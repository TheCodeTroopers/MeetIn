'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import { Calendar as CalendarIcon, Loader2, Sparkles, Clock, User, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatTime12h } from '@/utils/slot-generator'
import { SlotStatusBadge } from '@/components/ui/slot-status'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

export default function FacultyCalendarPage() {
  const { profile } = useAuth()
  const [facultyId, setFacultyId] = useState<string | null>(null)
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [calendarDates, setCalendarDates] = useState<string[]>([])
  const [daySlots, setDaySlots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (profile) getFacultyId()
  }, [profile])

  useEffect(() => {
    if (facultyId) fetchCalendar(facultyId, currentYear)
  }, [facultyId, currentYear])

  const getFacultyId = async () => {
    try {
      const { data } = await supabase.from('faculty').select('id').eq('profile_id', profile!.id).single()
      if (data) {
        setFacultyId(data.id)
      } else {
        setLoading(false)
      }
    } catch {
      setLoading(false)
    }
  }

  const fetchCalendar = async (fid: string, year: number) => {
    setLoading(true)
    try {
      const startOfYear = new Date(year, 0, 1).toISOString().split('T')[0]
      const endOfYear = new Date(year, 11, 31).toISOString().split('T')[0]
      const { data } = await supabase
        .from('appointments')
        .select(`
          slot:appointment_slots!inner(date)
        `)
        .eq('faculty_id', fid)
        .gte('appointment_slots.date', startOfYear)
        .lte('appointment_slots.date', endOfYear)
      setCalendarDates([...new Set(data?.map(d => (d.slot as any).date) || [])])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const selectDate = async (date: string) => {
    setSelectedDate(date)
    setIsDialogOpen(true)
    setLoadingSlots(true)
    try {
      const { data } = await supabase
        .from('appointment_slots')
        .select(`*, appointments!inner(id, status, reason, user:profiles!appointments_user_id_fkey(full_name, email))`)
        .eq('faculty_id', facultyId!)
        .eq('date', date)
        .order('start_time', { ascending: true })
      setDaySlots(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingSlots(false)
    }
  }

  const jumpToToday = () => setCurrentYear(new Date().getFullYear())

  const months = Array.from({ length: 12 }, (_, i) => new Date(currentYear, i, 1))
  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div className="p-6 sm:p-10 max-w-[1400px] mx-auto space-y-8 animate-fade-in bg-[#fbfbfa] min-h-screen">

      {/* Top Controller */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#E9DED8] shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F1DCE8] text-[#7A1F57] flex items-center justify-center shrink-0">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFF1BF] text-[#7A1F57] text-[10px] font-bold border border-[#E8B52D]/40 mb-1">
              <Sparkles className="w-3 h-3" />
              <span>SCHEDULE CALENDAR</span>
            </div>
            <h1 className="text-2xl font-bold text-[#34252D]">{currentYear} Calendar</h1>
            <p className="text-sm text-[#75676C]">Select a highlighted date to inspect slots and student bookings</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={jumpToToday}
            className="text-[#7A1F57] border-[#7A1F57]/20 bg-[#F1DCE8] hover:bg-[#E8C5D8] font-semibold text-xs"
          >
            Jump to Today ({todayStr})
          </Button>
          <div className="flex items-center gap-3 border border-[#E9DED8] rounded-xl p-1 bg-white shadow-xs">
            <Button variant="ghost" size="icon" onClick={() => setCurrentYear(y => y - 1)}>
              <ChevronLeft className="w-4 h-4 text-[#34252D]" />
            </Button>
            <span className="font-bold w-12 text-center text-[#34252D]">{currentYear}</span>
            <Button variant="ghost" size="icon" onClick={() => setCurrentYear(y => y + 1)}>
              <ChevronRight className="w-4 h-4 text-[#34252D]" />
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-[#7A1F57]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {months.map((month, mi) => {
            const m = month.getMonth()
            const firstDay = new Date(currentYear, m, 1).getDay()
            const daysInMonth = new Date(currentYear, m + 1, 0).getDate()
            const weeks: (number | null)[][] = []
            let week: (number | null)[] = Array(firstDay).fill(null)

            for (let d = 1; d <= daysInMonth; d++) {
              week.push(d)
              if (week.length === 7) { weeks.push(week); week = [] }
            }
            if (week.length > 0) weeks.push([...week, ...Array(7 - week.length).fill(null)])

            return (
              <div key={mi} className="bg-white rounded-3xl p-5 border border-[#E9DED8] shadow-sm hover:shadow-md transition-shadow">
                <h2 className="text-center font-bold text-[#34252D] mb-4">
                  {month.toLocaleDateString('en-IN', { month: 'long' })}
                </h2>

                <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <div key={d} className="text-[11px] font-semibold text-[#75676C] py-1">{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {weeks.flat().map((day, i) => {
                    if (!day) return <div key={i} className="h-8" />
                    const dateStr = `${currentYear}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                    const hasAvail = calendarDates.includes(dateStr)
                    const isToday = dateStr === todayStr
                    const isSelected = dateStr === selectedDate

                    return (
                      <button
                        key={i}
                        onClick={() => hasAvail && selectDate(dateStr)}
                        disabled={!hasAvail}
                        className={`relative h-8 w-full flex items-center justify-center rounded-lg text-xs font-medium transition-colors
                          ${isSelected
                            ? 'bg-[#7A1F57] text-white shadow-md shadow-[#7A1F57]/20'
                            : hasAvail
                            ? 'text-[#34252D] hover:bg-[#F1DCE8] hover:text-[#7A1F57] cursor-pointer'
                            : 'text-[#75676C] opacity-60 cursor-default'
                          }
                          ${isToday && !isSelected ? 'bg-[#FFF1BF] text-[#7A1F57] font-bold' : ''}
                        `}
                      >
                        {day}
                        {hasAvail && !isSelected && (
                          <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-[#7A1F57]" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Day Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#7A1F57]" />
              {selectedDate && new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
              })}
            </DialogTitle>
            <DialogDescription>
              Slot occupancy and student booking details for this day.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 max-h-[500px] overflow-y-auto pr-2">
            {loadingSlots ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#7A1F57]" />
              </div>
            ) : daySlots.length === 0 ? (
              <div className="text-center py-8 text-sm text-[#75676C]">
                No slots found for this date.
              </div>
            ) : (
              <div className="space-y-3">
                {daySlots.map(slot => (
                  <div key={slot.id} className="p-4 rounded-xl bg-[#FCF9F6] border border-[#E9DED8] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#34252D] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#7A1F57]" />
                        {formatTime12h(slot.start_time)} – {formatTime12h(slot.end_time)}
                      </span>
                      <SlotStatusBadge status={slot.status} />
                    </div>

                    {slot.appointments?.[0] && (
                      <div className="text-xs pt-2 border-t border-[#E9DED8] space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-[#7A1F57]">
                          <User className="w-3.5 h-3.5" />
                          <span>{slot.appointments[0].user?.full_name}</span>
                        </div>
                        {slot.appointments[0].reason && (
                          <p className="text-[11px] text-[#75676C] leading-relaxed">
                            {slot.appointments[0].reason}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}

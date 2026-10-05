'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar as CalendarIcon, Loader2, Sparkles, User, UserCheck, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { formatTime12h } from '@/utils/slot-generator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

export default function AdminCalendarPage() {
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [calendarDates, setCalendarDates] = useState<string[]>([])
  const [dayAppointments, setDayAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingAppts, setLoadingAppts] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    fetchCalendarDates(currentYear)
  }, [currentYear])

  const fetchCalendarDates = async (year: number) => {
    setLoading(true)
    try {
      const startOfYear = new Date(year, 0, 1).toISOString().split('T')[0]
      const endOfYear = new Date(year, 11, 31).toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('faculty_availability')
        .select('date')
        .gte('date', startOfYear)
        .lte('date', endOfYear)

      if (data) {
        const dates = data.map(avail => avail.date)
        setCalendarDates([...new Set(dates)])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const selectDate = async (date: string) => {
    setSelectedDate(date)
    setIsDialogOpen(true)
    setLoadingAppts(true)
    try {
      const { data, error } = await supabase
        .from('faculty_availability')
        .select(`
          id, date, start_time, end_time, slot_mode, slot_duration,
          faculty:faculty!faculty_availability_faculty_id_fkey(
            department, designation,
            profile:profiles!faculty_profile_id_fkey(full_name)
          ),
          slot_count:appointment_slots(count)
        `)
        .eq('date', date)
      
      if (data) {
        const sorted = data.sort((a: any, b: any) => {
          return a.start_time.localeCompare(b.start_time)
        })
        setDayAppointments(sorted)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingAppts(false)
    }
  }

  const jumpToToday = () => {
    setCurrentYear(new Date().getFullYear())
  }

  const months = Array.from({ length: 12 }, (_, i) => new Date(currentYear, i, 1))

  return (
    <div className="p-6 sm:p-10 max-w-[1400px] mx-auto space-y-8 animate-fade-in bg-[#fbfbfa] min-h-screen">
      
      {/* Top Controller */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#E9DED8] shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#eff6ff] text-[#3b82f6] flex items-center justify-center shrink-0">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1b1c1a]">{currentYear} Calendar</h1>
            <p className="text-sm text-[#554243]">Select a date to open its appointment register</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white">
          <Button variant="outline" onClick={jumpToToday} className="text-[#3b82f6] border-[#3b82f6]/20 bg-[#eff6ff] hover:bg-[#dbeafe]">
            Jump to Today ({new Date().toISOString().split('T')[0]})
          </Button>
          <div className="flex items-center gap-3 border rounded-xl p-1 bg-white shadow-xs">
            <Button variant="ghost" size="icon" onClick={() => setCurrentYear(y => y - 1)}>
              <ChevronLeft className="w-4 h-4 text-[#1b1c1a]" />
            </Button>
            <span className="font-bold w-12 text-center text-[#1b1c1a]">{currentYear}</span>
            <Button variant="ghost" size="icon" onClick={() => setCurrentYear(y => y + 1)}>
              <ChevronRight className="w-4 h-4 text-[#1b1c1a]" />
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-[#3b82f6]" />
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
              <div key={mi} className="bg-white rounded-3xl p-5 border border-[#e4e2de] shadow-sm hover:shadow-md transition-shadow">
                <h2 className="text-center font-bold text-[#1b1c1a] mb-4">
                  {month.toLocaleDateString('en-US', { month: 'long' })}
                </h2>

                <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <div key={d} className="text-[11px] font-semibold text-[#897375] py-1">
                      {d}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {weeks.flat().map((day, i) => {
                    if (!day) return <div key={i} className="h-8" />
                    const dateStr = `${currentYear}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                    const hasAppts = calendarDates.includes(dateStr)
                    const isToday = dateStr === new Date().toISOString().split('T')[0]

                    return (
                      <button
                        key={i}
                        onClick={() => hasAppts && selectDate(dateStr)}
                        disabled={!hasAppts}
                        className={`relative h-8 w-full flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                          hasAppts
                            ? 'text-[#1b1c1a] hover:bg-[#eff6ff] hover:text-[#3b82f6] cursor-pointer'
                            : 'text-[#554243] opacity-60 cursor-default hover:bg-transparent'
                        } ${isToday ? 'bg-[#fce8eb] text-[#982b3d] font-bold' : ''}`}
                      >
                        {day}
                        {hasAppts && (
                          <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#10b981]" />
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#3b82f6]" />
              Schedules for {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </DialogTitle>
            <DialogDescription>
              Detailed view of all faculty schedules for this day.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 max-h-[500px] overflow-y-auto pr-2">
            {loadingAppts ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#3b82f6]" />
              </div>
            ) : dayAppointments.length === 0 ? (
              <div className="text-center py-8 text-sm text-[#75676C]">
                No schedules found for this date.
              </div>
            ) : (
              <div className="space-y-4">
                {dayAppointments.map(schedule => (
                  <div key={schedule.id} className="p-4 rounded-xl bg-[#fcfbf9] border border-[#e4e2de] space-y-3">
                    <div className="flex items-center justify-between border-b border-[#e4e2de] pb-2">
                      <span className="text-xs font-bold text-[#1b1c1a] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#3b82f6]" />
                        {formatTime12h(schedule.start_time)} – {formatTime12h(schedule.end_time)}
                      </span>
                      <Badge variant={schedule.slot_mode === 'MINUTE_BASED' ? 'default' : 'secondary'} className="font-medium shadow-none">
                        {schedule.slot_mode === 'MINUTE_BASED' ? `${schedule.slot_duration} min slots` : 'Manual'}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#eff6ff] flex items-center justify-center shrink-0">
                          <UserCheck className="w-3 h-3 text-[#3b82f6]" />
                        </div>
                        <div className="text-xs">
                          <span className="font-semibold text-[#1b1c1a]">{schedule.faculty?.profile?.full_name}</span>
                          <span className="text-[#554243]"> ({schedule.faculty?.department})</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#fce8eb] flex items-center justify-center shrink-0">
                          <Sparkles className="w-3 h-3 text-[#982b3d]" />
                        </div>
                        <div className="text-xs text-[#554243]">
                          Generated {schedule.slot_count?.[0]?.count || 0} slots
                        </div>
                      </div>
                    </div>
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

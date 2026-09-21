'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import { Calendar, Loader2, Sparkles, Clock, User } from 'lucide-react'
import { formatTime12h } from '@/utils/slot-generator'
import { SlotStatusBadge } from '@/components/ui/slot-status'

export default function FacultyCalendarPage() {
  const { profile } = useAuth()
  const [facultyId, setFacultyId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [calendarDates, setCalendarDates] = useState<string[]>([])
  const [daySlots, setDaySlots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (profile) getFacultyId()
  }, [profile])

  const getFacultyId = async () => {
    try {
      const { data } = await supabase.from('faculty').select('id').eq('profile_id', profile!.id).single()
      if (data) {
        setFacultyId(data.id)
        fetchCalendar(data.id)
      } else {
        setLoading(false)
      }
    } catch {
      setLoading(false)
    }
  }

  const fetchCalendar = async (fid: string) => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('faculty_availability')
        .select('date')
        .eq('faculty_id', fid)
        .gte('date', today)
        .order('date', { ascending: true })
      setCalendarDates(data?.map(d => d.date) || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const selectDate = async (date: string) => {
    setSelectedDate(date)
    setLoadingSlots(true)
    try {
      const { data } = await supabase
        .from('appointment_slots')
        .select(`*, appointments(id, status, reason, user:profiles!appointments_user_id_fkey(full_name, email))`)
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

  const today = new Date()
  const months = [new Date(today), new Date(today.getFullYear(), today.getMonth() + 1)]

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9DED8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1BF] text-[#7A1F57] text-[11px] font-bold border border-[#E8B52D]/40">
            <Sparkles className="w-3.5 h-3.5 text-[#7A1F57]" />
            <span>SCHEDULE CALENDAR</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#34252D] tracking-tight">
            Consultation Calendar & Day Inspector
          </h1>
          <p className="text-xs sm:text-sm text-[#75676C]">
            Select scheduled dates to inspect real-time slot occupancy and student bookings.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#7A1F57]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Calendar Months Grid */}
          <div className="lg:col-span-7 space-y-6">
            {months.map((month, mi) => {
              const year = month.getFullYear()
              const m = month.getMonth()
              const firstDay = new Date(year, m, 1).getDay()
              const daysInMonth = new Date(year, m + 1, 0).getDate()
              const weeks: (number | null)[][] = []
              let week: (number | null)[] = Array(firstDay).fill(null)

              for (let d = 1; d <= daysInMonth; d++) {
                week.push(d)
                if (week.length === 7) { weeks.push(week); week = [] }
              }
              if (week.length > 0) weeks.push([...week, ...Array(7 - week.length).fill(null)])

              return (
                <div key={mi} className="bg-white rounded-3xl p-6 border border-[#E9DED8] shadow-xs">
                  <div className="border-b border-[#E9DED8] pb-4 mb-4 flex items-center justify-between">
                    <h2 className="text-base font-bold text-[#34252D]">
                      {month.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                    </h2>
                  </div>

                  <div className="grid grid-cols-7 gap-2 mb-2 text-center">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                      <div key={d} className="text-[11px] font-bold text-[#75676C] py-1">
                        {d}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {weeks.flat().map((day, i) => {
                      if (!day) return <div key={i} className="h-10" />
                      const dateStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                      const hasAvail = calendarDates.includes(dateStr)
                      const isSelected = dateStr === selectedDate

                      return (
                        <button
                          key={i}
                          onClick={() => hasAvail && selectDate(dateStr)}
                          disabled={!hasAvail}
                          className={`relative h-11 w-full flex flex-col items-center justify-center rounded-xl text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-[#7A1F57] text-white shadow-md shadow-[#7A1F57]/20 scale-105'
                              : hasAvail
                              ? 'bg-[#F1DCE8] text-[#7A1F57] hover:bg-[#E8C5D8] cursor-pointer'
                              : 'bg-transparent text-[#9A8E91] cursor-default'
                          }`}
                        >
                          <span>{day}</span>
                          {hasAvail && !isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#7A1F57] mt-0.5" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Day Detail Inspector */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 border border-[#E9DED8] shadow-xs sticky top-6 space-y-4">
              <div className="border-b border-[#E9DED8] pb-4">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7A1F57] mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>DAY INSPECTOR</span>
                </div>
                <h3 className="text-base font-bold text-[#34252D]">
                  {selectedDate
                    ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
                        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                      })
                    : 'Select a highlighted date'}
                </h3>
              </div>

              {!selectedDate ? (
                <div className="text-center py-12 text-xs text-[#75676C] space-y-2">
                  <Calendar className="w-10 h-10 mx-auto text-[#9A8E91]" />
                  <p>Click any highlighted calendar cell to inspect individual slots and student details.</p>
                </div>
              ) : loadingSlots ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-[#7A1F57]" />
                </div>
              ) : daySlots.length === 0 ? (
                <div className="text-center py-10 text-xs text-[#75676C]">
                  No slots found for this date.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                  {daySlots.map(slot => (
                    <div
                      key={slot.id}
                      className="p-3.5 rounded-2xl bg-[#FCF9F6] border border-[#E9DED8] space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#34252D]">
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
                            <p className="text-[11px] text-[#75676C]">
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
          </div>

        </div>
      )}
    </div>
  )
}

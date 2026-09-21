'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Calendar, Clock, CheckCircle2, Search, ArrowRight,
  UserCheck, AlertCircle, Sparkles
} from 'lucide-react'
import { formatTime12h, formatDateShort } from '@/utils/slot-generator'
import { AppointmentStatusBadge } from '@/components/ui/appointment-status'

export default function UserDashboard() {
  const { profile } = useAuth()
  const [appointments, setAppointments] = useState<any[]>([])
  const [stats, setStats] = useState({
    upcoming: 0,
    pending: 0,
    completed: 0,
    total: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (profile) fetchData()
  }, [profile])

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id, status, reason, created_at,
          faculty:faculty!appointments_faculty_id_fkey(
            department,
            designation,
            profile:profiles!faculty_profile_id_fkey(full_name, email, image_url)
          ),
          slot:appointment_slots!appointments_slot_id_fkey(date, start_time, end_time)
        `)
        .eq('user_id', profile!.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching appointments:', error)
      } else if (data) {
        setAppointments(data)
        const upcomingCount = data.filter(a => a.status === 'approved').length
        const pendingCount = data.filter(a => a.status === 'pending').length
        const completedCount = data.filter(a => a.status === 'completed').length

        setStats({
          upcoming: upcomingCount,
          pending: pendingCount,
          completed: completedCount,
          total: data.length,
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getTimeGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      {/* Top Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9DED8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1BF] text-[#7A1F57] text-[11px] font-bold border border-[#E8B52D]/40">
            <Sparkles className="w-3.5 h-3.5 text-[#7A1F57]" />
            <span>STUDENT WORKSPACE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#34252D] tracking-tight">
            {getTimeGreeting()}, {profile?.full_name || 'Student'}
          </h1>
          <p className="text-xs sm:text-sm text-[#75676C]">
            Manage your faculty appointments and upcoming consultations from one place.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Link href="/user/faculty">
            <Button className="h-11 px-5 rounded-2xl bg-[#7A1F57] hover:bg-[#651744] text-white font-bold text-xs shadow-md shadow-[#7A1F57]/15 flex items-center gap-2 cursor-pointer transition-all">
              <Search className="w-4 h-4" />
              <span>Book Appointment</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Counters (Section 14) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-[#E9DED8] shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#75676C] uppercase tracking-wider">
              Upcoming
            </span>
            <div className="text-3xl font-bold text-[#34252D]">
              {loading ? '—' : stats.upcoming}
            </div>
            <span className="text-[11px] text-[#2E7D5B] font-medium">Confirmed appointments</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#E5F4EC] text-[#2E7D5B] flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#E9DED8] shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#75676C] uppercase tracking-wider">
              Pending
            </span>
            <div className="text-3xl font-bold text-[#34252D]">
              {loading ? '—' : stats.pending}
            </div>
            <span className="text-[11px] text-[#B7791F] font-medium">Awaiting faculty approval</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FFF3D6] text-[#B7791F] flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#E9DED8] shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#75676C] uppercase tracking-wider">
              Completed
            </span>
            <div className="text-3xl font-bold text-[#34252D]">
              {loading ? '—' : stats.completed}
            </div>
            <span className="text-[11px] text-[#4A668A] font-medium">Past consultations</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#EAF0F7] text-[#4A668A] flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left / Main: Recent & Upcoming Appointments */}
        <div className="lg:col-span-8 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#34252D]">Upcoming & Recent Appointments</h2>
            <Link
              href="/user/appointments"
              className="text-xs font-bold text-[#7A1F57] hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl p-12 border border-[#E9DED8] text-center text-xs text-[#75676C]">
              Loading your appointments...
            </div>
          ) : appointments.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-[#E9DED8] text-center space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-[#F7EFE8] text-[#7A1F57] flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#34252D]">No appointments scheduled yet</h3>
                <p className="text-xs text-[#75676C] max-w-sm mx-auto">
                  Browse your department faculty to view available consultation hours and request an appointment.
                </p>
              </div>
              <Link href="/user/faculty">
                <Button className="h-10 px-5 rounded-xl bg-[#7A1F57] hover:bg-[#651744] text-white font-bold text-xs">
                  Find Faculty
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3.5">
              {appointments.slice(0, 4).map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white rounded-2xl p-5 border border-[#E9DED8] hover:border-[#7A1F57]/30 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5">
                      <h4 className="text-sm font-bold text-[#34252D]">
                        {apt.faculty?.profile?.full_name || 'Faculty Member'}
                      </h4>
                      <span className="text-[11px] text-[#75676C] font-medium">
                        • {apt.faculty?.department || 'Department'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#75676C]">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-[#7A1F57]" />
                        <span>{apt.slot?.date ? formatDateShort(apt.slot.date) : 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-[#7A1F57]" />
                        <span>
                          {apt.slot?.start_time ? formatTime12h(apt.slot.start_time) : ''}
                          {apt.slot?.end_time ? ` – ${formatTime12h(apt.slot.end_time)}` : ''}
                        </span>
                      </div>
                    </div>

                    {apt.reason && (
                      <p className="text-xs text-[#34252D] bg-[#FCF9F6] px-3 py-1.5 rounded-lg border border-[#E9DED8] inline-block mt-1">
                        <span className="font-semibold text-[#75676C]">Reason: </span>
                        {apt.reason}
                      </p>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2.5 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#E9DED8]">
                    <AppointmentStatusBadge status={apt.status} />
                    <Link href="/user/appointments">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs font-bold text-[#7A1F57] hover:bg-[#F1DCE8] h-8 px-3 rounded-lg"
                      >
                        Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Quick Actions & Instructions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#E9DED8] shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#34252D]">Quick Actions</h3>
            <div className="space-y-2.5">
              <Link href="/user/faculty" className="block">
                <div className="p-3.5 rounded-2xl bg-[#FCF9F6] border border-[#E9DED8] hover:border-[#7A1F57]/40 transition-all flex items-center gap-3 group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-[#F1DCE8] text-[#7A1F57] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-[#34252D] group-hover:text-[#7A1F57]">
                      Faculty Directory
                    </div>
                    <div className="text-[11px] text-[#75676C] truncate">
                      Search professors & office hours
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/user/appointments" className="block">
                <div className="p-3.5 rounded-2xl bg-[#FCF9F6] border border-[#E9DED8] hover:border-[#7A1F57]/40 transition-all flex items-center gap-3 group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF1BF] text-[#7A1F57] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-[#34252D] group-hover:text-[#7A1F57]">
                      Appointment History
                    </div>
                    <div className="text-[11px] text-[#75676C] truncate">
                      View all status updates & notes
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Institutional Guidelines Card */}
          <div className="bg-[#FCF9F6] rounded-3xl p-6 border border-[#E9DED8] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#7A1F57]">
              <AlertCircle className="w-4 h-4" />
              <span>Booking Guidelines</span>
            </div>
            <ul className="text-xs text-[#75676C] space-y-2 list-disc pl-4 leading-relaxed">
              <li>Book at least 2 hours ahead of the scheduled slot.</li>
              <li>Always include a concise, academic topic for the meeting.</li>
              <li>Cancel reasonably early if unable to attend so other students can book.</li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  )
}

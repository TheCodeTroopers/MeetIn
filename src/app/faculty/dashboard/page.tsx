'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Clock, CheckCircle2, Calendar, Plus, CalendarDays,
  Sparkles, ArrowRight, UserCheck, AlertCircle
} from 'lucide-react'
import { formatTime12h, formatDateShort } from '@/utils/slot-generator'
import { AppointmentStatusBadge } from '@/components/ui/appointment-status'

interface DashboardData {
  todayCount: number
  pendingCount: number
  upcomingCount: number
  completedCount: number
  recentAppointments: any[]
}

export default function FacultyDashboard() {
  const { profile } = useAuth()
  const [data, setData] = useState<DashboardData>({
    todayCount: 0,
    pendingCount: 0,
    upcomingCount: 0,
    completedCount: 0,
    recentAppointments: [],
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (profile) fetchDashboard()
  }, [profile])

  const fetchDashboard = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]

      const { data: faculty } = await supabase
        .from('faculty')
        .select('id')
        .eq('profile_id', profile!.id)
        .single()

      if (!faculty) {
        setLoading(false)
        return
      }

      const [
        { count: todayCount },
        { count: pendingCount },
        { count: upcomingCount },
        { count: completedCount },
        { data: recentAppointments },
      ] = await Promise.all([
        supabase.from('appointments')
          .select('*, slot:appointment_slots!inner(date)', { count: 'exact', head: true })
          .eq('faculty_id', faculty.id)
          .eq('appointment_slots.date', today),
        supabase.from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('faculty_id', faculty.id)
          .eq('status', 'pending'),
        supabase.from('appointments')
          .select('*, slot:appointment_slots!inner(date)', { count: 'exact', head: true })
          .eq('faculty_id', faculty.id)
          .in('status', ['approved'])
          .gte('appointment_slots.date', today),
        supabase.from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('faculty_id', faculty.id)
          .eq('status', 'completed'),
        supabase.from('appointments')
          .select(`
            id, status, reason, created_at,
            user:profiles(full_name, email, department, year),
            slot:appointment_slots(date, start_time, end_time)
          `)
          .eq('faculty_id', faculty.id)
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      setData({
        todayCount: todayCount || 0,
        pendingCount: pendingCount || 0,
        upcomingCount: upcomingCount || 0,
        completedCount: completedCount || 0,
        recentAppointments: recentAppointments || [],
      })
      console.log('--- RECENT APPOINTMENTS FETCHED ---', JSON.stringify(recentAppointments, null, 2))
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
      
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9DED8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1BF] text-[#7A1F57] text-[11px] font-bold border border-[#E8B52D]/40">
            <Sparkles className="w-3.5 h-3.5 text-[#7A1F57]" />
            <span>FACULTY WORKSPACE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#34252D] tracking-tight">
            {getTimeGreeting()}, {profile?.full_name || 'Faculty Member'}
          </h1>
          <p className="text-xs sm:text-sm text-[#75676C]">
            Here is your daily appointment overview, pending requests, and consultation schedule.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/faculty/availability">
            <Button className="h-11 px-5 rounded-2xl bg-[#7A1F57] hover:bg-[#651744] text-white font-bold text-xs shadow-md shadow-[#7A1F57]/15 flex items-center gap-2 cursor-pointer transition-all">
              <Plus className="w-4 h-4" />
              <span>Create Availability</span>
            </Button>
          </Link>
          <Link href="/faculty/calendar">
            <Button
              variant="outline"
              className="h-11 px-5 rounded-2xl border-[#E9DED8] text-[#7A1F57] hover:bg-[#F7EFE8] font-bold text-xs"
            >
              <CalendarDays className="w-4 h-4 mr-1.5" />
              View Calendar
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Statistics (Section 16) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E9DED8] shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#75676C] uppercase tracking-wider">Today</span>
            <div className="text-2xl sm:text-3xl font-bold text-[#34252D]">
              {loading ? '—' : data.todayCount}
            </div>
            <span className="text-[10px] sm:text-[11px] text-[#7A1F57] font-medium">Scheduled today</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#F1DCE8] text-[#7A1F57] flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E9DED8] shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#75676C] uppercase tracking-wider">Pending</span>
            <div className="text-2xl sm:text-3xl font-bold text-[#34252D]">
              {loading ? '—' : data.pendingCount}
            </div>
            <span className="text-[10px] sm:text-[11px] text-[#B7791F] font-medium">Action required</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#FFF3D6] text-[#B7791F] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E9DED8] shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#75676C] uppercase tracking-wider">Upcoming</span>
            <div className="text-2xl sm:text-3xl font-bold text-[#34252D]">
              {loading ? '—' : data.upcomingCount}
            </div>
            <span className="text-[10px] sm:text-[11px] text-[#2E7D5B] font-medium">Confirmed ahead</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#E5F4EC] text-[#2E7D5B] flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E9DED8] shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#75676C] uppercase tracking-wider">Completed</span>
            <div className="text-2xl sm:text-3xl font-bold text-[#34252D]">
              {loading ? '—' : data.completedCount}
            </div>
            <span className="text-[10px] sm:text-[11px] text-[#4A668A] font-medium">Past consultations</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#EAF0F7] text-[#4A668A] flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Pending Requests & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Recent Student Requests */}
        <div className="lg:col-span-8 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#34252D]">Recent Student Requests</h2>
            <Link
              href="/faculty/appointments"
              className="text-xs font-bold text-[#7A1F57] hover:underline flex items-center gap-1"
            >
              <span>Manage all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl p-12 border border-[#E9DED8] text-center text-xs text-[#75676C]">
              Loading student requests...
            </div>
          ) : data.recentAppointments.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-[#E9DED8] text-center space-y-3 shadow-xs">
              <Clock className="w-10 h-10 text-[#9A8E91] mx-auto" />
              <h3 className="text-base font-bold text-[#34252D]">No pending consultation requests</h3>
              <p className="text-xs text-[#75676C] max-w-sm mx-auto">
                When students request meetings during your open office hours, they will appear here for review.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {data.recentAppointments.map((apt) => {
                const user = Array.isArray(apt.user) ? apt.user[0] : apt.user;
                const slot = Array.isArray(apt.slot) ? apt.slot[0] : apt.slot;
                return (
                <div
                  key={apt.id}
                  className="bg-white rounded-2xl p-5 border border-[#E9DED8] hover:border-[#7A1F57]/30 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5">
                      <h4 className="text-sm font-bold text-[#34252D]">
                        {user?.full_name || 'Student'}
                      </h4>
                      <span className="text-[11px] text-[#75676C]">
                        • {user?.department || 'Department'} ({user?.year || 'Student'})
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#75676C]">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-[#7A1F57]" />
                        <span>{slot?.date ? formatDateShort(slot.date) : 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-[#7A1F57]" />
                        <span>
                          {slot?.start_time ? formatTime12h(slot.start_time) : ''}
                          {slot?.end_time ? ` – ${formatTime12h(slot.end_time)}` : ''}
                        </span>
                      </div>
                    </div>

                    {apt.reason && (
                      <p className="text-xs text-[#34252D] bg-[#FCF9F6] px-3 py-1.5 rounded-lg border border-[#E9DED8] inline-block mt-1">
                        <span className="font-semibold text-[#75676C]">Topic: </span>
                        {apt.reason}
                      </p>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2.5 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#E9DED8]">
                    <AppointmentStatusBadge status={apt.status} />
                    <Link href="/faculty/appointments">
                      <Button
                        size="sm"
                        className="text-xs font-bold bg-[#7A1F57] hover:bg-[#651744] text-white h-8 px-3 rounded-lg"
                      >
                        Review
                      </Button>
                    </Link>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Quick Navigation & Availability Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#E9DED8] shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#34252D]">Quick Actions</h3>
            <div className="space-y-2.5">
              <Link href="/faculty/availability" className="block">
                <div className="p-3.5 rounded-2xl bg-[#FCF9F6] border border-[#E9DED8] hover:border-[#7A1F57]/40 transition-all flex items-center gap-3 group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-[#F1DCE8] text-[#7A1F57] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-[#34252D] group-hover:text-[#7A1F57]">
                      Generate Slots
                    </div>
                    <div className="text-[11px] text-[#75676C] truncate">
                      Minute-based or manual availability
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/faculty/calendar" className="block">
                <div className="p-3.5 rounded-2xl bg-[#FCF9F6] border border-[#E9DED8] hover:border-[#7A1F57]/40 transition-all flex items-center gap-3 group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF1BF] text-[#7A1F57] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-[#34252D] group-hover:text-[#7A1F57]">
                      Schedule Calendar
                    </div>
                    <div className="text-[11px] text-[#75676C] truncate">
                      Full monthly breakdown & slot counts
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          <div className="bg-[#FCF9F6] rounded-3xl p-6 border border-[#E9DED8] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#7A1F57]">
              <AlertCircle className="w-4 h-4" />
              <span>Faculty Tips</span>
            </div>
            <ul className="text-xs text-[#75676C] space-y-2 list-disc pl-4 leading-relaxed">
              <li>Use the <strong>Minute-Based Mode</strong> to automatically partition office hours into 10–20 minute slots.</li>
              <li>Provide clear rejection notes if you need students to reschedule or prepare specific materials.</li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  )
}


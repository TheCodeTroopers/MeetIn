'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Users, UserCheck, ClipboardList, Activity, Plus,
  Sparkles, Calendar, ArrowRight, ShieldCheck
} from 'lucide-react'
import { AppointmentStatusBadge } from '@/components/ui/appointment-status'
import { formatDateShort, formatTime12h } from '@/utils/slot-generator'

interface Stats {
  totalFaculty: number
  activeFaculty: number
  appointmentsToday: number
  pendingRequests: number
}

export default function AdminDashboard() {
  const { profile } = useAuth()
  const [stats, setStats] = useState<Stats>({
    totalFaculty: 0,
    activeFaculty: 0,
    appointmentsToday: 0,
    pendingRequests: 0,
  })
  const [recentAppointments, setRecentAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]

      const [
        { count: totalFaculty },
        { count: activeFaculty },
        { count: appointmentsToday },
        { count: pendingRequests },
        { data: recentAppointmentsData },
      ] = await Promise.all([
        supabase.from('faculty').select('*', { count: 'exact', head: true }),
        supabase.from('faculty').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('appointments')
          .select('*, slot:appointment_slots!inner(date)', { count: 'exact', head: true })
          .eq('appointment_slots.date', today),
        supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('appointments')
          .select(`
            id, status, reason, created_at,
            user:profiles!appointments_user_id_fkey(full_name, email, department),
            faculty:faculty!appointments_faculty_id_fkey(designation, department, profile:profiles!faculty_profile_id_fkey(full_name)),
            slot:appointment_slots!appointments_slot_id_fkey(date, start_time, end_time)
          `)
          .order('created_at', { ascending: false })
          .limit(6),
      ])

      setStats({
        totalFaculty: totalFaculty || 0,
        activeFaculty: activeFaculty || 0,
        appointmentsToday: appointmentsToday || 0,
        pendingRequests: pendingRequests || 0,
      })
      setRecentAppointments(recentAppointmentsData || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      {/* Admin Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9DED8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1BF] text-[#7A1F57] text-[11px] font-bold border border-[#E8B52D]/40">
            <ShieldCheck className="w-3.5 h-3.5 text-[#7A1F57]" />
            <span>ADMINISTRATIVE PANEL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#34252D] tracking-tight">
            Good morning, Administrator
          </h1>
          <p className="text-xs sm:text-sm text-[#75676C]">
            Comprehensive overview of campus faculty accounts, bookings, and appointment velocity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/faculty/new">
            <Button className="h-11 px-5 rounded-2xl bg-[#7A1F57] hover:bg-[#651744] text-white font-bold text-xs shadow-md shadow-[#7A1F57]/15 flex items-center gap-2 cursor-pointer transition-all">
              <Plus className="w-4 h-4" />
              <span>Add Faculty Member</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Stats (Section 24) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E9DED8] shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#75676C] uppercase tracking-wider">Total Faculty</span>
            <div className="text-2xl sm:text-3xl font-bold text-[#34252D]">
              {loading ? '—' : stats.totalFaculty}
            </div>
            <span className="text-[10px] sm:text-[11px] text-[#7A1F57] font-medium">Onboarded accounts</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#F1DCE8] text-[#7A1F57] flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E9DED8] shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#75676C] uppercase tracking-wider">Active Faculty</span>
            <div className="text-2xl sm:text-3xl font-bold text-[#34252D]">
              {loading ? '—' : stats.activeFaculty}
            </div>
            <span className="text-[10px] sm:text-[11px] text-[#2E7D5B] font-medium">Accepting bookings</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#E5F4EC] text-[#2E7D5B] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E9DED8] shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#75676C] uppercase tracking-wider">Today</span>
            <div className="text-2xl sm:text-3xl font-bold text-[#34252D]">
              {loading ? '—' : stats.appointmentsToday}
            </div>
            <span className="text-[10px] sm:text-[11px] text-[#4A668A] font-medium">Scheduled today</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#EAF0F7] text-[#4A668A] flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E9DED8] shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#75676C] uppercase tracking-wider">Pending Requests</span>
            <div className="text-2xl sm:text-3xl font-bold text-[#34252D]">
              {loading ? '—' : stats.pendingRequests}
            </div>
            <span className="text-[10px] sm:text-[11px] text-[#B7791F] font-medium">Awaiting decision</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#FFF3D6] text-[#B7791F] flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Recent System Consultations */}
        <div className="lg:col-span-8 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#34252D]">Recent System Bookings</h2>
            <Link
              href="/admin/appointments"
              className="text-xs font-bold text-[#7A1F57] hover:underline flex items-center gap-1"
            >
              <span>View full log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl p-12 border border-[#E9DED8] text-center text-xs text-[#75676C]">
              Loading appointment logs...
            </div>
          ) : recentAppointments.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-[#E9DED8] text-center space-y-3 shadow-xs">
              <ClipboardList className="w-10 h-10 mx-auto text-[#9A8E91]" />
              <p className="text-sm font-bold text-[#34252D]">No appointments recorded yet</p>
              <p className="text-xs text-[#75676C]">Student bookings across all faculty will be logged here.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {recentAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white rounded-2xl p-5 border border-[#E9DED8] hover:border-[#7A1F57]/30 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#34252D]">
                        Student: {apt.user?.full_name}
                      </span>
                      <span className="text-[#9A8E91]">→</span>
                      <span className="font-bold text-xs text-[#7A1F57]">
                        Faculty: {apt.faculty?.profile?.full_name}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#75676C]">
                      <span>{apt.slot?.date ? formatDateShort(apt.slot.date) : 'N/A'}</span>
                      <span>•</span>
                      <span>
                        {apt.slot?.start_time ? formatTime12h(apt.slot.start_time) : ''}
                        {apt.slot?.end_time ? ` – ${formatTime12h(apt.slot.end_time)}` : ''}
                      </span>
                      {apt.faculty?.department && (
                        <>
                          <span>•</span>
                          <span>{apt.faculty.department}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <AppointmentStatusBadge status={apt.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Faculty Quick Management */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#E9DED8] shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#34252D]">Admin Actions</h3>
            <div className="space-y-2.5">
              <Link href="/admin/faculty" className="block">
                <div className="p-3.5 rounded-2xl bg-[#FCF9F6] border border-[#E9DED8] hover:border-[#7A1F57]/40 transition-all flex items-center gap-3 group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-[#F1DCE8] text-[#7A1F57] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-[#34252D] group-hover:text-[#7A1F57]">
                      Manage Faculty Accounts
                    </div>
                    <div className="text-[11px] text-[#75676C] truncate">
                      View, edit & deactivate profiles
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/admin/faculty/new" className="block">
                <div className="p-3.5 rounded-2xl bg-[#FCF9F6] border border-[#E9DED8] hover:border-[#7A1F57]/40 transition-all flex items-center gap-3 group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF1BF] text-[#7A1F57] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-[#34252D] group-hover:text-[#7A1F57]">
                      Add New Faculty
                    </div>
                    <div className="text-[11px] text-[#75676C] truncate">
                      Onboard professors & assign depts
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}

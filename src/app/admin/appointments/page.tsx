'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Loader2, Search, Sparkles, Filter } from 'lucide-react'
import { formatTime12h, formatDateShort } from '@/utils/slot-generator'
import { AppointmentStatusBadge } from '@/components/ui/appointment-status'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const supabase = createClient()

  useEffect(() => {
    fetchAppointments()
  }, [statusFilter])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('appointments')
        .select(`
          id, status, reason, rejection_reason, created_at,
          user:profiles!appointments_user_id_fkey(full_name, email, department),
          faculty:faculty!appointments_faculty_id_fkey(
            department, designation,
            profile:profiles!faculty_profile_id_fkey(full_name)
          ),
          slot:appointment_slots!appointments_slot_id_fkey(date, start_time, end_time)
        `)
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') query = query.eq('status', statusFilter)

      const { data, error } = await query
      if (!error && data) {
        setAppointments(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = appointments.filter(a => {
    const student = a.user?.full_name || ''
    const facultyMember = a.faculty?.profile?.full_name || ''
    const reason = a.reason || ''
    const q = search.toLowerCase()

    return student.toLowerCase().includes(q) || facultyMember.toLowerCase().includes(q) || reason.toLowerCase().includes(q)
  })

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9DED8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1BF] text-[#7A1F57] text-[11px] font-bold border border-[#E8B52D]/40">
            <Sparkles className="w-3.5 h-3.5 text-[#7A1F57]" />
            <span>GLOBAL APPOINTMENTS AUDIT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#34252D] tracking-tight">
            All Campus Appointments
          </h1>
          <p className="text-xs sm:text-sm text-[#75676C]">
            Live audit logs of all student-faculty appointments and status progressions.
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl p-4 border border-[#E9DED8] shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Input
            placeholder="Search by student, faculty, or meeting agenda..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.75rem' }}
            className="h-11 rounded-xl border-[#E9DED8] bg-[#FCF9F6] text-xs focus:border-[#7A1F57]"
          />
          <Search className="w-4 h-4 text-[#9A8E91] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="w-full sm:w-60 relative">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
            className="w-full h-11 rounded-xl border border-[#E9DED8] bg-[#FCF9F6] text-xs font-semibold text-[#34252D] focus:outline-none focus:border-[#7A1F57] pr-4 appearance-none"
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <Filter className="w-4 h-4 text-[#9A8E91] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-[#E9DED8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#34252D]">
            <thead className="bg-[#FCF9F6] border-b border-[#E9DED8] text-[#75676C] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Faculty Member</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Discussion Topic</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9DED8]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#7A1F57]" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-[#75676C]">
                    No appointment records match the current filter.
                  </td>
                </tr>
              ) : (
                filtered.map(a => (
                  <tr key={a.id} className="hover:bg-[#FCF9F6] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#34252D]">{a.user?.full_name}</div>
                      <div className="text-[11px] text-[#75676C]">{a.user?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#7A1F57]">{a.faculty?.profile?.full_name}</div>
                      <div className="text-[11px] text-[#75676C]">{a.faculty?.designation} • {a.faculty?.department}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#34252D]">
                        {a.slot?.date ? formatDateShort(a.slot.date) : '—'}
                      </div>
                      <div className="text-[11px] text-[#75676C]">
                        {a.slot?.start_time ? formatTime12h(a.slot.start_time) : ''} – {a.slot?.end_time ? formatTime12h(a.slot.end_time) : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="truncate text-xs text-[#34252D]" title={a.reason}>
                        {a.reason || '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <AppointmentStatusBadge status={a.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

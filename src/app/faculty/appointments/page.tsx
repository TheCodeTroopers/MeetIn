'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { CheckCircle2, XCircle, Clock, Loader2, Sparkles, Calendar, UserCheck } from 'lucide-react'
import { formatTime12h, formatDate } from '@/utils/slot-generator'
import { AppointmentStatusBadge } from '@/components/ui/appointment-status'

type Filter = 'pending' | 'approved' | 'completed' | 'rejected' | 'cancelled' | 'all'

export default function FacultyAppointmentsPage() {
  const { profile } = useAuth()
  const [facultyId, setFacultyId] = useState<string | null>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [filter, setFilter] = useState<Filter>('pending')
  const [loading, setLoading] = useState(true)
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; id: string }>({ open: false, id: '' })
  const [rejectionReason, setRejectionReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (profile) getFacultyId()
  }, [profile])

  useEffect(() => {
    if (facultyId) fetchAppointments()
  }, [facultyId, filter])

  const getFacultyId = async () => {
    try {
      const { data } = await supabase.from('faculty').select('id').eq('profile_id', profile!.id).single()
      if (data) setFacultyId(data.id)
    } catch {
      setLoading(false)
    }
  }

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('appointments')
        .select(`
          id, status, reason, rejection_reason, created_at, slot_id,
          user:profiles!appointments_user_id_fkey(full_name, email, department, year, phone),
          slot:appointment_slots!appointments_slot_id_fkey(date, start_time, end_time)
        `)
        .eq('faculty_id', facultyId!)
        .order('created_at', { ascending: false })

      if (filter !== 'all') query = query.eq('status', filter)

      const { data, error } = await query
      if (error) {
        console.error(error)
      } else {
        setAppointments(data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const approveAppointment = async (id: string) => {
    setSubmitting(true)
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'approved' })
      .eq('id', id)

    if (error) {
      toast.error('Failed to approve appointment')
    } else {
      toast.success('Appointment approved successfully')
      fetchAppointments()
    }
    setSubmitting(false)
  }

  const rejectAppointment = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }
    setSubmitting(true)

    const { error } = await supabase
      .from('appointments')
      .update({ status: 'rejected', rejection_reason: rejectionReason.trim() })
      .eq('id', rejectDialog.id)

    // Free up slot back to AVAILABLE
    const { data: apt } = await supabase
      .from('appointments')
      .select('slot_id')
      .eq('id', rejectDialog.id)
      .single()

    if (apt) {
      await supabase
        .from('appointment_slots')
        .update({ status: 'AVAILABLE' })
        .eq('id', apt.slot_id)
    }

    if (error) {
      toast.error('Failed to reject appointment')
    } else {
      toast.success('Appointment rejected and slot released')
      setRejectDialog({ open: false, id: '' })
      setRejectionReason('')
      fetchAppointments()
    }
    setSubmitting(false)
  }

  const markCompleted = async (id: string, slotId: string) => {
    await Promise.all([
      supabase.from('appointments').update({ status: 'completed' }).eq('id', id),
      supabase.from('appointment_slots').update({ status: 'COMPLETED' }).eq('id', slotId),
    ])
    toast.success('Marked consultation as completed')
    fetchAppointments()
  }

  const filterTabs: { value: Filter; label: string }[] = [
    { value: 'pending', label: 'Pending Requests' },
    { value: 'approved', label: 'Approved' },
    { value: 'completed', label: 'Completed' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'all', label: 'All' },
  ]

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9DED8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1BF] text-[#7A1F57] text-[11px] font-bold border border-[#E8B52D]/40">
            <Sparkles className="w-3.5 h-3.5 text-[#7A1F57]" />
            <span>APPOINTMENT MANAGEMENT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#34252D] tracking-tight">
            Review Student Consultation Requests
          </h1>
          <p className="text-xs sm:text-sm text-[#75676C]">
            Approve pending student requests, review discussion agendas, or reschedule consultations.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap bg-white p-2 rounded-2xl border border-[#E9DED8] shadow-xs">
        {filterTabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === tab.value
                ? 'bg-[#7A1F57] text-white shadow-xs'
                : 'text-[#75676C] hover:bg-[#F7EFE8] hover:text-[#34252D]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#7A1F57]" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-[#E9DED8] text-center space-y-3 shadow-xs">
          <Clock className="w-10 h-10 mx-auto text-[#9A8E91]" />
          <h3 className="text-sm font-bold text-[#34252D]">
            No {filter !== 'all' ? filter : ''} appointments found
          </h3>
          <p className="text-xs text-[#75676C]">
            When students submit requests for this filter, they will be listed here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white rounded-2xl p-6 border border-[#E9DED8] hover:border-[#7A1F57]/30 transition-all shadow-xs"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#F1DCE8] text-[#7A1F57] flex items-center justify-center text-base font-bold flex-shrink-0 shadow-xs">
                    {apt.user?.full_name?.charAt(0) || 'S'}
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-sm text-[#34252D]">
                        {apt.user?.full_name || 'Student'}
                      </span>
                      <AppointmentStatusBadge status={apt.status} />
                    </div>

                    <div className="text-xs text-[#75676C]">
                      <span>{apt.user?.email}</span>
                      {apt.user?.department && (
                        <span> • {apt.user.department} ({apt.user.year || 'Student'})</span>
                      )}
                    </div>

                    {apt.slot && (
                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#75676C] pt-1">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-[#7A1F57]" />
                          {formatDate(apt.slot.date)}
                        </span>
                        <span className="flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-[#7A1F57]" />
                          {formatTime12h(apt.slot.start_time)} — {formatTime12h(apt.slot.end_time)}
                        </span>
                      </div>
                    )}

                    <div className="text-xs rounded-xl p-3 bg-[#FCF9F6] border border-[#E9DED8] text-[#34252D]">
                      <span className="font-bold text-[#75676C]">Agenda / Reason: </span>
                      {apt.reason}
                    </div>

                    {apt.rejection_reason && (
                      <div className="text-xs rounded-xl p-3 bg-[#FBE8E8] border border-[#B64242]/20 text-[#B64242]">
                        <span className="font-bold">Rejection Note: </span>
                        {apt.rejection_reason}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0 flex items-center gap-2.5">
                  {apt.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => approveAppointment(apt.id)}
                        disabled={submitting}
                        className="rounded-xl bg-[#2E7D5B] hover:bg-[#25664A] text-white text-xs font-bold h-9 px-4 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRejectDialog({ open: true, id: apt.id })}
                        className="rounded-xl border-[#B64242]/30 text-[#B64242] hover:bg-[#FBE8E8] text-xs font-bold h-9 px-3.5"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}

                  {apt.status === 'approved' && (
                    <Button
                      size="sm"
                      onClick={() => markCompleted(apt.id, apt.slot_id)}
                      className="rounded-xl bg-[#7A1F57] hover:bg-[#651744] text-white text-xs font-bold h-9 px-4"
                    >
                      <UserCheck className="w-3.5 h-3.5 mr-1" />
                      Mark Completed
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Reason Dialog (Section 17) */}
      <Dialog open={rejectDialog.open} onOpenChange={open => setRejectDialog({ open, id: '' })}>
        <DialogContent className="bg-white rounded-3xl border border-[#E9DED8] p-6 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#34252D]">
              Reject Consultation Request
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 my-2">
            <label className="text-xs font-bold text-[#34252D]">
              Reason for rejection <span className="text-[#B64242]">*</span>
            </label>
            <Textarea
              placeholder="State why this time cannot be accommodated or ask the student to select another window..."
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              rows={4}
              className="rounded-xl border-[#E9DED8] bg-[#FCF9F6] text-xs focus:border-[#7A1F57]"
            />
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setRejectDialog({ open: false, id: '' })}
              className="rounded-xl border-[#E9DED8] text-xs font-semibold text-[#75676C]"
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl bg-[#B64242] hover:bg-[#9B3232] text-white text-xs font-bold"
              onClick={rejectAppointment}
              disabled={submitting || !rejectionReason.trim()}
            >
              {submitting ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

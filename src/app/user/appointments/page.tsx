'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Calendar, Loader2, XCircle, Clock, Sparkles } from 'lucide-react'
import { formatTime12h, formatDate } from '@/utils/slot-generator'
import { AppointmentStatusBadge } from '@/components/ui/appointment-status'

type Filter = 'all' | 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled'

export default function UserAppointmentsPage() {
  const { profile } = useAuth()
  const [appointments, setAppointments] = useState<any[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [loading, setLoading] = useState(true)
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; id: string; slotId: string }>({
    open: false, id: '', slotId: '',
  })
  const [cancelling, setCancelling] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (profile) fetchAppointments()
  }, [profile, filter])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('appointments')
        .select(`
          id, status, reason, rejection_reason, created_at, slot_id,
          faculty:faculty!appointments_faculty_id_fkey(
            designation, department, office_location,
            profile:profiles!faculty_profile_id_fkey(full_name, email, image_url)
          ),
          slot:appointment_slots!appointments_slot_id_fkey(date, start_time, end_time)
        `)
        .eq('user_id', profile!.id)
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

  const cancelAppointment = async () => {
    setCancelling(true)
    const [aptRes] = await Promise.all([
      supabase.from('appointments').update({ status: 'cancelled' }).eq('id', cancelDialog.id),
      supabase.from('appointment_slots').update({ status: 'AVAILABLE' }).eq('id', cancelDialog.slotId),
    ])

    if (aptRes.error) {
      toast.error('Failed to cancel appointment')
    } else {
      toast.success('Appointment cancelled')
      setCancelDialog({ open: false, id: '', slotId: '' })
      fetchAppointments()
    }
    setCancelling(false)
  }

  const filterTabs: { value: Filter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Upcoming / Approved' },
    { value: 'completed', label: 'Completed' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'cancelled', label: 'Cancelled' },
  ]

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9DED8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1BF] text-[#7A1F57] text-[11px] font-bold border border-[#E8B52D]/40">
            <Sparkles className="w-3.5 h-3.5 text-[#7A1F57]" />
            <span>MY APPOINTMENTS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#34252D] tracking-tight">
            Appointment Records & Requests
          </h1>
          <p className="text-xs sm:text-sm text-[#75676C]">
            Track status, notes, and schedules for your consultations with college faculty.
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

      {/* Appointment Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#7A1F57]" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-[#E9DED8] text-center space-y-3 shadow-xs">
          <Calendar className="w-10 h-10 mx-auto text-[#9A8E91]" />
          <h3 className="text-sm font-bold text-[#34252D]">
            No {filter !== 'all' ? filter : ''} appointments found
          </h3>
          <p className="text-xs text-[#75676C]">
            When you book consultations with professors, they will show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map(apt => {
            const canCancel = apt.status === 'pending' || apt.status === 'approved'

            return (
              <div
                key={apt.id}
                className="bg-white rounded-2xl p-6 border border-[#E9DED8] hover:border-[#7A1F57]/30 transition-all shadow-xs"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#F1DCE8] text-[#7A1F57] flex items-center justify-center text-base font-bold flex-shrink-0 shadow-xs">
                      {apt.faculty?.profile?.full_name?.charAt(0) || 'F'}
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-bold text-sm text-[#34252D]">
                          {apt.faculty?.profile?.full_name || 'Faculty Member'}
                        </span>
                        <AppointmentStatusBadge status={apt.status} />
                      </div>

                      <div className="text-xs font-semibold text-[#7A1F57]">
                        {apt.faculty?.designation} • {apt.faculty?.department}
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
                        <span className="font-bold text-[#75676C]">Reason: </span>
                        {apt.reason}
                      </div>

                      {apt.rejection_reason && (
                        <div className="text-xs rounded-xl p-3 bg-[#FBE8E8] border border-[#B64242]/20 text-[#B64242]">
                          <span className="font-bold">Faculty Note / Rejection Reason: </span>
                          {apt.rejection_reason}
                        </div>
                      )}
                    </div>
                  </div>

                  {canCancel && (
                    <div className="flex-shrink-0 flex sm:flex-col items-end justify-between">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCancelDialog({ open: true, id: apt.id, slotId: apt.slot_id })}
                        className="rounded-xl border-[#B64242]/30 text-[#B64242] hover:bg-[#FBE8E8] hover:text-[#B64242] font-bold text-xs h-9 px-3.5"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        Cancel Request
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialog.open} onOpenChange={open => setCancelDialog({ open, id: '', slotId: '' })}>
        <DialogContent className="bg-white rounded-3xl border border-[#E9DED8] p-6 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#34252D]">
              Cancel Appointment Request?
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-[#75676C] leading-relaxed my-2">
            Are you sure you want to cancel this appointment? The selected time slot will immediately become available for other students to book.
          </p>
          <DialogFooter className="gap-2 mt-4">
            <Button
              variant="outline"
              className="rounded-xl border-[#E9DED8] text-xs font-semibold text-[#75676C]"
              onClick={() => setCancelDialog({ open: false, id: '', slotId: '' })}
            >
              Keep Appointment
            </Button>
            <Button
              className="rounded-xl bg-[#B64242] hover:bg-[#9B3232] text-white text-xs font-bold"
              onClick={cancelAppointment}
              disabled={cancelling}
            >
              {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

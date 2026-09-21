'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import { AppointmentSlot, FacultyWithProfile, FacultyAvailability } from '@/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  MapPin, Briefcase, Phone, ChevronLeft, CalendarDays, Clock, CheckCircle, Loader2, Sparkles, AlertCircle
} from 'lucide-react'
import { formatTime12h, formatDate, formatDateShort } from '@/utils/slot-generator'
import Link from 'next/link'

type Step = 'profile' | 'date' | 'slot' | 'reason' | 'confirm'

export default function FacultyProfileAndBookPage() {
  const params = useParams()
  const router = useRouter()
  const { profile: userProfile } = useAuth()
  const facultyId = params.id as string

  const [faculty, setFaculty] = useState<FacultyWithProfile | null>(null)
  const [availability, setAvailability] = useState<FacultyAvailability[]>([])
  const [slots, setSlots] = useState<AppointmentSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<Step>('profile')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchFaculty()
    fetchAvailability()
  }, [facultyId])

  const fetchFaculty = async () => {
    try {
      const { data, error } = await supabase
        .from('faculty')
        .select(`*, profile:profiles!faculty_profile_id_fkey(*)`)
        .eq('id', facultyId)
        .single()
      if (!error && data) {
        setFaculty(data as FacultyWithProfile)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailability = async () => {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('faculty_availability')
      .select('*')
      .eq('faculty_id', facultyId)
      .eq('is_active', true)
      .gte('date', today)
      .order('date', { ascending: true })
    setAvailability(data || [])
  }

  const fetchSlots = async (date: string) => {
    setLoadingSlots(true)
    const { data } = await supabase
      .from('appointment_slots')
      .select('*')
      .eq('faculty_id', facultyId)
      .eq('date', date)
      .in('status', ['AVAILABLE'])
      .order('start_time', { ascending: true })
    setSlots(data || [])
    setLoadingSlots(false)
  }

  const selectDate = async (date: string) => {
    setSelectedDate(date)
    setSelectedSlot(null)
    setSlots([])
    await fetchSlots(date)
    setStep('slot')
  }

  const selectSlot = (slot: AppointmentSlot) => {
    setSelectedSlot(slot)
    setStep('reason')
  }

  const confirmBooking = async () => {
    if (!selectedSlot || !reason.trim() || !userProfile) return
    setSubmitting(true)

    // Mark slot as booked and create appointment
    const { error: slotError } = await supabase
      .from('appointment_slots')
      .update({ status: 'BOOKED' })
      .eq('id', selectedSlot.id)
      .eq('status', 'AVAILABLE')

    if (slotError) {
      toast.error('This slot has just been booked by another user. Please select another slot.')
      setStep('slot')
      fetchSlots(selectedDate!)
      setSubmitting(false)
      return
    }

    const { error: aptError } = await supabase
      .from('appointments')
      .insert({
        slot_id: selectedSlot.id,
        user_id: userProfile.id,
        faculty_id: facultyId,
        reason: reason.trim(),
        status: 'pending',
      })

    if (aptError) {
      await supabase.from('appointment_slots').update({ status: 'AVAILABLE' }).eq('id', selectedSlot.id)
      toast.error('Failed to create appointment. Please try again.')
      setSubmitting(false)
      return
    }

    if (faculty?.profile_id) {
      await supabase.from('notifications').insert({
        user_id: faculty.profile_id,
        title: 'New Appointment Request',
        message: `${userProfile.full_name} requested an appointment on ${formatDateShort(selectedSlot.date)} at ${formatTime12h(selectedSlot.start_time)}`,
        type: 'appointment_requested',
      })
    }

    toast.success('Appointment request submitted successfully!')
    router.push('/user/appointments')
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#7A1F57]" />
      </div>
    )
  }

  if (!faculty) {
    return (
      <div className="p-10 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#34252D]">Faculty member not found</h2>
        <Link href="/user/faculty">
          <Button className="rounded-xl bg-[#7A1F57] text-white">Back to Directory</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-10 max-w-4xl mx-auto space-y-6 animate-fade-in">
      
      {/* Back to Directory */}
      <Link
        href="/user/faculty"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#75676C] hover:text-[#7A1F57] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Faculty Directory</span>
      </Link>

      {/* Faculty Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9DED8] shadow-xs">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-[#F1DCE8] text-[#7A1F57] flex items-center justify-center text-2xl font-bold flex-shrink-0 shadow-xs">
            {faculty.profile?.image_url ? (
              <img
                src={faculty.profile.image_url}
                alt={faculty.profile.full_name}
                className="w-20 h-20 rounded-2xl object-cover"
              />
            ) : (
              faculty.profile?.full_name?.charAt(0) || 'F'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFF1BF] text-[#7A1F57] text-[10px] font-bold border border-[#E8B52D]/30 mb-2">
              <Sparkles className="w-3 h-3 text-[#7A1F57]" />
              <span>FACULTY PROFILE</span>
            </div>
            <h1 className="text-2xl font-bold text-[#34252D]">{faculty.profile?.full_name}</h1>
            <p className="text-xs font-bold text-[#7A1F57] mt-0.5">{faculty.designation}</p>

            <div className="flex flex-wrap gap-4 mt-3 text-xs text-[#75676C]">
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#9A8E91]" />
                {faculty.department}
              </span>
              {faculty.office_location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#9A8E91]" />
                  {faculty.office_location}
                </span>
              )}
              {faculty.profile?.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#9A8E91]" />
                  {faculty.profile.phone}
                </span>
              )}
            </div>

            {(faculty.bio || faculty.profile?.bio) && (
              <p className="mt-3.5 text-xs text-[#75676C] leading-relaxed">
                {faculty.bio || faculty.profile?.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Step 1: Select Date */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9DED8] shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-[#E9DED8] pb-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#34252D]">
            <CalendarDays className="w-4 h-4 text-[#7A1F57]" />
            <span>1. Choose Available Date</span>
          </div>
        </div>

        {availability.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#75676C]">
            No open consultation dates published at the moment. Please check back later.
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {availability.map(avail => {
              const isSelected = selectedDate === avail.date
              const d = new Date(avail.date + 'T00:00:00')
              return (
                <button
                  key={avail.id}
                  onClick={() => selectDate(avail.date)}
                  className={`p-3.5 rounded-2xl text-center transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#7A1F57] text-white border-[#7A1F57] shadow-md shadow-[#7A1F57]/20 scale-105'
                      : 'bg-[#FCF9F6] text-[#34252D] border-[#E9DED8] hover:border-[#7A1F57]/50'
                  }`}
                  style={{ minWidth: '90px' }}
                >
                  <div className="text-lg font-bold">{d.getDate()}</div>
                  <div className="text-[11px] font-semibold uppercase">{d.toLocaleDateString('en-IN', { month: 'short' })}</div>
                  <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-[#75676C]'}`}>
                    {d.toLocaleDateString('en-IN', { weekday: 'short' })}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Step 2: Select Slot */}
      {selectedDate && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9DED8] shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#E9DED8] pb-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#34252D]">
              <Clock className="w-4 h-4 text-[#7A1F57]" />
              <span>2. Select Time Slot — {formatDate(selectedDate)}</span>
            </div>
          </div>

          {loadingSlots ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#7A1F57]" />
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-6 text-xs text-[#75676C]">
              No available slots remaining for this date.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {slots.map(slot => {
                const isSelected = selectedSlot?.id === slot.id
                return (
                  <button
                    key={slot.id}
                    onClick={() => selectSlot(slot)}
                    className={`p-3 rounded-xl text-center transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#F1DCE8] border-[#7A1F57] text-[#7A1F57] font-bold shadow-xs'
                        : 'bg-[#FCF9F6] border-[#E9DED8] hover:border-[#7A1F57]/40 text-[#34252D]'
                    }`}
                  >
                    <div className="text-xs font-bold">
                      {formatTime12h(slot.start_time)}
                    </div>
                    <div className="text-[10px] text-[#75676C] mt-0.5">
                      to {formatTime12h(slot.end_time)}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Enter Reason & Confirm */}
      {selectedSlot && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9DED8] shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#E9DED8] pb-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#34252D]">
              <CheckCircle className="w-4 h-4 text-[#7A1F57]" />
              <span>3. Confirm Consultation Details</span>
            </div>
          </div>

          <div className="bg-[#FCF9F6] p-4 rounded-2xl border border-[#E9DED8] space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#75676C]">Faculty:</span>
              <span className="font-bold text-[#34252D]">{faculty.profile?.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#75676C]">Date:</span>
              <span className="font-bold text-[#34252D]">{formatDate(selectedSlot.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#75676C]">Time:</span>
              <span className="font-bold text-[#7A1F57]">
                {formatTime12h(selectedSlot.start_time)} – {formatTime12h(selectedSlot.end_time)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#34252D]">
              Reason for Appointment <span className="text-[#B64242]">*</span>
            </label>
            <Textarea
              placeholder="State your agenda clearly (e.g. Project review, doubt clarification, recommendation request)..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              className="rounded-xl border-[#E9DED8] bg-[#FCF9F6] text-xs focus:border-[#7A1F57]"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              className="w-full h-11 rounded-xl bg-[#7A1F57] hover:bg-[#651744] text-white font-bold text-xs shadow-md shadow-[#7A1F57]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              onClick={confirmBooking}
              disabled={submitting || !reason.trim()}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Request...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirm Appointment Request</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}

    </div>
  )
}

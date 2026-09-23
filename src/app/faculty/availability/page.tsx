'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import { FacultyAvailability, ManualSlotInput, SlotMode } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  Plus, Trash2, Clock, Calendar, Loader2, Sparkles, AlertCircle, CheckCircle2, ChevronRight
} from 'lucide-react'
import {
  generateMinuteBasedSlots, validateManualSlots, formatTime12h,
  formatDate, isDateInPast, getTodayString
} from '@/utils/slot-generator'

interface AvailabilityWithSlotCount extends FacultyAvailability {
  slot_count?: number
}

export default function FacultyAvailabilityPage() {
  const { profile } = useAuth()
  const [facultyId, setFacultyId] = useState<string | null>(null)
  const [availability, setAvailability] = useState<AvailabilityWithSlotCount[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  // Form state
  const [date, setDate] = useState(getTodayString())
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [slotMode, setSlotMode] = useState<SlotMode>('MINUTE_BASED')
  const [duration, setDuration] = useState(15)
  const [manualSlots, setManualSlots] = useState<ManualSlotInput[]>([])
  const [newSlotStart, setNewSlotStart] = useState('')
  const [newSlotEnd, setNewSlotEnd] = useState('')
  const [preview, setPreview] = useState<{ start: string; end: string }[]>([])

  useEffect(() => {
    if (profile) getFacultyId()
  }, [profile])

  const getFacultyId = async () => {
    try {
      const { data, error } = await supabase
        .from('faculty')
        .select('id')
        .eq('profile_id', profile!.id)
        .single()
        
      if (error) {
        console.error('Error fetching faculty record:', error)
        toast.error('Could not find your faculty profile. Ensure you are registered as a faculty member.')
      }

      if (data) {
        setFacultyId(data.id)
        fetchAvailability(data.id)
      } else {
        setLoading(false)
      }
    } catch (err) {
      console.error('Unexpected error fetching faculty id:', err)
      setLoading(false)
    }
  }

  const fetchAvailability = async (fid: string) => {
    try {
      const { data } = await supabase
        .from('faculty_availability')
        .select(`
          *,
          slot_count:appointment_slots(count)
        `)
        .eq('faculty_id', fid)
        .order('date', { ascending: true })

      const formatted = (data || []).map((a: any) => ({
        ...a,
        slot_count: a.slot_count?.[0]?.count || 0,
      }))
      setAvailability(formatted)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updatePreview = useCallback(() => {
    if (slotMode === 'MINUTE_BASED' && startTime && endTime && duration > 0) {
      try {
        const slots = generateMinuteBasedSlots(startTime, endTime, duration)
        setPreview(slots)
      } catch {
        setPreview([])
      }
    } else {
      setPreview([])
    }
  }, [slotMode, startTime, endTime, duration])

  useEffect(() => {
    updatePreview()
  }, [updatePreview])

  const addManualSlot = () => {
    if (!newSlotStart || !newSlotEnd) {
      toast.error('Enter slot start and end time')
      return
    }
    const newSlot = { start_time: newSlotStart, end_time: newSlotEnd }
    const error = validateManualSlots(
      [...manualSlots.map(s => ({ start: s.start_time, end: s.end_time })),
       { start: newSlotStart, end: newSlotEnd }],
      startTime,
      endTime
    )
    if (error) { toast.error(error); return }
    setManualSlots(prev => [...prev, newSlot])
    setNewSlotStart('')
    setNewSlotEnd('')
  }

  const removeManualSlot = (i: number) => {
    setManualSlots(prev => prev.filter((_, idx) => idx !== i))
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!facultyId) {
      toast.error('Unable to save: Faculty profile not found.')
      return
    }
    if (isDateInPast(date)) { toast.error('Cannot create availability in the past'); return }
    if (slotMode === 'MINUTE_BASED' && preview.length === 0) {
      toast.error('No slots can be generated with the given parameters')
      return
    }
    if (slotMode === 'MANUAL' && manualSlots.length === 0) {
      toast.error('Please add at least one manual slot')
      return
    }

    setSubmitting(true)

    const formatTime = (t: string) => t.length === 5 ? `${t}:00` : t

    // Create availability record
    const { data: avail, error: availError } = await supabase
      .from('faculty_availability')
      .insert({
        faculty_id: facultyId,
        date,
        start_time: formatTime(startTime),
        end_time: formatTime(endTime),
        slot_mode: slotMode,
        slot_duration: slotMode === 'MINUTE_BASED' ? duration : null,
      })
      .select()
      .single()

    if (availError) {
      console.error('Availability Insert Error:', availError)
      toast.error(availError.message.includes('unique') ? 'Availability already exists for this date' : `Error: ${availError.message}`)
      setSubmitting(false)
      return
    }

    // Insert slots
    const slotsToInsert =
      slotMode === 'MINUTE_BASED'
        ? preview.map(s => ({
            availability_id: avail.id,
            faculty_id: facultyId,
            date,
            start_time: formatTime(s.start),
            end_time: formatTime(s.end),
            status: 'AVAILABLE',
          }))
        : manualSlots.map(s => ({
            availability_id: avail.id,
            faculty_id: facultyId,
            date,
            start_time: formatTime(s.start_time),
            end_time: formatTime(s.end_time),
            status: 'AVAILABLE',
          }))

    const { error: slotsError } = await supabase.from('appointment_slots').insert(slotsToInsert)

    if (slotsError) {
      console.error('Slots Insert Error:', slotsError)
      await supabase.from('faculty_availability').delete().eq('id', avail.id)
      toast.error(`Failed to create slots: ${slotsError.message}`)
      setSubmitting(false)
      return
    }

    toast.success(`Availability created with ${slotsToInsert.length} slot${slotsToInsert.length !== 1 ? 's' : ''}`)
    setShowDialog(false)
    setManualSlots([])
    fetchAvailability(facultyId)
    setSubmitting(false)
  }

  const deleteAvailability = async (avail: AvailabilityWithSlotCount) => {
    if ((avail.slot_count || 0) > 0) {
      const { count: bookedCount } = await supabase
        .from('appointment_slots')
        .select('*', { count: 'exact', head: true })
        .eq('availability_id', avail.id)
        .eq('status', 'BOOKED')

      if (bookedCount && bookedCount > 0) {
        toast.error('Cannot delete: some slots in this window are already booked')
        return
      }
    }

    const { error } = await supabase
      .from('faculty_availability')
      .delete()
      .eq('id', avail.id)

    if (error) {
      toast.error('Failed to delete availability')
    } else {
      toast.success('Availability window removed')
      fetchAvailability(facultyId!)
    }
  }

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9DED8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1BF] text-[#7A1F57] text-[11px] font-bold border border-[#E8B52D]/40">
            <Sparkles className="w-3.5 h-3.5 text-[#7A1F57]" />
            <span>AVAILABILITY BUILDER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#34252D] tracking-tight">
            Consultation Windows & Slots
          </h1>
          <p className="text-xs sm:text-sm text-[#75676C]">
            Create and partition times when students can book appointments with you.
          </p>
        </div>

        <Button
          onClick={() => setShowDialog(true)}
          className="h-11 px-5 rounded-2xl bg-[#7A1F57] hover:bg-[#651744] text-white font-bold text-xs shadow-md shadow-[#7A1F57]/15 flex items-center gap-2 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Availability</span>
        </Button>
      </div>

      {/* Availability List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#7A1F57]" />
        </div>
      ) : availability.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-[#E9DED8] text-center space-y-4 shadow-xs">
          <Clock className="w-12 h-12 mx-auto text-[#9A8E91]" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#34252D]">No published availability windows</h3>
            <p className="text-xs text-[#75676C] max-w-md mx-auto">
              You have not created any consultation hours yet. Use the button below to set up minute-based or custom slots.
            </p>
          </div>
          <Button
            onClick={() => setShowDialog(true)}
            className="h-10 px-5 rounded-xl bg-[#7A1F57] text-white font-bold text-xs"
          >
            Create Your First Window
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {availability.map((avail) => (
            <div
              key={avail.id}
              className="bg-white rounded-2xl p-6 border border-[#E9DED8] hover:border-[#7A1F57]/30 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-[#F1DCE8] text-[#7A1F57] flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold leading-none">
                    {new Date(avail.date + 'T00:00:00').getDate()}
                  </span>
                  <span className="text-[10px] font-bold uppercase mt-0.5">
                    {new Date(avail.date + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short' })}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-[#34252D]">
                    {new Date(avail.date + 'T00:00:00').toLocaleDateString('en-IN', {
                      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                    })}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-[#75676C]">
                    <Clock className="w-3.5 h-3.5 text-[#7A1F57]" />
                    <span>{formatTime12h(avail.start_time)} — {formatTime12h(avail.end_time)}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FCF9F6] border border-[#E9DED8] text-[#7A1F57]">
                      {avail.slot_mode === 'MINUTE_BASED' ? `${avail.slot_duration}m Duration` : 'Manual Slots'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E5F4EC] text-[#2E7D5B]">
                      {avail.slot_count} slot{avail.slot_count !== 1 ? 's' : ''} generated
                    </span>
                    {isDateInPast(avail.date) && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F7EFE8] text-[#75676C]">
                        Past
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#E9DED8]">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteAvailability(avail)}
                  className="rounded-xl border-[#B64242]/30 text-[#B64242] hover:bg-[#FBE8E8] text-xs font-bold h-9 px-3"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Availability Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl border border-[#E9DED8] p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#34252D]">
              Create Consultation Availability
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-6 mt-4">
            
            {/* Date, Start Time, End Time Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#34252D]">Date *</label>
                <Input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  min={getTodayString()}
                  required
                  className="h-11 rounded-xl border-[#E9DED8] bg-[#FCF9F6] text-xs font-medium focus:border-[#7A1F57]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#34252D]">Start Time *</label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  required
                  className="h-11 rounded-xl border-[#E9DED8] bg-[#FCF9F6] text-xs font-medium focus:border-[#7A1F57]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#34252D]">End Time *</label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  required
                  className="h-11 rounded-xl border-[#E9DED8] bg-[#FCF9F6] text-xs font-medium focus:border-[#7A1F57]"
                />
              </div>
            </div>

            {/* Slot Mode Selection (Section 19) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#34252D]">Slot Generation Mode *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSlotMode('MINUTE_BASED')}
                  className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                    slotMode === 'MINUTE_BASED'
                      ? 'bg-[#F1DCE8] border-[#7A1F57] text-[#7A1F57]'
                      : 'bg-[#FCF9F6] border-[#E9DED8] text-[#34252D] hover:border-[#7A1F57]/40'
                  }`}
                >
                  <div className="font-bold text-xs">⏱ Minute-Based Mode</div>
                  <div className="text-[11px] text-[#75676C] mt-0.5">
                    Automatically partition window into equal slots
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSlotMode('MANUAL')}
                  className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                    slotMode === 'MANUAL'
                      ? 'bg-[#F1DCE8] border-[#7A1F57] text-[#7A1F57]'
                      : 'bg-[#FCF9F6] border-[#E9DED8] text-[#34252D] hover:border-[#7A1F57]/40'
                  }`}
                >
                  <div className="font-bold text-xs">✏️ Manual Slots Mode</div>
                  <div className="text-[11px] text-[#75676C] mt-0.5">
                    Define custom start and end times individually
                  </div>
                </button>
              </div>
            </div>

            {/* Minute-Based Mode Options & Live Preview (Section 20) */}
            {slotMode === 'MINUTE_BASED' && (
              <div className="bg-[#FCF9F6] rounded-2xl p-5 border border-[#E9DED8] space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#34252D]">Slot Duration (minutes)</label>
                  <div className="flex flex-wrap gap-2">
                    {[5, 10, 15, 20, 30, 45, 60].map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDuration(d)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          duration === d
                            ? 'bg-[#7A1F57] text-white border-[#7A1F57] shadow-xs'
                            : 'bg-white border-[#E9DED8] text-[#34252D] hover:border-[#7A1F57]/40'
                        }`}
                      >
                        {d} min
                      </button>
                    ))}
                  </div>
                </div>

                {preview.length > 0 ? (
                  <div className="space-y-2 pt-2 border-t border-[#E9DED8]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#34252D]">Generated Preview</span>
                      <span className="text-[#2E7D5B] font-bold">{preview.length} slots ready</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                      {preview.map((slot, i) => (
                        <div
                          key={i}
                          className="bg-white border border-[#E9DED8] rounded-xl p-2.5 text-center text-xs"
                        >
                          <span className="font-bold text-[#7A1F57] block">
                            {formatTime12h(slot.start)}
                          </span>
                          <span className="text-[10px] text-[#75676C]">
                            to {formatTime12h(slot.end)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-[#B7791F] pt-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>No complete {duration}-minute slots fit between {startTime} and {endTime}.</span>
                  </div>
                )}
              </div>
            )}

            {/* Manual Slot Mode Options (Section 21) */}
            {slotMode === 'MANUAL' && (
              <div className="bg-[#FCF9F6] rounded-2xl p-5 border border-[#E9DED8] space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#34252D]">Add Custom Slot</label>
                  <div className="flex items-end gap-3">
                    <div className="space-y-1 flex-1">
                      <span className="text-[10px] font-bold text-[#75676C]">Start</span>
                      <Input
                        type="time"
                        value={newSlotStart}
                        onChange={e => setNewSlotStart(e.target.value)}
                        className="h-10 rounded-xl bg-white border-[#E9DED8] text-xs"
                      />
                    </div>
                    <div className="space-y-1 flex-1">
                      <span className="text-[10px] font-bold text-[#75676C]">End</span>
                      <Input
                        type="time"
                        value={newSlotEnd}
                        onChange={e => setNewSlotEnd(e.target.value)}
                        className="h-10 rounded-xl bg-white border-[#E9DED8] text-xs"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={addManualSlot}
                      className="h-10 rounded-xl bg-[#7A1F57] text-white text-xs font-bold px-4"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>

                {manualSlots.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#E9DED8]">
                    <span className="text-xs font-bold text-[#34252D]">Added Slots ({manualSlots.length})</span>
                    <div className="space-y-1.5">
                      {manualSlots.map((slot, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-[#E9DED8] text-xs"
                        >
                          <span className="font-bold text-[#34252D]">
                            {formatTime12h(slot.start_time)} – {formatTime12h(slot.end_time)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeManualSlot(i)}
                            className="text-xs font-bold text-[#B64242] hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="rounded-xl border-[#E9DED8] text-xs font-bold text-[#75676C]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-[#7A1F57] hover:bg-[#651744] text-white text-xs font-bold px-5"
              >
                {submitting ? 'Generating...' : 'Save Availability'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

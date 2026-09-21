/**
 * Slot Generation Engine
 * Handles minute-based slot generation according to the implementation spec
 */

import { TimeSlot } from '@/types'

/**
 * Parse time string "HH:MM" or "HH:MM:SS" to total minutes from midnight
 */
export function timeToMinutes(time: string): number {
  const parts = time.split(':')
  const hours = parseInt(parts[0], 10)
  const minutes = parseInt(parts[1], 10)
  return hours * 60 + minutes
}

/**
 * Convert total minutes from midnight back to "HH:MM" string
 */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/**
 * Format "HH:MM" or "HH:MM:SS" to 12-hour display format "hh:mm AM/PM"
 */
export function formatTime12h(time: string): string {
  const [hourStr, minuteStr] = time.split(':')
  let hour = parseInt(hourStr, 10)
  const minute = parseInt(minuteStr, 10)
  const period = hour >= 12 ? 'PM' : 'AM'
  if (hour === 0) hour = 12
  else if (hour > 12) hour -= 12
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`
}

/**
 * Generate minute-based slots.
 *
 * Rules:
 * - number_of_slots = floor((end - start) / duration)
 * - Partial final slots are NOT generated
 * - All slots fit within [startTime, endTime]
 *
 * @param startTime - "HH:MM" or "HH:MM:SS"
 * @param endTime   - "HH:MM" or "HH:MM:SS"
 * @param duration  - slot duration in minutes (must be > 0)
 * @returns Array of {start, end} slots in "HH:MM" format
 */
export function generateMinuteBasedSlots(
  startTime: string,
  endTime: string,
  duration: number
): TimeSlot[] {
  if (duration <= 0) {
    throw new Error('Slot duration must be a positive number of minutes')
  }

  const startMinutes = timeToMinutes(startTime)
  const endMinutes = timeToMinutes(endTime)

  if (endMinutes <= startMinutes) {
    throw new Error('End time must be after start time')
  }

  const slots: TimeSlot[] = []
  let current = startMinutes

  while (current + duration <= endMinutes) {
    slots.push({
      start: minutesToTime(current),
      end: minutesToTime(current + duration),
    })
    current += duration
  }

  return slots
}

/**
 * Validate that manual slots:
 * 1. Each slot has start < end
 * 2. Slots do not overlap each other
 * 3. All slots fit within availability window
 *
 * @returns null if valid, error message string if invalid
 */
export function validateManualSlots(
  slots: TimeSlot[],
  availStart: string,
  availEnd: string
): string | null {
  const windowStart = timeToMinutes(availStart)
  const windowEnd = timeToMinutes(availEnd)

  for (let i = 0; i < slots.length; i++) {
    const s = timeToMinutes(slots[i].start)
    const e = timeToMinutes(slots[i].end)

    if (e <= s) {
      return `Slot ${i + 1}: end time must be after start time`
    }
    if (s < windowStart || e > windowEnd) {
      return `Slot ${i + 1}: must be within availability window`
    }

    // Check overlap with subsequent slots
    for (let j = i + 1; j < slots.length; j++) {
      const s2 = timeToMinutes(slots[j].start)
      const e2 = timeToMinutes(slots[j].end)
      if (s < e2 && e > s2) {
        return `Slots ${i + 1} and ${j + 1} overlap`
      }
    }
  }

  return null
}

/**
 * Check if a given date string (YYYY-MM-DD) is in the past
 */
export function isDateInPast(date: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(date)
  return d < today
}

/**
 * Format a date string YYYY-MM-DD to a human-readable format
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Format a date string YYYY-MM-DD to short format like "22 Sep"
 */
export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayString(): string {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

/**
 * Sort slots by start time
 */
export function sortSlotsByTime<T extends { start_time: string }>(slots: T[]): T[] {
  return [...slots].sort((a, b) => {
    return timeToMinutes(a.start_time) - timeToMinutes(b.start_time)
  })
}

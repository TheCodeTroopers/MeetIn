// ============================================================
// Database Types — College Faculty Appointment System
// ============================================================

export type UserRole = 'admin' | 'faculty' | 'user'
export type SlotMode = 'MANUAL' | 'MINUTE_BASED'
export type SlotStatus = 'AVAILABLE' | 'BOOKED' | 'BLOCKED' | 'COMPLETED' | 'CANCELLED'
export type AppointmentStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled'
export type NotificationType =
  | 'appointment_requested'
  | 'appointment_approved'
  | 'appointment_rejected'
  | 'appointment_cancelled'
  | 'appointment_completed'
  | 'appointment_reminder'
  | 'faculty_added'
  | 'faculty_deactivated'
  | 'system_alert'

export interface Profile {
  id: string
  full_name: string
  email: string
  role: UserRole
  department?: string
  year?: string
  designation?: string
  bio?: string
  phone?: string
  image_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Faculty {
  id: string
  profile_id: string
  employee_id?: string
  department: string
  designation: string
  office_location?: string
  bio?: string
  is_active: boolean
  created_at: string
  updated_at: string
  // Joined fields
  profile?: Profile
}

export interface FacultyWithProfile extends Faculty {
  profile: Profile
}

export interface FacultyAvailability {
  id: string
  faculty_id: string
  date: string // ISO date string YYYY-MM-DD
  start_time: string // HH:MM:SS
  end_time: string // HH:MM:SS
  slot_mode: SlotMode
  slot_duration?: number // minutes, null for MANUAL mode
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AppointmentSlot {
  id: string
  availability_id: string
  faculty_id: string
  date: string // YYYY-MM-DD
  start_time: string // HH:MM:SS
  end_time: string // HH:MM:SS
  status: SlotStatus
  created_at: string
  updated_at: string
  // Joined
  faculty?: Faculty
}

export interface Appointment {
  id: string
  slot_id: string
  user_id: string
  faculty_id: string
  reason: string
  status: AppointmentStatus
  rejection_reason?: string
  created_at: string
  updated_at: string
  // Joined
  slot?: AppointmentSlot
  user?: Profile
  faculty?: Faculty
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  is_read: boolean
  related_id?: string
  created_at: string
}

export interface AuditLog {
  id: string
  user_id?: string
  action: string
  entity_type: string
  entity_id?: string
  metadata?: Record<string, unknown>
  created_at: string
  user?: Profile
}

// ============================================================
// Form/Request Types
// ============================================================

export interface CreateFacultyInput {
  full_name: string
  email: string
  employee_id?: string
  department: string
  designation: string
  office_location?: string
  bio?: string
  phone?: string
  image_url?: string
  is_active?: boolean
}

export interface UpdateFacultyInput extends Partial<CreateFacultyInput> {
  id: string
}

export interface CreateAvailabilityInput {
  date: string // YYYY-MM-DD
  start_time: string // HH:MM
  end_time: string // HH:MM
  slot_mode: SlotMode
  slot_duration?: number // required for MINUTE_BASED
  manual_slots?: ManualSlotInput[] // required for MANUAL
}

export interface ManualSlotInput {
  start_time: string // HH:MM
  end_time: string // HH:MM
}

export interface CreateAppointmentInput {
  slot_id: string
  faculty_id: string
  reason: string
}

export interface RejectAppointmentInput {
  id: string
  rejection_reason: string
}

// ============================================================
// Utility Types
// ============================================================

export interface TimeSlot {
  start: string // HH:MM
  end: string // HH:MM
}

export interface DashboardStats {
  today_appointments: number
  pending_requests: number
  upcoming_appointments: number
  available_slots: number
  total_appointments: number
  completed_appointments: number
  cancelled_appointments: number
}

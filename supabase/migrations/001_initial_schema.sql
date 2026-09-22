-- ============================================================
-- College Faculty Appointment System — Initial Schema
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM ('admin', 'faculty', 'user');
CREATE TYPE slot_mode AS ENUM ('MANUAL', 'MINUTE_BASED');
CREATE TYPE slot_status AS ENUM ('AVAILABLE', 'BOOKED', 'BLOCKED', 'COMPLETED', 'CANCELLED');
CREATE TYPE appointment_status AS ENUM ('pending', 'approved', 'rejected', 'completed', 'cancelled');
CREATE TYPE notification_type AS ENUM (
  'appointment_requested',
  'appointment_approved',
  'appointment_rejected',
  'appointment_cancelled',
  'appointment_completed',
  'appointment_reminder',
  'faculty_added',
  'faculty_deactivated',
  'system_alert'
);

-- ============================================================
-- PROFILES
-- Stores all authenticated users (linked to Supabase Auth)
-- ============================================================

CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  role          user_role NOT NULL DEFAULT 'user',
  department    TEXT,
  year          TEXT,
  designation   TEXT,
  bio           TEXT,
  phone         TEXT,
  image_url     TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FACULTY
-- Extended information for faculty members
-- ============================================================

CREATE TABLE faculty (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id       UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  employee_id      TEXT UNIQUE,
  department       TEXT NOT NULL,
  designation      TEXT NOT NULL,
  office_location  TEXT,
  bio              TEXT,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FACULTY AVAILABILITY
-- Defines when a faculty member is available
-- ============================================================

CREATE TABLE faculty_availability (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faculty_id      UUID NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  slot_mode       slot_mode NOT NULL DEFAULT 'MINUTE_BASED',
  slot_duration   INTEGER, -- minutes, NULL for MANUAL mode
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- No overlapping availability for the same faculty on same date
  CONSTRAINT availability_time_check CHECK (end_time > start_time),
  CONSTRAINT slot_duration_check CHECK (
    (slot_mode = 'MINUTE_BASED' AND slot_duration IS NOT NULL AND slot_duration > 0)
    OR (slot_mode = 'MANUAL' AND slot_duration IS NULL)
  )
);

-- Prevent overlapping availability for the same faculty on the same date
CREATE UNIQUE INDEX no_overlapping_availability
  ON faculty_availability (faculty_id, date)
  WHERE is_active = TRUE;

-- ============================================================
-- APPOINTMENT SLOTS
-- Individual bookable time units (both manual & generated)
-- ============================================================

CREATE TABLE appointment_slots (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  availability_id  UUID NOT NULL REFERENCES faculty_availability(id) ON DELETE CASCADE,
  faculty_id       UUID NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
  date             DATE NOT NULL,
  start_time       TIME NOT NULL,
  end_time         TIME NOT NULL,
  status           slot_status NOT NULL DEFAULT 'AVAILABLE',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT slot_time_check CHECK (end_time > start_time)
);

-- Index for fast slot lookups by faculty and date
CREATE INDEX idx_slots_faculty_date ON appointment_slots (faculty_id, date);
CREATE INDEX idx_slots_availability ON appointment_slots (availability_id);
CREATE INDEX idx_slots_status ON appointment_slots (status);

-- ============================================================
-- APPOINTMENTS
-- User bookings against a slot
-- ============================================================

CREATE TABLE appointments (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot_id          UUID NOT NULL REFERENCES appointment_slots(id) ON DELETE RESTRICT,
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  faculty_id       UUID NOT NULL REFERENCES faculty(id) ON DELETE RESTRICT,
  reason           TEXT NOT NULL,
  status           appointment_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Each slot can only have one active appointment
  CONSTRAINT one_booking_per_slot UNIQUE (slot_id)
);

CREATE INDEX idx_appointments_user ON appointments (user_id);
CREATE INDEX idx_appointments_faculty ON appointments (faculty_id);
CREATE INDEX idx_appointments_status ON appointments (status);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  type        notification_type NOT NULL,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  related_id  UUID, -- optional reference to appointment/slot
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications (user_id, is_read);

-- ============================================================
-- AUDIT LOGS
-- ============================================================

CREATE TABLE audit_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action       TEXT NOT NULL,
  entity_type  TEXT NOT NULL,
  entity_id    UUID,
  metadata     JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs (user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs (entity_type, entity_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_faculty_updated_at
  BEFORE UPDATE ON faculty
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_availability_updated_at
  BEFORE UPDATE ON faculty_availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_slots_updated_at
  BEFORE UPDATE ON appointment_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- NEW USER PROFILE TRIGGER
-- Auto-create profile when a user signs up via Supabase Auth
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role user_role;
  extracted_dept TEXT;
BEGIN
  -- Check if email matches faculty pattern: name.department@sode-edu.in
  -- We ensure the part after the dot contains ONLY letters (no numbers)
  -- This prevents student emails like name.23cs001@sode-edu.in from matching
  IF NEW.email ~ '^[a-zA-Z0-9._-]+?\.[a-zA-Z]+@sode-edu\.in$' THEN
    assigned_role := 'faculty'::user_role;
    extracted_dept := substring(NEW.email from '\.([a-zA-Z]+)@sode-edu\.in$');
  ELSE
    -- Default to the metadata role, or 'user'
    assigned_role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'user'::user_role);
    extracted_dept := NULL;
  END IF;

  INSERT INTO profiles (id, full_name, email, role, department)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    assigned_role,
    extracted_dept
  );

  IF assigned_role = 'faculty' THEN
    INSERT INTO faculty (profile_id, department, designation)
    VALUES (NEW.id, extracted_dept, 'Faculty Member');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function to get faculty record for current user
CREATE OR REPLACE FUNCTION current_faculty_id()
RETURNS UUID AS $$
  SELECT id FROM faculty WHERE profile_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ---- profiles ----
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (current_user_role() = 'admin');

CREATE POLICY "Faculty profiles are public (limited)" ON profiles
  FOR SELECT USING (role = 'faculty');

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can manage all profiles" ON profiles
  FOR ALL USING (current_user_role() = 'admin');

-- ---- faculty ----
CREATE POLICY "Faculty profiles are publicly viewable" ON faculty
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can view all faculty" ON faculty
  FOR SELECT USING (current_user_role() = 'admin');

CREATE POLICY "Admins can manage faculty" ON faculty
  FOR ALL USING (current_user_role() = 'admin');

CREATE POLICY "Faculty can view their own record" ON faculty
  FOR SELECT USING (profile_id = auth.uid());

-- ---- faculty_availability ----
CREATE POLICY "Active availability is publicly viewable" ON faculty_availability
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Faculty can manage their own availability" ON faculty_availability
  FOR ALL USING (
    faculty_id = current_faculty_id()
    OR current_user_role() = 'admin'
  );

-- ---- appointment_slots ----
CREATE POLICY "Available slots are publicly viewable" ON appointment_slots
  FOR SELECT USING (status = 'AVAILABLE');

CREATE POLICY "Faculty can view all their slots" ON appointment_slots
  FOR SELECT USING (faculty_id = current_faculty_id() OR current_user_role() = 'admin');

CREATE POLICY "Faculty can manage their own slots" ON appointment_slots
  FOR ALL USING (
    faculty_id = current_faculty_id()
    OR current_user_role() = 'admin'
  );

CREATE POLICY "Authenticated users can view available slots" ON appointment_slots
  FOR SELECT USING (auth.uid() IS NOT NULL AND status = 'AVAILABLE');

-- ---- appointments ----
CREATE POLICY "Users can view their own appointments" ON appointments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Faculty can view appointments for their slots" ON appointments
  FOR SELECT USING (faculty_id = current_faculty_id());

CREATE POLICY "Admins can view all appointments" ON appointments
  FOR SELECT USING (current_user_role() = 'admin');

CREATE POLICY "Users can create appointments" ON appointments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can cancel their appointments" ON appointments
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Faculty can update appointment status" ON appointments
  FOR UPDATE USING (faculty_id = current_faculty_id());

CREATE POLICY "Admins can manage all appointments" ON appointments
  FOR ALL USING (current_user_role() = 'admin');

-- ---- notifications ----
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can mark notifications as read" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (TRUE);

-- ---- audit_logs ----
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (current_user_role() = 'admin');

CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (TRUE);

-- ============================================================
-- College Faculty Appointment System — Designations Schema
-- ============================================================

CREATE TABLE IF NOT EXISTS designations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed initial 3 designations
INSERT INTO designations (name) VALUES 
  ('Principal'),
  ('Dean R&D'),
  ('Dean Academics')
ON CONFLICT (name) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE designations ENABLE ROW LEVEL SECURITY;

-- Allow read access to all users (faculty directory, profiles, dropdowns)
CREATE POLICY "Allow public read designations" ON designations
  FOR SELECT USING (true);

-- Allow authenticated admins to insert/update/delete designations
CREATE POLICY "Allow admin manage designations" ON designations
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

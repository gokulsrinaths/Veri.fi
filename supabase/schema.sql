-- Veri.fi Supabase schema
-- Run this in Supabase SQL Editor or via Supabase CLI (supabase db push / migration)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- users (wallet-based; optional stats)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  wallet_address TEXT PRIMARY KEY,
  tasks_created INT NOT NULL DEFAULT 0,
  tasks_completed INT NOT NULL DEFAULT 0,
  rewards_earned TEXT NOT NULL DEFAULT '0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- ---------------------------------------------------------------------------
-- tasks
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sponsor_wallet TEXT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  expected_location TEXT NOT NULL,
  required_evidence_type TEXT NOT NULL DEFAULT 'Photo + GPS',
  reward_amount TEXT NOT NULL DEFAULT '5 CTC',
  threshold DOUBLE PRECISION NOT NULL DEFAULT 0.7,
  expected_object TEXT NOT NULL DEFAULT 'EV Charger',
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED', 'EXPIRED')),
  onchain_task_id INT,
  escrow_tx_hash TEXT,
  target_latitude DOUBLE PRECISION,
  target_longitude DOUBLE PRECISION,
  radius_meters INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_sponsor ON tasks(sponsor_wallet);

-- Allow any wallet as sponsor (no FK to users); run this if you already had the FK and get constraint errors
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_sponsor_wallet_fkey;

-- ---------------------------------------------------------------------------
-- submissions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  participant_address TEXT,
  image_url TEXT NOT NULL,
  note TEXT,
  exif_data JSONB,
  manual_lat DOUBLE PRECISION,
  manual_lng DOUBLE PRECISION,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFYING', 'VERIFIED', 'REJECTED', 'PAID')),
  verification_score DOUBLE PRECISION,
  reasoning TEXT,
  tx_hash TEXT,
  score_breakdown JSONB,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_task_id ON submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_participant ON submissions(participant_address);

-- ---------------------------------------------------------------------------
-- verification_results (one per submission)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS verification_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL UNIQUE REFERENCES submissions(id) ON DELETE CASCADE,
  visual_score DOUBLE PRECISION NOT NULL,
  location_score DOUBLE PRECISION NOT NULL,
  timestamp_score DOUBLE PRECISION NOT NULL,
  anti_fraud_score DOUBLE PRECISION NOT NULL,
  final_score DOUBLE PRECISION NOT NULL,
  verified BOOLEAN NOT NULL,
  reasoning TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_results_submission ON verification_results(submission_id);

-- ---------------------------------------------------------------------------
-- Storage bucket: proof-images
-- If the INSERT below fails (permissions), create the bucket in Supabase Dashboard:
-- Storage → New bucket → Name: proof-images, Public: Yes, then run the policies below.
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'proof-images',
  'proof-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Drop policies if they exist (so script can be re-run)
DROP POLICY IF EXISTS "Public read proof-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload proof-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update proof-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete proof-images" ON storage.objects;

-- Allow public read
CREATE POLICY "Public read proof-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'proof-images');

-- Allow service role / authenticated upload (anon can be restricted in app to server-only upload)
CREATE POLICY "Authenticated upload proof-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'proof-images');

CREATE POLICY "Authenticated update proof-images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'proof-images');

CREATE POLICY "Authenticated delete proof-images"
ON storage.objects FOR DELETE
USING (bucket_id = 'proof-images');

-- ---------------------------------------------------------------------------
-- RLS (Row Level Security) - enable if you want per-user isolation
-- For hackathon/demo we keep tables readable by service role; enable RLS later
-- ---------------------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_results ENABLE ROW LEVEL SECURITY;

-- Drop existing policies so script can be re-run
DROP POLICY IF EXISTS "Allow all tasks" ON tasks;
DROP POLICY IF EXISTS "Allow all submissions" ON submissions;
DROP POLICY IF EXISTS "Allow all users" ON users;
DROP POLICY IF EXISTS "Allow all verification_results" ON verification_results;

-- Permissive policies for demo (service_role key bypasses RLS in Supabase; anon can read if needed)
CREATE POLICY "Allow all tasks" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow all submissions" ON submissions FOR ALL USING (true);
CREATE POLICY "Allow all users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all verification_results" ON verification_results FOR ALL USING (true);

-- ---------------------------------------------------------------------------
-- Seed task (optional; for demo)
-- ---------------------------------------------------------------------------
INSERT INTO tasks (
  id,
  name,
  description,
  expected_location,
  required_evidence_type,
  reward_amount,
  threshold,
  expected_object,
  status,
  target_latitude,
  target_longitude,
  radius_meters
) VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Verify EV Charger #21',
  'Confirm that EV Charger #21 is physically present and operational at the specified location.',
  'Palo Alto EV Station',
  'Photo + GPS',
  '5 CTC',
  0.7,
  'EV Charger',
  'OPEN',
  37.4419,
  -122.143,
  200
)
ON CONFLICT (id) DO NOTHING;

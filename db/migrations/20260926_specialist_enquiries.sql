-- Specialist relocation support enquiries (detailed concierge intake).

CREATE SCHEMA IF NOT EXISTS career;

CREATE TABLE IF NOT EXISTS career.specialist_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  nationality text,
  current_country text,
  destination_countries text[] NOT NULL DEFAULT '{}',
  primary_goal text NOT NULL DEFAULT 'work'
    CHECK (primary_goal IN ('work', 'study', 'family', 'business', 'asylum_humanitarian', 'other')),
  timeline text,
  current_occupation text,
  target_occupation text,
  years_experience integer,
  education_level text,
  english_level text,
  visa_status text,
  already_abroad boolean NOT NULL DEFAULT false,
  dependents integer NOT NULL DEFAULT 0,
  budget_range text,
  challenges text[] NOT NULL DEFAULT '{}',
  preferred_contact text NOT NULL DEFAULT 'email'
    CHECK (preferred_contact IN ('email', 'phone', 'whatsapp')),
  message text NOT NULL DEFAULT '',
  consent boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'in_review', 'contacted', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_career_specialist_enquiries_status
  ON career.specialist_enquiries (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_career_specialist_enquiries_email
  ON career.specialist_enquiries (email);

-- Ensure contact form table exists (used by /contact).
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text,
  message text NOT NULL,
  page_context text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_created
  ON contact_submissions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status
  ON contact_submissions (status);

-- Ensure legacy concierge requests table exists.
CREATE TABLE IF NOT EXISTS relocation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id text,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  goal text NOT NULL DEFAULT 'relocate',
  destination text,
  timeline text,
  message text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_relocation_requests_status
  ON relocation_requests (status, created_at DESC);

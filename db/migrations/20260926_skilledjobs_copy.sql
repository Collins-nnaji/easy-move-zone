-- Job, sponsor, and assessment tables copied from Rekruuter's skilledjobs
-- schema. Rekruuter itself is never written to; this only creates the
-- EasyMoveZone side. Data is loaded by scripts/copy-rekruuter-job-tables.mjs.

CREATE SCHEMA IF NOT EXISTS skilledjobs;
CREATE SCHEMA IF NOT EXISTS career;

CREATE TABLE IF NOT EXISTS skilledjobs.jobs (
  id serial PRIMARY KEY,
  title text NOT NULL,
  company text NOT NULL,
  location text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  experience_level text NOT NULL,
  job_type text NOT NULL,
  visa_type text NOT NULL,
  skills text[] NOT NULL DEFAULT '{}',
  url text NOT NULL,
  logo_url text,
  posted_at timestamp NOT NULL,
  expires_at text,
  external_id text,
  is_partner_job boolean DEFAULT false,
  country text NOT NULL DEFAULT 'Other'
);

CREATE INDEX IF NOT EXISTS idx_skilledjobs_jobs_company_lower
  ON skilledjobs.jobs (lower(company));
CREATE INDEX IF NOT EXISTS idx_skilledjobs_jobs_country
  ON skilledjobs.jobs (country);
CREATE INDEX IF NOT EXISTS idx_skilledjobs_jobs_posted
  ON skilledjobs.jobs (posted_at DESC);

CREATE TABLE IF NOT EXISTS skilledjobs.sponsored_companies (
  id serial PRIMARY KEY,
  name text NOT NULL,
  city text,
  county text,
  type_and_rating text,
  route text,
  created_at timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skilledjobs_sponsor_name_lower
  ON skilledjobs.sponsored_companies (lower(name));

CREATE TABLE IF NOT EXISTS skilledjobs.occupation_codes (
  code text PRIMARY KEY,
  job_type text NOT NULL,
  related_job_titles text,
  standard_going_rate text,
  lower_going_rate text,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS skilledjobs.saved_job_urls (
  id serial PRIMARY KEY,
  label text NOT NULL,
  url text NOT NULL,
  company text,
  category text,
  last_fetched_at timestamp,
  created_at timestamp DEFAULT now(),
  last_fetch_status text,
  last_fetch_error text,
  last_failed_at timestamp,
  show_on_dashboard boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS skilledjobs.staff_companies (
  id serial PRIMARY KEY,
  name text NOT NULL,
  job_page_url text NOT NULL,
  location text,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  last_fetch_status text,
  last_fetch_error text,
  last_failed_at timestamp
);

CREATE TABLE IF NOT EXISTS skilledjobs.staged_jobs (
  id serial PRIMARY KEY,
  company_id integer,
  title text NOT NULL,
  company text NOT NULL,
  location text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  experience_level text NOT NULL,
  job_type text NOT NULL,
  visa_type text NOT NULL,
  skills text[] NOT NULL DEFAULT '{}',
  url text NOT NULL,
  posted_at timestamp NOT NULL,
  expires_at text,
  status text NOT NULL DEFAULT 'pending',
  reviewer_notes text,
  created_by text,
  created_at timestamp DEFAULT now(),
  external_id text,
  is_partner_job boolean DEFAULT false,
  country text NOT NULL DEFAULT 'Other'
);

CREATE INDEX IF NOT EXISTS idx_skilledjobs_staged_status
  ON skilledjobs.staged_jobs (status);

CREATE TABLE IF NOT EXISTS skilledjobs.company_logos (
  id serial PRIMARY KEY,
  company_name text NOT NULL UNIQUE,
  logo_url text NOT NULL,
  aliases text[] DEFAULT '{}',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS skilledjobs.url_validation_history (
  id serial PRIMARY KEY,
  job_id integer NOT NULL,
  url text NOT NULL,
  status text NOT NULL,
  is_valid boolean NOT NULL,
  content_available boolean DEFAULT true,
  last_checked timestamp NOT NULL DEFAULT now(),
  check_count integer NOT NULL DEFAULT 1,
  error_message text
);

CREATE INDEX IF NOT EXISTS idx_skilledjobs_url_validation_job
  ON skilledjobs.url_validation_history (job_id);

-- Attempts and badges earned inside EasyMoveZone. The role catalog itself
-- lives in code (lib/career/suitability-catalog.ts), copied from Rekruuter.
CREATE TABLE IF NOT EXISTS career.assessment_attempts (
  id text PRIMARY KEY,
  user_id text,
  role_key text NOT NULL,
  role_title text NOT NULL,
  category text,
  questions jsonb NOT NULL,
  answers jsonb,
  score integer,
  tier text,
  status text NOT NULL DEFAULT 'in_progress',
  created_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_career_attempts_user
  ON career.assessment_attempts (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS career.assessment_badges (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  role_key text NOT NULL,
  role_title text NOT NULL,
  category text,
  tier text NOT NULL,
  best_score integer NOT NULL,
  latest_score integer NOT NULL,
  attempts_count integer NOT NULL DEFAULT 1,
  first_earned_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT career_badges_user_role_unique UNIQUE (user_id, role_key)
);

CREATE INDEX IF NOT EXISTS idx_career_badges_user
  ON career.assessment_badges (user_id, best_score DESC);

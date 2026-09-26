-- Profile + job-support tables from Rekruuter skilledjobs schema.
-- Jobs/sponsors/staging already exist; this adds user profile, tracker, and CV tables.

CREATE SCHEMA IF NOT EXISTS skilledjobs;

CREATE TABLE IF NOT EXISTS skilledjobs.users (
  id text PRIMARY KEY,
  username text UNIQUE,
  email text UNIQUE,
  first_name text,
  last_name text,
  bio text,
  profile_image_url text,
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text,
  subscription_status text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  is_open_to_work boolean DEFAULT false,
  availability text,
  job_search_status text DEFAULT 'Closed',
  skills text[],
  linkedin_url text,
  phone text,
  visa_required boolean DEFAULT false,
  years_experience integer,
  current_company text,
  "current_role" text,
  seniority text,
  industry text,
  cv_text text,
  current_location text
);

CREATE TABLE IF NOT EXISTS skilledjobs.user_skills (
  id serial PRIMARY KEY,
  user_id text NOT NULL,
  skill text NOT NULL,
  level text,
  created_at timestamp DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_skilledjobs_user_skills_user
  ON skilledjobs.user_skills (user_id);

CREATE TABLE IF NOT EXISTS skilledjobs.work_experience (
  id serial PRIMARY KEY,
  user_id text NOT NULL,
  job_title text NOT NULL,
  company text NOT NULL,
  location text,
  description text,
  start_date text,
  end_date text,
  currently_working boolean DEFAULT false,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_skilledjobs_work_exp_user
  ON skilledjobs.work_experience (user_id);

CREATE TABLE IF NOT EXISTS skilledjobs.saved_jobs (
  id serial PRIMARY KEY,
  user_id text NOT NULL,
  job_id integer NOT NULL REFERENCES skilledjobs.jobs(id) ON DELETE CASCADE,
  created_at timestamp DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_skilledjobs_saved_jobs_user
  ON skilledjobs.saved_jobs (user_id);
CREATE INDEX IF NOT EXISTS idx_skilledjobs_saved_jobs_job
  ON skilledjobs.saved_jobs (job_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_skilledjobs_saved_jobs_user_job
  ON skilledjobs.saved_jobs (user_id, job_id);

CREATE TABLE IF NOT EXISTS skilledjobs.job_applications (
  id serial PRIMARY KEY,
  user_id text NOT NULL,
  job_id integer REFERENCES skilledjobs.jobs(id) ON DELETE SET NULL,
  job_title text NOT NULL,
  company_name text NOT NULL,
  job_location text,
  status text NOT NULL,
  applied_date timestamp NOT NULL DEFAULT now(),
  last_updated timestamp NOT NULL DEFAULT now(),
  notes text,
  upcoming_interviews jsonb,
  contacts jsonb,
  salary text,
  job_type text,
  job_url text,
  reminder_date timestamp,
  reminder_set boolean DEFAULT false,
  resume_version text,
  cover_letter_version text,
  custom_fields jsonb,
  archived boolean NOT NULL DEFAULT false,
  source text
);
CREATE INDEX IF NOT EXISTS idx_skilledjobs_job_apps_user
  ON skilledjobs.job_applications (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_skilledjobs_job_apps_user_job
  ON skilledjobs.job_applications (user_id, job_id);

CREATE TABLE IF NOT EXISTS skilledjobs.cvs (
  id serial PRIMARY KEY,
  user_id text NOT NULL,
  name varchar(255) NOT NULL DEFAULT 'My CV',
  personal_info jsonb NOT NULL DEFAULT '{}'::jsonb,
  summary text,
  experiences jsonb NOT NULL DEFAULT '[]'::jsonb,
  education jsonb NOT NULL DEFAULT '[]'::jsonb,
  skills text[] NOT NULL DEFAULT '{}',
  publications jsonb,
  certifications jsonb,
  awards jsonb,
  languages jsonb,
  projects jsonb,
  courses jsonb,
  volunteering jsonb,
  skill_categories jsonb DEFAULT '[]'::jsonb,
  interests jsonb DEFAULT '[]'::jsonb,
  template_id text DEFAULT 'basic',
  settings jsonb DEFAULT '{"primaryColor":"#0f172a","fontFamily":"sans","fontSize":"md"}'::jsonb,
  visible_sections jsonb DEFAULT '{"experience":true,"education":true,"skills":true,"projects":true,"certifications":true,"languages":true,"awards":true,"volunteering":true,"interests":true}'::jsonb,
  job_description text,
  last_optimized timestamp,
  optimization_prompt text,
  is_optimized boolean DEFAULT false,
  original_cv_id integer,
  is_template boolean DEFAULT false,
  is_public boolean DEFAULT false,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_skilledjobs_cvs_user
  ON skilledjobs.cvs (user_id);

CREATE TABLE IF NOT EXISTS skilledjobs.cv_documents (
  id serial PRIMARY KEY,
  user_id text NOT NULL,
  name varchar(255) NOT NULL,
  personal_info jsonb,
  summary text,
  experiences jsonb,
  education jsonb,
  skills text[],
  certifications jsonb,
  publications jsonb,
  languages text[],
  projects jsonb,
  awards jsonb,
  volunteering jsonb,
  courses jsonb,
  training text[],
  books text[],
  custom_sections jsonb,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_skilledjobs_cv_docs_user
  ON skilledjobs.cv_documents (user_id);

CREATE TABLE IF NOT EXISTS skilledjobs.cv_optimizations (
  id serial PRIMARY KEY,
  user_id text,
  original_cv_text text NOT NULL,
  job_description text NOT NULL,
  optimized_cv_text text NOT NULL,
  optimization_suggestions text[],
  created_at timestamp DEFAULT now(),
  job_title varchar(255),
  company_name varchar(255)
);
CREATE INDEX IF NOT EXISTS idx_skilledjobs_cv_opt_user
  ON skilledjobs.cv_optimizations (user_id);

CREATE TABLE IF NOT EXISTS skilledjobs.cover_letters (
  id serial PRIMARY KEY,
  user_id text,
  cv_text text,
  generated_cover_letter text,
  customizations text,
  job_title varchar(255),
  name text DEFAULT 'My Cover Letter',
  document_type text DEFAULT 'cover_letter',
  company_name varchar(255),
  role text,
  job_description text,
  personal_statement_requirements jsonb DEFAULT '[]'::jsonb,
  selected_cv_id integer,
  candidate_summary text,
  candidate_experience text,
  cover_letter text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_skilledjobs_cover_letters_user
  ON skilledjobs.cover_letters (user_id);

CREATE TABLE IF NOT EXISTS skilledjobs.profile_boost_enquiries (
  id serial PRIMARY KEY,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  "current_role" text,
  target_role text,
  message text NOT NULL,
  created_at timestamp DEFAULT now(),
  responded_at timestamp,
  location text,
  linkedin_url text,
  service_type text
);

CREATE TABLE IF NOT EXISTS skilledjobs.managed_job_applications (
  id serial PRIMARY KEY,
  user_id text NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  target_role text NOT NULL,
  target_location text,
  cv_url text,
  notes text,
  tier text,
  status text NOT NULL DEFAULT 'received',
  admin_notes text,
  responded_at timestamp,
  created_at timestamp DEFAULT now(),
  profile_cv_content text,
  linkedin_url text,
  portfolio_links jsonb
);
CREATE INDEX IF NOT EXISTS idx_skilledjobs_managed_apps_user
  ON skilledjobs.managed_job_applications (user_id);

CREATE TABLE IF NOT EXISTS skilledjobs.managed_application_items (
  id serial PRIMARY KEY,
  application_id integer NOT NULL REFERENCES skilledjobs.managed_job_applications(id) ON DELETE CASCADE,
  job_title text NOT NULL,
  company text NOT NULL,
  job_url text,
  location text,
  status text NOT NULL DEFAULT 'applied',
  applied_at timestamp DEFAULT now(),
  notes text
);
CREATE INDEX IF NOT EXISTS idx_skilledjobs_managed_items_app
  ON skilledjobs.managed_application_items (application_id);

CREATE TABLE IF NOT EXISTS skilledjobs.managed_application_messages (
  id serial PRIMARY KEY,
  application_id integer NOT NULL REFERENCES skilledjobs.managed_job_applications(id) ON DELETE CASCADE,
  sender_role text NOT NULL DEFAULT 'admin',
  message text NOT NULL,
  created_at timestamp DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_skilledjobs_managed_msgs_app
  ON skilledjobs.managed_application_messages (application_id);

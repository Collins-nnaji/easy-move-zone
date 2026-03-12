-- EasyMoveZone Property Finder schema (optional, for Neon)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS city_markets (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  flag_emoji TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  avg_rent_usd NUMERIC(12,2) NOT NULL DEFAULT 0,
  avg_buy_usd NUMERIC(12,2) NOT NULL DEFAULT 0,
  security_score INTEGER NOT NULL DEFAULT 0,
  commute_score INTEGER NOT NULL DEFAULT 0,
  lifestyle_score INTEGER NOT NULL DEFAULT 0,
  top_sectors JSONB NOT NULL DEFAULT '[]'::jsonb,
  latitude DOUBLE PRECISION NOT NULL DEFAULT 0,
  longitude DOUBLE PRECISION NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS trusted_agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  city_coverage JSONB NOT NULL DEFAULT '[]'::jsonb,
  rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  transactions INTEGER NOT NULL DEFAULT 0,
  languages JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS property_listings (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  city_slug TEXT NOT NULL,
  country TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  type TEXT NOT NULL,
  price_usd NUMERIC(12,2) NOT NULL,
  bedrooms INTEGER NOT NULL DEFAULT 0,
  bathrooms INTEGER NOT NULL DEFAULT 0,
  area_sqm INTEGER NOT NULL DEFAULT 0,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  move_in_ready BOOLEAN NOT NULL DEFAULT FALSE,
  schools_nearby INTEGER NOT NULL DEFAULT 0,
  commute_minutes INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  agent_id TEXT NOT NULL REFERENCES trusted_agents(id)
);

CREATE TABLE IF NOT EXISTS property_testimonials (
  id TEXT PRIMARY KEY,
  mover_type TEXT NOT NULL,
  route TEXT NOT NULL,
  outcome TEXT NOT NULL,
  quote TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS property_faqs (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS resource_guides (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  category TEXT NOT NULL,
  read_minutes INTEGER NOT NULL DEFAULT 5,
  href TEXT NOT NULL DEFAULT '/contact'
);

CREATE TABLE IF NOT EXISTS relocation_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id TEXT NOT NULL UNIQUE,
  plan_name TEXT NOT NULL DEFAULT 'My relocation plan',
  origin_city TEXT,
  origin_country TEXT,
  destination_city TEXT,
  destination_country TEXT,
  move_date DATE,
  move_reason TEXT,
  household_size INTEGER NOT NULL DEFAULT 1,
  work_mode TEXT NOT NULL DEFAULT 'hybrid',
  visa_pathway TEXT,
  status TEXT NOT NULL DEFAULT 'planning',
  budget_housing_usd INTEGER NOT NULL DEFAULT 0,
  budget_travel_usd INTEGER NOT NULL DEFAULT 0,
  budget_setup_usd INTEGER NOT NULL DEFAULT 0,
  budget_buffer_usd INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT relocation_plans_work_mode_check CHECK (work_mode IN ('onsite', 'hybrid', 'remote', 'business_owner', 'student')),
  CONSTRAINT relocation_plans_status_check CHECK (status IN ('planning', 'in_progress', 'ready_to_move', 'settled'))
);

CREATE TABLE IF NOT EXISTS relocation_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES relocation_plans(id) ON DELETE CASCADE,
  auth_user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'todo',
  priority TEXT NOT NULL DEFAULT 'medium',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT relocation_tasks_category_check CHECK (category IN ('visa', 'legal', 'finance', 'logistics', 'career', 'family', 'settling')),
  CONSTRAINT relocation_tasks_status_check CHECK (status IN ('todo', 'in_progress', 'done')),
  CONSTRAINT relocation_tasks_priority_check CHECK (priority IN ('low', 'medium', 'high'))
);

CREATE TABLE IF NOT EXISTS relocation_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES relocation_plans(id) ON DELETE CASCADE,
  auth_user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  service_type TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  website TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS relocation_country_guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country TEXT NOT NULL UNIQUE,
  visa_summary TEXT NOT NULL,
  required_documents TEXT[] NOT NULL DEFAULT '{}',
  pre_move_steps TEXT[] NOT NULL DEFAULT '{}',
  first_week_steps TEXT[] NOT NULL DEFAULT '{}',
  healthcare_tip TEXT NOT NULL DEFAULT '',
  banking_tip TEXT NOT NULL DEFAULT '',
  schooling_tip TEXT NOT NULL DEFAULT '',
  estimated_setup_days INTEGER NOT NULL DEFAULT 14,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

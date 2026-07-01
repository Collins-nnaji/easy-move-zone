-- Dual-product schema additions

-- Add user_type to users table if it doesn't exist
-- Valid types: 'individual', 'corporate'
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'individual';

-- Corporate Profiles
CREATE TABLE IF NOT EXISTS corporate_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  company_name TEXT NOT NULL,
  employee_count TEXT NOT NULL,
  industry TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Individual Profiles
CREATE TABLE IF NOT EXISTS individual_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  citizenship TEXT,
  family_size INTEGER DEFAULT 1,
  risk_appetite TEXT,
  target_cities JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Corporate Employees (Relocating under a corporate account)
CREATE TABLE IF NOT EXISTS corporate_employees (
  id TEXT PRIMARY KEY,
  corporate_profile_id TEXT NOT NULL REFERENCES corporate_profiles(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  origin_city TEXT,
  destination_city TEXT,
  status TEXT NOT NULL DEFAULT 'planning',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

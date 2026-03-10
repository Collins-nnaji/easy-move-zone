-- Migration: agent flag on user_profiles + admin_users table
-- Date: 2026-03-10

-- Add is_agent flag to user_profiles
-- Sellers can self-declare as licensed agents during registration
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS is_agent BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS agent_license TEXT,
  ADD COLUMN IF NOT EXISTS agent_company TEXT,
  ADD COLUMN IF NOT EXISTS agent_bio TEXT,
  ADD COLUMN IF NOT EXISTS agent_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- Admin users table — only emails in this table can access /admin
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed the admin email
INSERT INTO admin_users (email) VALUES ('collinsnnaji1@gmail.com')
  ON CONFLICT (email) DO NOTHING;

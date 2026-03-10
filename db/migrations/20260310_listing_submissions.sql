-- Migration: listing submissions + extended property schema
-- Date: 2026-03-10

-- Extend property_listings to support user submissions, video, and moderation status
ALTER TABLE property_listings
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS submitted_by TEXT,          -- auth user id
  ADD COLUMN IF NOT EXISTS submission_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewer_notes TEXT;

-- Constraint: valid submission statuses
ALTER TABLE property_listings
  DROP CONSTRAINT IF EXISTS property_listings_submission_status_check;
ALTER TABLE property_listings
  ADD CONSTRAINT property_listings_submission_status_check
  CHECK (submission_status IN ('pending', 'approved', 'rejected', 'draft'));

-- Extend trusted_agents with user account linkage
ALTER TABLE trusted_agents
  ADD COLUMN IF NOT EXISTS auth_user_id TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS photo_url TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Table: user_listing_profiles (seller info attached to auth user)
CREATE TABLE IF NOT EXISTS user_listing_profiles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  auth_user_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  preferred_contact TEXT NOT NULL DEFAULT 'email',
  role TEXT NOT NULL DEFAULT 'buyer',
  -- buyer fields
  buyer_preferred_cities JSONB NOT NULL DEFAULT '[]'::jsonb,
  buyer_listing_types JSONB NOT NULL DEFAULT '[]'::jsonb,
  buyer_budget_min NUMERIC(14,2),
  buyer_budget_max NUMERIC(14,2),
  buyer_bedrooms_min INTEGER,
  buyer_notes TEXT NOT NULL DEFAULT '',
  -- seller fields
  seller_company_name TEXT NOT NULL DEFAULT '',
  seller_license TEXT NOT NULL DEFAULT '',
  seller_service_cities JSONB NOT NULL DEFAULT '[]'::jsonb,
  seller_property_types JSONB NOT NULL DEFAULT '[]'::jsonb,
  seller_notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: saved_searches (user saved property searches)
CREATE TABLE IF NOT EXISTS saved_searches (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  auth_user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  city_slug TEXT,
  listing_type TEXT,
  budget_min NUMERIC(14,2),
  budget_max NUMERIC(14,2),
  bedrooms_min INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS saved_searches_user_idx ON saved_searches(auth_user_id);
CREATE INDEX IF NOT EXISTS property_listings_submitted_by_idx ON property_listings(submitted_by);
CREATE INDEX IF NOT EXISTS property_listings_status_idx ON property_listings(submission_status);

-- ============================================================================
-- Marketplace: the public buy side, and the approval pipeline behind it.
--
-- YOU DO NOT NORMALLY NEED TO RUN THIS. server/db.js applies the same
-- statements on every server start, so a deploy migrates the database on its
-- own. Run it by hand only to migrate ahead of a deploy, or to see exactly
-- what the deploy will do.
--
-- Safe to run against a database that has already been migrated: every
-- statement is guarded, so a second run changes nothing. No existing row is
-- deleted or overwritten.
--
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f 2026-08-marketplace.sql
-- ============================================================================

BEGIN;

-- ── 1. Listings ────────────────────────────────────────────────────────────
-- Every row starts as a EasyOffer submission. Nothing is public until an
-- admin moves it to 'live', and the API refuses that unless EasyMoveZone bought
-- the property (route = 'company_owned') or the owner ticked the optional
-- public-listing consent on the authorization (publish_consent).
--
-- Pipeline:
--   submitted -> reviewing -> offer_made
--      accepted  -> bought  -> live, as company_owned
--      declined  ->            live, as owner_listed, if the owner consented
--   live -> sold | withdrawn ; anything can end at rejected

CREATE TABLE IF NOT EXISTS listings (
  id SERIAL PRIMARY KEY,
  ref VARCHAR(24) UNIQUE NOT NULL,
  slug VARCHAR(255) UNIQUE,
  -- Who sent it. None of this is ever returned by a public route.
  owner_email VARCHAR(255) NOT NULL,
  owner_name VARCHAR(255),
  owner_phone VARCHAR(100),
  session_id VARCHAR(255),
  -- What it is.
  title VARCHAR(255) NOT NULL,
  address VARCHAR(500),
  area VARCHAR(255),
  city VARCHAR(120),
  state VARCHAR(80),
  property_type VARCHAR(80),
  beds VARCHAR(20),
  baths VARCHAR(20),
  size_label VARCHAR(120),
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  description TEXT,
  media JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- The numbers: guide_price is what the owner asked for, list_price is what
  -- it goes to market at, offer_amount is what EasyMoveZone offered (private).
  currency VARCHAR(8) NOT NULL DEFAULT 'NGN',
  guide_price NUMERIC(15,2),
  list_price NUMERIC(15,2),
  offer_amount NUMERIC(15,2),
  valuation_low NUMERIC(15,2),
  valuation_high NUMERIC(15,2),
  condition_score INT,
  insight JSONB,
  -- The deal.
  intent VARCHAR(20) NOT NULL DEFAULT 'private'
    CHECK (intent IN ('renovate','private','buyout')),
  route VARCHAR(20) NOT NULL DEFAULT 'private'
    CHECK (route IN ('private','owner_listed','company_owned')),
  publish_consent BOOLEAN NOT NULL DEFAULT false,
  -- Signed owner authorization.
  owner_confirmed BOOLEAN NOT NULL DEFAULT false,
  consent BOOLEAN NOT NULL DEFAULT false,
  consent_name VARCHAR(255),
  -- Lifecycle.
  status VARCHAR(24) NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted','reviewing','offer_made','bought','live','sold','withdrawn','rejected')),
  featured BOOLEAN NOT NULL DEFAULT false,
  admin_note TEXT,
  reviewed_by VARCHAR(255),
  published_at TIMESTAMPTZ,
  sold_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_email ON listings(owner_email);
CREATE INDEX IF NOT EXISTS idx_listings_state ON listings(state);
CREATE INDEX IF NOT EXISTS idx_listings_published ON listings(published_at DESC);

-- ── 2. Buyer enquiries ─────────────────────────────────────────────────────
-- One row per "I want to view this" from the public listing page. Deleting a
-- listing takes its enquiries with it.

CREATE TABLE IF NOT EXISTS listing_enquiries (
  id SERIAL PRIMARY KEY,
  listing_id INT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(100),
  message TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','contacted','viewing_booked','offer_made','closed')),
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listing_enquiries_listing ON listing_enquiries(listing_id);

COMMIT;

-- ── Checks you can run afterwards ──────────────────────────────────────────
--
-- Both tables exist:
--   SELECT table_name FROM information_schema.tables
--    WHERE table_name IN ('listings','listing_enquiries');
--
-- Nothing is public yet (a fresh install returns 0):
--   SELECT COUNT(*) FROM listings WHERE status = 'live';
--
-- What is waiting for an admin, and whether it may be published at all:
--   SELECT ref, title, status, route, publish_consent,
--          (publish_consent OR route = 'company_owned') AS may_publish
--     FROM listings ORDER BY created_at DESC;

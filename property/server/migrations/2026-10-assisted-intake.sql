-- ============================================================================
-- Assisted intake, developer projects, and the 'bought' gate on publishing.
--
-- YOU DO NOT NORMALLY NEED TO RUN THIS. server/db.js applies the same
-- statements on every server start, so a deploy migrates the database on its
-- own. Run it by hand only to migrate ahead of a deploy, or to see exactly
-- what the deploy will do.
--
-- Safe to run against a database that has already been migrated: every
-- statement is guarded, so a second run changes nothing. No row is deleted.
--
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f 2026-10-assisted-intake.sql
-- ============================================================================

BEGIN;

-- ── 1. Developer projects ──────────────────────────────────────────────────
-- One developer's estate. Each unit type in it is an ordinary listing row
-- (project_id, units_available), and one owner signature covers them all.

CREATE TABLE IF NOT EXISTS listing_projects (
  id SERIAL PRIMARY KEY,
  ref VARCHAR(24) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  developer_name VARCHAR(255),
  contact_name VARCHAR(255),
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(100),
  address VARCHAR(500),
  area VARCHAR(255),
  city VARCHAR(120),
  state VARCHAR(80),
  country VARCHAR(120),
  description TEXT,
  assisted_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. Listings: drafts, who signed, and when we bought ────────────────────
-- 'draft' is a listing an admin typed in for the owner. It is never public and
-- cannot be published; only the owner's own confirmation moves it on.

ALTER TABLE listings ADD COLUMN IF NOT EXISTS project_id INT REFERENCES listing_projects(id) ON DELETE SET NULL;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS units_available INT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS assisted_by VARCHAR(255);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS owner_note TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS consent_via VARCHAR(20);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS consent_at TIMESTAMPTZ;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS consent_ip VARCHAR(64);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS bought_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_listings_project ON listings(project_id);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname = 'listings_status_check'
       AND pg_get_constraintdef(oid) LIKE '%draft%'
  ) THEN
    ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_status_check;
    ALTER TABLE listings ADD CONSTRAINT listings_status_check
      CHECK (status IN ('draft','submitted','reviewing','offer_made','bought','live','sold','withdrawn','rejected'));
  END IF;
END $$;

-- Publishing as 'company_owned' now needs bought_at, which only the 'bought'
-- step sets. Rows that went through an issued offer keep working; a live
-- 'company_owned' row with no offer on record stays live but cannot be
-- re-published as ours until it is marked bought.
UPDATE listings SET bought_at = COALESCE(updated_at, NOW())
 WHERE bought_at IS NULL
   AND (status = 'bought'
        OR (route = 'company_owned' AND status IN ('live','sold') AND offer_issued_at IS NOT NULL));
UPDATE listings SET consent_via = 'self', consent_at = created_at
 WHERE consent_via IS NULL AND consent = true;

-- ── 3. Owner confirmation links ────────────────────────────────────────────
-- Only a SHA-256 of the token is stored. A link is single-use, expires, and is
-- revoked when a newer one is issued for the same listing or project.

CREATE TABLE IF NOT EXISTS listing_confirmations (
  id SERIAL PRIMARY KEY,
  token_hash VARCHAR(64) UNIQUE NOT NULL,
  listing_id INT REFERENCES listings(id) ON DELETE CASCADE,
  project_id INT REFERENCES listing_projects(id) ON DELETE CASCADE,
  created_by VARCHAR(255),
  expires_at TIMESTAMPTZ NOT NULL,
  opened_at TIMESTAMPTZ,
  used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK ((listing_id IS NULL) <> (project_id IS NULL))
);
CREATE INDEX IF NOT EXISTS idx_listing_confirmations_listing ON listing_confirmations(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_confirmations_project ON listing_confirmations(project_id);

COMMIT;

-- ── Checks you can run afterwards ──────────────────────────────────────────
--
-- Live 'company_owned' rows with no purchase on record (published before
-- this change without going through 'bought'):
--   SELECT ref, title, status FROM listings
--    WHERE route = 'company_owned' AND bought_at IS NULL AND status IN ('live','sold');
--
-- Drafts waiting on their owner:
--   SELECT ref, title, owner_email, project_id FROM listings WHERE status = 'draft';

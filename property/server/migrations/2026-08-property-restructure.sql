-- ============================================================================
-- Property restructure: wealth platform out, EasyMoveZone Manage in.
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
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f 2026-08-property-restructure.sql
-- ============================================================================

BEGIN;

-- ── 1. Plan matcher results ────────────────────────────────────────────────
-- Replaces risk_profiles. One row per owner: which management plan the
-- matcher put them on, and the answers behind it.
-- See src/config/landlord.js, which does the scoring.

CREATE TABLE IF NOT EXISTS landlord_profiles (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  score INT NOT NULL DEFAULT 0,
  plan VARCHAR(30) NOT NULL DEFAULT 'full_management',
  plan_label VARCHAR(40),
  location VARCHAR(20),
  units VARCHAR(20),
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_landlord_profiles_email ON landlord_profiles(email);


-- ── 2. Consultations ───────────────────────────────────────────────────────
-- advisory_bookings becomes consultations, keeping every existing booking.
--
-- Order matters: the table rename runs BEFORE the CREATE, so an existing
-- table is renamed rather than sitting beside a new empty one. On a database
-- that has no advisory_bookings, the rename is a no-op and the CREATE builds
-- the table fresh.

DO $$ BEGIN
  ALTER TABLE IF EXISTS advisory_bookings RENAME TO consultations;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS consultations (
  id SERIAL PRIMARY KEY,
  ref VARCHAR(24) UNIQUE NOT NULL,
  service VARCHAR(40) NOT NULL DEFAULT 'discovery',
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(100),
  portfolio_band VARCHAR(60),
  goals TEXT,
  preferred_date DATE,
  preferred_window VARCHAR(20),
  status VARCHAR(20) NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested','scheduled','completed','cancelled')),
  manager_name VARCHAR(255),
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- The two columns whose meaning changed with the business.
-- RENAME COLUMN carries the existing values across; the ADD COLUMN lines
-- below only fire on a database that never had the old columns at all.
DO $$ BEGIN
  ALTER TABLE consultations RENAME COLUMN investable_band TO portfolio_band;
EXCEPTION WHEN undefined_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE consultations RENAME COLUMN advisor_name TO manager_name;
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

ALTER TABLE consultations ADD COLUMN IF NOT EXISTS portfolio_band VARCHAR(60);
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS manager_name VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_consultations_email ON consultations(email);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);

COMMIT;


-- ── 3. Check it worked ─────────────────────────────────────────────────────
-- Expect: consultations holds every row advisory_bookings had, with the old
-- investable_band and advisor_name values now under their new names.

-- SELECT count(*) AS consultations FROM consultations;
-- SELECT ref, service, name, portfolio_band, manager_name, status
--   FROM consultations ORDER BY created_at DESC LIMIT 10;
-- SELECT to_regclass('advisory_bookings') AS old_table_should_be_null;


-- ── 4. Dropping the dead finance tables (OPTIONAL, DESTRUCTIVE) ─────────────
-- Nothing in the codebase reads or writes these any more. They are left in
-- place on purpose: the restructure does not need them gone, and dropping
-- them cannot be undone.
--
-- Take a backup first, and only run this once you are satisfied you will
-- never want the old wealth-platform data back.
--
--   DROP TABLE IF EXISTS risk_profiles;
--   DROP TABLE IF EXISTS portfolio_holdings;
--   DROP TABLE IF EXISTS watchlist;
--   DROP TABLE IF EXISTS journal_entries;

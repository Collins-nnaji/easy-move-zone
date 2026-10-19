-- ============================================================================
-- Rentals: vacant managed properties, let through the public Rent page.
--
-- YOU DO NOT NORMALLY NEED TO RUN THIS. server/db.js applies the same
-- statements on every server start, so a deploy migrates the database on its
-- own. Run it by hand to migrate ahead of a deploy, or to see exactly what the
-- deploy will do.
--
-- Safe to run more than once: every statement is guarded, so a second run
-- changes nothing. No existing row is deleted or overwritten — existing
-- listings become listing_type = 'sale', and no owner is opted in to
-- advertising (advertise_consent defaults to false).
--
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f server/migrations/2026-10-rentals.sql
-- ============================================================================

BEGIN;

-- ── 1. The owner's consent to advertise ─────────────────────────────────────
-- Separate from the signed management authorization, unticked by default, and
-- switchable from the owner's console. A rental cannot go live without it
-- (unless EasyMoveZone owns the property), and switching it off takes any live
-- rental down.
ALTER TABLE management_requests ADD COLUMN IF NOT EXISTS advertise_consent BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE management_requests ADD COLUMN IF NOT EXISTS advertise_consent_at TIMESTAMPTZ;

-- ── 2. Rentals live in listings ─────────────────────────────────────────────
-- listing_type separates the Buy grid ('sale') from the Rent page ('rent').
-- A rental is linked to the managed property it lets, and ends at 'let'.
ALTER TABLE listings ADD COLUMN IF NOT EXISTS listing_type VARCHAR(8) NOT NULL DEFAULT 'sale';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS management_request_id INT REFERENCES management_requests(id) ON DELETE SET NULL;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS unit_label VARCHAR(80);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS rent_frequency VARCHAR(16);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS service_charge NUMERIC(15,2);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS caution_deposit NUMERIC(15,2);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS available_from DATE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS furnished VARCHAR(20);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS let_at TIMESTAMPTZ;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'listings_listing_type_check') THEN
    ALTER TABLE listings ADD CONSTRAINT listings_listing_type_check CHECK (listing_type IN ('sale','rent'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'listings_rent_frequency_check') THEN
    ALTER TABLE listings ADD CONSTRAINT listings_rent_frequency_check
      CHECK (rent_frequency IS NULL OR rent_frequency IN ('annual','biannual','quarterly','monthly'));
  END IF;
  -- Widen the status check to allow 'let' (only once). It keeps 'draft' from
  -- the assisted-intake migration, so the two can run in either order.
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname = 'listings_status_check'
       AND pg_get_constraintdef(oid) LIKE '%''draft''%'
       AND pg_get_constraintdef(oid) LIKE '%''let''%'
  ) THEN
    ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_status_check;
    ALTER TABLE listings ADD CONSTRAINT listings_status_check
      CHECK (status IN ('draft','submitted','reviewing','offer_made','bought','live','sold','let','withdrawn','rejected'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_listings_type ON listings(listing_type);
CREATE INDEX IF NOT EXISTS idx_listings_management ON listings(management_request_id);

-- ── 3. Rental applications ──────────────────────────────────────────────────
-- A renter applying for a live rental. Personal details are admin-only; the
-- owner sees counts. Creating the tenancy links tenancy_id and marks it 'let'.
CREATE TABLE IF NOT EXISTS rental_applications (
  id SERIAL PRIMARY KEY,
  ref VARCHAR(24) UNIQUE NOT NULL,
  listing_id INT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(100) NOT NULL,
  occupation VARCHAR(255),
  employer VARCHAR(255),
  income_band VARCHAR(40),
  household_size INT,
  move_in_date DATE,
  current_address VARCHAR(500),
  id_type VARCHAR(40),
  reference_name VARCHAR(255),
  reference_phone VARCHAR(100),
  viewing_date DATE,
  viewing_window VARCHAR(40),
  message TEXT,
  screening_consent BOOLEAN NOT NULL DEFAULT false,
  status VARCHAR(20) NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','contacted','viewing_booked','vetting','approved','declined','let','withdrawn')),
  admin_note TEXT,
  tenancy_id INT REFERENCES management_tenancies(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rental_applications_listing ON rental_applications(listing_id);
CREATE INDEX IF NOT EXISTS idx_rental_applications_status ON rental_applications(status);

COMMIT;

const { Pool } = require('pg');
const path = require('path');

/**
 * Neon requires SSL; a local Postgres started for isolated testing does not
 * offer it at all, and forcing it there fails the connection outright. Detect
 * the local case rather than making every developer edit this file.
 */
const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || '';
const isLocalDb = /@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(DATABASE_URL);

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: isLocalDb ? false : { rejectUnauthorized: false },
  // Serverless runs many small instances; each keeps its own pool, so keep
  // them small (and use Neon's pooled "-pooler" connection string).
  max: Number(process.env.PG_POOL_MAX) || (process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY ? 2 : 5),
  idleTimeoutMillis: 30000,
});

/**
 * The starter neighbourhoods (data/areas.json) as VALUES rows. Inserted with
 * ON CONFLICT DO NOTHING, so an area staff have edited or hidden keeps their
 * changes; a new entry in the file is added on the next deploy.
 */
const sqlText = (v) => `'${String(v).replace(/'/g, "''")}'`;
const AREA_SEED_SQL = require('./data/areas.json').map((a) => `(${[
  sqlText(a.slug), sqlText(a.name), sqlText(a.city), sqlText(a.state),
  Number(a.center[0]), Number(a.center[1]),
  `ARRAY[${a.match.map(sqlText).join(',')}]::text[]`, sqlText(a.blurb),
].join(', ')})`).join(',\n');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255),
  balance DECIMAL(15,2) DEFAULT 100000.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_users_session ON users(session_id);
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  stripe_customer_id VARCHAR(255),
  tier VARCHAR(20) DEFAULT 'free' CHECK (tier IN ('free', 'pro')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON user_subscriptions(email);
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  type VARCHAR(30) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  message TEXT,
  service VARCHAR(100),
  preferred_time VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
DO $$ BEGIN
  ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_type_check;
  ALTER TABLE leads ADD CONSTRAINT leads_type_check
    CHECK (type IN ('advisory_enquiry', 'client_enquiry', 'partner_enquiry', 'general'));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS phone VARCHAR(100);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'new';
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_type ON leads(type);
CREATE TABLE IF NOT EXISTS property_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name VARCHAR(255),
  tagline VARCHAR(500),
  bio TEXT,
  location VARCHAR(255),
  avatar_color VARCHAR(20) DEFAULT '#15803d',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- ── Plan matcher: one stored result per owner, keyed by email ──
-- The answers column is the raw questionnaire; plan is the management plan
-- the score maps to (see src/config/landlord.js, which derives both).
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

-- ── Consultations: an owner asking a manager to look at their property ──
-- Carried over from the advisory bookings this platform started as, so the
-- rename and the two column renames below run once and then no-op.
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
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages(user_id);
CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  dek VARCHAR(500),
  body TEXT NOT NULL,
  cover_image TEXT,
  category VARCHAR(40) NOT NULL DEFAULT 'market-note',
  source_ref JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','rejected')),
  ai_generated BOOLEAN NOT NULL DEFAULT true,
  admin_note VARCHAR(500),
  reviewed_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at);
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS story_type VARCHAR(40);
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS prompt_notes TEXT;

-- ── EasyMoveZone Upgrade: home renovation / upgrade requests (solar, pools, boreholes, etc.) ──
-- A homeowner submits an upgrade request with photos/video → in-house team books an
-- local inspection → quote in the customer's selected currency → homeowner pays by milestones.
CREATE TABLE IF NOT EXISTS renovation_requests (
  id SERIAL PRIMARY KEY,
  ref VARCHAR(24) UNIQUE NOT NULL,
  service VARCHAR(40) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  property_type VARCHAR(60),
  size_band VARCHAR(60),
  budget_band VARCHAR(60),
  -- Cross-market location.
  country VARCHAR(120),
  state VARCHAR(80) NOT NULL,
  city VARCHAR(120),
  area VARCHAR(255),
  address VARCHAR(500),
  -- Contact.
  contact_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(100),
  -- Media (photos + walkthrough video) and instant AI pre-assessment.
  media JSONB NOT NULL DEFAULT '[]'::jsonb,
  estimate JSONB,
  ai_assessment JSONB,
  -- Inspection booking (in-house inspector).
  inspection_date DATE,
  inspection_window VARCHAR(20),
  inspector_name VARCHAR(255),
  inspection_status VARCHAR(20) NOT NULL DEFAULT 'unscheduled'
    CHECK (inspection_status IN ('unscheduled','requested','scheduled','completed','cancelled')),
  inspection_notes TEXT,
  -- Quote.
  currency VARCHAR(8) NOT NULL DEFAULT 'NGN',
  quote_amount NUMERIC(15,2),
  quote_breakdown JSONB,
  quote_note TEXT,
  -- Lifecycle.
  status VARCHAR(24) NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','reviewing','inspection_booked','inspected','quoted','accepted','in_progress','completed','cancelled')),
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_renovation_requests_status ON renovation_requests(status);
CREATE INDEX IF NOT EXISTS idx_renovation_requests_email ON renovation_requests(contact_email);
CREATE INDEX IF NOT EXISTS idx_renovation_requests_state ON renovation_requests(state);
ALTER TABLE renovation_requests ADD COLUMN IF NOT EXISTS country VARCHAR(120);

CREATE TABLE IF NOT EXISTS renovation_messages (
  id SERIAL PRIMARY KEY,
  request_id INT NOT NULL REFERENCES renovation_requests(id) ON DELETE CASCADE,
  sender VARCHAR(10) NOT NULL CHECK (sender IN ('customer','admin')),
  body TEXT NOT NULL,
  read_by_admin BOOLEAN NOT NULL DEFAULT false,
  read_by_customer BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_renovation_messages_req ON renovation_messages(request_id);

-- Escrow-style milestones: the quote is split into a deposit + progress payments.
CREATE TABLE IF NOT EXISTS renovation_milestones (
  id SERIAL PRIMARY KEY,
  request_id INT NOT NULL REFERENCES renovation_requests(id) ON DELETE CASCADE,
  seq INT NOT NULL DEFAULT 0,
  label VARCHAR(120) NOT NULL,
  amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  currency VARCHAR(8) NOT NULL DEFAULT 'NGN',
  status VARCHAR(16) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','due','paid','released')),
  stripe_session_id VARCHAR(255),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_renovation_milestones_req ON renovation_milestones(request_id);

-- ── EasyMoveZone Manage: letting & property management ──
-- One row per property an owner hands to us. The quote column is the indicative
-- fee breakdown captured at sign-up; agreed_fee_pct is what we actually contract
-- on after the management visit.
/*
 * The marketplace.
 *
 * Every listing starts life as a EasyOffer submission — nothing reaches the
 * public grid that EasyMoveZone has not valued and approved. The status column is
 * the whole pipeline, from what the owner sent to what the public can see:
 *
 *   submitted -> reviewing -> offer_made
 *      accepted  -> bought  -> live, as company_owned
 *      declined  ->            live, as owner_listed, if the owner consented
 *   live -> sold | withdrawn ; anything can end at rejected
 *
 * Only live rows are public, and publishing is gated on either EasyMoveZone
 * owning the property or the owner having ticked publish_consent.
 */
CREATE TABLE IF NOT EXISTS listings (
  id SERIAL PRIMARY KEY,
  ref VARCHAR(24) UNIQUE NOT NULL,
  slug VARCHAR(255) UNIQUE,
  -- Who sent it.
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
  country VARCHAR(120),
  property_type VARCHAR(80),
  beds VARCHAR(20),
  baths VARCHAR(20),
  size_label VARCHAR(120),
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  description TEXT,
  media JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- The numbers: guide_price is what the owner asked for, list_price is what
  -- it goes to market at, offer_amount is what EasyMoveZone offered.
  currency VARCHAR(8) NOT NULL,
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
    CHECK (status IN ('draft','submitted','reviewing','offer_made','bought','live','sold','let','withdrawn','rejected')),
  featured BOOLEAN NOT NULL DEFAULT false,
  admin_note TEXT,
  customer_note TEXT,
  reviewed_by VARCHAR(255),
  offer_issued_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  sold_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS country VARCHAR(120);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS customer_note TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS offer_issued_at TIMESTAMPTZ;
ALTER TABLE listings ALTER COLUMN currency DROP DEFAULT;
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_email ON listings(owner_email);
CREATE INDEX IF NOT EXISTS idx_listings_state ON listings(state);
CREATE INDEX IF NOT EXISTS idx_listings_country ON listings(country);
CREATE INDEX IF NOT EXISTS idx_listings_published ON listings(published_at DESC);

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

-- Assisted intake and developer projects.
--
-- An admin can type a listing in for the owner. It sits at 'draft' (never
-- public, never publishable) until the owner opens a single-use link, checks
-- it and signs the authorization and publish consent themselves. consent_via,
-- consent_at and consent_ip record who signed and when.
--
-- A project is one developer's estate: one signature covers every unit type
-- in it, and each unit type is an ordinary listing row with units_available.
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
ALTER TABLE listings ADD COLUMN IF NOT EXISTS project_id INT REFERENCES listing_projects(id) ON DELETE SET NULL;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS units_available INT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS assisted_by VARCHAR(255);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS owner_note TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS consent_via VARCHAR(20);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS consent_at TIMESTAMPTZ;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS consent_ip VARCHAR(64);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS bought_at TIMESTAMPTZ;
-- The EasyMoveZone offer: issued once inspection and title verification are done,
-- and we complete within PURCHASE_DAYS of that. Stamped per offer, so changing
-- the policy later never rewrites a promise already made.
ALTER TABLE listings ADD COLUMN IF NOT EXISTS purchase_by TIMESTAMPTZ;
-- The title and land documents the owner ticked (and any they uploaded), as
-- [{ id, name, files: [{ url, name }] }]. Private: never in PUBLIC_COLUMNS, and
-- kept out of \`media\`, which is the only column /api/media/public will serve.
ALTER TABLE listings ADD COLUMN IF NOT EXISTS title_documents JSONB NOT NULL DEFAULT '[]'::jsonb;
CREATE INDEX IF NOT EXISTS idx_listings_project ON listings(project_id);
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname = 'listings_status_check'
       AND pg_get_constraintdef(oid) LIKE '%''draft''%'
       AND pg_get_constraintdef(oid) LIKE '%''let''%'
  ) THEN
    -- One list for every status: 'draft' (assisted intake) and 'let' (rentals).
    -- The rentals block below uses the same list, so neither undoes the other.
    ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_status_check;
    ALTER TABLE listings ADD CONSTRAINT listings_status_check
      CHECK (status IN ('draft','submitted','reviewing','offer_made','bought','live','sold','let','withdrawn','rejected'));
  END IF;
END $$;
-- Publishing as 'company_owned' needs bought_at, which only the 'bought'
-- step sets. Rows that went through an issued offer keep working.
UPDATE listings SET bought_at = COALESCE(updated_at, NOW())
 WHERE bought_at IS NULL
   AND (status = 'bought'
        OR (route = 'company_owned' AND status IN ('live','sold') AND offer_issued_at IS NOT NULL));
UPDATE listings SET consent_via = 'self', consent_at = created_at
 WHERE consent_via IS NULL AND consent = true;

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

CREATE TABLE IF NOT EXISTS management_requests (
  id SERIAL PRIMARY KEY,
  ref VARCHAR(24) UNIQUE NOT NULL,
  plan VARCHAR(30) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  -- The property.
  property_type VARCHAR(60),
  units INT NOT NULL DEFAULT 1,
  bedrooms VARCHAR(20),
  furnished VARCHAR(20),
  letting_status VARCHAR(20) NOT NULL DEFAULT 'unsure'
    CHECK (letting_status IN ('vacant','tenanted','new_build','shortlet','unsure')),
  state VARCHAR(80) NOT NULL,
  city VARCHAR(120),
  area VARCHAR(255),
  address VARCHAR(500),
  country VARCHAR(120),
  -- Commercials.
  currency VARCHAR(8) NOT NULL DEFAULT 'NGN',
  expected_rent NUMERIC(15,2),
  addons JSONB NOT NULL DEFAULT '[]'::jsonb,
  quote JSONB,
  start_date DATE,
  media JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Owner + signed management authorization.
  contact_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(100),
  owner_confirmed BOOLEAN NOT NULL DEFAULT false,
  consent BOOLEAN NOT NULL DEFAULT false,
  consent_name VARCHAR(255),
  -- Lifecycle.
  status VARCHAR(24) NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','reviewing','visit_booked','proposal_sent','onboarding','active','paused','ended','cancelled')),
  manager_name VARCHAR(255),
  agreed_fee_pct NUMERIC(6,2),
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_management_requests_status ON management_requests(status);
CREATE INDEX IF NOT EXISTS idx_management_requests_email ON management_requests(contact_email);
CREATE INDEX IF NOT EXISTS idx_management_requests_state ON management_requests(state);

CREATE TABLE IF NOT EXISTS management_messages (
  id SERIAL PRIMARY KEY,
  request_id INT NOT NULL REFERENCES management_requests(id) ON DELETE CASCADE,
  sender VARCHAR(10) NOT NULL CHECK (sender IN ('customer','admin')),
  body TEXT NOT NULL,
  read_by_admin BOOLEAN NOT NULL DEFAULT false,
  read_by_customer BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_management_messages_req ON management_messages(request_id);

-- Where net rent is sent. We deliberately keep only the bank, the account name
-- and the last four digits — a manager collects full details out of band.
ALTER TABLE management_requests ADD COLUMN IF NOT EXISTS payout_bank VARCHAR(120);
ALTER TABLE management_requests ADD COLUMN IF NOT EXISTS payout_account_name VARCHAR(255);
ALTER TABLE management_requests ADD COLUMN IF NOT EXISTS payout_account_last4 VARCHAR(4);
ALTER TABLE management_requests ADD COLUMN IF NOT EXISTS payout_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly';
ALTER TABLE management_requests ADD COLUMN IF NOT EXISTS repair_limit NUMERIC(15,2);
ALTER TABLE management_requests ADD COLUMN IF NOT EXISTS country VARCHAR(120);

-- A letting on a managed property. A block has one row per let unit.
CREATE TABLE IF NOT EXISTS management_tenancies (
  id SERIAL PRIMARY KEY,
  request_id INT NOT NULL REFERENCES management_requests(id) ON DELETE CASCADE,
  unit_label VARCHAR(80),
  tenant_name VARCHAR(255),
  tenant_email VARCHAR(255),
  tenant_phone VARCHAR(100),
  rent_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  rent_frequency VARCHAR(16) NOT NULL DEFAULT 'annual'
    CHECK (rent_frequency IN ('annual','biannual','quarterly','monthly')),
  deposit NUMERIC(15,2),
  currency VARCHAR(8) NOT NULL DEFAULT 'NGN',
  start_date DATE,
  end_date DATE,
  status VARCHAR(16) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','notice','ended','void')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_management_tenancies_req ON management_tenancies(request_id);

-- Rent due from a tenant. Becomes 'received' when it clears, then gets swept
-- into a payout (payout_id) so it is never remitted to the owner twice.
CREATE TABLE IF NOT EXISTS management_rent_charges (
  id SERIAL PRIMARY KEY,
  request_id INT NOT NULL REFERENCES management_requests(id) ON DELETE CASCADE,
  tenancy_id INT REFERENCES management_tenancies(id) ON DELETE SET NULL,
  period_label VARCHAR(80),
  due_date DATE NOT NULL,
  amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  amount_received NUMERIC(15,2) NOT NULL DEFAULT 0,
  currency VARCHAR(8) NOT NULL DEFAULT 'NGN',
  status VARCHAR(16) NOT NULL DEFAULT 'due'
    CHECK (status IN ('due','received','part','overdue','void')),
  received_on DATE,
  payout_id INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_management_rent_req ON management_rent_charges(request_id);
CREATE INDEX IF NOT EXISTS idx_management_rent_payout ON management_rent_charges(payout_id);

-- Money spent on the property, for the owner's account. Anything above the
-- agreed repair limit sits at 'pending' until the owner approves it in-portal.
CREATE TABLE IF NOT EXISTS management_expenses (
  id SERIAL PRIMARY KEY,
  request_id INT NOT NULL REFERENCES management_requests(id) ON DELETE CASCADE,
  category VARCHAR(40) NOT NULL DEFAULT 'repairs',
  vendor VARCHAR(255),
  description TEXT,
  amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  currency VARCHAR(8) NOT NULL DEFAULT 'NGN',
  incurred_on DATE NOT NULL DEFAULT CURRENT_DATE,
  needs_approval BOOLEAN NOT NULL DEFAULT false,
  status VARCHAR(16) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','paid')),
  decided_at TIMESTAMPTZ,
  decision_note TEXT,
  receipt_url VARCHAR(1000),
  payout_id INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_management_expenses_req ON management_expenses(request_id);
CREATE INDEX IF NOT EXISTS idx_management_expenses_payout ON management_expenses(payout_id);

-- A remittance to the owner: collected rent, less fee, VAT and costs.
-- The statement column snapshots the lines as they stood when it was raised.
CREATE TABLE IF NOT EXISTS management_payouts (
  id SERIAL PRIMARY KEY,
  request_id INT NOT NULL REFERENCES management_requests(id) ON DELETE CASCADE,
  ref VARCHAR(24) UNIQUE NOT NULL,
  period_start DATE,
  period_end DATE,
  gross_rent NUMERIC(15,2) NOT NULL DEFAULT 0,
  fee_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  vat_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  expense_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  adjustment NUMERIC(15,2) NOT NULL DEFAULT 0,
  net_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  fee_pct NUMERIC(6,2),
  currency VARCHAR(8) NOT NULL DEFAULT 'NGN',
  status VARCHAR(16) NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled','processing','paid','failed')),
  method VARCHAR(40) NOT NULL DEFAULT 'bank_transfer',
  bank_ref VARCHAR(120),
  scheduled_for DATE,
  paid_on DATE,
  statement JSONB NOT NULL DEFAULT '{}'::jsonb,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_management_payouts_req ON management_payouts(request_id);

CREATE TABLE IF NOT EXISTS management_documents (
  id SERIAL PRIMARY KEY,
  request_id INT NOT NULL REFERENCES management_requests(id) ON DELETE CASCADE,
  kind VARCHAR(40) NOT NULL DEFAULT 'other',
  name VARCHAR(255) NOT NULL,
  url VARCHAR(1000) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_management_documents_req ON management_documents(request_id);

-- ── Rentals: vacant managed properties, let through the public Rent page ──
/*
 * A rental is a row in listings with listing_type = 'rent', linked to the
 * managed property it lets. It follows the same rules as a sale: only 'live'
 * rows are public, and going live needs consent — here the owner's separate,
 * unticked-by-default advertise_consent on the management request (or
 * EasyMoveZone owning the property). A rental ends at 'let', not 'sold'.
 */
ALTER TABLE management_requests ADD COLUMN IF NOT EXISTS advertise_consent BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE management_requests ADD COLUMN IF NOT EXISTS advertise_consent_at TIMESTAMPTZ;

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
  -- Older databases were created before 'let' existed; widen the status check
  -- once. Same list as the assisted-intake block above, 'draft' included.
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

-- Someone asking to rent a live rental. Vetting happens in Admin → Rentals;
-- an approved applicant becomes a management_tenancies row (tenancy_id).
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

-- ── Property Passport: verify any property before the customer pays ──
CREATE TABLE IF NOT EXISTS passport_requests (
  id SERIAL PRIMARY KEY,
  reference VARCHAR(40) UNIQUE NOT NULL,
  access_token VARCHAR(80) UNIQUE,
  property_label VARCHAR(255) NOT NULL,
  country VARCHAR(120),
  currency VARCHAR(8),
  address VARCHAR(500),
  property_url TEXT,
  asking_price VARCHAR(80),
  seller_name VARCHAR(255),
  contact_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(100),
  concerns TEXT,
  documents JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(30) NOT NULL DEFAULT 'submitted',
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  stripe_session_id VARCHAR(255),
  checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
  advisor_note TEXT,
  report_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE passport_requests ADD COLUMN IF NOT EXISTS access_token VARCHAR(80) UNIQUE;
ALTER TABLE passport_requests ADD COLUMN IF NOT EXISTS country VARCHAR(120);
ALTER TABLE passport_requests ADD COLUMN IF NOT EXISTS currency VARCHAR(8);
ALTER TABLE passport_requests ADD COLUMN IF NOT EXISTS verification_type VARCHAR(30);
ALTER TABLE passport_requests ADD COLUMN IF NOT EXISTS extras JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE passport_requests ADD COLUMN IF NOT EXISTS quoted_fee NUMERIC(14,2);
CREATE INDEX IF NOT EXISTS idx_passport_requests_email ON passport_requests(contact_email);
CREATE INDEX IF NOT EXISTS idx_passport_requests_status ON passport_requests(status);

-- ── Tenant portal (2026-10) ────────────────────────────────────────────
-- A tenant signs in with the email on their management_tenancies row and
-- sees their home, rent schedule and shared documents. What they raise —
-- a repair, a question, "I have paid", notice to leave — is a
-- tenant_requests row, worked by the desk in Admin → Tenants. The owner of
-- the property sees repairs (never the tenant's contact details).
CREATE TABLE IF NOT EXISTS tenant_requests (
  id SERIAL PRIMARY KEY,
  ref VARCHAR(24) UNIQUE NOT NULL,
  tenancy_id INT NOT NULL REFERENCES management_tenancies(id) ON DELETE CASCADE,
  request_id INT NOT NULL REFERENCES management_requests(id) ON DELETE CASCADE,
  tenant_email VARCHAR(255) NOT NULL,
  category VARCHAR(20) NOT NULL DEFAULT 'repair'
    CHECK (category IN ('repair','payment','question','notice')),
  title VARCHAR(255) NOT NULL,
  details TEXT,
  urgency VARCHAR(10) NOT NULL DEFAULT 'normal'
    CHECK (urgency IN ('low','normal','urgent')),
  location VARCHAR(120),
  access_notes VARCHAR(500),
  amount NUMERIC(15,2),
  paid_on DATE,
  payment_ref VARCHAR(120),
  media JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(16) NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','in_progress','scheduled','resolved','closed')),
  response TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tenant_requests_tenancy ON tenant_requests(tenancy_id);
CREATE INDEX IF NOT EXISTS idx_tenant_requests_status ON tenant_requests(status);
CREATE INDEX IF NOT EXISTS idx_management_tenancies_email ON management_tenancies(LOWER(tenant_email));

-- Documents stay owner-only unless the desk shares one with the tenant
-- (a tenancy agreement, an inventory, a gas certificate).
ALTER TABLE management_documents ADD COLUMN IF NOT EXISTS share_with_tenant BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE management_documents ADD COLUMN IF NOT EXISTS tenancy_id INT REFERENCES management_tenancies(id) ON DELETE SET NULL;

-- ── Portal hardening (2026-10) ─────────────────────────────────────────
-- Staff activity: every change a staff member makes through the API.
CREATE TABLE IF NOT EXISTS admin_audit (
  id BIGSERIAL PRIMARY KEY,
  actor VARCHAR(255) NOT NULL,
  method VARCHAR(8) NOT NULL,
  path VARCHAR(500) NOT NULL,
  status INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_admin_audit_created ON admin_audit(created_at DESC);

-- What we told whom. Every notice lands in the recipient's in-app inbox;
-- email and SMS go out too when a provider is configured, and the row says
-- whether they did.
CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  recipient_email VARCHAR(255) NOT NULL,
  audience VARCHAR(10) NOT NULL DEFAULT 'owner'
    CHECK (audience IN ('owner','tenant','staff')),
  kind VARCHAR(40) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT,
  link VARCHAR(500),
  read_at TIMESTAMPTZ,
  email_status VARCHAR(12) NOT NULL DEFAULT 'skipped',
  sms_status VARCHAR(12) NOT NULL DEFAULT 'skipped',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_email, created_at DESC);

-- Online rent payments (Paystack). One row per checkout; the reference makes
-- crediting the rent charge idempotent across the redirect and the webhook.
CREATE TABLE IF NOT EXISTS rent_payments (
  id SERIAL PRIMARY KEY,
  reference VARCHAR(80) UNIQUE NOT NULL,
  charge_id INT NOT NULL REFERENCES management_rent_charges(id) ON DELETE CASCADE,
  tenancy_id INT REFERENCES management_tenancies(id) ON DELETE SET NULL,
  payer_email VARCHAR(255) NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  currency VARCHAR(8) NOT NULL DEFAULT 'NGN',
  provider VARCHAR(20) NOT NULL DEFAULT 'paystack',
  status VARCHAR(12) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','success','failed','abandoned')),
  paid_at TIMESTAMPTZ,
  credited BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rent_payments_charge ON rent_payments(charge_id);

-- Rent reminders are sent once per charge per kind.
ALTER TABLE management_rent_charges ADD COLUMN IF NOT EXISTS reminded_due_at TIMESTAMPTZ;
ALTER TABLE management_rent_charges ADD COLUMN IF NOT EXISTS reminded_overdue_at TIMESTAMPTZ;

-- A single-use link that attaches a tenancy to whoever signs in with it.
-- Only a SHA-256 of the token is stored; a new link revokes the old one.
CREATE TABLE IF NOT EXISTS tenant_invites (
  id SERIAL PRIMARY KEY,
  tenancy_id INT NOT NULL REFERENCES management_tenancies(id) ON DELETE CASCADE,
  token_hash CHAR(64) UNIQUE NOT NULL,
  sent_to VARCHAR(255),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  used_by VARCHAR(255),
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tenant_invites_tenancy ON tenant_invites(tenancy_id);

-- The conversation on a tenant request. 'owner' notes are between the owner
-- and the desk: the tenant never sees them.
CREATE TABLE IF NOT EXISTS tenant_request_messages (
  id SERIAL PRIMARY KEY,
  request_id INT NOT NULL REFERENCES tenant_requests(id) ON DELETE CASCADE,
  sender VARCHAR(10) NOT NULL CHECK (sender IN ('tenant','admin','owner')),
  author VARCHAR(255),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tenant_request_messages_req ON tenant_request_messages(request_id);

-- ── Neighbourhoods (2026-10) ───────────────────────────────────────────
-- Residents' posts on an area's board (areas are in areaCatalog.js). Posts
-- are about places, never people: contact details are refused, and anything
-- that may name or accuse someone is 'held' until the desk reads it.
CREATE TABLE IF NOT EXISTS area_posts (
  id SERIAL PRIMARY KEY,
  area_slug VARCHAR(80) NOT NULL,
  category VARCHAR(20) NOT NULL,
  place VARCHAR(160),
  body TEXT NOT NULL,
  author_email VARCHAR(255) NOT NULL,
  author_name VARCHAR(80),
  verified_resident BOOLEAN NOT NULL DEFAULT false,
  status VARCHAR(12) NOT NULL DEFAULT 'published'
    CHECK (status IN ('published','held','removed')),
  moderation_note TEXT,
  reviewed_by VARCHAR(255),
  reviewed_at TIMESTAMPTZ,
  report_count INT NOT NULL DEFAULT 0,
  helpful_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_area_posts_area ON area_posts(area_slug, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_area_posts_author ON area_posts(author_email, created_at DESC);

CREATE TABLE IF NOT EXISTS area_post_replies (
  id SERIAL PRIMARY KEY,
  post_id INT NOT NULL REFERENCES area_posts(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  author_email VARCHAR(255) NOT NULL,
  author_name VARCHAR(80),
  verified_resident BOOLEAN NOT NULL DEFAULT false,
  status VARCHAR(12) NOT NULL DEFAULT 'published'
    CHECK (status IN ('published','held','removed')),
  moderation_note TEXT,
  reviewed_by VARCHAR(255),
  reviewed_at TIMESTAMPTZ,
  report_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_area_post_replies_post ON area_post_replies(post_id, created_at);

-- One "helpful" per person per post.
CREATE TABLE IF NOT EXISTS area_post_votes (
  post_id INT NOT NULL REFERENCES area_posts(id) ON DELETE CASCADE,
  voter_email VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (post_id, voter_email)
);

-- One report per person per post or reply; enough of them hides it for review.
CREATE TABLE IF NOT EXISTS area_reports (
  id SERIAL PRIMARY KEY,
  target_type VARCHAR(8) NOT NULL CHECK (target_type IN ('post','reply')),
  target_id INT NOT NULL,
  reporter_email VARCHAR(255) NOT NULL,
  reason VARCHAR(40) NOT NULL,
  detail VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (target_type, target_id, reporter_email)
);

-- A resident's scores for an area (1-5, 5 is good), one row per person, kept up to date.
CREATE TABLE IF NOT EXISTS area_ratings (
  area_slug VARCHAR(80) NOT NULL,
  rater_email VARCHAR(255) NOT NULL,
  power SMALLINT CHECK (power BETWEEN 1 AND 5),
  water SMALLINT CHECK (water BETWEEN 1 AND 5),
  flooding SMALLINT CHECK (flooding BETWEEN 1 AND 5),
  security SMALLINT CHECK (security BETWEEN 1 AND 5),
  roads SMALLINT CHECK (roads BETWEEN 1 AND 5),
  noise SMALLINT CHECK (noise BETWEEN 1 AND 5),
  network SMALLINT CHECK (network BETWEEN 1 AND 5),
  verified_resident BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (area_slug, rater_email)
);

-- The neighbourhoods that have a page. Staff open, edit and hide them in
-- Admin → Community; the starter set comes from data/areas.json.
CREATE TABLE IF NOT EXISTS areas (
  slug VARCHAR(80) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  city VARCHAR(120) NOT NULL,
  state VARCHAR(80) NOT NULL,
  lat NUMERIC(9,6),
  lng NUMERIC(9,6),
  match TEXT[] NOT NULL DEFAULT '{}',
  blurb VARCHAR(400),
  status VARCHAR(10) NOT NULL DEFAULT 'live' CHECK (status IN ('live','hidden')),
  created_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO areas (slug, name, city, state, lat, lng, match, blurb) VALUES
${AREA_SEED_SQL}
ON CONFLICT (slug) DO NOTHING;

-- ── Agent marketplace (Rightmove-style classifieds beside EasyOffer) ──
CREATE TABLE IF NOT EXISTS agencies (
  id SERIAL PRIMARY KEY,
  ref VARCHAR(24) UNIQUE NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(100),
  website VARCHAR(500),
  bio TEXT,
  logo TEXT,
  address VARCHAR(500),
  area VARCHAR(255),
  city VARCHAR(120),
  state VARCHAR(80),
  country VARCHAR(120) DEFAULT 'Nigeria',
  license_number VARCHAR(120),
  license_docs JSONB NOT NULL DEFAULT '[]'::jsonb,
  verification_status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending','verified','rejected','suspended')),
  verified_at TIMESTAMPTZ,
  verified_by VARCHAR(255),
  plan VARCHAR(20) NOT NULL DEFAULT 'none'
    CHECK (plan IN ('none','starter','pro','premium')),
  listing_quota INT NOT NULL DEFAULT 0,
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_agencies_slug ON agencies(slug);
CREATE INDEX IF NOT EXISTS idx_agencies_status ON agencies(verification_status);
CREATE INDEX IF NOT EXISTS idx_agencies_city ON agencies(city);

CREATE TABLE IF NOT EXISTS agency_members (
  id SERIAL PRIMARY KEY,
  agency_id INT NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'owner'
    CHECK (role IN ('owner','admin','negotiator')),
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','invited','removed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (agency_id, email)
);
CREATE INDEX IF NOT EXISTS idx_agency_members_email ON agency_members(email);
CREATE INDEX IF NOT EXISTS idx_agency_members_user ON agency_members(user_id);

CREATE TABLE IF NOT EXISTS agency_branches (
  id SERIAL PRIMARY KEY,
  agency_id INT NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(500),
  city VARCHAR(120),
  state VARCHAR(80),
  country VARCHAR(120),
  phone VARCHAR(100),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_agency_branches_agency ON agency_branches(agency_id);

CREATE TABLE IF NOT EXISTS agent_applications (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  phone VARCHAR(100),
  website VARCHAR(500),
  license_number VARCHAR(120),
  city VARCHAR(120),
  state VARCHAR(80),
  country VARCHAR(120),
  bio TEXT,
  docs JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','needs_more')),
  agency_id INT REFERENCES agencies(id) ON DELETE SET NULL,
  admin_note TEXT,
  reviewed_by VARCHAR(255),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_agent_applications_email ON agent_applications(email);
CREATE INDEX IF NOT EXISTS idx_agent_applications_status ON agent_applications(status);

CREATE TABLE IF NOT EXISTS agency_subscriptions (
  id SERIAL PRIMARY KEY,
  agency_id INT NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  plan VARCHAR(20) NOT NULL,
  quota INT NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  currency VARCHAR(8) NOT NULL DEFAULT 'NGN',
  reference VARCHAR(80) UNIQUE NOT NULL,
  provider VARCHAR(20) NOT NULL DEFAULT 'paystack',
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','active','failed','cancelled','comped')),
  credited BOOLEAN NOT NULL DEFAULT false,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_agency_subscriptions_agency ON agency_subscriptions(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_subscriptions_ref ON agency_subscriptions(reference);

CREATE TABLE IF NOT EXISTS user_saved_listings (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  listing_id INT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (email, listing_id)
);
CREATE INDEX IF NOT EXISTS idx_user_saved_listings_email ON user_saved_listings(email);

CREATE TABLE IF NOT EXISTS user_saved_searches (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  alert_enabled BOOLEAN NOT NULL DEFAULT true,
  last_notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_user_saved_searches_email ON user_saved_searches(email);

CREATE TABLE IF NOT EXISTS listing_viewings (
  id SERIAL PRIMARY KEY,
  listing_id INT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  agency_id INT REFERENCES agencies(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(100),
  preferred_at TIMESTAMPTZ,
  preferred_window VARCHAR(40),
  message TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested','offered','confirmed','cancelled')),
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_listing_viewings_listing ON listing_viewings(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_viewings_agency ON listing_viewings(agency_id);

CREATE TABLE IF NOT EXISTS rate_limit_events (
  id BIGSERIAL PRIMARY KEY,
  bucket VARCHAR(80) NOT NULL,
  actor VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rate_limit_events_bucket ON rate_limit_events(bucket, actor, created_at DESC);

ALTER TABLE listings ADD COLUMN IF NOT EXISTS agency_id INT REFERENCES agencies(id) ON DELETE SET NULL;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS branch_id INT REFERENCES agency_branches(id) ON DELETE SET NULL;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS listed_by_user_id VARCHAR(255);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;
CREATE INDEX IF NOT EXISTS idx_listings_agency ON listings(agency_id);

ALTER TABLE listing_enquiries ADD COLUMN IF NOT EXISTS kind VARCHAR(20) NOT NULL DEFAULT 'enquiry';
ALTER TABLE listing_enquiries ADD COLUMN IF NOT EXISTS agency_id INT REFERENCES agencies(id) ON DELETE SET NULL;
ALTER TABLE listing_enquiries ADD COLUMN IF NOT EXISTS preferred_at TIMESTAMPTZ;
ALTER TABLE listing_enquiries ADD COLUMN IF NOT EXISTS preferred_window VARCHAR(40);

DO $$ BEGIN
  ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_route_check;
  ALTER TABLE listings ADD CONSTRAINT listings_route_check
    CHECK (route IN ('private','owner_listed','company_owned','agent_listed'));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname = 'listings_status_check'
       AND pg_get_constraintdef(oid) LIKE '%''pending_review''%'
  ) THEN
    ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_status_check;
    ALTER TABLE listings ADD CONSTRAINT listings_status_check
      CHECK (status IN ('draft','submitted','reviewing','pending_review','offer_made','bought','live','sold','let','withdrawn','rejected'));
  END IF;
END $$;

DO $$ BEGIN
  ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_audience_check;
  ALTER TABLE notifications ADD CONSTRAINT notifications_audience_check
    CHECK (audience IN ('owner','tenant','staff','community','agent'));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- A buyer asking the mortgage desk for a bank loan or an NHF introduction.
-- Not a credit decision: staff contact them, a lender decides.
CREATE TABLE IF NOT EXISTS mortgage_leads (
  id SERIAL PRIMARY KEY,
  ref VARCHAR(24) UNIQUE NOT NULL,
  product VARCHAR(20) NOT NULL CHECK (product IN ('bank','nhf','unsure')),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(100),
  city VARCHAR(120),
  price NUMERIC(15,2),
  employment VARCHAR(40),
  income_band VARCHAR(60),
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mortgage_leads_status ON mortgage_leads(status, created_at DESC);
`;

/**
 * Apply SCHEMA once per version of it. Every statement is idempotent, but
 * running ~800 lines of DDL on each serverless cold start made first requests
 * slow, so a hash of SCHEMA is stored and the run is skipped when it matches.
 * An advisory lock stops two cold starts applying it at the same time.
 */
const SCHEMA_HASH = require('crypto').createHash('sha256').update(SCHEMA).digest('hex');
const SCHEMA_LOCK = 427001;

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Fast path. On a brand-new database schema_meta does not exist yet; it is
    // created under the lock, so two cold starts cannot both try to create it.
    const current = await client.query(`SELECT value FROM schema_meta WHERE key = 'schema_hash'`).catch(() => null);
    if (current?.rows[0]?.value === SCHEMA_HASH && process.env.FORCE_SCHEMA !== '1') return;
    await client.query('SELECT pg_advisory_lock($1)', [SCHEMA_LOCK]);
    try {
      await client.query('CREATE TABLE IF NOT EXISTS schema_meta (key VARCHAR(40) PRIMARY KEY, value TEXT NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW())');
      const again = await client.query(`SELECT value FROM schema_meta WHERE key = 'schema_hash'`);
      if (again.rows[0]?.value !== SCHEMA_HASH || process.env.FORCE_SCHEMA === '1') {
        await client.query(SCHEMA);
        await client.query(
          `INSERT INTO schema_meta (key, value) VALUES ('schema_hash', $1)
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
          [SCHEMA_HASH]
        );
        console.log('Database schema initialized');
      }
    } finally {
      await client.query('SELECT pg_advisory_unlock($1)', [SCHEMA_LOCK]);
    }
  } catch (err) {
    console.error('Database initialization error:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

async function getOrCreateUser(sessionId) {
  const email = sessionId.startsWith('auth:') ? sessionId.slice(5) : null;
  const existing = await pool.query('SELECT * FROM users WHERE session_id = $1', [sessionId]);
  if (existing.rows.length > 0) {
    if (email && !existing.rows[0].email) {
      await pool.query('UPDATE users SET email = $1 WHERE id = $2', [email, existing.rows[0].id]);
    }
    return existing.rows[0];
  }

  const result = await pool.query(
    'INSERT INTO users (session_id, email) VALUES ($1, $2) RETURNING *',
    [sessionId, email]
  );
  return result.rows[0];
}

module.exports = { pool, initializeDatabase, getOrCreateUser };

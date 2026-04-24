-- EasyMoveZone: Agro Logistics Schema
-- Run after platform-schema.sql

-- ─── Farmer / transporter / buyer roles ───────────────────────────────────
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS agro_role TEXT CHECK (agro_role IN ('farmer', 'transporter', 'buyer', 'admin')) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS base_state TEXT,
  ADD COLUMN IF NOT EXISTS base_lga TEXT;

-- ─── Produce listings ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS produce_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id TEXT REFERENCES user_profiles(user_id) ON DELETE SET NULL,

  -- Crop info
  crop_type TEXT NOT NULL,
  variety TEXT,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,                        -- kg, tonnes, bags, crates, etc.
  price_per_unit NUMERIC NOT NULL,
  currency TEXT DEFAULT 'NGN',
  notes TEXT,

  -- Location
  state TEXT NOT NULL,
  lga TEXT,
  coordinates POINT,                         -- future: GPS pin

  -- Timing
  harvest_date DATE,
  pickup_from DATE,
  pickup_to DATE,

  -- Logistics flags
  needs_transport BOOLEAN DEFAULT FALSE,
  cold_storage_required BOOLEAN DEFAULT FALSE,

  -- Contact (used when farmer is not authenticated)
  contact_name TEXT,
  contact_phone TEXT,
  contact_whatsapp BOOLEAN DEFAULT TRUE,

  -- Status
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'reserved', 'sold', 'expired', 'removed')),
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,

  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS produce_listings_crop_idx ON produce_listings (crop_type);
CREATE INDEX IF NOT EXISTS produce_listings_state_idx ON produce_listings (state);
CREATE INDEX IF NOT EXISTS produce_listings_status_idx ON produce_listings (status);
CREATE INDEX IF NOT EXISTS produce_listings_harvest_idx ON produce_listings (harvest_date);

-- ─── Transporter profiles ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transporter_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES user_profiles(user_id) ON DELETE SET NULL,

  company_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp BOOLEAN DEFAULT TRUE,

  base_state TEXT NOT NULL,
  base_lga TEXT,

  fleet_size INTEGER DEFAULT 1,
  truck_types TEXT[] DEFAULT '{}',
  specialties TEXT[] DEFAULT '{}',
  routes TEXT,
  years_experience INTEGER,

  has_insurance BOOLEAN DEFAULT FALSE,
  has_gps BOOLEAN DEFAULT FALSE,
  has_cold_chain BOOLEAN DEFAULT FALSE,

  price_per_tonne_km NUMERIC,

  rating NUMERIC(3,2),
  total_trips INTEGER DEFAULT 0,

  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'suspended')),
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS transporter_profiles_state_idx ON transporter_profiles (base_state);
CREATE INDEX IF NOT EXISTS transporter_profiles_status_idx ON transporter_profiles (status);

-- ─── Shipments ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parties
  farmer_id TEXT REFERENCES user_profiles(user_id) ON DELETE SET NULL,
  transporter_id UUID REFERENCES transporter_profiles(id) ON DELETE SET NULL,
  buyer_id TEXT REFERENCES user_profiles(user_id) ON DELETE SET NULL,

  -- What's being shipped
  produce_listing_id UUID REFERENCES produce_listings(id) ON DELETE SET NULL,
  crop_description TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  cargo_value NUMERIC,
  currency TEXT DEFAULT 'NGN',

  -- Origin / destination
  origin_state TEXT NOT NULL,
  origin_lga TEXT,
  destination TEXT NOT NULL,

  -- Dates
  pickup_date DATE,
  eta DATE,
  actual_delivery TIMESTAMPTZ,

  -- Status
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'pickup', 'in_transit', 'delivered', 'issue', 'cancelled')),

  -- Tracking
  last_location TEXT,
  last_location_updated_at TIMESTAMPTZ,

  -- Dispute
  dispute_reason TEXT,
  dispute_opened_at TIMESTAMPTZ,
  dispute_resolved_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS shipments_farmer_idx ON shipments (farmer_id);
CREATE INDEX IF NOT EXISTS shipments_transporter_idx ON shipments (transporter_id);
CREATE INDEX IF NOT EXISTS shipments_buyer_idx ON shipments (buyer_id);
CREATE INDEX IF NOT EXISTS shipments_status_idx ON shipments (status);

-- ─── Shipment timeline events ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shipment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,       -- e.g. 'pickup', 'checkpoint', 'delay', 'delivery'
  description TEXT,
  location TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Commodity prices ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS commodity_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  crop TEXT NOT NULL,
  category TEXT,
  variety TEXT,
  unit TEXT NOT NULL,

  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'NGN',

  market_name TEXT NOT NULL,
  state TEXT NOT NULL,
  city TEXT,

  reported_by TEXT,               -- user_id or 'system'
  quality_grade TEXT,             -- A, B, C

  verified BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS commodity_prices_crop_idx ON commodity_prices (crop);
CREATE INDEX IF NOT EXISTS commodity_prices_market_idx ON commodity_prices (market_name);
CREATE INDEX IF NOT EXISTS commodity_prices_created_idx ON commodity_prices (created_at DESC);

-- ─── Price submissions (crowdsource) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS price_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop TEXT NOT NULL,
  unit TEXT NOT NULL,
  price NUMERIC NOT NULL,
  market_name TEXT NOT NULL,
  state TEXT NOT NULL,
  submitted_by TEXT,
  phone TEXT,
  reviewed BOOLEAN DEFAULT FALSE,
  accepted BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

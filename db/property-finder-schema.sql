-- EasyMoveZone Property Finder schema (optional, for Neon)

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

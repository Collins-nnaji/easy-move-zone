-- EasyMoveZone platform schema (PostgreSQL / Neon)
-- Apply in your Neon SQL editor.

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'client',
  company TEXT,
  created_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS markets (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  flag_emoji TEXT NOT NULL,
  region TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  gdp TEXT NOT NULL,
  population TEXT NOT NULL,
  business_environment_score INTEGER NOT NULL DEFAULT 0,
  ease_of_doing_business_rank INTEGER NOT NULL DEFAULT 0,
  top_sectors JSONB NOT NULL DEFAULT '[]'::jsonb,
  regulatory_notes TEXT NOT NULL DEFAULT '',
  latitude DOUBLE PRECISION NOT NULL DEFAULT 0,
  longitude DOUBLE PRECISION NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS corridors (
  id TEXT PRIMARY KEY,
  origin_market_id TEXT NOT NULL REFERENCES markets(id),
  destination_market_id TEXT NOT NULL REFERENCES markets(id),
  sector TEXT NOT NULL,
  active_client_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  market_id TEXT NOT NULL REFERENCES markets(id),
  sector TEXT NOT NULL,
  direction TEXT NOT NULL,
  summary TEXT NOT NULL,
  full_content TEXT NOT NULL,
  preview_excerpt TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  publish_date DATE NOT NULL,
  last_updated_date DATE NOT NULL,
  author TEXT NOT NULL,
  download_url TEXT NOT NULL,
  purchase_count INTEGER NOT NULL DEFAULT 0,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  direction TEXT NOT NULL,
  description TEXT NOT NULL,
  client_receives TEXT NOT NULL,
  emz_execution TEXT NOT NULL,
  timeline TEXT NOT NULL,
  price_min NUMERIC(12,2) NOT NULL,
  price_max NUMERIC(12,2) NOT NULL,
  featured BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS faqs (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS testimonials (
  id TEXT PRIMARY KEY,
  client_type TEXT NOT NULL,
  corridor_id TEXT NOT NULL REFERENCES corridors(id),
  outcome TEXT NOT NULL,
  quote TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS team (
  id TEXT PRIMARY KEY,
  section TEXT NOT NULL,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  bio TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  markets JSONB NOT NULL DEFAULT '[]'::jsonb,
  linkedin_url TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS values (
  id TEXT PRIMARY KEY,
  order_index INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS press (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  article_url TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS partners (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  country TEXT NOT NULL,
  website_url TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS newsletter (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  list_type TEXT NOT NULL DEFAULT 'general',
  subscribed_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'subscribed',
  UNIQUE(email, list_type)
);

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  direction TEXT NOT NULL,
  target_market TEXT NOT NULL,
  business_sector TEXT NOT NULL,
  timeline TEXT NOT NULL,
  budget_range TEXT NOT NULL,
  message TEXT NOT NULL,
  source TEXT NOT NULL,
  recommended_service TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  ai_summary TEXT NOT NULL DEFAULT '',
  created_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  engagement_type TEXT NOT NULL,
  corridor_id TEXT NOT NULL REFERENCES corridors(id),
  advisor_name TEXT NOT NULL,
  advisor_photo TEXT NOT NULL,
  phase TEXT NOT NULL,
  start_date DATE NOT NULL,
  contract_value NUMERIC(12,2) NOT NULL DEFAULT 0,
  next_milestone TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS deliverables (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id),
  name TEXT NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL,
  file_url TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS introductions (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id),
  contact_name TEXT NOT NULL,
  company TEXT NOT NULL,
  introduction_date DATE NOT NULL,
  purpose TEXT NOT NULL,
  outcome_status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id),
  sender_role TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_status BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS intelligence_feed (
  id TEXT PRIMARY KEY,
  corridor_id TEXT NOT NULL REFERENCES corridors(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

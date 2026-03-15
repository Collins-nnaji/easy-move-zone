-- EasyMoveZone Service-Enabled Pivot
-- Run this script in your Neon SQL editor to drop legacy property tables and add new service functionality.

-- 1. DROP LEGACY TABLES
DROP TABLE IF EXISTS property_listings CASCADE;
DROP TABLE IF EXISTS trusted_agents CASCADE;
DROP TABLE IF EXISTS city_markets CASCADE;
DROP TABLE IF EXISTS property_testimonials CASCADE;
DROP TABLE IF EXISTS property_faqs CASCADE;
DROP TABLE IF EXISTS resource_guides CASCADE;
DROP TABLE IF EXISTS relocation_tasks CASCADE;
DROP TABLE IF EXISTS relocation_contacts CASCADE;
DROP TABLE IF EXISTS relocation_plans CASCADE;
DROP TABLE IF EXISTS relocation_country_guides CASCADE;

-- Also dropping old unused platform tables if preferred for a clean slate
DROP TABLE IF EXISTS deliverables CASCADE;
DROP TABLE IF EXISTS introductions CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS intelligence_feed CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS leads CASCADE;

-- 2. CREATE SERVICE TABLES
-- Service Catalog (The services we offer as a platform)
CREATE TABLE IF NOT EXISTS platform_services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- e.g., 'visa', 'housing', 'logistics', 'tax'
  description TEXT NOT NULL,
  price_estimated TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Service Requests (When a user or corporate client requests a service)
CREATE TABLE IF NOT EXISTS service_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  service_id TEXT NOT NULL REFERENCES platform_services(id),
  status TEXT NOT NULL DEFAULT 'submitted', -- 'submitted', 'reviewing', 'in_progress', 'completed', 'cancelled'
  user_notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert initial service catalog
INSERT INTO platform_services (id, name, category, description, price_estimated) VALUES
  ('srv_visa_tech', 'UK Tech Nation Visa Support', 'visa', 'End-to-end guidance for the Global Talent route including endorsement review.', 'From $2,500'),
  ('srv_visa_golden', 'UAE Golden Visa Application', 'visa', 'Processing, medicals, and Emirates ID setup via property investment or salary routes.', 'From $3,000'),
  ('srv_house_london', 'London Home Search Tour', 'housing', 'Accompanied viewings based on pre-vetted shortlists in target boroughs.', 'From $1,500'),
  ('srv_tax_consult', 'Cross-Border Tax Consultation', 'tax', '1-hour deep dive into your double taxation exposure and structuring.', '$450/hr'),
  ('srv_corp_entity', 'Corporate Entity Setup Express', 'legal', 'Fast-tracked establishment of local legal entities for hiring.', 'Custom Quote')
ON CONFLICT (id) DO NOTHING;

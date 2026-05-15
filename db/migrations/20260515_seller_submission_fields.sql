-- Migration: add seller contact fields and listing_type to property_listings
-- Date: 2026-05-15

ALTER TABLE property_listings
  ADD COLUMN IF NOT EXISTS listing_type TEXT,
  ADD COLUMN IF NOT EXISTS seller_name TEXT,
  ADD COLUMN IF NOT EXISTS seller_phone TEXT,
  ADD COLUMN IF NOT EXISTS seller_email TEXT;

-- Valid listing types for owner submissions
ALTER TABLE property_listings
  DROP CONSTRAINT IF EXISTS property_listings_listing_type_check;
ALTER TABLE property_listings
  ADD CONSTRAINT property_listings_listing_type_check
  CHECK (listing_type IS NULL OR listing_type IN (
    'outright-purchase', 'rent-to-own', 'build', 'mortgage-eligible'
  ));

CREATE INDEX IF NOT EXISTS property_listings_listing_type_idx ON property_listings(listing_type);

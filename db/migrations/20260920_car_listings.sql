-- Marketplace car listings (seller submissions + admin review)
CREATE TABLE IF NOT EXISTS car_listings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  seller_user_id TEXT NOT NULL,
  seller_email TEXT,
  seller_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  year INTEGER NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  trim TEXT NOT NULL DEFAULT '',
  mileage INTEGER NOT NULL DEFAULT 0,
  fuel TEXT NOT NULL DEFAULT 'Petrol',
  transmission TEXT NOT NULL DEFAULT 'Automatic',
  engine TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT 'Saloon',
  colour TEXT NOT NULL DEFAULT '',
  doors INTEGER NOT NULL DEFAULT 4,
  seats INTEGER NOT NULL DEFAULT 5,
  price INTEGER NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  photos TEXT[] NOT NULL DEFAULT '{}',
  stock_type TEXT NOT NULL DEFAULT 'uk_stock',
  origin_country TEXT NOT NULL DEFAULT 'United Kingdom',
  admin_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT car_listings_status_check CHECK (status IN ('pending', 'approved', 'rejected')),
  CONSTRAINT car_listings_stock_check CHECK (stock_type IN ('uk_stock', 'import', 'cfr'))
);

CREATE INDEX IF NOT EXISTS car_listings_status_idx ON car_listings (status, created_at DESC);
CREATE INDEX IF NOT EXISTS car_listings_seller_idx ON car_listings (seller_user_id, created_at DESC);

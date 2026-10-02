-- Shared catalogue, delivery requests, public pictures and enquiry management.
-- The application also creates these tables on first use. Existing data is preserved.
CREATE TABLE IF NOT EXISTS emz_produce_catalog (
  id integer PRIMARY KEY,
  content jsonb NOT NULL,
  revision integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS emz_produce_shipments (
  reference text PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS emz_produce_shipments_updated_idx
  ON emz_produce_shipments(updated_at DESC);
CREATE TABLE IF NOT EXISTS emz_produce_media (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  content_type text NOT NULL,
  data text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS emz_enquiry_states (
  id text PRIMARY KEY,
  status text NOT NULL DEFAULT 'new',
  notes text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Additive marketplace data; existing bookings and workers remain intact.
CREATE TABLE IF NOT EXISTS public.emz_marketplace (
  kind text NOT NULL,
  id text NOT NULL,
  owner_id text NOT NULL DEFAULT '',
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (kind,id)
);
CREATE INDEX IF NOT EXISTS emz_marketplace_owner ON public.emz_marketplace(kind,owner_id);
CREATE INDEX IF NOT EXISTS emz_moves_owner ON public.emz_moves((data->>'userId'));

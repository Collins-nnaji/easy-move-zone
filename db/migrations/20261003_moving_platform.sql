-- Current moving platform. Account and support records are preserved.
CREATE TABLE IF NOT EXISTS public.emz_moves (
  reference text PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS emz_moves_updated_idx ON public.emz_moves(updated_at DESC);
CREATE TABLE IF NOT EXISTS public.emz_enquiry_states (
  id text PRIMARY KEY,
  status text NOT NULL DEFAULT 'new',
  notes text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

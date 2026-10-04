-- Movers and vehicle owners who can be assigned to booked moves.
CREATE TABLE IF NOT EXISTS public.emz_workers (
  id text PRIMARY KEY,
  user_id text UNIQUE,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

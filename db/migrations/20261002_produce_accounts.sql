-- Application-owned account tables. Neon Auth manages its own schema separately.
CREATE TABLE IF NOT EXISTS admin_users (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
-- Matches the columns used by the current account administration endpoints.
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'buyer',
  full_name text,
  phone text,
  nationality text,
  subscription_tier text DEFAULT 'free',
  is_agent boolean NOT NULL DEFAULT false,
  agent_company text,
  agent_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS nationality text,
  ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS is_agent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS agent_company text,
  ADD COLUMN IF NOT EXISTS agent_verified boolean NOT NULL DEFAULT false;

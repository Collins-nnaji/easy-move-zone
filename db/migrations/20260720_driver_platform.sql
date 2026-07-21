-- Driver shifts platform — core tables
create extension if not exists pgcrypto;

-- Driver preferences and onboarding state
create table if not exists driver_profiles (
  auth_user_id text primary key,
  zone text not null default 'Lagos Mainland',
  vehicle_type text not null default 'sprinter'
    check (vehicle_type in ('sprinter', 'box-truck', 'client-fleet', 'flatbed')),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Shifts posted by fleet managers or seeded by the platform
create table if not exists driver_shifts (
  id uuid primary key default gen_random_uuid(),
  posted_by text,
  payout_cents integer not null check (payout_cents > 0),
  payout_type text not null check (payout_type in ('day', 'hour')),
  vehicle_type text not null
    check (vehicle_type in ('sprinter', 'box-truck', 'client-fleet', 'flatbed')),
  vehicle_label text not null,
  pickup text not null,
  dropoff text not null,
  start_time text not null,
  end_time text not null,
  hours numeric(4, 1) not null,
  zone text not null,
  distance_mi integer not null default 0,
  stops integer not null default 1,
  demand text not null default 'normal' check (demand in ('high', 'normal')),
  shift_date text not null,
  status text not null default 'open'
    check (status in ('open', 'claimed', 'active', 'completed', 'cancelled')),
  claimed_by text,
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_driver_shifts_zone_status on driver_shifts(zone, status);
create index if not exists idx_driver_shifts_claimed_by on driver_shifts(claimed_by) where claimed_by is not null;

-- Live shift session (clock-in, waypoints, sign-off)
create table if not exists driver_shift_sessions (
  id uuid primary key default gen_random_uuid(),
  shift_id uuid not null references driver_shifts(id) on delete cascade,
  auth_user_id text not null,
  clocked_in_at timestamptz,
  clocked_out_at timestamptz,
  signature_data text,
  waypoints jsonb not null default '[]'::jsonb,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'active', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (shift_id, auth_user_id)
);

create index if not exists idx_driver_sessions_user on driver_shift_sessions(auth_user_id, status);

-- Wallet balances per driver
create table if not exists driver_wallets (
  auth_user_id text primary key,
  available_cents integer not null default 0 check (available_cents >= 0),
  pending_cents integer not null default 0 check (pending_cents >= 0),
  lifetime_cents integer not null default 0 check (lifetime_cents >= 0),
  updated_at timestamptz not null default now()
);

-- Transaction ledger
create table if not exists driver_wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  auth_user_id text not null,
  label text not null,
  amount_cents integer not null,
  txn_type text not null check (txn_type in ('credit', 'deduction', 'cashout')),
  shift_id uuid references driver_shifts(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_driver_wallet_txn_user on driver_wallet_transactions(auth_user_id, created_at desc);

-- Compliance documents
create table if not exists driver_compliance_docs (
  id uuid primary key default gen_random_uuid(),
  auth_user_id text not null,
  doc_key text not null,
  name text not null,
  status text not null default 'missing'
    check (status in ('verified', 'pending', 'expiring', 'missing')),
  detail text,
  expires_at date,
  file_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (auth_user_id, doc_key)
);

create index if not exists idx_driver_compliance_user on driver_compliance_docs(auth_user_id);

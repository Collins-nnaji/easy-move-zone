-- Marketplace pivot: fleet operators, expanded vehicle/cargo types, ratings, commission

-- Expand vehicle type constraints
alter table driver_profiles drop constraint if exists driver_profiles_vehicle_type_check;
alter table driver_profiles add constraint driver_profiles_vehicle_type_check
  check (vehicle_type in (
    'sprinter', 'cargo-van', 'box-truck', 'flatbed', 'semi',
    'tanker', 'refrigerated', 'dump-truck', 'client-fleet'
  ));

alter table driver_shifts drop constraint if exists driver_shifts_vehicle_type_check;
alter table driver_shifts add constraint driver_shifts_vehicle_type_check
  check (vehicle_type in (
    'sprinter', 'cargo-van', 'box-truck', 'flatbed', 'semi',
    'tanker', 'refrigerated', 'dump-truck', 'client-fleet'
  ));

-- Driver / truck-owner marketplace profile fields
alter table driver_profiles add column if not exists display_name text;
alter table driver_profiles add column if not exists owner_type text not null default 'driver'
  check (owner_type in ('driver', 'owner'));
alter table driver_profiles add column if not exists rate_hint_cents integer;
alter table driver_profiles add column if not exists rating_avg numeric(3, 2) not null default 0;
alter table driver_profiles add column if not exists rating_count integer not null default 0;
alter table driver_profiles add column if not exists bio text;

-- Fleet operator profiles
create table if not exists fleet_operator_profiles (
  auth_user_id text primary key,
  company_name text not null default 'My Fleet',
  contact_name text,
  zone text not null default 'Lagos Mainland',
  onboarding_completed boolean not null default false,
  rating_avg numeric(3, 2) not null default 0,
  rating_count integer not null default 0,
  commission_bps integer not null default 800 check (commission_bps >= 0 and commission_bps <= 2500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Shift marketplace fields
alter table driver_shifts add column if not exists cargo_category text not null default 'general-freight'
  check (cargo_category in (
    'parcel', 'heavy-goods', 'tanker', 'refrigerated',
    'construction', 'hazmat', 'general-freight'
  ));
alter table driver_shifts add column if not exists commission_bps integer not null default 800
  check (commission_bps >= 0 and commission_bps <= 2500);
alter table driver_shifts add column if not exists title text;

create index if not exists idx_driver_shifts_posted_by on driver_shifts(posted_by) where posted_by is not null;
create index if not exists idx_driver_shifts_cargo on driver_shifts(cargo_category, status);

-- Bilateral ratings after completed shifts
create table if not exists marketplace_ratings (
  id uuid primary key default gen_random_uuid(),
  shift_id uuid references driver_shifts(id) on delete set null,
  from_user_id text not null,
  to_user_id text not null,
  from_role text not null check (from_role in ('driver', 'fleet')),
  stars integer not null check (stars between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (shift_id, from_user_id)
);

create index if not exists idx_marketplace_ratings_to on marketplace_ratings(to_user_id, created_at desc);

-- Commission ledger for fleet operators
create table if not exists marketplace_commissions (
  id uuid primary key default gen_random_uuid(),
  shift_id uuid not null references driver_shifts(id) on delete cascade,
  fleet_user_id text not null,
  driver_user_id text not null,
  gross_cents integer not null check (gross_cents > 0),
  commission_cents integer not null check (commission_cents >= 0),
  driver_net_cents integer not null check (driver_net_cents >= 0),
  created_at timestamptz not null default now(),
  unique (shift_id)
);

create index if not exists idx_marketplace_commissions_fleet on marketplace_commissions(fleet_user_id, created_at desc);

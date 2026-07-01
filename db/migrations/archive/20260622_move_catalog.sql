create extension if not exists pgcrypto;

-- Move app catalog: destinations and bookable inventory (trips, stays, visa tiers).
create table if not exists move_destinations (
  id text primary key,
  city text not null,
  country text not null,
  region text not null,
  photo_label text not null default '',
  image_url text,
  match_scores jsonb not null default '{}',
  honest jsonb not null default '{}',
  stats jsonb not null default '{}',
  visa jsonb not null default '{}',
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_move_destinations_active_sort
  on move_destinations (active, sort_order);

create table if not exists move_trips (
  id text primary key,
  destination_id text not null references move_destinations(id) on delete cascade,
  provider text not null,
  route text not null,
  duration text not null,
  price text not null,
  sort_order integer not null default 0,
  active boolean not null default true
);

create index if not exists idx_move_trips_destination
  on move_trips (destination_id, sort_order);

create table if not exists move_stays (
  id text primary key,
  destination_id text not null references move_destinations(id) on delete cascade,
  name text not null,
  area text not null,
  price text not null,
  rating text not null,
  for_modes text[] not null default '{}',
  sort_order integer not null default 0,
  active boolean not null default true
);

create index if not exists idx_move_stays_destination
  on move_stays (destination_id, sort_order);

create table if not exists move_visa_services (
  id text primary key,
  mode text not null check (mode in ('trip', 'nomad', 'move')),
  title text not null,
  detail text not null,
  price text not null,
  sort_order integer not null default 0,
  active boolean not null default true
);

create index if not exists idx_move_visa_services_mode
  on move_visa_services (mode, sort_order);

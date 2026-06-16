create extension if not exists pgcrypto;

-- Bookings made inside the Move app: trips, stays and visa services.
-- Mirrors the relocation_* tables: one row per reservation, owned by an auth user.
create table if not exists move_bookings (
  id uuid primary key default gen_random_uuid(),
  auth_user_id text not null,
  booking_type text not null check (booking_type in ('trip', 'stay', 'visa')),
  destination_city text not null,
  destination_country text,
  item_title text not null,
  provider text,
  price_label text,
  start_date date,
  end_date date,
  guests integer not null default 1,
  status text not null default 'reserved' check (status in ('reserved', 'confirmed', 'cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_move_bookings_user on move_bookings(auth_user_id);
create index if not exists idx_move_bookings_type on move_bookings(booking_type);

create extension if not exists pgcrypto;

-- Service managers who get assigned to booked relocation services.
create table if not exists service_managers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  title text not null default 'Relocation Manager',
  specialties text[] not null default '{}',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- A booked relocation service, owned by a user and assigned to a manager.
create table if not exists service_bookings (
  id uuid primary key default gen_random_uuid(),
  auth_user_id text not null,
  service_key text not null,
  service_name text not null,
  goal text not null default 'relocate',
  destination text,
  name text not null,
  email text not null,
  phone text,
  notes text not null default '',
  status text not null default 'assigned' check (status in ('assigned', 'in_progress', 'completed', 'cancelled')),
  manager_id uuid references service_managers(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_service_bookings_user on service_bookings (auth_user_id, created_at desc);
create index if not exists idx_service_bookings_status on service_bookings (status, created_at desc);
create index if not exists idx_service_bookings_manager on service_bookings (manager_id);

-- Seed a small managers team (idempotent by email).
insert into service_managers (name, email, title, specialties, sort_order) values
  ('Amara Okafor', 'amara@easymovezone.com', 'Senior Relocation Manager', array['relocate','visa','work'], 0),
  ('Diego Reyes', 'diego@easymovezone.com', 'Study & Student Visa Lead', array['study','visa'], 1),
  ('Mei Lin', 'mei@easymovezone.com', 'Work & Settling-In Manager', array['work','relocate'], 2)
on conflict (email) do nothing;

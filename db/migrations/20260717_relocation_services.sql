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

-- No named managers are seeded — the team is reached at a single inbox
-- (hello@easymovezone.com, shown in-app). Add real managers here later if you
-- want per-person assignment from the admin dashboard.

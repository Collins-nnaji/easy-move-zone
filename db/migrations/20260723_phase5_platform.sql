-- Phase 5: notifications, GPS, tax contacts

alter table driver_profiles add column if not exists contact_phone text;
alter table fleet_operator_profiles add column if not exists contact_phone text;

alter table driver_shift_sessions add column if not exists clock_in_lat double precision;
alter table driver_shift_sessions add column if not exists clock_in_lng double precision;
alter table driver_shift_sessions add column if not exists last_lat double precision;
alter table driver_shift_sessions add column if not exists last_lng double precision;
alter table driver_shift_sessions add column if not exists last_location_at timestamptz;

create table if not exists driver_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  auth_user_id text not null,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (auth_user_id, endpoint)
);

create index if not exists idx_push_subs_user on driver_push_subscriptions(auth_user_id);

-- Phase 1: easy booking — offers, notifications, fleet contact email

alter table fleet_operator_profiles add column if not exists contact_email text;
alter table driver_profiles add column if not exists contact_email text;

create table if not exists marketplace_offers (
  id uuid primary key default gen_random_uuid(),
  shift_id uuid not null references driver_shifts(id) on delete cascade,
  fleet_user_id text not null,
  driver_user_id text not null,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined', 'cancelled', 'expired')),
  message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_marketplace_offers_pending_unique
  on marketplace_offers (shift_id, driver_user_id)
  where status = 'pending';

create index if not exists idx_marketplace_offers_driver
  on marketplace_offers (driver_user_id, status, created_at desc);

create index if not exists idx_marketplace_offers_fleet
  on marketplace_offers (fleet_user_id, status, created_at desc);

create table if not exists marketplace_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  kind text not null,
  title text not null,
  body text not null,
  link text,
  meta jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_marketplace_notifications_user
  on marketplace_notifications (user_id, created_at desc);

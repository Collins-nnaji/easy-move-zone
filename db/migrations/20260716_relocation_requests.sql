create extension if not exists pgcrypto;

-- Concierge requests: a user asks the agency to help with their move. Captured
-- here so operators can triage and manage them from the admin dashboard.
create table if not exists relocation_requests (
  id uuid primary key default gen_random_uuid(),
  auth_user_id text,
  name text not null,
  email text not null,
  phone text,
  goal text not null default 'relocate' check (goal in ('work', 'study', 'visa', 'relocate', 'other')),
  destination text,
  timeline text,
  message text not null default '',
  status text not null default 'new' check (status in ('new', 'in_review', 'contacted', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_relocation_requests_status
  on relocation_requests (status, created_at desc);

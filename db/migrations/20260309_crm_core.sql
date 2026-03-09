-- CRM core schema: prospects, clients, communication, activities, tasks.
-- Safe to run multiple times in Neon/Postgres.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'crm_lifecycle') then
    create type crm_lifecycle as enum ('new', 'qualified', 'proposal', 'won', 'lost', 'churned');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'crm_channel') then
    create type crm_channel as enum ('in_app', 'email', 'sms');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'crm_message_direction') then
    create type crm_message_direction as enum ('inbound', 'outbound', 'internal_note');
  end if;
end $$;

create table if not exists crm_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id text unique not null,
  full_name text not null,
  email text unique not null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists crm_roles (
  id uuid primary key default gen_random_uuid(),
  role_key text unique not null check (role_key in ('admin', 'sales_manager', 'sales_rep', 'client')),
  label text not null,
  created_at timestamptz not null default now()
);

create table if not exists crm_user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references crm_users(id) on delete cascade,
  role_id uuid not null references crm_roles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, role_id)
);

create table if not exists prospects (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  company_name text,
  email text not null,
  phone text,
  source text,
  lifecycle crm_lifecycle not null default 'new',
  score integer not null default 0 check (score >= 0 and score <= 100),
  owner_user_id uuid references crm_users(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_contacted_at timestamptz
);

create index if not exists idx_prospects_lifecycle on prospects(lifecycle);
create index if not exists idx_prospects_owner on prospects(owner_user_id);
create index if not exists idx_prospects_created_at on prospects(created_at desc);

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid unique references prospects(id) on delete set null,
  company_name text not null,
  primary_contact_name text not null,
  primary_contact_email text not null,
  primary_contact_phone text,
  lifecycle crm_lifecycle not null default 'won',
  owner_user_id uuid references crm_users(id) on delete set null,
  arr_usd integer not null default 0 check (arr_usd >= 0),
  renewal_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_contacted_at timestamptz
);

create index if not exists idx_clients_owner on clients(owner_user_id);
create index if not exists idx_clients_lifecycle on clients(lifecycle);
create index if not exists idx_clients_renewal_date on clients(renewal_date);

create table if not exists communication_threads (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  channel crm_channel not null default 'in_app',
  prospect_id uuid references prospects(id) on delete cascade,
  client_id uuid references clients(id) on delete cascade,
  status text not null default 'open' check (status in ('open', 'closed', 'archived')),
  created_by_user_id uuid references crm_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_message_at timestamptz,
  check (
    (prospect_id is not null and client_id is null)
    or (prospect_id is null and client_id is not null)
  )
);

create index if not exists idx_threads_channel on communication_threads(channel);
create index if not exists idx_threads_prospect on communication_threads(prospect_id);
create index if not exists idx_threads_client on communication_threads(client_id);
create index if not exists idx_threads_last_message_at on communication_threads(last_message_at desc nulls last);

create table if not exists communication_participants (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references communication_threads(id) on delete cascade,
  user_id uuid references crm_users(id) on delete cascade,
  external_name text,
  external_email text,
  external_phone text,
  role text not null check (role in ('internal', 'prospect', 'client')),
  created_at timestamptz not null default now(),
  check (
    (role = 'internal' and user_id is not null)
    or (role <> 'internal' and user_id is null)
  )
);

create unique index if not exists idx_participants_unique_internal
  on communication_participants(thread_id, user_id)
  where user_id is not null;

create table if not exists communication_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references communication_threads(id) on delete cascade,
  sender_participant_id uuid references communication_participants(id) on delete set null,
  direction crm_message_direction not null,
  body text not null,
  metadata jsonb not null default '{}'::jsonb,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_thread_created_at on communication_messages(thread_id, created_at desc);
create index if not exists idx_messages_unread on communication_messages(is_read) where is_read = false;

create table if not exists email_deliveries (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null unique references communication_messages(id) on delete cascade,
  provider text not null default 'resend',
  provider_message_id text,
  send_status text not null default 'queued' check (send_status in ('queued', 'sent', 'failed')),
  failure_reason text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists sms_deliveries (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null unique references communication_messages(id) on delete cascade,
  provider text not null default 'twilio',
  provider_message_id text,
  send_status text not null default 'queued' check (send_status in ('queued', 'sent', 'failed')),
  failure_reason text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references crm_users(id) on delete set null,
  prospect_id uuid references prospects(id) on delete cascade,
  client_id uuid references clients(id) on delete cascade,
  title text not null,
  description text,
  activity_type text not null check (activity_type in ('call', 'email', 'meeting', 'note', 'status_change')),
  happened_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  check (
    (prospect_id is not null and client_id is null)
    or (prospect_id is null and client_id is not null)
  )
);

create index if not exists idx_activities_happened_at on activities(happened_at desc);
create index if not exists idx_activities_prospect on activities(prospect_id);
create index if not exists idx_activities_client on activities(client_id);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  assignee_user_id uuid references crm_users(id) on delete set null,
  prospect_id uuid references prospects(id) on delete cascade,
  client_id uuid references clients(id) on delete cascade,
  title text not null,
  description text,
  due_at timestamptz,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (prospect_id is not null and client_id is null)
    or (prospect_id is null and client_id is not null)
  )
);

create index if not exists idx_tasks_due_at on tasks(due_at);
create index if not exists idx_tasks_status on tasks(status);
create index if not exists idx_tasks_assignee on tasks(assignee_user_id);

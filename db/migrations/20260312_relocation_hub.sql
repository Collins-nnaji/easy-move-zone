create extension if not exists pgcrypto;

create table if not exists relocation_plans (
  id uuid primary key default gen_random_uuid(),
  auth_user_id text not null unique,
  plan_name text not null default 'My relocation plan',
  origin_city text,
  origin_country text,
  destination_city text,
  destination_country text,
  move_date date,
  move_reason text,
  household_size integer not null default 1,
  work_mode text not null default 'hybrid' check (work_mode in ('onsite', 'hybrid', 'remote', 'business_owner', 'student')),
  visa_pathway text,
  status text not null default 'planning' check (status in ('planning', 'in_progress', 'ready_to_move', 'settled')),
  budget_housing_usd integer not null default 0,
  budget_travel_usd integer not null default 0,
  budget_setup_usd integer not null default 0,
  budget_buffer_usd integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists relocation_tasks (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references relocation_plans(id) on delete cascade,
  auth_user_id text not null,
  title text not null,
  category text not null check (category in ('visa', 'legal', 'finance', 'logistics', 'career', 'family', 'settling')),
  due_date date,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists relocation_contacts (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references relocation_plans(id) on delete cascade,
  auth_user_id text not null,
  name text not null,
  service_type text not null,
  email text,
  phone text,
  website text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_relocation_tasks_user_plan on relocation_tasks(auth_user_id, plan_id);
create index if not exists idx_relocation_tasks_status on relocation_tasks(status);
create index if not exists idx_relocation_contacts_user_plan on relocation_contacts(auth_user_id, plan_id);

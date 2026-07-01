-- Move-services (vendor) marketplace: providers + enquiries.
-- Idempotent: safe to run multiple times.

create extension if not exists pgcrypto;

create table if not exists vendors (
  id uuid primary key default gen_random_uuid(),
  auth_user_id text,
  business_name text not null,
  service_type text not null default 'removals'
    check (service_type in ('removals','packing','cleaning','handyman','international','storage','other')),
  city text,
  tagline text,
  description text,
  base_price numeric(12,2),
  price_label text,
  currency text not null default 'GBP',
  coverage_areas text[] not null default '{}',
  features text[] not null default '{}',
  experience_years integer not null default 0,
  rating numeric(3,2),
  contact_name text,
  contact_email text,
  contact_phone text,
  website text,
  logo_url text,
  images jsonb not null default '[]'::jsonb,
  status text not null default 'pending' check (status in ('pending','live','rejected')),
  reviewer_notes text,
  is_featured boolean not null default false,
  view_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists vendor_enquiries (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  message text not null,
  move_from text,
  move_to text,
  move_date date,
  status text not null default 'new' check (status in ('new','read','replied','closed')),
  created_at timestamptz not null default now()
);

create index if not exists idx_vendors_status on vendors(status);
create index if not exists idx_vendors_service_type on vendors(service_type);
create index if not exists idx_vendors_owner on vendors(auth_user_id);
create index if not exists idx_vendor_enquiries_vendor on vendor_enquiries(vendor_id);
</content>

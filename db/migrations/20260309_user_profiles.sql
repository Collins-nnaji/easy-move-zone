create extension if not exists pgcrypto;

create table if not exists user_profiles (
  auth_user_id text primary key,
  role text not null default 'buyer' check (role in ('buyer', 'seller')),
  full_name text,
  phone text,
  preferred_contact_method text not null default 'email' check (preferred_contact_method in ('email', 'phone', 'whatsapp')),
  buyer_preferred_cities text[] not null default '{}',
  buyer_listing_types text[] not null default '{}',
  buyer_budget_min integer,
  buyer_budget_max integer,
  buyer_bedrooms_min integer,
  buyer_notes text,
  seller_company_name text,
  seller_license text,
  seller_service_cities text[] not null default '{}',
  seller_property_types text[] not null default '{}',
  seller_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_profiles_role on user_profiles(role);

create table if not exists user_saved_searches (
  id uuid primary key default gen_random_uuid(),
  auth_user_id text not null references user_profiles(auth_user_id) on delete cascade,
  name text not null,
  city_slug text,
  listing_type text check (listing_type in ('rent', 'buy', 'commercial')),
  budget_min integer,
  budget_max integer,
  bedrooms_min integer,
  created_at timestamptz not null default now()
);

create index if not exists idx_saved_searches_user_created_at on user_saved_searches(auth_user_id, created_at desc);

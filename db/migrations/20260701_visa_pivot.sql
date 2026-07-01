-- Visa pivot: replace the relocation/move data model with a visa-application
-- focused one (applications, checklist items, uploaded documents, requirement
-- templates, embassy directory).
--
-- NOTE: the DROP statements below remove the old relocation_* tables entirely.
-- If there is production data in relocation_plans/relocation_tasks/
-- relocation_contacts/relocation_country_guides worth preserving, migrate it
-- before running this file — this migration does not attempt to backfill it.

create extension if not exists pgcrypto;

-- 1. Visa applications (one row per tracked visa application; a user can have many)
create table if not exists visa_applications (
  id uuid primary key default gen_random_uuid(),
  auth_user_id text not null,
  label text not null default 'My visa application',
  applicant_nationality text not null,
  destination_country text not null,
  visa_type text not null,
  visa_type_label text,
  purpose_notes text,
  target_travel_date date,
  status text not null default 'researching'
    check (status in ('researching', 'gathering_documents', 'submitted', 'approved', 'rejected', 'expired')),
  passport_number_last4 text,
  passport_expiry_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_visa_applications_user on visa_applications(auth_user_id);
create index if not exists idx_visa_applications_status on visa_applications(status);

-- 2. Checklist items for an application
create table if not exists visa_checklist_items (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references visa_applications(id) on delete cascade,
  auth_user_id text not null,
  title text not null,
  description text,
  category text not null default 'documentation'
    check (category in ('documentation', 'application_form', 'appointment', 'fee_payment', 'biometrics', 'interview', 'follow_up')),
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done', 'not_applicable')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date date,
  is_ai_generated boolean not null default false,
  source_template_id uuid,
  linked_document_id uuid,
  sort_order integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_visa_checklist_user_app on visa_checklist_items(auth_user_id, application_id);
create index if not exists idx_visa_checklist_status on visa_checklist_items(status);

-- 3. Uploaded documents for an application
create table if not exists visa_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references visa_applications(id) on delete cascade,
  auth_user_id text not null,
  document_type text not null,
  label text not null,
  file_key text not null,
  file_url text not null,
  mime_type text not null,
  file_size_bytes integer not null default 0,
  status text not null default 'uploaded'
    check (status in ('uploaded', 'verified', 'rejected', 'expired', 'needs_replacement')),
  expiry_date date,
  admin_review_notes text,
  uploaded_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_visa_documents_user_app on visa_documents(auth_user_id, application_id);
create index if not exists idx_visa_documents_expiry on visa_documents(expiry_date) where expiry_date is not null;

alter table visa_checklist_items
  drop constraint if exists fk_checklist_linked_document;
alter table visa_checklist_items
  add constraint fk_checklist_linked_document
  foreign key (linked_document_id) references visa_documents(id) on delete set null;

-- 4. Requirement templates: curated or AI-generated, keyed by nationality x
-- destination x visa type. 'ANY' nationality is a wildcard fallback row.
create table if not exists visa_requirement_templates (
  id uuid primary key default gen_random_uuid(),
  nationality text not null,
  destination_country text not null,
  visa_type text not null,
  visa_type_label text not null,
  summary text not null,
  required_documents jsonb not null default '[]'::jsonb,
  checklist_template jsonb not null default '[]'::jsonb,
  processing_time_estimate text,
  fee_estimate text,
  validity_notes text,
  source text not null default 'curated' check (source in ('curated', 'ai_generated', 'admin_edited')),
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (nationality, destination_country, visa_type)
);
create index if not exists idx_visa_templates_lookup on visa_requirement_templates(nationality, destination_country, visa_type);

-- 5. Embassy / consulate directory (admin-curated only, never AI-generated)
create table if not exists embassies (
  id uuid primary key default gen_random_uuid(),
  country text not null,
  located_in_country text not null,
  mission_type text not null default 'embassy'
    check (mission_type in ('embassy', 'consulate', 'consulate_general', 'visa_application_center', 'trade_office')),
  city text not null,
  address text,
  phone text,
  email text,
  website text,
  appointment_booking_url text,
  latitude double precision,
  longitude double precision,
  jurisdiction_notes text,
  operating_hours text,
  services jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_embassies_lookup on embassies(country, located_in_country);
create index if not exists idx_embassies_city on embassies(city);

-- 6. Drop the superseded relocation/move tables (destination matching, bookings,
-- work/study listings — all part of the removed "travel platform" scope).
drop table if exists relocation_tasks cascade;
drop table if exists relocation_contacts cascade;
drop table if exists relocation_plans cascade;
drop table if exists relocation_country_guides cascade;
drop table if exists move_bookings cascade;
drop table if exists move_schools cascade;
drop table if exists move_jobs cascade;
drop table if exists move_visa_services cascade;
drop table if exists move_stays cascade;
drop table if exists move_trips cascade;
drop table if exists move_destinations cascade;

-- 7. Trim move-specific fields off user_profiles; keep nationality (used for
-- visa lookups going forward).
alter table user_profiles
  drop column if exists move_preferred_destinations,
  drop column if exists move_work_mode,
  drop column if exists move_stay_preference,
  drop column if exists move_notes;

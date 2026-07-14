-- ============================================================
-- Consolidated setup for the move/relocation app database.
-- Generated from the files scripts/run-move-setup.mjs runs, in order.
-- Safe to re-run (idempotent: create table if not exists / on conflict).
-- Paste this whole file into the Neon SQL Editor and run it once.
-- ============================================================

-- ---- db/add-contact-submissions.sql ----
-- Run once on existing databases (already included in property-platform-schema.sql for fresh installs)
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  page_context TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_created ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);

-- ---- db/migrations/20260309_user_profiles.sql ----
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

-- ---- db/migrations/20260310_agent_flag_and_admin.sql ----
-- Migration: agent flag on user_profiles + admin_users table
-- Date: 2026-03-10

-- Add is_agent flag to user_profiles
-- Sellers can self-declare as licensed agents during registration
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS is_agent BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS agent_license TEXT,
  ADD COLUMN IF NOT EXISTS agent_company TEXT,
  ADD COLUMN IF NOT EXISTS agent_bio TEXT,
  ADD COLUMN IF NOT EXISTS agent_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- Admin users table — only emails in this table can access /admin
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed the admin email
INSERT INTO admin_users (email) VALUES ('collinsnnaji1@gmail.com')
  ON CONFLICT (email) DO NOTHING;

-- ---- db/migrations/20260312_relocation_hub.sql ----
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

-- ---- db/migrations/20260312_relocation_guides.sql ----
create extension if not exists pgcrypto;

create table if not exists relocation_country_guides (
  id uuid primary key default gen_random_uuid(),
  country text not null unique,
  visa_summary text not null,
  required_documents text[] not null default '{}',
  pre_move_steps text[] not null default '{}',
  first_week_steps text[] not null default '{}',
  healthcare_tip text not null default '',
  banking_tip text not null default '',
  schooling_tip text not null default '',
  estimated_setup_days integer not null default 14,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into relocation_country_guides (
  country,
  visa_summary,
  required_documents,
  pre_move_steps,
  first_week_steps,
  healthcare_tip,
  banking_tip,
  schooling_tip,
  estimated_setup_days
) values
(
  'Nigeria',
  'Most professionals and business visitors need a visa before entry. Validate the latest visa class based on employment or business status.',
  array['Passport (6+ months validity)', 'Visa application confirmation', 'Accommodation proof', 'Travel insurance', 'Vaccination proof where required'],
  array['Confirm visa class with employer or legal advisor', 'Prepare document scans and originals', 'Set 3-month cash-flow budget', 'Book first 2-4 weeks temporary stay'],
  array['Register local SIM and internet', 'Open local banking profile if eligible', 'Confirm transport routes and safety zones', 'Complete tenancy verification checks'],
  'Set up a primary care provider in your first week and keep digital copies of prescriptions.',
  'Use a local + international account pairing to reduce transfer friction in month one.',
  'Shortlist schools before arrival and verify commute safety in both peak and off-peak hours.',
  18
),
(
  'Kenya',
  'For work transitions, secure permit sponsorship and verify current eCitizen process updates before travel.',
  array['Passport (6+ months validity)', 'Permit/visa application records', 'Employment or business documents', 'Proof of funds', 'Return or onward travel details'],
  array['Check permit class and sponsorship status', 'Align temporary housing with workplace access', 'Pre-book airport transfer and first-week logistics', 'Prepare school and healthcare shortlists'],
  array['Activate MPESA-compatible line', 'Settle local transport and neighborhood orientation', 'Complete in-person document verifications as needed', 'Start local financial setup'],
  'Prioritize facilities with emergency response access close to your first neighborhood choice.',
  'Enable mobile money immediately and keep card + mobile payment fallback options.',
  'For families, verify school admission timelines before confirming long-term lease plans.',
  16
),
(
  'Ghana',
  'Check entry and residence pathways early; business and long-stay planning benefits from pre-travel legal review.',
  array['Passport (6+ months validity)', 'Visa/residence paperwork', 'Local contact details', 'Accommodation confirmation', 'Emergency funding plan'],
  array['Validate residence requirements with latest consular guidance', 'Confirm move budget with currency buffer', 'Identify priority neighborhoods by commute and safety', 'Plan legal document notarization timeline'],
  array['Set up local telecom and internet', 'Complete landlord and tenancy validation', 'Establish daily transport routes', 'Begin local banking onboarding'],
  'Keep private healthcare options mapped in parallel with nearest public hospitals.',
  'Use staged transfers and maintain a short-term liquidity buffer in local currency.',
  'Evaluate school catchment and transport schedules before selecting final neighborhood.',
  14
),
(
  'South Africa',
  'Work and long-stay relocations require careful visa pathway matching and documentation quality controls.',
  array['Passport (6+ months validity)', 'Permit/visa approval docs', 'Police clearance as required', 'Proof of accommodation', 'Medical cover documents'],
  array['Confirm permit category and timeline risk', 'Build first-90-days budget in local currency', 'Pre-book compliant temporary accommodation', 'Create move-day legal checklist'],
  array['Register for local telecom and transport cards', 'Set up initial banking and payments', 'Validate neighborhood safety routines', 'Complete local document address verifications'],
  'Ensure your medical cover works from day one and map urgent care near your accommodation.',
  'Schedule bank onboarding early; proof-of-address requirements can delay setup.',
  'If relocating with children, secure school admission confirmation before long lease commitment.',
  21
)
on conflict (country) do update set
  visa_summary = excluded.visa_summary,
  required_documents = excluded.required_documents,
  pre_move_steps = excluded.pre_move_steps,
  first_week_steps = excluded.first_week_steps,
  healthcare_tip = excluded.healthcare_tip,
  banking_tip = excluded.banking_tip,
  schooling_tip = excluded.schooling_tip,
  estimated_setup_days = excluded.estimated_setup_days,
  updated_at = now();

-- ---- db/migrations/20260616_move_bookings.sql ----
create extension if not exists pgcrypto;

-- Bookings made inside the Move app: trips, stays and visa services.
-- Mirrors the relocation_* tables: one row per reservation, owned by an auth user.
create table if not exists move_bookings (
  id uuid primary key default gen_random_uuid(),
  auth_user_id text not null,
  booking_type text not null check (booking_type in ('trip', 'stay', 'visa')),
  destination_city text not null,
  destination_country text,
  item_title text not null,
  provider text,
  price_label text,
  start_date date,
  end_date date,
  guests integer not null default 1,
  status text not null default 'reserved' check (status in ('reserved', 'confirmed', 'cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_move_bookings_user on move_bookings(auth_user_id);
create index if not exists idx_move_bookings_type on move_bookings(booking_type);

-- ---- db/migrations/20260622_move_catalog.sql ----
create extension if not exists pgcrypto;

-- Move app catalog: destinations and bookable inventory (trips, stays, visa tiers).
create table if not exists move_destinations (
  id text primary key,
  city text not null,
  country text not null,
  region text not null,
  photo_label text not null default '',
  image_url text,
  match_scores jsonb not null default '{}',
  honest jsonb not null default '{}',
  stats jsonb not null default '{}',
  visa jsonb not null default '{}',
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_move_destinations_active_sort
  on move_destinations (active, sort_order);

create table if not exists move_trips (
  id text primary key,
  destination_id text not null references move_destinations(id) on delete cascade,
  provider text not null,
  route text not null,
  duration text not null,
  price text not null,
  sort_order integer not null default 0,
  active boolean not null default true
);

create index if not exists idx_move_trips_destination
  on move_trips (destination_id, sort_order);

create table if not exists move_stays (
  id text primary key,
  destination_id text not null references move_destinations(id) on delete cascade,
  name text not null,
  area text not null,
  price text not null,
  rating text not null,
  for_modes text[] not null default '{}',
  sort_order integer not null default 0,
  active boolean not null default true
);

create index if not exists idx_move_stays_destination
  on move_stays (destination_id, sort_order);

create table if not exists move_visa_services (
  id text primary key,
  mode text not null check (mode in ('trip', 'nomad', 'move')),
  title text not null,
  detail text not null,
  price text not null,
  sort_order integer not null default 0,
  active boolean not null default true
);

create index if not exists idx_move_visa_services_mode
  on move_visa_services (mode, sort_order);

-- ---- db/migrations/20260623_relocation_budget_monthly.sql ----
alter table relocation_plans
  add column if not exists budget_monthly_living_usd integer not null default 0;

-- ---- db/migrations/20260624_profile_move_fields.sql ----
-- Move-first profile fields (Day 4)
alter table user_profiles
  add column if not exists nationality text,
  add column if not exists move_preferred_destinations text[] not null default '{}',
  add column if not exists move_work_mode text,
  add column if not exists move_stay_preference text,
  add column if not exists move_notes text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'user_profiles_move_work_mode_check'
  ) then
    alter table user_profiles
      add constraint user_profiles_move_work_mode_check
      check (move_work_mode is null or move_work_mode in ('onsite', 'hybrid', 'remote', 'business_owner', 'student'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'user_profiles_move_stay_preference_check'
  ) then
    alter table user_profiles
      add constraint user_profiles_move_stay_preference_check
      check (move_stay_preference is null or move_stay_preference in ('trip', 'nomad', 'move'));
  end if;
end $$;

-- ---- db/migrations/20260625_settle_guide_enrichment.sql ----
-- Day 5: unify /settle and /move settle content in relocation_country_guides
alter table relocation_country_guides
  add column if not exists city_slug text,
  add column if not exists settle_cards jsonb not null default '[]'::jsonb,
  add column if not exists sim_tip text not null default '',
  add column if not exists neighborhoods_tip text not null default '',
  add column if not exists community_tip text not null default '',
  add column if not exists transport_tip text not null default '';

create unique index if not exists idx_relocation_guides_city_slug
  on relocation_country_guides (city_slug)
  where city_slug is not null;

-- Move catalog destinations (matches app/move/data.ts SETTLE keys)
update relocation_country_guides set
  city_slug = 'lisbon',
  settle_cards = '[
    {"tag":"Neighbourhoods","title":"Where to base yourself","body":"Príncipe Real for cafés, Alcântara for value, Estrela for families and green space."},
    {"tag":"Getting around","title":"Metro, trams & a Navegante card","body":"A monthly Navegante pass is €40 and covers metro, bus and tram across the city."},
    {"tag":"Connectivity","title":"SIM in 10 minutes","body":"Grab a MEO or Vodafone prepaid SIM at the airport — generous data, no contract."},
    {"tag":"Community","title":"Lisbon Digital Nomads","body":"14k-member group with weekly meetups, a housing channel and a newcomer onboarding thread."}
  ]'::jsonb,
  neighborhoods_tip = 'Príncipe Real for cafés, Alcântara for value, Estrela for families and green space.',
  transport_tip = 'A monthly Navegante pass is €40 and covers metro, bus and tram across the city.',
  sim_tip = 'Grab a MEO or Vodafone prepaid SIM at the airport — generous data, no contract.',
  community_tip = 'Lisbon Digital Nomads — 14k members with weekly meetups and a housing channel.',
  updated_at = now()
where country = 'Portugal';

update relocation_country_guides set
  city_slug = 'mexicocity',
  settle_cards = '[
    {"tag":"Neighbourhoods","title":"Where to base yourself","body":"Roma Norte & Condesa for walkability, Coyoacán for charm, Polanco for upscale calm."},
    {"tag":"Getting around","title":"Metro, Metrobús & apps","body":"A rechargeable Movilidad Integrada card works across metro and Metrobús; ride-hail is cheap."},
    {"tag":"Connectivity","title":"Telcel or AT&T SIM","body":"Cheap prepaid data everywhere; Telcel has the widest coverage outside the city too."},
    {"tag":"Community","title":"CDMX Expats & Nomads","body":"Active community with neighbourhood guides, Spanish-exchange nights and a trusted-services list."}
  ]'::jsonb,
  neighborhoods_tip = 'Roma Norte & Condesa for walkability, Coyoacán for charm, Polanco for upscale calm.',
  transport_tip = 'A rechargeable Movilidad Integrada card works across metro and Metrobús; ride-hail is cheap.',
  sim_tip = 'Telcel or AT&T prepaid SIMs — cheap data with widest coverage via Telcel outside the city.',
  community_tip = 'CDMX Expats & Nomads — neighbourhood guides, Spanish-exchange nights and trusted services.',
  updated_at = now()
where country = 'Mexico';

update relocation_country_guides set
  city_slug = 'bangkok',
  settle_cards = '[
    {"tag":"Neighbourhoods","title":"Where to base yourself","body":"Thonglor & Ekkamai for nomads, Ari for a local feel, Sathorn for business proximity."},
    {"tag":"Getting around","title":"Live near the BTS","body":"The Skytrain and MRT skip the traffic — a Rabbit card makes both seamless."},
    {"tag":"Connectivity","title":"AIS or TrueMove SIM","body":"Tourist SIMs with huge data allowances are sold right at the airport arrivals hall."},
    {"tag":"Community","title":"Bangkok Nomads & Expats","body":"One of Asia''s biggest scenes — condo tips, visa-run advice and daily coworking meetups."}
  ]'::jsonb,
  neighborhoods_tip = 'Thonglor & Ekkamai for nomads, Ari for a local feel, Sathorn for business proximity.',
  transport_tip = 'Live near the BTS — a Rabbit card covers Skytrain and MRT and skips the traffic.',
  sim_tip = 'AIS or TrueMove tourist SIMs with huge data allowances at the airport arrivals hall.',
  community_tip = 'Bangkok Nomads & Expats — condo tips, visa-run advice and daily coworking meetups.',
  updated_at = now()
where country = 'Thailand';

update relocation_country_guides set
  city_slug = 'tbilisi',
  settle_cards = '[
    {"tag":"Neighbourhoods","title":"Where to base yourself","body":"Vera & Sololaki for cafés and walkability, Vake for green calm, Old Town for character."},
    {"tag":"Getting around","title":"Metro, marshrutkas & Bolt","body":"The metro is cents per ride; Bolt rides across town rarely cost more than a few dollars."},
    {"tag":"Connectivity","title":"Magti or Silknet SIM","body":"Cheap, fast data with easy top-ups — sorted within minutes of landing."},
    {"tag":"Community","title":"Tbilisi Nomads","body":"Tight-knit and welcoming, with flat listings, language tips and weekend trip groups."}
  ]'::jsonb,
  neighborhoods_tip = 'Vera & Sololaki for cafés and walkability, Vake for green calm, Old Town for character.',
  transport_tip = 'Metro is cents per ride; Bolt rides across town rarely cost more than a few dollars.',
  sim_tip = 'Magti or Silknet SIM — cheap, fast data with easy top-ups within minutes of landing.',
  community_tip = 'Tbilisi Nomads — flat listings, language tips and weekend trip groups.',
  updated_at = now()
where country = 'Georgia';

-- ---- db/seeds/20260615_relocation_and_dashboard_seed.sql ----
-- Relocation country guides (matching /move destinations + popular corridors)
-- and buyer-dashboard demo rows for the admin account.
-- Run after: 20260312_relocation_guides.sql, property-platform-schema.sql,
--            and 20260615_property_marketplace_seed.sql.

-- ── Country guides ──
insert into relocation_country_guides (
  country, visa_summary, required_documents, pre_move_steps, first_week_steps,
  healthcare_tip, banking_tip, schooling_tip, estimated_setup_days
) values
(
  'Portugal',
  'Stays over 90 days typically use the D7 (passive income) or D8 (digital nomad) routes; both lead to residency and eventually PR after five years.',
  array['Passport (6+ months validity)','Proof of income or remote contract','NIF (tax number)','Portuguese bank account','Accommodation proof','Criminal record certificate'],
  array['Apply for your NIF (in person or via a representative)','Open a Portuguese bank account','Gather D7/D8 income evidence (~€3,280/mo for D8)','Book a consulate visa appointment','Line up 3+ months of accommodation'],
  array['Register at the local junta de freguesia','Activate a MEO/Vodafone SIM','Attend your AIMA residency appointment','Set up utilities and transport passes'],
  'Register for an SNS number for public healthcare and pair it with private insurance for faster specialist access.',
  'Open a local account early — your NIF and proof of address unlock most services and rentals.',
  'International schools in Lisbon and Cascais fill fast; apply before you arrive and verify commute times.',
  21
),
(
  'Mexico',
  'A generous tourist entry (up to 180 days) covers short stints; the Temporary Resident Visa (applied at a consulate) suits longer moves and leads to permanent residency.',
  array['Passport (6+ months validity)','Proof of income or savings','Consulate appointment confirmation','Accommodation proof','Passport photos'],
  array['Decide between tourist entry and a Temporary Resident Visa','Book a consulate appointment in your home country','Show income (~US$2,600/mo) or savings evidence','Budget for altitude acclimatisation in CDMX'],
  array['Exchange your visa for a residency card at INM within 30 days','Get a Telcel or AT&T SIM','Open a local bank account once you have residency','Learn the metro and Metrobús routes'],
  'Excellent private hospitals in CDMX — carry insurance with direct-billing and keep prescriptions digital.',
  'Card and mobile payments are widely accepted; keep some cash for markets and smaller neighbourhoods.',
  'Bilingual schools cluster in Roma, Condesa and Polanco; confirm admission timelines before signing a lease.',
  14
),
(
  'Thailand',
  'Short visits use visa-exempt entry (30–60 days); the Destination Thailand Visa (DTV) gives remote workers 180 days per entry over five years, and the LTR suits long-term movers.',
  array['Passport (6+ months validity)','Proof of remote income or employment','Bank statements','Accommodation booking','Health insurance'],
  array['Pick the right visa (exempt, DTV or LTR)','Prepare income and savings evidence','Pre-book your first 2–4 weeks of stay','Plan around the Feb–Apr burning season for air quality'],
  array['Buy an AIS or TrueMove SIM at the airport','Set up a condo and a coworking membership','Open a bank account where your visa allows','Get a Rabbit card for the BTS Skytrain'],
  'Bangkok has world-class private hospitals; an international insurance policy keeps costs predictable.',
  'Opening a bank account can require a long-stay visa or a work permit — confirm before relying on it.',
  'International schools are plentiful but premium; shortlist by BTS access to keep commutes short.',
  16
),
(
  'Georgia',
  'Around 95 nationalities enter visa-free for a full year; the "Remotely from Georgia" programme and standard residence permits cover longer stays.',
  array['Passport (6+ months validity)','Proof of funds or remote income','Accommodation proof','Health insurance'],
  array['Confirm your visa-free duration (often 365 days)','Prepare remote-income evidence for the programme','Book initial accommodation in Tbilisi','Budget for grey winters and quieter pace'],
  array['Get a Magti or Silknet SIM','Open a Georgian bank account (often same-day)','Register your address if staying long-term','Learn the metro and Bolt for getting around'],
  'Affordable private clinics are widely available; keep travel/health insurance for major procedures.',
  'Banking is fast and foreigner-friendly — many open an account within a day of arrival.',
  'A handful of international schools in Tbilisi; visit in person as places and quality vary.',
  12
),
(
  'United Kingdom',
  'Most relocations need a sponsored route (Skilled Worker), the Global Talent visa, or a family/ancestry route — secure sponsorship and a CoS before travelling.',
  array['Passport (6+ months validity)','Certificate of Sponsorship (if applicable)','Proof of funds','TB test certificate (some countries)','Biometric appointment confirmation'],
  array['Confirm your visa route and sponsorship','Pay the Immigration Health Surcharge','Book a biometrics (VFS) appointment','Arrange first-month accommodation near transit'],
  array['Register with a local GP','Set up a UK bank account and prove address','Get a National Insurance number','Top up an Oyster/contactless travel card'],
  'Register with an NHS GP in week one; keep a private policy if you need fast specialist access.',
  'Some banks let you open an account pre-arrival; otherwise bring proof of address to speed setup.',
  'State school places depend on catchment; apply early and check Ofsted ratings and commute.',
  20
),
(
  'Canada',
  'Express Entry (skilled workers), a Provincial Nominee Program, or a study/work permit are the common routes; processing times vary by stream.',
  array['Passport (6+ months validity)','Proof of funds','Educational Credential Assessment (if applicable)','Language test results (IELTS/CELPIP)','Job offer or PNP nomination (if applicable)'],
  array['Pick your immigration stream and check timelines','Complete language tests and ECA early','Show settlement funds','Plan for the climate and first-winter costs'],
  array['Apply for a SIN (Social Insurance Number)','Open a newcomer bank account','Register for provincial health cover','Get a transit pass and a local phone plan'],
  'Provincial health cover can have a waiting period — hold private insurance for the first three months.',
  'Newcomer banking packages waive fees for the first year; bring your landing documents to open one.',
  'Public schools are strong and free; register with your district using proof of address and immunisations.',
  21
),
(
  'United Arab Emirates',
  'Most movers use an employer-sponsored work visa or the self-sponsored options (Golden Visa, freelance/remote-work permits via a free zone).',
  array['Passport (6+ months validity)','Attested degree certificate','Employment contract or free-zone licence','Emirates ID application','Medical fitness test'],
  array['Confirm sponsorship or a free-zone permit','Get key documents attested in your home country','Budget for upfront rent (often paid in cheques)','Arrange temporary accommodation'],
  array['Complete the medical fitness test and Emirates ID biometrics','Open a local bank account once your visa is stamped','Get a du or Etisalat SIM','Set up DEWA utilities and a Nol transport card'],
  'Employer health insurance is mandatory; confirm your plan''s network and dependant coverage.',
  'A residence visa and Emirates ID are usually needed before opening a bank account — plan timing.',
  'International schools are the norm and competitive; secure offers before committing to an area.',
  18
)
on conflict (country) do update set
  visa_summary = excluded.visa_summary,
  required_documents = excluded.required_documents,
  pre_move_steps = excluded.pre_move_steps,
  first_week_steps = excluded.first_week_steps,
  healthcare_tip = excluded.healthcare_tip,
  banking_tip = excluded.banking_tip,
  schooling_tip = excluded.schooling_tip,
  estimated_setup_days = excluded.estimated_setup_days,
  updated_at = now();

-- ── Buyer dashboard demo rows for the admin user ──
-- Resolved by email from the Neon Auth sync table so no auth id is hardcoded.
-- No-ops cleanly if the auth table or user is absent.
do $$
declare
  v_uid text;
begin
  if to_regclass('neon_auth.users_sync') is null then
    return;
  end if;

  select id into v_uid
  from neon_auth.users_sync
  where lower(email) = lower('collinsnnaji1@gmail.com')
  limit 1;

  if v_uid is null then
    return;
  end if;

  if to_regclass('public.saved_properties') is null then
    return;
  end if;

  insert into saved_properties (user_id, property_id) values
    (v_uid, 'a1000000-0000-4000-8000-000000000001'),
    (v_uid, 'a1000000-0000-4000-8000-000000000004'),
    (v_uid, 'a1000000-0000-4000-8000-000000000010')
  on conflict (user_id, property_id) do nothing;

  insert into enquiries (id, property_id, user_id, agent_id, message, status) values
    ('f2000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000004', v_uid, 'agent-emz-001','Is the rent-to-own plan still available? I''d like to view this week.','replied'),
    ('f2000000-0000-4000-8000-000000000002','a1000000-0000-4000-8000-000000000010', v_uid, 'agent-emz-002','Can this Wuse 2 flat be financed through NHF?','new')
  on conflict (id) do nothing;

  insert into transactions (id, property_id, buyer_id, agent_id, status, agreed_amount_ngn, notes) values
    ('f3000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000001', v_uid, 'agent-emz-001','in-progress', 185000000, 'Offer accepted; awaiting payment milestone.'),
    ('f3000000-0000-4000-8000-000000000002','a1000000-0000-4000-8000-000000000003', v_uid, 'agent-emz-001','completed', 42000000, 'Land purchase completed and documented.')
  on conflict (id) do nothing;
end $$;
</content>

-- ---- db/migrations/20260627_settle_guide_more_destinations.sql ----
-- Base country guides + settle cards for the 8 new /move destinations
-- (matches app/move/data.ts DESTINATIONS/SETTLE additions).
-- South Africa, Canada & United Arab Emirates already have base rows
-- (20260312_relocation_guides.sql, 20260615_relocation_and_dashboard_seed.sql)
-- so only Germany, Argentina, Japan and Australia need a fresh insert here.
-- Singapore has no prior base row either and is added below.

insert into relocation_country_guides (
  country, visa_summary, required_documents, pre_move_steps, first_week_steps,
  healthcare_tip, banking_tip, schooling_tip, estimated_setup_days
) values
(
  'Germany',
  'Schengen visa-free entry covers short stays; longer stints typically use a freelance (Freiberufler) visa or an EU Blue Card, both leading to permanent residency after five years.',
  array['Passport (6+ months validity)','Anmeldung (address registration)','Proof of health insurance','Proof of income or client contracts','Blocked account or proof of funds'],
  array['Confirm your visa route (freelance, Blue Card or family)','Book health insurance before you apply','Translate and notarise key documents','Budget for a deposit-heavy rental market'],
  array['Complete your Anmeldung at the Bürgeramt','Apply for a tax ID (Steuer-ID)','Open a German bank account','Get a Telekom or O2 SIM'],
  'Public (Gesetzlich) or private (Privat) insurance is mandatory — confirm which route your visa requires before arrival.',
  'Most banks need your Anmeldung first; a few neobanks let you open an account before you have an address.',
  'International schools are competitive in Berlin and Munich; state schools are strong and free once registered.',
  18
),
(
  'Argentina',
  'Most visitors enter visa-free for tourism; the Digital Nomad Visa or a Rentista residency route suit longer stays and lead toward permanent residency.',
  array['Passport (6+ months validity)','Proof of foreign income or savings','Accommodation proof','Health insurance','Criminal record certificate'],
  array['Decide between tourist entry, Digital Nomad Visa or Rentista residency','Gather proof of foreign income','Budget with a peso-inflation buffer','Pre-book your first month of accommodation'],
  array['Get a SUBE transit card','Buy a Personal or Movistar SIM','Open a peso bank account if eligible','Register with your visa category if applicable'],
  'Private health insurance is affordable and recommended; public hospitals are free but can be crowded.',
  'Inflation and currency controls make peso-dollar exchanges tricky — track the blue-dollar rate before transferring funds.',
  'Bilingual private schools cluster in Palermo, Belgrano and Recoleta; apply a term ahead where possible.',
  15
),
(
  'Japan',
  'Short stays are visa-free for most passports; longer stints use the Digital Nomad Visa, while work usually needs employer sponsorship for a specialist or engineer visa.',
  array['Passport (6+ months validity)','Certificate of Eligibility (for work visas)','Proof of income or remote-work contract','Health insurance','Residence card application (if applicable)'],
  array['Confirm visa-free entry length or apply for a Certificate of Eligibility','Arrange health insurance valid in Japan','Budget for higher upfront accommodation costs (key money, deposits)','Start learning basic Japanese for daily logistics'],
  array['Register your address at the local ward office','Get a residence card if staying long-term','Open a bank account (often needs a residence card first)','Get a Suica/Pasmo card and a local SIM'],
  'Enrol in National Health Insurance once you have a residence card — it covers most costs at a fraction of Western prices.',
  'Most banks require a residence card and a Japanese phone number; set these up before opening an account.',
  'International schools in Tokyo are excellent but have long waitlists — apply as early as possible.',
  20
),
(
  'Australia',
  'Short visits use an eVisitor or ETA; working holidaymakers use the WHV, and longer-term movers go through the points-tested skilled migration system.',
  array['Passport (6+ months validity)','eVisitor/ETA or visa grant notice','Proof of funds','Skills assessment (for skilled migration)','Health insurance'],
  array['Confirm your visa pathway (visitor, WHV or skilled migration)','Complete a skills assessment if applying for points-tested PR','Budget for a high cost of living, especially Sydney/Melbourne','Arrange health cover before you land'],
  array['Apply for a Tax File Number (TFN)','Open an Australian bank account','Get a local transit card for your city','Get a Telstra or Optus SIM'],
  'Medicare covers citizens/PR and some reciprocal-agreement countries; everyone else needs private health cover.',
  'Most major banks let you open an account online before you land using your passport and visa details.',
  'Public schools are strong and zoned by address; private and selective schools have competitive entry.',
  19
),
(
  'Singapore',
  'Most visitors enter visa-free for 90 days; working professionals need an employer-sponsored Employment Pass, and permanent residency is discretionary and highly selective.',
  array['Passport (6+ months validity)','Employment Pass approval (if working)','Proof of accommodation','Health insurance','Educational certificates (for Employment Pass)'],
  array['Confirm your visa route — most stays here are tourist entry or employer-sponsored','Secure an Employment Pass via your employer if working','Budget for one of the world''s highest costs of living','Shortlist condo areas before arrival — rentals move fast'],
  array['Collect your Employment Pass card if applicable','Open a bank account (DBS/OCBC/UOB) with your pass or passport','Get an EZ-Link card for transit','Get a Singtel or StarHub SIM'],
  'Healthcare is excellent but not free for most foreigners — keep private insurance with a wide hospital network.',
  'Banks are fast to onboard with an Employment Pass; tourists can also open some accounts with just a passport.',
  'International schools are plentiful but have high fees and long waitlists; apply well before relocating with kids.',
  16
)
on conflict (country) do update set
  visa_summary = excluded.visa_summary,
  required_documents = excluded.required_documents,
  pre_move_steps = excluded.pre_move_steps,
  first_week_steps = excluded.first_week_steps,
  healthcare_tip = excluded.healthcare_tip,
  banking_tip = excluded.banking_tip,
  schooling_tip = excluded.schooling_tip,
  estimated_setup_days = excluded.estimated_setup_days,
  updated_at = now();

-- ── Settle cards (matches app/move/data.ts SETTLE keys) ──

update relocation_country_guides set
  city_slug = 'berlin',
  settle_cards = '[
    {"tag":"Neighbourhoods","title":"Where to base yourself","body":"Prenzlauer Berg for families, Kreuzberg & Neukölln for nightlife and value, Charlottenburg for calm."},
    {"tag":"Getting around","title":"BVG monthly pass","body":"A monthly BVG ticket is €58 and covers U-Bahn, S-Bahn, trams and buses across the city."},
    {"tag":"Connectivity","title":"Telekom or O2 SIM","body":"Prepaid SIMs are widely available at kiosks and electronics stores, no contract needed."},
    {"tag":"Community","title":"Berlin Expats & Freelancers","body":"Regular meetups, Stammtisch nights and an active housing-tips channel for newcomers."}
  ]'::jsonb,
  neighborhoods_tip = 'Prenzlauer Berg for families, Kreuzberg & Neukölln for nightlife and value, Charlottenburg for calm.',
  transport_tip = 'A monthly BVG ticket is €58 and covers U-Bahn, S-Bahn, trams and buses across the city.',
  sim_tip = 'Telekom or O2 prepaid SIM, widely available at kiosks and electronics stores.',
  community_tip = 'Berlin Expats & Freelancers — regular meetups, Stammtisch nights and a housing-tips channel.',
  updated_at = now()
where country = 'Germany';

update relocation_country_guides set
  city_slug = 'buenosaires',
  settle_cards = '[
    {"tag":"Neighbourhoods","title":"Where to base yourself","body":"Palermo for nomads and nightlife, Recoleta for elegance, Belgrano for families and green space."},
    {"tag":"Getting around","title":"SUBE card","body":"One card covers subte, buses and trains — rides cost cents thanks to local subsidies."},
    {"tag":"Connectivity","title":"Personal or Movistar SIM","body":"Cheap prepaid data plans available at any kiosko, no paperwork required."},
    {"tag":"Community","title":"Buenos Aires Nomads & Expats","body":"Language exchanges, asado meetups and a trusted-services list for newcomers."}
  ]'::jsonb,
  neighborhoods_tip = 'Palermo for nomads and nightlife, Recoleta for elegance, Belgrano for families and green space.',
  transport_tip = 'A SUBE card covers subte, buses and trains — rides cost cents thanks to local subsidies.',
  sim_tip = 'Personal or Movistar SIM — cheap prepaid data plans available at any kiosko.',
  community_tip = 'Buenos Aires Nomads & Expats — language exchanges, asado meetups and a trusted-services list.',
  updated_at = now()
where country = 'Argentina';

update relocation_country_guides set
  city_slug = 'tokyo',
  settle_cards = '[
    {"tag":"Neighbourhoods","title":"Where to base yourself","body":"Shibuya & Shimokitazawa for energy, Kichijoji for families, Nakameguro for a quieter base."},
    {"tag":"Getting around","title":"Suica or Pasmo IC card","body":"Tap onto every train, subway and bus across the metro — no tickets needed."},
    {"tag":"Connectivity","title":"Pocket wifi or a Mobal SIM","body":"Easiest to order a rental pocket wifi or SIM online before you arrive."},
    {"tag":"Community","title":"Tokyo Foreign Residents & Nomads","body":"Language-exchange meetups and an active visa-questions thread."}
  ]'::jsonb,
  neighborhoods_tip = 'Shibuya & Shimokitazawa for energy, Kichijoji for families, Nakameguro for a quieter base.',
  transport_tip = 'A Suica or Pasmo IC card taps onto every train, subway and bus across the metro.',
  sim_tip = 'Rental pocket wifi or a Mobal/IIJmio SIM — easiest to order online before arrival.',
  community_tip = 'Tokyo Foreign Residents & Nomads — language-exchange meetups and a visa-questions thread.',
  updated_at = now()
where country = 'Japan';

update relocation_country_guides set
  city_slug = 'capetown',
  settle_cards = '[
    {"tag":"Neighbourhoods","title":"Where to base yourself","body":"Sea Point & Green Point for nomads, Constantia for families, Woodstock for an arty, central base."},
    {"tag":"Getting around","title":"MyCiTi & ride-hail apps","body":"MyCiTi bus rapid transit covers the city bowl; ride-hail apps are the norm beyond that."},
    {"tag":"Connectivity","title":"Vodacom or MTN SIM","body":"Strong fibre backup keeps you online through loadshedding power cuts."},
    {"tag":"Community","title":"Cape Town Digital Nomads","body":"Power-cut tips, area safety advice and a weekly co-working meetup."}
  ]'::jsonb,
  neighborhoods_tip = 'Sea Point & Green Point for nomads, Constantia for families, Woodstock for an arty, central base.',
  transport_tip = 'MyCiTi bus rapid transit covers the city bowl; ride-hail apps are the norm beyond that.',
  sim_tip = 'Vodacom or MTN SIM with strong fibre backup for loadshedding-proof connectivity.',
  community_tip = 'Cape Town Digital Nomads — power-cut tips, area safety advice and a weekly co-working meetup.',
  updated_at = now()
where country = 'South Africa';

update relocation_country_guides set
  city_slug = 'dubai',
  settle_cards = '[
    {"tag":"Neighbourhoods","title":"Where to base yourself","body":"Dubai Marina & JLT for nomads, Jumeirah for families, Downtown for business proximity."},
    {"tag":"Getting around","title":"Nol card","body":"One card covers the Metro, tram and buses — fast, clean and air-conditioned."},
    {"tag":"Connectivity","title":"Etisalat or du SIM","body":"Available at the airport with generous data bundles from day one."},
    {"tag":"Community","title":"Dubai Expats & Remote Workers","body":"Visa-run advice, networking events and an active housing channel."}
  ]'::jsonb,
  neighborhoods_tip = 'Dubai Marina & JLT for nomads, Jumeirah for families, Downtown for business proximity.',
  transport_tip = 'A Nol card covers the Metro, tram and buses — fast, clean and air-conditioned.',
  sim_tip = 'Etisalat or du SIM, available at the airport with generous data bundles.',
  community_tip = 'Dubai Expats & Remote Workers — visa-run advice, networking events and a housing channel.',
  updated_at = now()
where country = 'United Arab Emirates';

update relocation_country_guides set
  city_slug = 'toronto',
  settle_cards = '[
    {"tag":"Neighbourhoods","title":"Where to base yourself","body":"King West & The Annex for nomads, North York for families, Leslieville for a quieter, leafy base."},
    {"tag":"Getting around","title":"PRESTO card","body":"One card covers TTC subway, streetcars and buses across the city."},
    {"tag":"Connectivity","title":"Freedom Mobile or Rogers SIM","body":"Prepaid SIMs are widely available at any mall kiosk."},
    {"tag":"Community","title":"Toronto Newcomers & Nomads","body":"Settlement-service tips, networking meetups and a housing-search thread."}
  ]'::jsonb,
  neighborhoods_tip = 'King West & The Annex for nomads, North York for families, Leslieville for a quieter, leafy base.',
  transport_tip = 'A PRESTO card covers TTC subway, streetcars and buses across the city.',
  sim_tip = 'Freedom Mobile or Rogers prepaid SIM, widely available at any mall kiosk.',
  community_tip = 'Toronto Newcomers & Nomads — settlement-service tips, networking meetups and a housing-search thread.',
  updated_at = now()
where country = 'Canada';

update relocation_country_guides set
  city_slug = 'sydney',
  settle_cards = '[
    {"tag":"Neighbourhoods","title":"Where to base yourself","body":"Surry Hills & Newtown for nomads, North Shore for families, Bondi for a beach-first lifestyle."},
    {"tag":"Getting around","title":"Opal card","body":"One card covers trains, buses, ferries and light rail across greater Sydney."},
    {"tag":"Connectivity","title":"Telstra or Optus SIM","body":"Strong coverage even outside the city centre, easy to top up."},
    {"tag":"Community","title":"Sydney Backpackers & Nomads","body":"Working-holiday tips, share-house listings and weekend meetups."}
  ]'::jsonb,
  neighborhoods_tip = 'Surry Hills & Newtown for nomads, North Shore for families, Bondi for a beach-first lifestyle.',
  transport_tip = 'An Opal card covers trains, buses, ferries and light rail across greater Sydney.',
  sim_tip = 'Telstra or Optus prepaid SIM with strong coverage even outside the city centre.',
  community_tip = 'Sydney Backpackers & Nomads — working-holiday tips, share-house listings and weekend meetups.',
  updated_at = now()
where country = 'Australia';

update relocation_country_guides set
  city_slug = 'singapore',
  settle_cards = '[
    {"tag":"Neighbourhoods","title":"Where to base yourself","body":"Tiong Bahru & Kampong Glam for nomads, Bukit Timah for families, Orchard for central convenience."},
    {"tag":"Getting around","title":"EZ-Link card","body":"Taps onto the MRT, buses and most taxis — fast and air-conditioned throughout."},
    {"tag":"Connectivity","title":"Singtel or StarHub SIM","body":"Sold at the airport with generous high-speed data from arrival."},
    {"tag":"Community","title":"Singapore Expats & Nomads","body":"Visa-pass guidance, networking events and a condo-hunting channel."}
  ]'::jsonb,
  neighborhoods_tip = 'Tiong Bahru & Kampong Glam for nomads, Bukit Timah for families, Orchard for central convenience.',
  transport_tip = 'An EZ-Link card taps onto the MRT, buses and most taxis — fast and air-conditioned throughout.',
  sim_tip = 'Singtel or StarHub SIM, sold at the airport with generous high-speed data.',
  community_tip = 'Singapore Expats & Nomads — visa-pass guidance, networking events and a condo-hunting channel.',
  updated_at = now()
where country = 'Singapore';

-- ---- db/migrations/20260628_settle_guide_life_stage_cards.sql ----
-- Append age/life-stage settle cards (matches app/move/data.ts SETTLE additions)
-- for all 12 /move destinations. Full settle_cards replace per country since the
-- column is the authoritative array, not merged with the static fallback.

update relocation_country_guides set
  settle_cards = '[
    {"tag":"Neighbourhoods","title":"Where to base yourself","body":"Príncipe Real for cafés, Alcântara for value, Estrela for families and green space."},
    {"tag":"Getting around","title":"Metro, trams & a Navegante card","body":"A monthly Navegante pass is €40 and covers metro, bus and tram across the city."},
    {"tag":"Connectivity","title":"SIM in 10 minutes","body":"Grab a MEO or Vodafone prepaid SIM at the airport — generous data, no contract."},
    {"tag":"Community","title":"Lisbon Digital Nomads","body":"14k-member group with weekly meetups, a housing channel and a newcomer onboarding thread."},
    {"tag":"Families & minors","title":"Free public schooling once registered","body":"EU rules make enrolling kids in public school straightforward; non-EU dependents are added directly to your D7/D8 residency application."},
    {"tag":"Students (18–25)","title":"Student residence permit","body":"Enrol at a Portuguese university or language school, then apply for a renewable student residence permit each academic year."},
    {"tag":"Working age (26–54)","title":"D8 income threshold","body":"The freelance/remote route (D8) needs proof of roughly €3,280/month in foreign income — budget for slow notary and AIMA appointment queues."},
    {"tag":"Retirees (55+)","title":"D7 passive-income visa","body":"Built for pensions and passive income rather than salaries — show steady foreign income and a place to live, then renew yearly toward permanent residency."}
  ]'::jsonb,
  updated_at = now()
where country = 'Portugal';

update relocation_country_guides set
  settle_cards = '[
    {"tag":"Neighbourhoods","title":"Where to base yourself","body":"Roma Norte & Condesa for walkability, Coyoacán for charm, Polanco for upscale calm."},
    {"tag":"Getting around","title":"Metro, Metrobús & apps","body":"A rechargeable Movilidad Integrada card works across metro and Metrobús; ride-hail is cheap."},
    {"tag":"Connectivity","title":"Telcel or AT&T SIM","body":"Cheap prepaid data everywhere; Telcel has the widest coverage outside the city too."},
    {"tag":"Community","title":"CDMX Expats & Nomads","body":"Active community with neighbourhood guides, Spanish-exchange nights and a trusted-services list."},
    {"tag":"Families & minors","title":"Schools and paperwork","body":"Bilingual private schools are common in Roma, Condesa and Polanco; public enrolment needs a CURP, which dependents get once your residency is filed."},
    {"tag":"Students (18–25)","title":"Student visa via enrolment","body":"A consulate-issued student visa needs an acceptance letter from an accredited institution, then converts to a local resident card on arrival."},
    {"tag":"Working age (26–54)","title":"Temporary Resident Visa","body":"Apply at a Mexican consulate abroad with proof of income or savings — it generally can''t be converted from a tourist stay inside the country."},
    {"tag":"Retirees (55+)","title":"Comfortable on a fixed income","body":"A modest pension or savings balance comfortably clears the income threshold for temporary residency, renewing toward permanent status after 4 years."}
  ]'::jsonb,
  updated_at = now()
where country = 'Mexico';

update relocation_country_guides set
  settle_cards = '[
    {"tag":"Neighbourhoods","title":"Where to base yourself","body":"Thonglor & Ekkamai for nomads, Ari for a local feel, Sathorn for business proximity."},
    {"tag":"Getting around","title":"Live near the BTS","body":"The Skytrain and MRT skip the traffic — a Rabbit card makes both seamless."},
    {"tag":"Connectivity","title":"AIS or TrueMove SIM","body":"Tourist SIMs with huge data allowances are sold right at the airport arrivals hall."},
    {"tag":"Community","title":"Bangkok Nomads & Expats","body":"One of Asia''s biggest scenes — condo tips, visa-run advice and daily coworking meetups."},
    {"tag":"Families & minors","title":"International schools","body":"30+ international schools cover IB, British and American curricula; a Non-O extension for the family of a worker or retiree covers dependents."},
    {"tag":"Students (18–25)","title":"Education visa","body":"An ED visa ties to enrolment at an accredited school or language institute and is renewable each term."},
    {"tag":"Working age (26–54)","title":"DTV for remote workers","body":"The Destination Thailand Visa (DTV) is the easiest route if you freelance or work remotely — no employer sponsorship needed."},
    {"tag":"Retirees (55+)","title":"Retirement visa","body":"Available from age 50, with a fixed deposit in a Thai bank or proof of monthly income — renewable annually, with private health insurance required."}
  ]'::jsonb,
  updated_at = now()
where country = 'Thailand';

update relocation_country_guides set
  settle_cards = '[
    {"tag":"Neighbourhoods","title":"Where to base yourself","body":"Vera & Sololaki for cafés and walkability, Vake for green calm, Old Town for character."},
    {"tag":"Getting around","title":"Metro, marshrutkas & Bolt","body":"The metro is cents per ride; Bolt rides across town rarely cost more than a few dollars."},
    {"tag":"Connectivity","title":"Magti or Silknet SIM","body":"Cheap, fast data with easy top-ups — sorted within minutes of landing."},
    {"tag":"Community","title":"Tbilisi Nomads","body":"Tight-knit and welcoming, with flat listings, language tips and weekend trip groups."},
    {"tag":"Families & minors","title":"Schools are limited but improving","body":"Only a handful of international schools in the city — shortlist and apply early if you''re moving with kids."},
    {"tag":"Students (18–25)","title":"Study at a local university","body":"Tuition is low by international standards, and a student residence permit is straightforward to arrange through your university."},
    {"tag":"Working age (26–54)","title":"Remotely from Georgia","body":"The remote-work program needs only proof of foreign income and a clean record — one of the fastest approvals on this list."},
    {"tag":"Retirees (55+)","title":"Light-touch residency","body":"No dedicated retirement visa, but a residence permit via property ownership or passive income is simple and affordable to maintain."}
  ]'::jsonb,
  updated_at = now()
where country = 'Georgia';

update relocation_country_guides set
  settle_cards = '[
    {"tag":"Neighbourhoods","title":"Where to base yourself","body":"Prenzlauer Berg for families, Kreuzberg & Neukölln for nightlife and value, Charlottenburg for calm."},
    {"tag":"Getting around","title":"BVG monthly pass","body":"A monthly BVG ticket is €58 and covers U-Bahn, S-Bahn, trams and buses across the city."},
    {"tag":"Connectivity","title":"Telekom or O2 SIM","body":"Prepaid SIMs are widely available at kiosks and electronics stores, no contract needed."},
    {"tag":"Community","title":"Berlin Expats & Freelancers","body":"Regular meetups, Stammtisch nights and an active housing-tips channel for newcomers."},
    {"tag":"Families & minors","title":"Kindergeld & free schooling","body":"Registered residents with kids can claim Kindergeld (child benefit), and state schools are free — though German-language support varies by district."},
    {"tag":"Students (18–25)","title":"Student visa & blocked account","body":"Non-EU students need a university acceptance letter and a blocked account (roughly €11,900/year) to prove they can support themselves."},
    {"tag":"Working age (26–54)","title":"Freiberufler route","body":"The freelance visa needs client letters and a German tax number (Steuer-ID) — budget weeks, not days, for Bürgeramt appointments."},
    {"tag":"Retirees (55+)","title":"Health insurance is the gatekeeper","body":"Pension income alone doesn''t grant residency outside EU family ties — most retirees here use a separate income- and insurance-based permit."}
  ]'::jsonb,
  updated_at = now()
where country = 'Germany';

update relocation_country_guides set
  settle_cards = '[
    {"tag":"Neighbourhoods","title":"Where to base yourself","body":"Palermo for nomads and nightlife, Recoleta for elegance, Belgrano for families and green space."},
    {"tag":"Getting around","title":"SUBE card","body":"One card covers subte, buses and trains — rides cost cents thanks to local subsidies."},
    {"tag":"Connectivity","title":"Personal or Movistar SIM","body":"Cheap prepaid data plans available at any kiosko, no paperwork required."},
    {"tag":"Community","title":"Buenos Aires Nomads & Expats","body":"Language exchanges, asado meetups and a trusted-services list for newcomers."},
    {"tag":"Families & minors","title":"Bilingual schools cluster centrally","body":"Palermo, Recoleta and Belgrano have the strongest bilingual private school options; public schools are free but Spanish-only."},
    {"tag":"Students (18–25)","title":"Student visa via enrolment","body":"A university or accredited course acceptance letter supports a renewable student residency category."},
    {"tag":"Working age (26–54)","title":"Rentista or digital nomad route","body":"Show steady foreign income for the Rentista visa, or use the dedicated nomad visa if you''re fully remote — both renew toward permanent residency."},
    {"tag":"Retirees (55+)","title":"Pensionado residency","body":"A specific pensionado category exists for stable foreign pension income, with a comparatively fast approval process."}
  ]'::jsonb,
  updated_at = now()
where country = 'Argentina';

update relocation_country_guides set
  settle_cards = '[
    {"tag":"Neighbourhoods","title":"Where to base yourself","body":"Shibuya & Shimokitazawa for energy, Kichijoji for families, Nakameguro for a quieter base."},
    {"tag":"Getting around","title":"Suica or Pasmo IC card","body":"Tap onto every train, subway and bus across the metro — no tickets needed."},
    {"tag":"Connectivity","title":"Pocket wifi or a Mobal SIM","body":"Easiest to order a rental pocket wifi or SIM online before you arrive."},
    {"tag":"Community","title":"Tokyo Foreign Residents & Nomads","body":"Language-exchange meetups and an active visa-questions thread."},
    {"tag":"Families & minors","title":"Long waitlists, plan early","body":"International schools are excellent but oversubscribed — apply 6–12 months ahead; dependents join on a Dependent visa tied to your status."},
    {"tag":"Students (18–25)","title":"Student visa via a school","body":"Language schools and universities sponsor a Certificate of Eligibility, which converts into a student residence card on arrival."},
    {"tag":"Working age (26–54)","title":"Employer sponsorship is the norm","body":"Most working-age movers need a Certificate of Eligibility from a Japanese employer — the digital nomad visa is a 6-month alternative for the self-employed."},
    {"tag":"Retirees (55+)","title":"No dedicated retiree visa","body":"Japan has no long-stay retirement visa — most retirees here are on a spouse, dependent or long-term resident status instead."}
  ]'::jsonb,
  updated_at = now()
where country = 'Japan';

update relocation_country_guides set
  settle_cards = '[
    {"tag":"Neighbourhoods","title":"Where to base yourself","body":"Sea Point & Green Point for nomads, Constantia for families, Woodstock for an arty, central base."},
    {"tag":"Getting around","title":"MyCiTi & ride-hail apps","body":"MyCiTi bus rapid transit covers the city bowl; ride-hail apps are the norm beyond that."},
    {"tag":"Connectivity","title":"Vodacom or MTN SIM","body":"Strong fibre backup keeps you online through loadshedding power cuts."},
    {"tag":"Community","title":"Cape Town Digital Nomads","body":"Power-cut tips, area safety advice and a weekly co-working meetup."},
    {"tag":"Families & minors","title":"Strong but mixed-quality schools","body":"Private schools are excellent and good value by international standards; safety and area choice matter more than in most cities on this list."},
    {"tag":"Students (18–25)","title":"Study visa via a university","body":"A study visa needs an offer letter from an accredited institution plus proof of funds, renewed annually."},
    {"tag":"Working age (26–54)","title":"Remote Work Visa or critical skills","body":"The dedicated Remote Work Visa suits foreign-income earners; the critical skills list is the route for local employment."},
    {"tag":"Retirees (55+)","title":"Retired person visa","body":"A specific retired person visa exists for those with a guaranteed pension or passive income above a set threshold — no upper age limit."}
  ]'::jsonb,
  updated_at = now()
where country = 'South Africa';

update relocation_country_guides set
  settle_cards = '[
    {"tag":"Neighbourhoods","title":"Where to base yourself","body":"Dubai Marina & JLT for nomads, Jumeirah for families, Downtown for business proximity."},
    {"tag":"Getting around","title":"Nol card","body":"One card covers the Metro, tram and buses — fast, clean and air-conditioned."},
    {"tag":"Connectivity","title":"Etisalat or du SIM","body":"Available at the airport with generous data bundles from day one."},
    {"tag":"Community","title":"Dubai Expats & Remote Workers","body":"Visa-run advice, networking events and an active housing channel."},
    {"tag":"Families & minors","title":"Sponsor your dependents","body":"Once on a residence visa, you can sponsor a spouse and children — international school fees are a major budget line, with 40+ schools to choose from."},
    {"tag":"Students (18–25)","title":"Student visa via a university","body":"UAE universities sponsor a student residence visa for enrolled students, renewable each academic year."},
    {"tag":"Working age (26–54)","title":"Virtual Working Programme or employment visa","body":"Freelancers and remote employees use the Virtual Working Programme; most others need employer sponsorship for a standard employment visa."},
    {"tag":"Retirees (55+)","title":"Retirement visa from age 55","body":"A 5-year retirement visa is available from age 55 with proof of savings, income or property ownership in the UAE."}
  ]'::jsonb,
  updated_at = now()
where country = 'United Arab Emirates';

update relocation_country_guides set
  settle_cards = '[
    {"tag":"Neighbourhoods","title":"Where to base yourself","body":"King West & The Annex for nomads, North York for families, Leslieville for a quieter, leafy base."},
    {"tag":"Getting around","title":"PRESTO card","body":"One card covers TTC subway, streetcars and buses across the city."},
    {"tag":"Connectivity","title":"Freedom Mobile or Rogers SIM","body":"Prepaid SIMs are widely available at any mall kiosk."},
    {"tag":"Community","title":"Toronto Newcomers & Nomads","body":"Settlement-service tips, networking meetups and a housing-search thread."},
    {"tag":"Families & minors","title":"Strong public schools, no fees","body":"Public education is free and well-regarded; international schools are rare because the public system covers most needs."},
    {"tag":"Students (18–25)","title":"Study permit via a school","body":"A study permit needs acceptance at a designated learning institution and proof of funds — many graduates transition to a post-graduation work permit."},
    {"tag":"Working age (26–54)","title":"Express Entry favours this age band","body":"The points-based Express Entry system weights age heavily — applicants under 35 score highest, directly boosting PR chances."},
    {"tag":"Retirees (55+)","title":"No dedicated retirement stream","body":"Canada has no specific retiree visa; most retirees arrive via family sponsorship or a 6-month visitor stay, renewed periodically."}
  ]'::jsonb,
  updated_at = now()
where country = 'Canada';

update relocation_country_guides set
  settle_cards = '[
    {"tag":"Neighbourhoods","title":"Where to base yourself","body":"Surry Hills & Newtown for nomads, North Shore for families, Bondi for a beach-first lifestyle."},
    {"tag":"Getting around","title":"Opal card","body":"One card covers trains, buses, ferries and light rail across greater Sydney."},
    {"tag":"Connectivity","title":"Telstra or Optus SIM","body":"Strong coverage even outside the city centre, easy to top up."},
    {"tag":"Community","title":"Sydney Backpackers & Nomads","body":"Working-holiday tips, share-house listings and weekend meetups."},
    {"tag":"Families & minors","title":"Zoned public schools","body":"Public schools are zoned by home address and generally strong; private and selective schools have competitive entry exams."},
    {"tag":"Students (18–25)","title":"Student visa via enrolment","body":"A student visa needs confirmed enrolment at a registered institution and proof of funds — many stay on for post-study work rights."},
    {"tag":"Working age (26–54)","title":"Working Holiday or skilled migration","body":"Ages 18–35 (sometimes 30) can use the Working Holiday visa for up to 12 months; older or longer-term movers need the points-tested skilled migration route."},
    {"tag":"Retirees (55+)","title":"Limited long-stay options","body":"Australia has no retirement-specific visa for most nationalities — long stays beyond a visitor visa generally need a family or partner sponsorship route."}
  ]'::jsonb,
  updated_at = now()
where country = 'Australia';

update relocation_country_guides set
  settle_cards = '[
    {"tag":"Neighbourhoods","title":"Where to base yourself","body":"Tiong Bahru & Kampong Glam for nomads, Bukit Timah for families, Orchard for central convenience."},
    {"tag":"Getting around","title":"EZ-Link card","body":"Taps onto the MRT, buses and most taxis — fast and air-conditioned throughout."},
    {"tag":"Connectivity","title":"Singtel or StarHub SIM","body":"Sold at the airport with generous high-speed data from arrival."},
    {"tag":"Community","title":"Singapore Expats & Nomads","body":"Visa-pass guidance, networking events and a condo-hunting channel."},
    {"tag":"Families & minors","title":"Plan school applications early","body":"International schools are plentiful but have long waitlists and high fees — apply well before relocating with kids; dependents join on a Dependant''s Pass."},
    {"tag":"Students (18–25)","title":"Student Pass via enrolment","body":"A Student Pass needs acceptance at an approved institution, sponsored by the school once you''ve been issued an In-Principle Approval."},
    {"tag":"Working age (26–54)","title":"Employment Pass is the standard route","body":"Most working-age professionals need an employer-sponsored Employment Pass, assessed against a points-based framework (COMPASS)."},
    {"tag":"Retirees (55+)","title":"No retirement visa","body":"Singapore has no dedicated retirement visa — long-term stays for retirees are rare without a Dependant''s Pass tied to a working family member."}
  ]'::jsonb,
  updated_at = now()
where country = 'Singapore';

-- ---- db/migrations/20260629_move_work_study.sql ----
-- Work & Study: school admissions and visa-sponsoring job listings, per destination.
create table if not exists move_schools (
  id text primary key,
  destination_id text not null references move_destinations(id) on delete cascade,
  institution text not null,
  program text not null,
  level text not null,
  tag text not null,
  price text not null,
  residency_pathway text,
  sort_order integer not null default 0,
  active boolean not null default true
);

create index if not exists idx_move_schools_destination
  on move_schools (destination_id, sort_order);

create table if not exists move_jobs (
  id text primary key,
  destination_id text not null references move_destinations(id) on delete cascade,
  company text not null,
  role text not null,
  industry text not null,
  tag text not null,
  price text not null,
  sort_order integer not null default 0,
  active boolean not null default true
);

create index if not exists idx_move_jobs_destination
  on move_jobs (destination_id, sort_order);

-- Applications for schools/jobs reuse move_bookings — widen the allowed types.
alter table move_bookings drop constraint if exists move_bookings_booking_type_check;
alter table move_bookings add constraint move_bookings_booking_type_check
  check (booking_type in ('trip', 'stay', 'visa', 'school', 'job'));

-- ---- db/migrations/20260713_community.sql ----

create table if not exists community_topics (
  id uuid primary key default gen_random_uuid(),
  auth_user_id text not null,
  author_name text not null,
  category text not null default 'general' check (category in ('work', 'study', 'visa', 'travel', 'settling', 'general')),
  title text not null,
  body text not null,
  reply_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists community_replies (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references community_topics(id) on delete cascade,
  auth_user_id text not null,
  author_name text not null,
  body text not null,
  is_ai boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_community_topics_category on community_topics(category);
create index if not exists idx_community_topics_created on community_topics(created_at desc);
create index if not exists idx_community_replies_topic on community_replies(topic_id, created_at);


-- ---- db/migrations/20260715_community_safety.sql ----

create table if not exists rate_limit_events (
  id uuid primary key default gen_random_uuid(),
  auth_user_id text not null,
  action text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_rate_limit_events_lookup
  on rate_limit_events (auth_user_id, action, created_at desc);

create table if not exists community_reports (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('topic', 'reply')),
  target_id uuid not null,
  reporter_user_id text not null,
  reason text not null default '',
  resolved boolean not null default false,
  created_at timestamptz not null default now(),
  unique (target_type, target_id, reporter_user_id)
);

create index if not exists idx_community_reports_open
  on community_reports (resolved, created_at desc);

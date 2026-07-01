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

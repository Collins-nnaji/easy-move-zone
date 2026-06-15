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

-- Demo journey seed (Day 7)
-- Populates a sample relocation plan, tasks, contacts, and bookings for the
-- first matching Neon Auth user. Re-run safe (fixed UUIDs + upserts).
--
-- Default email: collinsnnaji1@gmail.com
-- Override:  psql ... -c "SET app.demo_email = 'you@example.com'" -f this file
-- Or edit the email literal below.

do $$
declare
  v_uid text;
  v_plan_id uuid;
  v_email text := '__DEMO_EMAIL__';
begin
  if to_regclass('neon_auth.users_sync') is null then
    raise notice 'Demo seed skipped: neon_auth.users_sync not found (sign up first).';
    return;
  end if;

  select id into v_uid
  from neon_auth.users_sync
  where lower(email) = lower(v_email)
  limit 1;

  if v_uid is null then
    raise notice 'Demo seed skipped: no user with email %. Sign up at /auth first.', v_email;
    return;
  end if;

  insert into user_profiles (auth_user_id, role, preferred_contact_method, full_name, nationality, move_work_mode, move_stay_preference)
  values (v_uid, 'buyer', 'email', 'Demo Mover', 'Nigerian', 'remote', 'nomad')
  on conflict (auth_user_id) do update set
    full_name = coalesce(nullif(user_profiles.full_name, ''), excluded.full_name),
    updated_at = now();

  insert into relocation_plans (
    auth_user_id, plan_name, origin_city, origin_country,
    destination_city, destination_country, move_reason, work_mode, status,
    budget_housing_usd, budget_travel_usd, budget_setup_usd, budget_buffer_usd,
    budget_monthly_living_usd, visa_pathway, notes
  ) values (
    v_uid, 'Lisbon nomad move', 'Lagos', 'Nigeria',
    'Lisbon', 'Portugal', 'Digital nomad stay', 'remote', 'in_progress',
    2400, 850, 1200, 1500, 1400, 'D8 digital nomad visa',
    'Demo plan — seeded for product walkthrough.'
  )
  on conflict (auth_user_id) do update set
    plan_name = excluded.plan_name,
    origin_city = excluded.origin_city,
    origin_country = excluded.origin_country,
    destination_city = excluded.destination_city,
    destination_country = excluded.destination_country,
    move_reason = excluded.move_reason,
    work_mode = excluded.work_mode,
    status = excluded.status,
    budget_housing_usd = excluded.budget_housing_usd,
    budget_travel_usd = excluded.budget_travel_usd,
    budget_setup_usd = excluded.budget_setup_usd,
    budget_buffer_usd = excluded.budget_buffer_usd,
    budget_monthly_living_usd = excluded.budget_monthly_living_usd,
    visa_pathway = excluded.visa_pathway,
    notes = excluded.notes,
    updated_at = now()
  returning id into v_plan_id;

  if v_plan_id is null then
    select id into v_plan_id from relocation_plans where auth_user_id = v_uid;
  end if;

  insert into relocation_tasks (
    id, plan_id, auth_user_id, title, category, due_date, status, priority, notes
  ) values
    ('f4000000-0000-4000-8000-000000000001', v_plan_id, v_uid, 'Confirm D8 visa eligibility', 'visa', (current_date + 14)::date, 'done', 'high', 'move:nomad:0:0'),
    ('f4000000-0000-4000-8000-000000000002', v_plan_id, v_uid, 'Gather income proof & bank statements', 'finance', (current_date + 10)::date, 'done', 'high', 'move:nomad:0:1'),
    ('f4000000-0000-4000-8000-000000000003', v_plan_id, v_uid, 'Book first-month accommodation', 'logistics', (current_date + 21)::date, 'done', 'medium', 'move:nomad:0:2'),
    ('f4000000-0000-4000-8000-000000000004', v_plan_id, v_uid, 'Apply for Portuguese NIF', 'legal', (current_date + 7)::date, 'done', 'medium', 'move:nomad:0:3'),
    ('f4000000-0000-4000-8000-000000000005', v_plan_id, v_uid, 'Open Portuguese bank account', 'finance', (current_date + 30)::date, 'in_progress', 'medium', 'move:nomad:1:0'),
    ('f4000000-0000-4000-8000-000000000006', v_plan_id, v_uid, 'Book one-way flight to Lisbon', 'logistics', (current_date + 25)::date, 'todo', 'high', 'move:nomad:1:1'),
    ('f4000000-0000-4000-8000-000000000007', v_plan_id, v_uid, 'Research health insurance options', 'settling', (current_date + 20)::date, 'todo', 'medium', 'move:nomad:1:2'),
    ('f4000000-0000-4000-8000-000000000008', v_plan_id, v_uid, 'Join Lisbon Digital Nomads community', 'settling', (current_date + 35)::date, 'todo', 'low', 'move:nomad:1:3')
  on conflict (id) do update set
    status = excluded.status,
    notes = excluded.notes,
    updated_at = now();

  insert into relocation_contacts (
    id, plan_id, auth_user_id, name, service_type, email, phone, website, notes
  ) values
    ('f4100000-0000-4000-8000-000000000001', v_plan_id, v_uid, 'Ana Relocation Co.', 'Immigration consultant', 'ana@example.com', '+351 912 000 001', 'https://example.com', 'D8 visa specialist — intro call booked.'),
    ('f4100000-0000-4000-8000-000000000002', v_plan_id, v_uid, 'Lisbon Coliving Hub', 'Accommodation', 'hello@example.com', '+351 912 000 002', 'https://example.com', 'Shortlist for first 60 days.')
  on conflict (id) do update set
    name = excluded.name,
    service_type = excluded.service_type,
    email = excluded.email,
    updated_at = now();

  insert into move_bookings (
    id, auth_user_id, booking_type, destination_city, destination_country,
    item_title, provider, price_label, start_date, end_date, guests, status
  ) values
    ('f4200000-0000-4000-8000-000000000001', v_uid, 'trip', 'Lisbon', 'Portugal', 'Lagos → Lisbon via TAP', 'TAP Air Portugal', 'from €420', (current_date + 28)::date, null, 1, 'reserved'),
    ('f4200000-0000-4000-8000-000000000002', v_uid, 'stay', 'Lisbon', 'Portugal', 'Príncipe Real coliving room', 'Lisbon Coliving Hub', '€890/mo', (current_date + 30)::date, (current_date + 120)::date, 1, 'confirmed'),
    ('f4200000-0000-4000-8000-000000000003', v_uid, 'visa', 'Lisbon', 'Portugal', 'D8 application review', 'EasyMoveZone Visa Desk', '£89', null, null, 1, 'reserved')
  on conflict (id) do update set
    status = excluded.status,
    updated_at = now();

  raise notice 'Demo journey seeded for user % (plan %).', v_email, v_plan_id;
end $$;

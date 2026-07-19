-- Marketplace seed: sample fleet operators, drivers, tanker/heavy shifts, ratings

-- Sample fleet operators (fixed auth ids for demo)
insert into fleet_operator_profiles (
  auth_user_id, company_name, contact_name, zone, onboarding_completed,
  rating_avg, rating_count, commission_bps
) values
  ('fleet-demo-001', 'Lone Star Logistics', 'Maria Chen', 'DFW North', true, 4.8, 124, 800),
  ('fleet-demo-002', 'Gulf Coast Freight Co', 'James Okonkwo', 'Houston Port', true, 4.6, 89, 800),
  ('fleet-demo-003', 'Hill Country Haulers', 'Rita Vasquez', 'San Antonio', true, 4.9, 56, 750)
on conflict (auth_user_id) do update set
  company_name = excluded.company_name,
  rating_avg = excluded.rating_avg,
  rating_count = excluded.rating_count,
  updated_at = now();

-- Sample independent drivers / truck owners
insert into driver_profiles (
  auth_user_id, zone, vehicle_type, onboarding_completed, display_name,
  owner_type, rate_hint_cents, rating_avg, rating_count, bio
) values
  ('driver-demo-001', 'DFW North', 'semi', true, 'Marcus Webb', 'owner', 32000, 4.9, 87,
   'CDL-A owner-operator. 12 years linehaul experience. Reefer and dry van.'),
  ('driver-demo-002', 'Houston Port', 'tanker', true, 'Elena Ruiz', 'owner', 45000, 4.7, 63,
   'Tanker endorsement. Fuel and chemical hauls. Hazmat certified.'),
  ('driver-demo-003', 'DFW Central', 'sprinter', true, 'Tyler Brooks', 'driver', 18000, 4.8, 142,
   'Last-mile specialist. Amazon, UPS, and FedEx routes.'),
  ('driver-demo-004', 'Houston Inner', 'box-truck', true, 'Darnell King', 'owner', 22000, 4.5, 38,
   '26'' box truck owner. Restaurant and grocery distribution.'),
  ('driver-demo-005', 'San Antonio', 'flatbed', true, 'Sofia Mendez', 'owner', 28000, 4.6, 51,
   'Flatbed CDL-B. Construction materials and port drayage.')
on conflict (auth_user_id) do update set
  display_name = excluded.display_name,
  owner_type = excluded.owner_type,
  rate_hint_cents = excluded.rate_hint_cents,
  rating_avg = excluded.rating_avg,
  rating_count = excluded.rating_count,
  bio = excluded.bio,
  updated_at = now();

-- Additional marketplace shifts with cargo types and fleet posters
insert into driver_shifts (
  id, posted_by, title, payout_cents, payout_type, vehicle_type, vehicle_label,
  cargo_category, pickup, dropoff, start_time, end_time, hours, zone,
  distance_mi, stops, demand, shift_date, status, commission_bps
) values
  (
    'b2000000-0000-4000-8000-000000000001',
    'fleet-demo-001', 'DFW Linehaul — Dry Van',
    32000, 'day', 'semi', 'Semi Tractor (CDL-A)',
    'heavy-goods', 'Lone Star Logistics Hub, Haslet TX', 'Oklahoma City DC',
    '5:00 AM', '3:00 PM', 10.0, 'DFW North',
    210, 2, 'high', 'Today', 'open', 800
  ),
  (
    'b2000000-0000-4000-8000-000000000002',
    'fleet-demo-002', 'Port Tanker Run — Fuel',
    45000, 'day', 'tanker', 'Tanker (Hazmat)',
    'tanker', 'Port of Houston Terminal', '3 fuel stations · East TX',
    '4:00 AM', '2:00 PM', 10.0, 'Houston Port',
    95, 3, 'high', 'Today', 'open', 800
  ),
  (
    'b2000000-0000-4000-8000-000000000003',
    'fleet-demo-001', 'Cold Chain — Grocery',
    27500, 'day', 'refrigerated', 'Reefer Trailer',
    'refrigerated', 'US Foods DFW', '12 grocery drops',
    '3:00 AM', '12:00 PM', 9.0, 'DFW Central',
    78, 12, 'normal', 'Tomorrow', 'open', 800
  ),
  (
    'b2000000-0000-4000-8000-000000000004',
    'fleet-demo-003', 'Construction Aggregate',
    24000, 'day', 'dump-truck', 'Dump Truck',
    'construction', 'Vulcan Materials, San Antonio', '4 job sites',
    '6:00 AM', '2:00 PM', 8.0, 'San Antonio',
    52, 4, 'normal', 'Tomorrow', 'open', 750
  ),
  (
    'b2000000-0000-4000-8000-000000000005',
    'fleet-demo-002', 'Hazmat Chemical Transfer',
    52000, 'day', 'tanker', 'Tanker (Hazmat CDL)',
    'hazmat', 'Baytown Chemical Plant', '2 distribution terminals',
    '5:30 AM', '4:00 PM', 10.5, 'Houston Port',
    68, 2, 'high', 'Mon, Jul 21', 'open', 800
  )
on conflict (id) do update set
  title = excluded.title,
  cargo_category = excluded.cargo_category,
  posted_by = excluded.posted_by,
  status = excluded.status,
  updated_at = now();

-- Tag existing seeded shifts with cargo categories and fleet poster
update driver_shifts set
  cargo_category = case vehicle_type
    when 'sprinter' then 'parcel'
    when 'box-truck' then 'general-freight'
    when 'flatbed' then 'construction'
    when 'client-fleet' then 'parcel'
    else 'general-freight'
  end,
  posted_by = coalesce(posted_by, 'fleet-demo-001'),
  title = coalesce(title, vehicle_label || ' route'),
  commission_bps = 800
where id in (
  'a1000000-0000-4000-8000-000000000001',
  'a1000000-0000-4000-8000-000000000002',
  'a1000000-0000-4000-8000-000000000003',
  'a1000000-0000-4000-8000-000000000004',
  'a1000000-0000-4000-8000-000000000005'
);

-- Sample ratings
insert into marketplace_ratings (shift_id, from_user_id, to_user_id, from_role, stars, comment)
select
  'a1000000-0000-4000-8000-000000000001',
  'driver-demo-003', 'fleet-demo-001', 'driver', 5, 'Clear instructions, on-time pickup.'
where not exists (
  select 1 from marketplace_ratings
  where shift_id = 'a1000000-0000-4000-8000-000000000001' and from_user_id = 'driver-demo-003'
);

insert into marketplace_ratings (shift_id, from_user_id, to_user_id, from_role, stars, comment)
select
  'a1000000-0000-4000-8000-000000000001',
  'fleet-demo-001', 'driver-demo-003', 'fleet', 5, 'Professional driver, all stops on time.'
where not exists (
  select 1 from marketplace_ratings
  where shift_id = 'a1000000-0000-4000-8000-000000000001' and from_user_id = 'fleet-demo-001'
);

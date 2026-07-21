-- Marketplace seed: sample Nigerian fleet operators, drivers, and corridor shifts

-- Sample fleet operators (fixed auth ids for demo)
insert into fleet_operator_profiles (
  auth_user_id, company_name, contact_name, zone, onboarding_completed,
  rating_avg, rating_count, commission_bps
) values
  ('fleet-demo-001', 'Lagos Corridor Logistics', 'Adaeze Okonkwo', 'Lagos Mainland', true, 4.8, 124, 800),
  ('fleet-demo-002', 'Niger Delta Freight Co', 'Chinedu Eze', 'Port Harcourt', true, 4.6, 89, 800),
  ('fleet-demo-003', 'Capital City Haulers', 'Fatima Bello', 'Abuja', true, 4.9, 56, 750)
on conflict (auth_user_id) do update set
  company_name = excluded.company_name,
  contact_name = excluded.contact_name,
  zone = excluded.zone,
  rating_avg = excluded.rating_avg,
  rating_count = excluded.rating_count,
  updated_at = now();

-- Sample independent drivers / truck owners
insert into driver_profiles (
  auth_user_id, zone, vehicle_type, onboarding_completed, display_name,
  owner_type, rate_hint_cents, rating_avg, rating_count, bio
) values
  ('driver-demo-001', 'Lagos Mainland', 'semi', true, 'Tunde Adebayo', 'owner', 8500000, 4.9, 87,
   'Owner-operator. 12 years Lagos–Abuja linehaul. Reefer and dry van.'),
  ('driver-demo-002', 'Port Harcourt', 'tanker', true, 'Ngozi Emeka', 'owner', 12000000, 4.7, 63,
   'Tanker endorsement. Fuel and chemical hauls across the Niger Delta.'),
  ('driver-demo-003', 'Ikeja / Airport', 'sprinter', true, 'Ibrahim Musa', 'driver', 4500000, 4.8, 142,
   'Last-mile specialist. Konga, GIG, and DHL airport routes.'),
  ('driver-demo-004', 'Lagos Island', 'box-truck', true, 'Kemi Adeyemi', 'owner', 6500000, 4.5, 38,
   '26'' box truck owner. Market and grocery distribution on the Island.'),
  ('driver-demo-005', 'Abuja', 'flatbed', true, 'Yusuf Mohammed', 'owner', 7200000, 4.6, 51,
   'Flatbed. Construction materials and Apapa–Abuja corridor freight.')
on conflict (auth_user_id) do update set
  zone = excluded.zone,
  vehicle_type = excluded.vehicle_type,
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
    'fleet-demo-001', 'Lagos–Abuja Linehaul — Dry Van',
    8500000, 'day', 'semi', 'Semi Tractor',
    'heavy-goods', 'Lagos Corridor Hub, Apapa', 'Abuja Central Depot',
    '5:00 AM', '3:00 PM', 10.0, 'Lagos Mainland',
    470, 2, 'high', 'Today', 'open', 800
  ),
  (
    'b2000000-0000-4000-8000-000000000002',
    'fleet-demo-002', 'Port Tanker Run — Fuel',
    12000000, 'day', 'tanker', 'Tanker (Hazmat)',
    'tanker', 'Onne Port Terminal', '3 fuel stations · Rivers',
    '4:00 AM', '2:00 PM', 10.0, 'Port Harcourt',
    55, 3, 'high', 'Today', 'open', 800
  ),
  (
    'b2000000-0000-4000-8000-000000000003',
    'fleet-demo-001', 'Cold Chain — Grocery',
    7200000, 'day', 'refrigerated', 'Reefer Trailer',
    'refrigerated', 'Cold Hub Ikeja', '12 grocery drops · Mainland',
    '3:00 AM', '12:00 PM', 9.0, 'Ikeja / Airport',
    38, 12, 'normal', 'Tomorrow', 'open', 800
  ),
  (
    'b2000000-0000-4000-8000-000000000004',
    'fleet-demo-003', 'Construction Aggregate',
    6500000, 'day', 'dump-truck', 'Dump Truck',
    'construction', 'Dangote Quarry spur, Abuja', '4 job sites · Gwarinpa',
    '6:00 AM', '2:00 PM', 8.0, 'Abuja',
    32, 4, 'normal', 'Tomorrow', 'open', 750
  ),
  (
    'b2000000-0000-4000-8000-000000000005',
    'fleet-demo-002', 'Hazmat Chemical Transfer',
    15000000, 'day', 'tanker', 'Tanker (Dangerous Goods)',
    'hazmat', 'Eleme Petrochemicals', '2 distribution terminals',
    '5:30 AM', '4:00 PM', 10.5, 'Port Harcourt',
    40, 2, 'high', 'Mon, Jul 21', 'open', 800
  )
on conflict (id) do update set
  title = excluded.title,
  posted_by = excluded.posted_by,
  payout_cents = excluded.payout_cents,
  payout_type = excluded.payout_type,
  vehicle_type = excluded.vehicle_type,
  vehicle_label = excluded.vehicle_label,
  cargo_category = excluded.cargo_category,
  pickup = excluded.pickup,
  dropoff = excluded.dropoff,
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  hours = excluded.hours,
  zone = excluded.zone,
  distance_mi = excluded.distance_mi,
  stops = excluded.stops,
  demand = excluded.demand,
  shift_date = excluded.shift_date,
  status = excluded.status,
  commission_bps = excluded.commission_bps,
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
  'driver-demo-003', 'fleet-demo-001', 'driver', 5, 'Clear instructions, on-time pickup at Ikeja.'
where not exists (
  select 1 from marketplace_ratings
  where shift_id = 'a1000000-0000-4000-8000-000000000001' and from_user_id = 'driver-demo-003'
);

insert into marketplace_ratings (shift_id, from_user_id, to_user_id, from_role, stars, comment)
select
  'a1000000-0000-4000-8000-000000000001',
  'fleet-demo-001', 'driver-demo-003', 'fleet', 5, 'Professional driver, all Lagos stops on time.'
where not exists (
  select 1 from marketplace_ratings
  where shift_id = 'a1000000-0000-4000-8000-000000000001' and from_user_id = 'fleet-demo-001'
);

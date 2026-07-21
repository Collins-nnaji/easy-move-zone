-- Seed open commercial driving shifts across Nigerian corridors (idempotent via fixed UUIDs)
insert into driver_shifts (
  id, payout_cents, payout_type, vehicle_type, vehicle_label,
  pickup, dropoff, start_time, end_time, hours, zone,
  distance_mi, stops, demand, shift_date, status
) values
  (
    'a1000000-0000-4000-8000-000000000001',
    18000, 'day', 'sprinter', 'Sprinter Van',
    'Konga Fulfilment, Ikeja Lagos', '12 stops · Lagos Mainland',
    '6:00 AM', '2:30 PM', 8.5, 'Ikeja / Airport',
    42, 12, 'high', 'Today', 'open'
  ),
  (
    'a1000000-0000-4000-8000-000000000002',
    2500, 'hour', 'box-truck', 'Box Truck (26'')',
    'Shoprite Distribution, Surulere', '8 market & restaurant drops',
    '4:00 PM', '11:00 PM', 7.0, 'Lagos Mainland',
    28, 8, 'normal', 'Today', 'open'
  ),
  (
    'a1000000-0000-4000-8000-000000000003',
    16500, 'day', 'client-fleet', 'No Vehicle Needed',
    'GIG Logistics Hub, Yaba', 'Linehaul return · Apapa',
    '5:30 AM', '1:00 PM', 7.5, 'Lagos Mainland',
    18, 2, 'high', 'Tomorrow', 'open'
  ),
  (
    'a1000000-0000-4000-8000-000000000004',
    2200, 'hour', 'flatbed', 'Flatbed',
    'Apapa Port Gate 2', '3 construction sites · Lekki',
    '7:00 AM', '4:00 PM', 9.0, 'Lagos Island',
    22, 3, 'normal', 'Tomorrow', 'open'
  ),
  (
    'a1000000-0000-4000-8000-000000000005',
    19500, 'day', 'sprinter', 'Sprinter Van',
    'DHL Gateway, MMIA Ikeja', '15 residential stops · Maryland',
    '7:00 AM', '3:30 PM', 8.5, 'Ikeja / Airport',
    35, 15, 'normal', 'Mon, Jul 21', 'open'
  )
on conflict (id) do update set
  payout_cents = excluded.payout_cents,
  payout_type = excluded.payout_type,
  vehicle_type = excluded.vehicle_type,
  vehicle_label = excluded.vehicle_label,
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
  updated_at = now();

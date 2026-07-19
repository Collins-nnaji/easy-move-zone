-- Seed open commercial driving shifts (idempotent via fixed UUIDs)
insert into driver_shifts (
  id, payout_cents, payout_type, vehicle_type, vehicle_label,
  pickup, dropoff, start_time, end_time, hours, zone,
  distance_mi, stops, demand, shift_date, status
) values
  (
    'a1000000-0000-4000-8000-000000000001',
    18000, 'day', 'sprinter', 'Sprinter Van',
    'Amazon DFW-7, Haslet TX', '12 stops · DFW metro',
    '6:00 AM', '2:30 PM', 8.5, 'DFW North',
    94, 12, 'high', 'Today', 'open'
  ),
  (
    'a1000000-0000-4000-8000-000000000002',
    2500, 'hour', 'box-truck', 'Box Truck (26'')',
    'Sysco Houston Hub', '8 restaurant drops',
    '4:00 PM', '11:00 PM', 7.0, 'Houston Inner',
    62, 8, 'normal', 'Today', 'open'
  ),
  (
    'a1000000-0000-4000-8000-000000000003',
    16500, 'day', 'client-fleet', 'No Vehicle Needed',
    'FedEx Ground, Mesquite TX', 'Linehaul return',
    '5:30 AM', '1:00 PM', 7.5, 'DFW East',
    118, 2, 'high', 'Tomorrow', 'open'
  ),
  (
    'a1000000-0000-4000-8000-000000000004',
    2200, 'hour', 'flatbed', 'Flatbed CDL-B',
    'Port of Houston', '3 construction sites',
    '7:00 AM', '4:00 PM', 9.0, 'Houston Port',
    48, 3, 'normal', 'Tomorrow', 'open'
  ),
  (
    'a1000000-0000-4000-8000-000000000005',
    19500, 'day', 'sprinter', 'Sprinter Van',
    'UPS Dallas Gateway', '15 residential stops',
    '7:00 AM', '3:30 PM', 8.5, 'DFW Central',
    76, 15, 'normal', 'Mon, Jul 21', 'open'
  )
on conflict (id) do update set
  payout_cents = excluded.payout_cents,
  status = excluded.status,
  updated_at = now();

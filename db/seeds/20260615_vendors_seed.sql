-- Move-services vendor marketplace demo data. Mirrors the names previously
-- hardcoded in AdminVendorsClient / VendorDashboardClient so those screens keep
-- their look but become real. Run after db/migrations/20260615_vendors.sql.

insert into vendors (
  id, auth_user_id, business_name, service_type, city, tagline, description,
  base_price, price_label, currency, coverage_areas, features, experience_years, rating,
  contact_name, contact_email, contact_phone, website, status, is_featured
) values
  ('c1000000-0000-4000-8000-000000000001', null, 'Swift Movers MCR', 'removals', 'Manchester',
   'Full home removals, done right', 'Insured, end-to-end home removals across the North West with packing and storage add-ons.',
   350, '£350+', 'GBP', '{"Manchester","North West","Nationwide"}', '{"Insured","Licensed","Packing add-on","Storage"}', 9, 4.8,
   'James Hartley', 'swift@example.com', '+44 161 555 0101', 'https://swiftmovers.example.com', 'live', true),

  ('c1000000-0000-4000-8000-000000000002', null, 'CleanSlate Ltd', 'cleaning', 'London',
   'Move-in & end-of-tenancy cleaning', 'Deep cleaning and end-of-tenancy specialists trusted by landlords and relocating tenants.',
   120, '£120+', 'GBP', '{"London","South East"}', '{"Insured","Eco products","Deposit-back guarantee"}', 6, 4.5,
   'Priya Shah', 'clean@example.com', '+44 20 7555 0199', 'https://cleanslate.example.com', 'live', false),

  ('c1000000-0000-4000-8000-000000000003', null, 'AbokiPack NG', 'packing', 'Lagos',
   'Careful packing for big moves', 'Professional packing and crating for local and international relocations out of Lagos.',
   80000, '₦80,000+', 'NGN', '{"Lagos","Nationwide"}', '{"Fragile specialists","Materials included"}', 4, null,
   'Chidi Obi', 'abokie@example.com', '+234 803 555 0144', null, 'pending', false),

  ('c1000000-0000-4000-8000-000000000004', null, 'GlobalShip Intl', 'international', 'London',
   'Door-to-door international shipping', 'Sea and air freight for household goods, with customs handling on both ends.',
   1500, 'Quote', 'GBP', '{"London","UK","International","Europe","Africa"}', '{"Customs handling","Door-to-door","Tracking"}', 12, null,
   'Marco Bianchi', 'global@example.com', '+44 20 7555 0233', 'https://globalship.example.com', 'pending', false),

  ('c1000000-0000-4000-8000-000000000005', null, 'FixIt Handymen', 'handyman', 'Birmingham',
   'Setup & repairs for new homes', 'Flat-pack assembly, mounting and small repairs to get your new place ready.',
   60, '£60+', 'GBP', '{"Birmingham","Midlands"}', '{"DBS-checked","Same-week slots"}', 3, null,
   'Daniel Osei', 'fixit@example.com', '+44 121 555 0177', null, 'rejected', false),

  ('c1000000-0000-4000-8000-000000000006', null, 'SecureStore Self Storage', 'storage', 'London',
   'Flexible storage between moves', 'Clean, monitored storage units from a locker to a garage, billed monthly.',
   45, '£45/mo', 'GBP', '{"London","Nationwide"}', '{"24/7 access","CCTV","Insured"}', 8, 4.6,
   'Hannah Lewis', 'store@example.com', '+44 20 7555 0266', 'https://securestore.example.com', 'live', false)
on conflict (id) do nothing;

insert into vendor_enquiries (id, vendor_id, name, email, phone, message, move_from, move_to, status)
values
  ('d1000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000001','Amara O.','amara@example.com','+44 7700 900001','3-bed house move, need packing too.','Manchester','London','new'),
  ('d1000000-0000-4000-8000-000000000002','c1000000-0000-4000-8000-000000000001','Femi K.','femi@example.com','+44 7700 900002','1-bed flat, same city, next weekend.','Manchester','Manchester','read'),
  ('d1000000-0000-4000-8000-000000000003','c1000000-0000-4000-8000-000000000002','Chloe M.','chloe@example.com','+44 7700 900003','End-of-tenancy deep clean next week.','London','London','new')
on conflict (id) do nothing;
</content>

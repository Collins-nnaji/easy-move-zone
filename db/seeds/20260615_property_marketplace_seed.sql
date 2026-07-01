-- Property marketplace demo data: agents, city markets, and ~18 listings in the
-- `properties` table that the live /api/properties endpoint reads (home, /purchase,
-- /own, /properties/[id]). Idempotent via explicit ids + ON CONFLICT.
--
-- Prerequisites (run first if not already applied):
--   db/property-platform-schema.sql        (properties, enquiries, saved_properties, transactions)
--   db/property-finder-schema.sql          (city_markets)
--   db/migrations/20260309_user_profiles.sql + 20260310_agent_flag_and_admin.sql (user_profiles agent fields)

-- ── Agents (migration-shape user_profiles: auth_user_id PK, is_agent/agent_*) ──
insert into user_profiles (auth_user_id, role, full_name, phone, is_agent, agent_company, agent_license, agent_bio, agent_verified)
values
  ('agent-emz-001', 'seller', 'Adaeze Okonkwo', '+2348031234001', true, 'EasyMoveZone Verified Partners', 'LASRERA/2024/0481', 'Lagos island & Lekki corridor specialist. 9 years closing title-clean transactions for diaspora buyers.', true),
  ('agent-emz-002', 'seller', 'Tunde Bakare',   '+2348031234002', true, 'Najville Realties',                'ABJ/REA/2023/1190', 'Abuja-based agent focused on Maitama, Asokoro and Gwarinpa family homes.', true),
  ('agent-emz-003', 'seller', 'Ifeoma Eze',      '+2348031234003', true, 'Garden City Homes',                'RV/REA/2024/0207', 'Port Harcourt residential & land, with strong due-diligence on Rivers State titles.', true)
on conflict (auth_user_id) do update set
  is_agent = excluded.is_agent,
  agent_company = excluded.agent_company,
  agent_verified = excluded.agent_verified,
  updated_at = now();

-- ── City markets (lib/property/data.ts getCityMarkets) ──
insert into city_markets (id, slug, name, country, flag_emoji, status, avg_rent_usd, avg_buy_usd, security_score, commute_score, lifestyle_score, top_sectors, latitude, longitude)
values
  ('lagos',         'lagos',         'Lagos',         'Nigeria', '🇳🇬', 'active', 1200, 180000, 62, 48, 82, '["Fintech","Logistics","Entertainment","Trade"]'::jsonb, 6.5244, 3.3792),
  ('abuja',         'abuja',         'Abuja',         'Nigeria', '🇳🇬', 'active', 1400, 220000, 74, 71, 76, '["Government","Oil & Gas","Real Estate","Services"]'::jsonb, 9.0765, 7.3986),
  ('port-harcourt', 'port-harcourt', 'Port Harcourt', 'Nigeria', '🇳🇬', 'active',  900, 140000, 58, 55, 68, '["Oil & Gas","Maritime","Engineering"]'::jsonb, 4.8156, 7.0498)
on conflict (id) do nothing;

-- ── Properties (the table /api/properties reads) ──
insert into properties (
  id, agent_id, title, description, property_type, city, state, country, neighborhood, address,
  price_ngn, price_usd, land_size_sqm, building_size_sqm, bedrooms, bathrooms,
  images, features, verification_status, ai_valuation_ngn, ai_valuation_confidence,
  is_featured, is_published, view_count, enquiry_count
) values
  ('a1000000-0000-4000-8000-000000000001','agent-emz-001','4-Bedroom Detached Duplex, Lekki Phase 1','Spacious detached duplex with all rooms en-suite, fitted kitchen, BQ and ample parking in a serviced Lekki Phase 1 estate. Governor''s Consent verified.','house','Lagos','Lagos','Nigeria','Lekki Phase 1','Admiralty Way, Lekki Phase 1',
   185000000,120000,500,420,4,5,
   '["https://images.unsplash.com/photo-1568605114967-8130f3a36994","https://images.unsplash.com/photo-1570129477492-45c003edd2be"]'::jsonb,
   '["All rooms en-suite","Fitted kitchen","BQ","24/7 power","Estate security"]'::jsonb,'verified',192000000,0.86,true,true,412,9),

  ('a1000000-0000-4000-8000-000000000002','agent-emz-001','3-Bedroom Apartment, Ikoyi','Luxury 3-bed apartment with a swimming pool, gym and waterfront views. Ideal for executives and returnees.','apartment','Lagos','Lagos','Nigeria','Ikoyi','Bourdillon Road, Ikoyi',
   165000000,107000,null,210,3,4,
   '["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00","https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"]'::jsonb,
   '["Swimming pool","Gym","Waterfront view","Concierge","Backup power"]'::jsonb,'verified',170000000,0.83,true,true,388,7),

  ('a1000000-0000-4000-8000-000000000003','agent-emz-001','800sqm Residential Land, Lekki (Govt Allocation)','Dry, fenced 800sqm plot in a gazetted scheme with Government Allocation and survey. Buy-and-build ready.','land','Lagos','Lagos','Nigeria','Sangotedo','Lekki-Epe Expressway, Sangotedo',
   42000000,27000,800,null,0,0,
   '["https://images.unsplash.com/photo-1500382017468-9049fed747ef"]'::jsonb,
   '["Govt allocation","Survey plan","Fenced","Dry land","C of O processing"]'::jsonb,'verified',45000000,0.78,false,true,221,4),

  ('a1000000-0000-4000-8000-000000000004','agent-emz-001','2-Bedroom Flat, Yaba (Rent-to-Own)','Modern 2-bed flat near tech hubs and UNILAG, offered on a rent-to-own plan with lock-in pricing over 5 years.','apartment','Lagos','Lagos','Nigeria','Yaba','Herbert Macaulay Way, Yaba',
   58000000,38000,null,98,2,2,
   '["https://images.unsplash.com/photo-1493809842364-78817add7ffb","https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"]'::jsonb,
   '["Rent-to-own","Close to tech hubs","Prepaid meter","Borehole","Secure compound"]'::jsonb,'verified',60000000,0.8,true,true,176,11),

  ('a1000000-0000-4000-8000-000000000005','agent-emz-001','5-Bedroom Terrace, Victoria Island','Contemporary 5-bed terrace with rooftop terrace and smart-home wiring in a gated VI cluster.','house','Lagos','Lagos','Nigeria','Victoria Island','Ahmadu Bello Way, VI',
   245000000,159000,360,510,5,6,
   '["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9","https://images.unsplash.com/photo-1600585154340-be6161a56a0c"]'::jsonb,
   '["Smart home","Rooftop terrace","Elevator-ready","Gated cluster"]'::jsonb,'pending',250000000,0.7,false,true,142,3),

  ('a1000000-0000-4000-8000-000000000006','agent-emz-001','Mixed-Use Building, Ikeja GRA','Three-floor mixed-use building (retail + offices) on a busy GRA road. Strong rental yield.','mixed-use','Lagos','Lagos','Nigeria','Ikeja GRA','Joel Ogunnaike St, Ikeja GRA',
   320000000,208000,700,950,0,8,
   '["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab"]'::jsonb,
   '["Retail + office","High footfall","Ample parking","Title verified"]'::jsonb,'verified',330000000,0.81,false,true,98,2),

  ('a1000000-0000-4000-8000-000000000007','agent-emz-002','4-Bedroom Semi-Detached, Maitama','Elegant 4-bed semi-detached in Maitama with private garden, study and staff quarters.','house','Abuja','FCT','Nigeria','Maitama','Gana Street, Maitama',
   210000000,136000,450,400,4,5,
   '["https://images.unsplash.com/photo-1576941089067-2de3c901e126","https://images.unsplash.com/photo-1564013799919-ab600027ffc6"]'::jsonb,
   '["Private garden","Study","Staff quarters","Diplomatic zone"]'::jsonb,'verified',215000000,0.85,true,true,265,6),

  ('a1000000-0000-4000-8000-000000000008','agent-emz-002','3-Bedroom Bungalow, Gwarinpa','Well-finished 3-bed bungalow in Gwarinpa estate, move-in ready with solar inverter.','house','Abuja','FCT','Nigeria','Gwarinpa','3rd Avenue, Gwarinpa',
   95000000,62000,450,260,3,3,
   '["https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83","https://images.unsplash.com/photo-1598228723793-52759bba239c"]'::jsonb,
   '["Solar inverter","Move-in ready","Estate security","Tarred road"]'::jsonb,'verified',98000000,0.82,false,true,203,5),

  ('a1000000-0000-4000-8000-000000000009','agent-emz-002','1000sqm Land, Guzape (C of O)','Prime hilltop 1000sqm plot in Guzape with a registered Certificate of Occupancy. Build your dream home.','land','Abuja','FCT','Nigeria','Guzape','Guzape District',
   140000000,91000,1000,null,0,0,
   '["https://images.unsplash.com/photo-1542889601-399c4f3a8402"]'::jsonb,
   '["C of O","Hilltop view","Tarred access","Cornerpiece"]'::jsonb,'verified',145000000,0.79,false,true,131,2),

  ('a1000000-0000-4000-8000-000000000010','agent-emz-002','2-Bedroom Apartment, Wuse 2 (Mortgage-Eligible)','NHF/mortgage-eligible 2-bed apartment in Wuse 2 with serviced facilities and dedicated parking.','apartment','Abuja','FCT','Nigeria','Wuse 2','Aminu Kano Crescent, Wuse 2',
   72000000,47000,null,86,2,2,
   '["https://images.unsplash.com/photo-1554995207-c18c203602cb","https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"]'::jsonb,
   '["Mortgage-eligible","Serviced","Dedicated parking","Backup power"]'::jsonb,'verified',74000000,0.84,true,true,159,8),

  ('a1000000-0000-4000-8000-000000000011','agent-emz-002','Commercial Plaza, Central Business District','Fully-let commercial plaza in Abuja CBD with anchor tenants and 9% net yield.','commercial','Abuja','FCT','Nigeria','Central Business District','Constitution Ave, CBD',
   480000000,312000,1200,1600,0,12,
   '["https://images.unsplash.com/photo-1497366754035-f200968a6e72"]'::jsonb,
   '["Fully let","Anchor tenants","9% net yield","CCTV"]'::jsonb,'pending',490000000,0.68,false,true,77,1),

  ('a1000000-0000-4000-8000-000000000012','agent-emz-003','4-Bedroom Detached, GRA Phase 2 (Port Harcourt)','Tastefully finished 4-bed detached home in GRA Phase 2 with a borehole, treatment plant and BQ.','house','Port Harcourt','Rivers','Nigeria','GRA Phase 2','Forces Avenue, GRA Phase 2',
   135000000,88000,540,380,4,5,
   '["https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6","https://images.unsplash.com/photo-1572120360610-d971b9d7767c"]'::jsonb,
   '["Borehole","Water treatment","BQ","Interlocked compound"]'::jsonb,'verified',138000000,0.83,true,true,184,5),

  ('a1000000-0000-4000-8000-000000000013','agent-emz-003','3-Bedroom Terrace, Trans Amadi','Affordable 3-bed terrace close to the industrial layout, ideal for working professionals.','house','Port Harcourt','Rivers','Nigeria','Trans Amadi','Trans Amadi Industrial Layout',
   68000000,44000,250,210,3,3,
   '["https://images.unsplash.com/photo-1512917774080-9991f1c4c750"]'::jsonb,
   '["Close to industry","Prepaid meter","Gated terrace"]'::jsonb,'verified',70000000,0.8,false,true,112,3),

  ('a1000000-0000-4000-8000-000000000014','agent-emz-003','650sqm Waterfront Land, Old GRA','Rare 650sqm waterfront plot in Old GRA with deed of assignment and survey. Premium location.','land','Port Harcourt','Rivers','Nigeria','Old GRA','Old GRA Waterfront',
   55000000,36000,650,null,0,0,
   '["https://images.unsplash.com/photo-1494526585095-c41746248156"]'::jsonb,
   '["Waterfront","Deed of assignment","Survey plan","Premium area"]'::jsonb,'pending',57000000,0.66,false,true,64,1),

  ('a1000000-0000-4000-8000-000000000015','agent-emz-003','2-Bedroom Flat, Woji (Rent-to-Own)','Newly built 2-bed flat in Woji offered rent-to-own, with the option to convert equity after year two.','apartment','Port Harcourt','Rivers','Nigeria','Woji','Woji Road',
   48000000,31000,null,90,2,2,
   '["https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6","https://images.unsplash.com/photo-1484154218962-a197022b5858"]'::jsonb,
   '["Rent-to-own","Newly built","Borehole","Secure estate"]'::jsonb,'verified',49500000,0.81,true,true,90,6),

  ('a1000000-0000-4000-8000-000000000016','agent-emz-001','Detached House Build Package, Sangotedo','Buy-and-build package: 450sqm plot plus a managed 4-bed build delivered in 12 months. Mortgage-eligible.','house','Lagos','Lagos','Nigeria','Sangotedo','Monastery Road, Sangotedo',
   110000000,71000,450,300,4,4,
   '["https://images.unsplash.com/photo-1564013799919-ab600027ffc6"]'::jsonb,
   '["Buy-and-build","Managed construction","12-month delivery","Mortgage-eligible"]'::jsonb,'verified',115000000,0.77,false,true,143,7),

  ('a1000000-0000-4000-8000-000000000017','agent-emz-002','Studio Apartment, Jahi (Mortgage-Eligible)','Compact studio in Jahi suited to first-time buyers; qualifies for NHF financing.','apartment','Abuja','FCT','Nigeria','Jahi','Jahi District',
   38000000,25000,null,52,1,1,
   '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"]'::jsonb,
   '["First-time buyer","NHF eligible","Serviced","Parking"]'::jsonb,'unverified',39000000,0.6,false,true,58,2),

  ('a1000000-0000-4000-8000-000000000018','agent-emz-003','5-Bedroom Mansion, Peter Odili Road','Luxury 5-bed mansion with cinema room, pool and 8-car garage on Peter Odili Road.','house','Port Harcourt','Rivers','Nigeria','Peter Odili','Peter Odili Road',
   290000000,188000,900,720,5,7,
   '["https://images.unsplash.com/photo-1613490493576-7fde63acd811","https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde"]'::jsonb,
   '["Cinema room","Swimming pool","8-car garage","Smart home"]'::jsonb,'verified',300000000,0.82,true,true,121,4)
on conflict (id) do nothing;
</content>

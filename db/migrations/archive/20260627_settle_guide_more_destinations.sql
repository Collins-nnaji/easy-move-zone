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

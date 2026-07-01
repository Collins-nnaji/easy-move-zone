-- Day 5: unify /settle and /move settle content in relocation_country_guides
alter table relocation_country_guides
  add column if not exists city_slug text,
  add column if not exists settle_cards jsonb not null default '[]'::jsonb,
  add column if not exists sim_tip text not null default '',
  add column if not exists neighborhoods_tip text not null default '',
  add column if not exists community_tip text not null default '',
  add column if not exists transport_tip text not null default '';

create unique index if not exists idx_relocation_guides_city_slug
  on relocation_country_guides (city_slug)
  where city_slug is not null;

-- Move catalog destinations (matches app/move/data.ts SETTLE keys)
update relocation_country_guides set
  city_slug = 'lisbon',
  settle_cards = '[
    {"tag":"Neighbourhoods","title":"Where to base yourself","body":"Príncipe Real for cafés, Alcântara for value, Estrela for families and green space."},
    {"tag":"Getting around","title":"Metro, trams & a Navegante card","body":"A monthly Navegante pass is €40 and covers metro, bus and tram across the city."},
    {"tag":"Connectivity","title":"SIM in 10 minutes","body":"Grab a MEO or Vodafone prepaid SIM at the airport — generous data, no contract."},
    {"tag":"Community","title":"Lisbon Digital Nomads","body":"14k-member group with weekly meetups, a housing channel and a newcomer onboarding thread."}
  ]'::jsonb,
  neighborhoods_tip = 'Príncipe Real for cafés, Alcântara for value, Estrela for families and green space.',
  transport_tip = 'A monthly Navegante pass is €40 and covers metro, bus and tram across the city.',
  sim_tip = 'Grab a MEO or Vodafone prepaid SIM at the airport — generous data, no contract.',
  community_tip = 'Lisbon Digital Nomads — 14k members with weekly meetups and a housing channel.',
  updated_at = now()
where country = 'Portugal';

update relocation_country_guides set
  city_slug = 'mexicocity',
  settle_cards = '[
    {"tag":"Neighbourhoods","title":"Where to base yourself","body":"Roma Norte & Condesa for walkability, Coyoacán for charm, Polanco for upscale calm."},
    {"tag":"Getting around","title":"Metro, Metrobús & apps","body":"A rechargeable Movilidad Integrada card works across metro and Metrobús; ride-hail is cheap."},
    {"tag":"Connectivity","title":"Telcel or AT&T SIM","body":"Cheap prepaid data everywhere; Telcel has the widest coverage outside the city too."},
    {"tag":"Community","title":"CDMX Expats & Nomads","body":"Active community with neighbourhood guides, Spanish-exchange nights and a trusted-services list."}
  ]'::jsonb,
  neighborhoods_tip = 'Roma Norte & Condesa for walkability, Coyoacán for charm, Polanco for upscale calm.',
  transport_tip = 'A rechargeable Movilidad Integrada card works across metro and Metrobús; ride-hail is cheap.',
  sim_tip = 'Telcel or AT&T prepaid SIMs — cheap data with widest coverage via Telcel outside the city.',
  community_tip = 'CDMX Expats & Nomads — neighbourhood guides, Spanish-exchange nights and trusted services.',
  updated_at = now()
where country = 'Mexico';

update relocation_country_guides set
  city_slug = 'bangkok',
  settle_cards = '[
    {"tag":"Neighbourhoods","title":"Where to base yourself","body":"Thonglor & Ekkamai for nomads, Ari for a local feel, Sathorn for business proximity."},
    {"tag":"Getting around","title":"Live near the BTS","body":"The Skytrain and MRT skip the traffic — a Rabbit card makes both seamless."},
    {"tag":"Connectivity","title":"AIS or TrueMove SIM","body":"Tourist SIMs with huge data allowances are sold right at the airport arrivals hall."},
    {"tag":"Community","title":"Bangkok Nomads & Expats","body":"One of Asia''s biggest scenes — condo tips, visa-run advice and daily coworking meetups."}
  ]'::jsonb,
  neighborhoods_tip = 'Thonglor & Ekkamai for nomads, Ari for a local feel, Sathorn for business proximity.',
  transport_tip = 'Live near the BTS — a Rabbit card covers Skytrain and MRT and skips the traffic.',
  sim_tip = 'AIS or TrueMove tourist SIMs with huge data allowances at the airport arrivals hall.',
  community_tip = 'Bangkok Nomads & Expats — condo tips, visa-run advice and daily coworking meetups.',
  updated_at = now()
where country = 'Thailand';

update relocation_country_guides set
  city_slug = 'tbilisi',
  settle_cards = '[
    {"tag":"Neighbourhoods","title":"Where to base yourself","body":"Vera & Sololaki for cafés and walkability, Vake for green calm, Old Town for character."},
    {"tag":"Getting around","title":"Metro, marshrutkas & Bolt","body":"The metro is cents per ride; Bolt rides across town rarely cost more than a few dollars."},
    {"tag":"Connectivity","title":"Magti or Silknet SIM","body":"Cheap, fast data with easy top-ups — sorted within minutes of landing."},
    {"tag":"Community","title":"Tbilisi Nomads","body":"Tight-knit and welcoming, with flat listings, language tips and weekend trip groups."}
  ]'::jsonb,
  neighborhoods_tip = 'Vera & Sololaki for cafés and walkability, Vake for green calm, Old Town for character.',
  transport_tip = 'Metro is cents per ride; Bolt rides across town rarely cost more than a few dollars.',
  sim_tip = 'Magti or Silknet SIM — cheap, fast data with easy top-ups within minutes of landing.',
  community_tip = 'Tbilisi Nomads — flat listings, language tips and weekend trip groups.',
  updated_at = now()
where country = 'Georgia';

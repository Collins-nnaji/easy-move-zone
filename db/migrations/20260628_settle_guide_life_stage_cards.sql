-- Append age/life-stage settle cards (matches app/move/data.ts SETTLE additions)
-- for all 12 /move destinations. Full settle_cards replace per country since the
-- column is the authoritative array, not merged with the static fallback.

update relocation_country_guides set
  settle_cards = '[
    {"tag":"Neighbourhoods","title":"Where to base yourself","body":"Príncipe Real for cafés, Alcântara for value, Estrela for families and green space."},
    {"tag":"Getting around","title":"Metro, trams & a Navegante card","body":"A monthly Navegante pass is €40 and covers metro, bus and tram across the city."},
    {"tag":"Connectivity","title":"SIM in 10 minutes","body":"Grab a MEO or Vodafone prepaid SIM at the airport — generous data, no contract."},
    {"tag":"Community","title":"Lisbon Digital Nomads","body":"14k-member group with weekly meetups, a housing channel and a newcomer onboarding thread."},
    {"tag":"Families & minors","title":"Free public schooling once registered","body":"EU rules make enrolling kids in public school straightforward; non-EU dependents are added directly to your D7/D8 residency application."},
    {"tag":"Students (18–25)","title":"Student residence permit","body":"Enrol at a Portuguese university or language school, then apply for a renewable student residence permit each academic year."},
    {"tag":"Working age (26–54)","title":"D8 income threshold","body":"The freelance/remote route (D8) needs proof of roughly €3,280/month in foreign income — budget for slow notary and AIMA appointment queues."},
    {"tag":"Retirees (55+)","title":"D7 passive-income visa","body":"Built for pensions and passive income rather than salaries — show steady foreign income and a place to live, then renew yearly toward permanent residency."}
  ]'::jsonb,
  updated_at = now()
where country = 'Portugal';

update relocation_country_guides set
  settle_cards = '[
    {"tag":"Neighbourhoods","title":"Where to base yourself","body":"Roma Norte & Condesa for walkability, Coyoacán for charm, Polanco for upscale calm."},
    {"tag":"Getting around","title":"Metro, Metrobús & apps","body":"A rechargeable Movilidad Integrada card works across metro and Metrobús; ride-hail is cheap."},
    {"tag":"Connectivity","title":"Telcel or AT&T SIM","body":"Cheap prepaid data everywhere; Telcel has the widest coverage outside the city too."},
    {"tag":"Community","title":"CDMX Expats & Nomads","body":"Active community with neighbourhood guides, Spanish-exchange nights and a trusted-services list."},
    {"tag":"Families & minors","title":"Schools and paperwork","body":"Bilingual private schools are common in Roma, Condesa and Polanco; public enrolment needs a CURP, which dependents get once your residency is filed."},
    {"tag":"Students (18–25)","title":"Student visa via enrolment","body":"A consulate-issued student visa needs an acceptance letter from an accredited institution, then converts to a local resident card on arrival."},
    {"tag":"Working age (26–54)","title":"Temporary Resident Visa","body":"Apply at a Mexican consulate abroad with proof of income or savings — it generally can''t be converted from a tourist stay inside the country."},
    {"tag":"Retirees (55+)","title":"Comfortable on a fixed income","body":"A modest pension or savings balance comfortably clears the income threshold for temporary residency, renewing toward permanent status after 4 years."}
  ]'::jsonb,
  updated_at = now()
where country = 'Mexico';

update relocation_country_guides set
  settle_cards = '[
    {"tag":"Neighbourhoods","title":"Where to base yourself","body":"Thonglor & Ekkamai for nomads, Ari for a local feel, Sathorn for business proximity."},
    {"tag":"Getting around","title":"Live near the BTS","body":"The Skytrain and MRT skip the traffic — a Rabbit card makes both seamless."},
    {"tag":"Connectivity","title":"AIS or TrueMove SIM","body":"Tourist SIMs with huge data allowances are sold right at the airport arrivals hall."},
    {"tag":"Community","title":"Bangkok Nomads & Expats","body":"One of Asia''s biggest scenes — condo tips, visa-run advice and daily coworking meetups."},
    {"tag":"Families & minors","title":"International schools","body":"30+ international schools cover IB, British and American curricula; a Non-O extension for the family of a worker or retiree covers dependents."},
    {"tag":"Students (18–25)","title":"Education visa","body":"An ED visa ties to enrolment at an accredited school or language institute and is renewable each term."},
    {"tag":"Working age (26–54)","title":"DTV for remote workers","body":"The Destination Thailand Visa (DTV) is the easiest route if you freelance or work remotely — no employer sponsorship needed."},
    {"tag":"Retirees (55+)","title":"Retirement visa","body":"Available from age 50, with a fixed deposit in a Thai bank or proof of monthly income — renewable annually, with private health insurance required."}
  ]'::jsonb,
  updated_at = now()
where country = 'Thailand';

update relocation_country_guides set
  settle_cards = '[
    {"tag":"Neighbourhoods","title":"Where to base yourself","body":"Vera & Sololaki for cafés and walkability, Vake for green calm, Old Town for character."},
    {"tag":"Getting around","title":"Metro, marshrutkas & Bolt","body":"The metro is cents per ride; Bolt rides across town rarely cost more than a few dollars."},
    {"tag":"Connectivity","title":"Magti or Silknet SIM","body":"Cheap, fast data with easy top-ups — sorted within minutes of landing."},
    {"tag":"Community","title":"Tbilisi Nomads","body":"Tight-knit and welcoming, with flat listings, language tips and weekend trip groups."},
    {"tag":"Families & minors","title":"Schools are limited but improving","body":"Only a handful of international schools in the city — shortlist and apply early if you''re moving with kids."},
    {"tag":"Students (18–25)","title":"Study at a local university","body":"Tuition is low by international standards, and a student residence permit is straightforward to arrange through your university."},
    {"tag":"Working age (26–54)","title":"Remotely from Georgia","body":"The remote-work program needs only proof of foreign income and a clean record — one of the fastest approvals on this list."},
    {"tag":"Retirees (55+)","title":"Light-touch residency","body":"No dedicated retirement visa, but a residence permit via property ownership or passive income is simple and affordable to maintain."}
  ]'::jsonb,
  updated_at = now()
where country = 'Georgia';

update relocation_country_guides set
  settle_cards = '[
    {"tag":"Neighbourhoods","title":"Where to base yourself","body":"Prenzlauer Berg for families, Kreuzberg & Neukölln for nightlife and value, Charlottenburg for calm."},
    {"tag":"Getting around","title":"BVG monthly pass","body":"A monthly BVG ticket is €58 and covers U-Bahn, S-Bahn, trams and buses across the city."},
    {"tag":"Connectivity","title":"Telekom or O2 SIM","body":"Prepaid SIMs are widely available at kiosks and electronics stores, no contract needed."},
    {"tag":"Community","title":"Berlin Expats & Freelancers","body":"Regular meetups, Stammtisch nights and an active housing-tips channel for newcomers."},
    {"tag":"Families & minors","title":"Kindergeld & free schooling","body":"Registered residents with kids can claim Kindergeld (child benefit), and state schools are free — though German-language support varies by district."},
    {"tag":"Students (18–25)","title":"Student visa & blocked account","body":"Non-EU students need a university acceptance letter and a blocked account (roughly €11,900/year) to prove they can support themselves."},
    {"tag":"Working age (26–54)","title":"Freiberufler route","body":"The freelance visa needs client letters and a German tax number (Steuer-ID) — budget weeks, not days, for Bürgeramt appointments."},
    {"tag":"Retirees (55+)","title":"Health insurance is the gatekeeper","body":"Pension income alone doesn''t grant residency outside EU family ties — most retirees here use a separate income- and insurance-based permit."}
  ]'::jsonb,
  updated_at = now()
where country = 'Germany';

update relocation_country_guides set
  settle_cards = '[
    {"tag":"Neighbourhoods","title":"Where to base yourself","body":"Palermo for nomads and nightlife, Recoleta for elegance, Belgrano for families and green space."},
    {"tag":"Getting around","title":"SUBE card","body":"One card covers subte, buses and trains — rides cost cents thanks to local subsidies."},
    {"tag":"Connectivity","title":"Personal or Movistar SIM","body":"Cheap prepaid data plans available at any kiosko, no paperwork required."},
    {"tag":"Community","title":"Buenos Aires Nomads & Expats","body":"Language exchanges, asado meetups and a trusted-services list for newcomers."},
    {"tag":"Families & minors","title":"Bilingual schools cluster centrally","body":"Palermo, Recoleta and Belgrano have the strongest bilingual private school options; public schools are free but Spanish-only."},
    {"tag":"Students (18–25)","title":"Student visa via enrolment","body":"A university or accredited course acceptance letter supports a renewable student residency category."},
    {"tag":"Working age (26–54)","title":"Rentista or digital nomad route","body":"Show steady foreign income for the Rentista visa, or use the dedicated nomad visa if you''re fully remote — both renew toward permanent residency."},
    {"tag":"Retirees (55+)","title":"Pensionado residency","body":"A specific pensionado category exists for stable foreign pension income, with a comparatively fast approval process."}
  ]'::jsonb,
  updated_at = now()
where country = 'Argentina';

update relocation_country_guides set
  settle_cards = '[
    {"tag":"Neighbourhoods","title":"Where to base yourself","body":"Shibuya & Shimokitazawa for energy, Kichijoji for families, Nakameguro for a quieter base."},
    {"tag":"Getting around","title":"Suica or Pasmo IC card","body":"Tap onto every train, subway and bus across the metro — no tickets needed."},
    {"tag":"Connectivity","title":"Pocket wifi or a Mobal SIM","body":"Easiest to order a rental pocket wifi or SIM online before you arrive."},
    {"tag":"Community","title":"Tokyo Foreign Residents & Nomads","body":"Language-exchange meetups and an active visa-questions thread."},
    {"tag":"Families & minors","title":"Long waitlists, plan early","body":"International schools are excellent but oversubscribed — apply 6–12 months ahead; dependents join on a Dependent visa tied to your status."},
    {"tag":"Students (18–25)","title":"Student visa via a school","body":"Language schools and universities sponsor a Certificate of Eligibility, which converts into a student residence card on arrival."},
    {"tag":"Working age (26–54)","title":"Employer sponsorship is the norm","body":"Most working-age movers need a Certificate of Eligibility from a Japanese employer — the digital nomad visa is a 6-month alternative for the self-employed."},
    {"tag":"Retirees (55+)","title":"No dedicated retiree visa","body":"Japan has no long-stay retirement visa — most retirees here are on a spouse, dependent or long-term resident status instead."}
  ]'::jsonb,
  updated_at = now()
where country = 'Japan';

update relocation_country_guides set
  settle_cards = '[
    {"tag":"Neighbourhoods","title":"Where to base yourself","body":"Sea Point & Green Point for nomads, Constantia for families, Woodstock for an arty, central base."},
    {"tag":"Getting around","title":"MyCiTi & ride-hail apps","body":"MyCiTi bus rapid transit covers the city bowl; ride-hail apps are the norm beyond that."},
    {"tag":"Connectivity","title":"Vodacom or MTN SIM","body":"Strong fibre backup keeps you online through loadshedding power cuts."},
    {"tag":"Community","title":"Cape Town Digital Nomads","body":"Power-cut tips, area safety advice and a weekly co-working meetup."},
    {"tag":"Families & minors","title":"Strong but mixed-quality schools","body":"Private schools are excellent and good value by international standards; safety and area choice matter more than in most cities on this list."},
    {"tag":"Students (18–25)","title":"Study visa via a university","body":"A study visa needs an offer letter from an accredited institution plus proof of funds, renewed annually."},
    {"tag":"Working age (26–54)","title":"Remote Work Visa or critical skills","body":"The dedicated Remote Work Visa suits foreign-income earners; the critical skills list is the route for local employment."},
    {"tag":"Retirees (55+)","title":"Retired person visa","body":"A specific retired person visa exists for those with a guaranteed pension or passive income above a set threshold — no upper age limit."}
  ]'::jsonb,
  updated_at = now()
where country = 'South Africa';

update relocation_country_guides set
  settle_cards = '[
    {"tag":"Neighbourhoods","title":"Where to base yourself","body":"Dubai Marina & JLT for nomads, Jumeirah for families, Downtown for business proximity."},
    {"tag":"Getting around","title":"Nol card","body":"One card covers the Metro, tram and buses — fast, clean and air-conditioned."},
    {"tag":"Connectivity","title":"Etisalat or du SIM","body":"Available at the airport with generous data bundles from day one."},
    {"tag":"Community","title":"Dubai Expats & Remote Workers","body":"Visa-run advice, networking events and an active housing channel."},
    {"tag":"Families & minors","title":"Sponsor your dependents","body":"Once on a residence visa, you can sponsor a spouse and children — international school fees are a major budget line, with 40+ schools to choose from."},
    {"tag":"Students (18–25)","title":"Student visa via a university","body":"UAE universities sponsor a student residence visa for enrolled students, renewable each academic year."},
    {"tag":"Working age (26–54)","title":"Virtual Working Programme or employment visa","body":"Freelancers and remote employees use the Virtual Working Programme; most others need employer sponsorship for a standard employment visa."},
    {"tag":"Retirees (55+)","title":"Retirement visa from age 55","body":"A 5-year retirement visa is available from age 55 with proof of savings, income or property ownership in the UAE."}
  ]'::jsonb,
  updated_at = now()
where country = 'United Arab Emirates';

update relocation_country_guides set
  settle_cards = '[
    {"tag":"Neighbourhoods","title":"Where to base yourself","body":"King West & The Annex for nomads, North York for families, Leslieville for a quieter, leafy base."},
    {"tag":"Getting around","title":"PRESTO card","body":"One card covers TTC subway, streetcars and buses across the city."},
    {"tag":"Connectivity","title":"Freedom Mobile or Rogers SIM","body":"Prepaid SIMs are widely available at any mall kiosk."},
    {"tag":"Community","title":"Toronto Newcomers & Nomads","body":"Settlement-service tips, networking meetups and a housing-search thread."},
    {"tag":"Families & minors","title":"Strong public schools, no fees","body":"Public education is free and well-regarded; international schools are rare because the public system covers most needs."},
    {"tag":"Students (18–25)","title":"Study permit via a school","body":"A study permit needs acceptance at a designated learning institution and proof of funds — many graduates transition to a post-graduation work permit."},
    {"tag":"Working age (26–54)","title":"Express Entry favours this age band","body":"The points-based Express Entry system weights age heavily — applicants under 35 score highest, directly boosting PR chances."},
    {"tag":"Retirees (55+)","title":"No dedicated retirement stream","body":"Canada has no specific retiree visa; most retirees arrive via family sponsorship or a 6-month visitor stay, renewed periodically."}
  ]'::jsonb,
  updated_at = now()
where country = 'Canada';

update relocation_country_guides set
  settle_cards = '[
    {"tag":"Neighbourhoods","title":"Where to base yourself","body":"Surry Hills & Newtown for nomads, North Shore for families, Bondi for a beach-first lifestyle."},
    {"tag":"Getting around","title":"Opal card","body":"One card covers trains, buses, ferries and light rail across greater Sydney."},
    {"tag":"Connectivity","title":"Telstra or Optus SIM","body":"Strong coverage even outside the city centre, easy to top up."},
    {"tag":"Community","title":"Sydney Backpackers & Nomads","body":"Working-holiday tips, share-house listings and weekend meetups."},
    {"tag":"Families & minors","title":"Zoned public schools","body":"Public schools are zoned by home address and generally strong; private and selective schools have competitive entry exams."},
    {"tag":"Students (18–25)","title":"Student visa via enrolment","body":"A student visa needs confirmed enrolment at a registered institution and proof of funds — many stay on for post-study work rights."},
    {"tag":"Working age (26–54)","title":"Working Holiday or skilled migration","body":"Ages 18–35 (sometimes 30) can use the Working Holiday visa for up to 12 months; older or longer-term movers need the points-tested skilled migration route."},
    {"tag":"Retirees (55+)","title":"Limited long-stay options","body":"Australia has no retirement-specific visa for most nationalities — long stays beyond a visitor visa generally need a family or partner sponsorship route."}
  ]'::jsonb,
  updated_at = now()
where country = 'Australia';

update relocation_country_guides set
  settle_cards = '[
    {"tag":"Neighbourhoods","title":"Where to base yourself","body":"Tiong Bahru & Kampong Glam for nomads, Bukit Timah for families, Orchard for central convenience."},
    {"tag":"Getting around","title":"EZ-Link card","body":"Taps onto the MRT, buses and most taxis — fast and air-conditioned throughout."},
    {"tag":"Connectivity","title":"Singtel or StarHub SIM","body":"Sold at the airport with generous high-speed data from arrival."},
    {"tag":"Community","title":"Singapore Expats & Nomads","body":"Visa-pass guidance, networking events and a condo-hunting channel."},
    {"tag":"Families & minors","title":"Plan school applications early","body":"International schools are plentiful but have long waitlists and high fees — apply well before relocating with kids; dependents join on a Dependant''s Pass."},
    {"tag":"Students (18–25)","title":"Student Pass via enrolment","body":"A Student Pass needs acceptance at an approved institution, sponsored by the school once you''ve been issued an In-Principle Approval."},
    {"tag":"Working age (26–54)","title":"Employment Pass is the standard route","body":"Most working-age professionals need an employer-sponsored Employment Pass, assessed against a points-based framework (COMPASS)."},
    {"tag":"Retirees (55+)","title":"No retirement visa","body":"Singapore has no dedicated retirement visa — long-term stays for retirees are rare without a Dependant''s Pass tied to a working family member."}
  ]'::jsonb,
  updated_at = now()
where country = 'Singapore';

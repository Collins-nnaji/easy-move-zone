-- Starter curated visa requirement templates. 'ANY' nationality rows are the
-- wildcard fallback used when there's no exact nationality match yet.
-- Content adapted from the archived relocation_country_guides visa summaries.

insert into visa_requirement_templates (
  nationality, destination_country, visa_type, visa_type_label, summary,
  required_documents, checklist_template, processing_time_estimate, fee_estimate,
  validity_notes, source, last_verified_at
) values
(
  'ANY', 'United Kingdom', 'tourist', 'Standard Visitor visa',
  'Most non-visa-national visitors need a Standard Visitor visa before travel to the UK for tourism, visiting family, or short business trips. Apply online and attend a biometric appointment at a visa application centre.',
  '[
    {"documentType":"passport","label":"Valid passport","description":"Must have at least one blank page and be valid for your whole stay.","mandatory":true},
    {"documentType":"photo","label":"Passport photo","description":"Recent digital photo meeting UK visa photo requirements.","mandatory":true},
    {"documentType":"bank_statement","label":"Proof of funds","description":"Bank statements showing you can support yourself during the trip.","mandatory":true},
    {"documentType":"itinerary","label":"Travel itinerary","description":"Flight bookings and accommodation details.","mandatory":true},
    {"documentType":"employment_letter","label":"Proof of ties to home country","description":"Employment or study letter showing intent to return.","mandatory":false}
  ]'::jsonb,
  '[
    {"title":"Complete the online visa application form","category":"application_form","description":"","sortOrder":0},
    {"title":"Pay the visa fee","category":"fee_payment","description":"","sortOrder":1},
    {"title":"Book a biometric appointment","category":"appointment","description":"","sortOrder":2},
    {"title":"Gather passport, photo, and proof of funds","category":"documentation","description":"","sortOrder":3},
    {"title":"Attend biometric enrolment","category":"biometrics","description":"","sortOrder":4}
  ]'::jsonb,
  'Typically 3 weeks',
  'From £115',
  'Standard Visitor visas are usually valid for up to 6 months from the date of travel.',
  'curated', now()
),
(
  'ANY', 'United States', 'tourist', 'B1/B2 Visitor visa',
  'Most visitors from countries without a visa waiver arrangement need a B1/B2 visa for tourism or business visits. This requires a DS-160 form and an in-person interview at a US embassy or consulate.',
  '[
    {"documentType":"passport","label":"Valid passport","description":"Valid for at least 6 months beyond your intended stay.","mandatory":true},
    {"documentType":"photo","label":"Visa photo","description":"Recent photo meeting US visa photo requirements.","mandatory":true},
    {"documentType":"bank_statement","label":"Proof of funds","description":"Evidence you can cover the cost of your trip.","mandatory":true},
    {"documentType":"employment_letter","label":"Proof of ties to home country","description":"Employment, property, or family ties showing intent to return.","mandatory":true},
    {"documentType":"itinerary","label":"Travel plans","description":"Purpose and itinerary of the trip.","mandatory":false}
  ]'::jsonb,
  '[
    {"title":"Complete the DS-160 form online","category":"application_form","description":"","sortOrder":0},
    {"title":"Pay the MRV application fee","category":"fee_payment","description":"","sortOrder":1},
    {"title":"Schedule the visa interview","category":"appointment","description":"","sortOrder":2},
    {"title":"Gather supporting financial and ties documents","category":"documentation","description":"","sortOrder":3},
    {"title":"Attend the consular interview","category":"interview","description":"","sortOrder":4}
  ]'::jsonb,
  'Varies by embassy — check current wait times',
  'From $185',
  'B1/B2 visas are typically issued for multiple entries, but each stay is limited by the officer at entry (usually up to 6 months).',
  'curated', now()
),
(
  'ANY', 'Canada', 'work', 'Work permit',
  'Most foreign nationals need a work permit to work in Canada, usually tied to a specific employer via a Labour Market Impact Assessment (LMIA) or an LMIA-exempt category.',
  '[
    {"documentType":"passport","label":"Valid passport","description":"","mandatory":true},
    {"documentType":"employment_letter","label":"Job offer letter","description":"Offer of employment from a Canadian employer, with an LMIA number if required.","mandatory":true},
    {"documentType":"photo","label":"Digital photo","description":"","mandatory":true},
    {"documentType":"bank_statement","label":"Proof of funds","description":"Evidence you can support yourself and any accompanying family.","mandatory":false}
  ]'::jsonb,
  '[
    {"title":"Confirm employer has LMIA (if required)","category":"documentation","description":"","sortOrder":0},
    {"title":"Complete the work permit application","category":"application_form","description":"","sortOrder":1},
    {"title":"Pay the work permit fee","category":"fee_payment","description":"","sortOrder":2},
    {"title":"Submit biometrics if required","category":"biometrics","description":"","sortOrder":3}
  ]'::jsonb,
  'Varies widely by country of application',
  'From CAD $155',
  'Work permits are usually tied to the job offer duration and employer named on the permit.',
  'curated', now()
)
on conflict (nationality, destination_country, visa_type) do update set
  visa_type_label = excluded.visa_type_label,
  summary = excluded.summary,
  required_documents = excluded.required_documents,
  checklist_template = excluded.checklist_template,
  processing_time_estimate = excluded.processing_time_estimate,
  fee_estimate = excluded.fee_estimate,
  validity_notes = excluded.validity_notes,
  source = excluded.source,
  last_verified_at = excluded.last_verified_at,
  updated_at = now();

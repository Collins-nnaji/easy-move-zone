-- Starter embassy directory entries. Admin-curated only — contact details are
-- sourced from official government sites, not AI-generated (wrong addresses or
-- phone numbers for consular services are actively harmful). Verify and expand
-- via /admin/embassies over time.
--
-- Sources (checked July 2026):
--   US Embassy London:        https://uk.usembassy.gov/contact/
--   British Embassy Wash. DC: https://www.gov.uk/world/organisations/british-embassy-washington
--   Canadian High Comm. London: https://www.international.gc.ca/country-pays/united_kingdom-royaume_uni/london-londres.aspx
--   US Embassy Abuja:         https://ng.usembassy.gov/contact/

insert into embassies (
  country, located_in_country, mission_type, city, address, phone, email,
  website, appointment_booking_url, jurisdiction_notes, operating_hours, services
) values
(
  'United States', 'United Kingdom', 'embassy', 'London',
  '33 Nine Elms Lane, London, SW11 7US',
  '+44 20 7499 9000', null,
  'https://uk.usembassy.gov/', 'https://www.ustraveldocs.com/uk/',
  'Serves visa and citizen services applicants across the United Kingdom.',
  'Monday to Friday, 8:30am to 5:00pm',
  '["visa_applications", "passport_services", "notarial_services"]'::jsonb
),
(
  'United Kingdom', 'United States', 'embassy', 'Washington, D.C.',
  '3100 Massachusetts Avenue NW, Washington, DC 20008',
  '+1 202-588-6500', null,
  'https://www.gov.uk/world/usa', null,
  'Serves UK visa and consular enquiries for residents of the United States.',
  null,
  '["visa_applications", "passport_services"]'::jsonb
),
(
  'Canada', 'United Kingdom', 'embassy', 'London',
  'Canada House, Trafalgar Square, London, SW1Y 5BJ',
  '+44 20 7004 6000', 'london.consular@international.gc.ca',
  'https://www.international.gc.ca/country-pays/united_kingdom-royaume_uni/london-londres.aspx', null,
  'High Commission of Canada, serving the United Kingdom.',
  null,
  '["visa_applications", "passport_services", "notarial_services"]'::jsonb
),
(
  'United States', 'Nigeria', 'embassy', 'Abuja',
  'Plot 1075 Diplomatic Drive, Central District Area, Abuja',
  '+234 209 461 4000', 'AbujaACS@state.gov',
  'https://ng.usembassy.gov/', 'https://www.ustraveldocs.com/ng/',
  'Serves visa and citizen services applicants across Nigeria.',
  'Monday to Friday, by appointment',
  '["visa_applications", "passport_services", "notarial_services"]'::jsonb
);

-- Small demo data set for CRM flows.
-- Run after db/migrations/20260309_crm_core.sql.

insert into crm_users (id, auth_user_id, full_name, email, phone)
values
  ('0d2f7836-55bd-4b7e-9f4d-6f193fa57111', 'auth_u_001', 'Ava Martinez', 'ava@acmecrm.dev', '+15550000001'),
  ('19e39f82-64cc-4e6e-a0c6-7e1559d6f222', 'auth_u_002', 'Noah Campbell', 'noah@acmecrm.dev', '+15550000002'),
  ('2b6141e6-5d5f-432d-8a0f-3eaef1d09333', 'auth_u_003', 'Mia Johnson', 'mia@acmecrm.dev', '+15550000003')
on conflict (id) do nothing;

insert into crm_roles (id, role_key, label)
values
  ('ce4a4c6f-71ac-4cc6-b7bf-624575330001', 'admin', 'Administrator'),
  ('ce4a4c6f-71ac-4cc6-b7bf-624575330002', 'sales_manager', 'Sales Manager'),
  ('ce4a4c6f-71ac-4cc6-b7bf-624575330003', 'sales_rep', 'Sales Representative'),
  ('ce4a4c6f-71ac-4cc6-b7bf-624575330004', 'client', 'Client User')
on conflict (id) do nothing;

insert into crm_user_roles (id, user_id, role_id)
values
  ('cf5b2f4a-8d06-4f8a-af81-232077f64001', '0d2f7836-55bd-4b7e-9f4d-6f193fa57111', 'ce4a4c6f-71ac-4cc6-b7bf-624575330001'),
  ('cf5b2f4a-8d06-4f8a-af81-232077f64002', '19e39f82-64cc-4e6e-a0c6-7e1559d6f222', 'ce4a4c6f-71ac-4cc6-b7bf-624575330002'),
  ('cf5b2f4a-8d06-4f8a-af81-232077f64003', '2b6141e6-5d5f-432d-8a0f-3eaef1d09333', 'ce4a4c6f-71ac-4cc6-b7bf-624575330003')
on conflict (id) do nothing;

insert into prospects (
  id, first_name, last_name, company_name, email, phone, source, lifecycle, score, owner_user_id, notes, last_contacted_at
)
values
  ('aa0a94d9-b835-445a-9b25-c1fdf6cb1001', 'Liam', 'Baker', 'Northstar Labs', 'liam@northstarlabs.io', '+15551111101', 'website', 'qualified', 74, '0d2f7836-55bd-4b7e-9f4d-6f193fa57111', 'Interested in annual plan and onboarding support.', now() - interval '1 day'),
  ('aa0a94d9-b835-445a-9b25-c1fdf6cb1002', 'Emma', 'Morris', 'Pioneer Freight', 'emma@pioneerfreight.com', '+15551111102', 'referral', 'proposal', 86, '19e39f82-64cc-4e6e-a0c6-7e1559d6f222', 'Requested pricing comparison against current vendor.', now() - interval '2 days'),
  ('aa0a94d9-b835-445a-9b25-c1fdf6cb1003', 'Lucas', 'Perez', 'Veridian Health', 'lucas@veridianhealth.org', '+15551111103', 'cold_email', 'new', 35, '0d2f7836-55bd-4b7e-9f4d-6f193fa57111', 'Replied once, then went quiet.', now() - interval '10 days'),
  ('aa0a94d9-b835-445a-9b25-c1fdf6cb1004', 'Sophia', 'Nguyen', 'Summit Staffing', 'sophia@summitstaffing.net', '+15551111104', 'linkedin', 'qualified', 68, '2b6141e6-5d5f-432d-8a0f-3eaef1d09333', 'Need multi-user access and SMS reminders.', now() - interval '3 days'),
  ('aa0a94d9-b835-445a-9b25-c1fdf6cb1005', 'Ethan', 'Rivera', 'Byte Harbor', 'ethan@byteharbor.dev', '+15551111105', 'conference', 'proposal', 80, '2b6141e6-5d5f-432d-8a0f-3eaef1d09333', 'Security questionnaire in progress.', now() - interval '1 day'),
  ('aa0a94d9-b835-445a-9b25-c1fdf6cb1006', 'Olivia', 'White', 'Maple Retail', 'olivia@mapleretail.co', '+15551111106', 'website', 'lost', 52, '19e39f82-64cc-4e6e-a0c6-7e1559d6f222', 'Budget freeze until next quarter.', now() - interval '20 days'),
  ('aa0a94d9-b835-445a-9b25-c1fdf6cb1007', 'Mason', 'Ward', 'Orbit Legal', 'mason@orbitlegal.com', '+15551111107', 'referral', 'new', 41, '0d2f7836-55bd-4b7e-9f4d-6f193fa57111', 'Needs migration timeline estimate.', now() - interval '6 days'),
  ('aa0a94d9-b835-445a-9b25-c1fdf6cb1008', 'Isabella', 'Collins', 'Bluefin Design', 'isabella@bluefindesign.co', '+15551111108', 'website', 'won', 93, '19e39f82-64cc-4e6e-a0c6-7e1559d6f222', 'Closed with 2-year term.', now() - interval '5 hours')
on conflict (id) do nothing;

insert into clients (
  id, prospect_id, company_name, primary_contact_name, primary_contact_email, primary_contact_phone, lifecycle, owner_user_id, arr_usd, renewal_date, notes, last_contacted_at
)
values
  ('bb0b4d06-65a7-4050-b3bd-8b1e4dd21001', 'aa0a94d9-b835-445a-9b25-c1fdf6cb1008', 'Bluefin Design', 'Isabella Collins', 'isabella@bluefindesign.co', '+15551111108', 'won', '19e39f82-64cc-4e6e-a0c6-7e1559d6f222', 42000, current_date + interval '11 months', 'Great fit for advanced reporting.', now() - interval '5 hours'),
  ('bb0b4d06-65a7-4050-b3bd-8b1e4dd21002', null, 'Aster Manufacturing', 'Daniel Reed', 'daniel@astermfg.com', '+15552220001', 'won', '0d2f7836-55bd-4b7e-9f4d-6f193fa57111', 72000, current_date + interval '8 months', 'Asks for monthly usage recap by email.', now() - interval '2 days'),
  ('bb0b4d06-65a7-4050-b3bd-8b1e4dd21003', null, 'Harbor Schools', 'Priya Nair', 'priya@harborschools.edu', '+15552220002', 'won', '2b6141e6-5d5f-432d-8a0f-3eaef1d09333', 31000, current_date + interval '5 months', 'Primary contact prefers SMS for urgent notices.', now() - interval '4 days')
on conflict (id) do nothing;

insert into communication_threads (
  id, subject, channel, prospect_id, client_id, status, created_by_user_id, last_message_at
)
values
  ('cc0c9f1d-f4e7-4f13-b9df-5fef76cd3001', 'Onboarding and trial setup', 'in_app', 'aa0a94d9-b835-445a-9b25-c1fdf6cb1001', null, 'open', '0d2f7836-55bd-4b7e-9f4d-6f193fa57111', now() - interval '20 hours'),
  ('cc0c9f1d-f4e7-4f13-b9df-5fef76cd3002', 'Proposal follow-up', 'email', 'aa0a94d9-b835-445a-9b25-c1fdf6cb1002', null, 'open', '19e39f82-64cc-4e6e-a0c6-7e1559d6f222', now() - interval '1 day'),
  ('cc0c9f1d-f4e7-4f13-b9df-5fef76cd3003', 'Security questionnaire', 'in_app', 'aa0a94d9-b835-445a-9b25-c1fdf6cb1005', null, 'open', '2b6141e6-5d5f-432d-8a0f-3eaef1d09333', now() - interval '9 hours'),
  ('cc0c9f1d-f4e7-4f13-b9df-5fef76cd3004', 'Kickoff meeting recap', 'email', null, 'bb0b4d06-65a7-4050-b3bd-8b1e4dd21001', 'open', '19e39f82-64cc-4e6e-a0c6-7e1559d6f222', now() - interval '4 hours'),
  ('cc0c9f1d-f4e7-4f13-b9df-5fef76cd3005', 'Monthly usage summary', 'email', null, 'bb0b4d06-65a7-4050-b3bd-8b1e4dd21002', 'open', '0d2f7836-55bd-4b7e-9f4d-6f193fa57111', now() - interval '2 days'),
  ('cc0c9f1d-f4e7-4f13-b9df-5fef76cd3006', 'Urgent outage alert preference', 'sms', null, 'bb0b4d06-65a7-4050-b3bd-8b1e4dd21003', 'open', '2b6141e6-5d5f-432d-8a0f-3eaef1d09333', now() - interval '4 days')
on conflict (id) do nothing;

insert into communication_participants (
  id, thread_id, user_id, external_name, external_email, external_phone, role
)
values
  ('dd0d5f4a-e7ac-4ba6-9081-3f3a31ad4001', 'cc0c9f1d-f4e7-4f13-b9df-5fef76cd3001', '0d2f7836-55bd-4b7e-9f4d-6f193fa57111', null, null, null, 'internal'),
  ('dd0d5f4a-e7ac-4ba6-9081-3f3a31ad4002', 'cc0c9f1d-f4e7-4f13-b9df-5fef76cd3001', null, 'Liam Baker', 'liam@northstarlabs.io', '+15551111101', 'prospect'),
  ('dd0d5f4a-e7ac-4ba6-9081-3f3a31ad4003', 'cc0c9f1d-f4e7-4f13-b9df-5fef76cd3002', '19e39f82-64cc-4e6e-a0c6-7e1559d6f222', null, null, null, 'internal'),
  ('dd0d5f4a-e7ac-4ba6-9081-3f3a31ad4004', 'cc0c9f1d-f4e7-4f13-b9df-5fef76cd3002', null, 'Emma Morris', 'emma@pioneerfreight.com', '+15551111102', 'prospect'),
  ('dd0d5f4a-e7ac-4ba6-9081-3f3a31ad4005', 'cc0c9f1d-f4e7-4f13-b9df-5fef76cd3004', '19e39f82-64cc-4e6e-a0c6-7e1559d6f222', null, null, null, 'internal'),
  ('dd0d5f4a-e7ac-4ba6-9081-3f3a31ad4006', 'cc0c9f1d-f4e7-4f13-b9df-5fef76cd3004', null, 'Isabella Collins', 'isabella@bluefindesign.co', '+15551111108', 'client'),
  ('dd0d5f4a-e7ac-4ba6-9081-3f3a31ad4007', 'cc0c9f1d-f4e7-4f13-b9df-5fef76cd3006', '2b6141e6-5d5f-432d-8a0f-3eaef1d09333', null, null, null, 'internal'),
  ('dd0d5f4a-e7ac-4ba6-9081-3f3a31ad4008', 'cc0c9f1d-f4e7-4f13-b9df-5fef76cd3006', null, 'Priya Nair', null, '+15552220002', 'client')
on conflict (id) do nothing;

insert into communication_messages (
  id, thread_id, sender_participant_id, direction, body, metadata, is_read, created_at
)
values
  ('ee0e3c1f-7f3c-4110-8f4a-2a04fef85001', 'cc0c9f1d-f4e7-4f13-b9df-5fef76cd3001', 'dd0d5f4a-e7ac-4ba6-9081-3f3a31ad4001', 'outbound', 'Happy to help set up your trial. Can we schedule a kickoff tomorrow?', '{"channel":"in_app"}', true, now() - interval '22 hours'),
  ('ee0e3c1f-7f3c-4110-8f4a-2a04fef85002', 'cc0c9f1d-f4e7-4f13-b9df-5fef76cd3001', 'dd0d5f4a-e7ac-4ba6-9081-3f3a31ad4002', 'inbound', 'Tomorrow works. We need SSO setup guidance as well.', '{"channel":"in_app"}', false, now() - interval '20 hours'),
  ('ee0e3c1f-7f3c-4110-8f4a-2a04fef85003', 'cc0c9f1d-f4e7-4f13-b9df-5fef76cd3002', 'dd0d5f4a-e7ac-4ba6-9081-3f3a31ad4003', 'outbound', 'Checking whether you had a chance to review the proposal deck.', '{"channel":"email","subject":"Proposal follow-up"}', true, now() - interval '27 hours'),
  ('ee0e3c1f-7f3c-4110-8f4a-2a04fef85004', 'cc0c9f1d-f4e7-4f13-b9df-5fef76cd3004', 'dd0d5f4a-e7ac-4ba6-9081-3f3a31ad4006', 'inbound', 'Thanks for the recap. Please add our finance lead to billing emails.', '{"channel":"email","subject":"Re: Kickoff meeting recap"}', false, now() - interval '4 hours'),
  ('ee0e3c1f-7f3c-4110-8f4a-2a04fef85005', 'cc0c9f1d-f4e7-4f13-b9df-5fef76cd3006', 'dd0d5f4a-e7ac-4ba6-9081-3f3a31ad4007', 'outbound', 'For urgent alerts we can send SMS. Confirm this number ends in 2002?', '{"channel":"sms"}', true, now() - interval '4 days'),
  ('ee0e3c1f-7f3c-4110-8f4a-2a04fef85006', 'cc0c9f1d-f4e7-4f13-b9df-5fef76cd3006', 'dd0d5f4a-e7ac-4ba6-9081-3f3a31ad4008', 'inbound', 'Confirmed. Please use SMS for high-priority incidents.', '{"channel":"sms"}', false, now() - interval '3 days 22 hours')
on conflict (id) do nothing;

insert into email_deliveries (id, message_id, provider, provider_message_id, send_status, sent_at)
values
  ('ff0f7a8b-59cc-4b32-91de-f5fed07f6001', 'ee0e3c1f-7f3c-4110-8f4a-2a04fef85003', 'resend', 'resend_msg_1001', 'sent', now() - interval '27 hours'),
  ('ff0f7a8b-59cc-4b32-91de-f5fed07f6002', 'ee0e3c1f-7f3c-4110-8f4a-2a04fef85004', 'resend', 'resend_msg_1002', 'sent', now() - interval '4 hours')
on conflict (id) do nothing;

insert into sms_deliveries (id, message_id, provider, provider_message_id, send_status, sent_at)
values
  ('ab1002ee-43ea-4a74-a5f8-b9b1ece47001', 'ee0e3c1f-7f3c-4110-8f4a-2a04fef85005', 'twilio', 'SM0001', 'sent', now() - interval '4 days'),
  ('ab1002ee-43ea-4a74-a5f8-b9b1ece47002', 'ee0e3c1f-7f3c-4110-8f4a-2a04fef85006', 'twilio', 'SM0002', 'sent', now() - interval '3 days 22 hours')
on conflict (id) do nothing;

insert into activities (id, user_id, prospect_id, client_id, title, description, activity_type, happened_at)
values
  ('ac2003f3-4e8c-46cb-b9d3-d630307a8001', '0d2f7836-55bd-4b7e-9f4d-6f193fa57111', 'aa0a94d9-b835-445a-9b25-c1fdf6cb1001', null, 'Discovery call completed', 'Discussed onboarding and SSO expectations.', 'call', now() - interval '1 day'),
  ('ac2003f3-4e8c-46cb-b9d3-d630307a8002', '19e39f82-64cc-4e6e-a0c6-7e1559d6f222', 'aa0a94d9-b835-445a-9b25-c1fdf6cb1002', null, 'Proposal sent', 'Sent 3-tier pricing model via email.', 'email', now() - interval '2 days'),
  ('ac2003f3-4e8c-46cb-b9d3-d630307a8003', '19e39f82-64cc-4e6e-a0c6-7e1559d6f222', null, 'bb0b4d06-65a7-4050-b3bd-8b1e4dd21001', 'Kickoff meeting', 'Reviewed timeline and milestones.', 'meeting', now() - interval '6 hours')
on conflict (id) do nothing;

insert into tasks (id, assignee_user_id, prospect_id, client_id, title, description, due_at, priority, status)
values
  ('ad3004d7-16d4-4ef8-b746-b4b539559001', '0d2f7836-55bd-4b7e-9f4d-6f193fa57111', 'aa0a94d9-b835-445a-9b25-c1fdf6cb1001', null, 'Send SSO setup checklist', 'Include required metadata fields.', now() + interval '1 day', 'high', 'todo'),
  ('ad3004d7-16d4-4ef8-b746-b4b539559002', '19e39f82-64cc-4e6e-a0c6-7e1559d6f222', 'aa0a94d9-b835-445a-9b25-c1fdf6cb1002', null, 'Follow up on pricing approval', 'Nudge for stakeholder sign-off.', now() + interval '2 days', 'medium', 'in_progress'),
  ('ad3004d7-16d4-4ef8-b746-b4b539559003', '2b6141e6-5d5f-432d-8a0f-3eaef1d09333', null, 'bb0b4d06-65a7-4050-b3bd-8b1e4dd21003', 'Confirm SMS escalation rules', 'Document outage and severity thresholds.', now() + interval '3 days', 'urgent', 'todo')
on conflict (id) do nothing;

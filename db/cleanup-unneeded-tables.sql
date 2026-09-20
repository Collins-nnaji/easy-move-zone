-- Cleanup for tables not used by the current logistics / marketplace app.
-- Safe to run multiple times (drop ... if exists).
--
-- KEPT (do not drop): contact_submissions, freight_quotes, public_shipments,
-- public_shipment_events, relocation_requests (admin quotes/leads),
-- driver_*/fleet_*/marketplace_* / escrow / payments / admin_users /
-- user_profiles / CRM clients+messages.
--
-- Run npm run db:setup FIRST so required tables exist before dropping the rest.

-- 1. Abandoned visa-app pivot
drop table if exists visa_checklist_items cascade;
drop table if exists visa_documents cascade;
drop table if exists visa_applications cascade;
drop table if exists visa_requirement_templates cascade;
drop table if exists embassies cascade;

-- 2. Abandoned service catalog pivot
drop table if exists service_requests cascade;
drop table if exists platform_services cascade;

-- 3. Real-estate marketplace remnants
-- `clients` / `messages` intentionally excluded (CRM).
drop table if exists property_listings cascade;
drop table if exists trusted_agents cascade;
drop table if exists city_markets cascade;
drop table if exists corporate_profiles cascade;
drop table if exists individual_profiles cascade;
drop table if exists corporate_employees cascade;
drop table if exists markets cascade;
drop table if exists corridors cascade;
drop table if exists reports cascade;
drop table if exists services cascade;
drop table if exists faqs cascade;
drop table if exists testimonials cascade;
drop table if exists team cascade;
drop table if exists "values" cascade;
drop table if exists press cascade;
drop table if exists partners cascade;
drop table if exists newsletter cascade;
drop table if exists leads cascade;
drop table if exists deliverables cascade;
drop table if exists introductions cascade;
drop table if exists intelligence_feed cascade;

-- 4. Old relocation / travel product (not the freight lead inbox)
drop table if exists community_reports cascade;
drop table if exists community_replies cascade;
drop table if exists community_topics cascade;
drop table if exists service_bookings cascade;
drop table if exists service_managers cascade;
drop table if exists move_bookings cascade;
drop table if exists move_jobs cascade;
drop table if exists move_schools cascade;
drop table if exists move_visa_services cascade;
drop table if exists move_stays cascade;
drop table if exists move_trips cascade;
drop table if exists move_destinations cascade;
drop table if exists relocation_country_guides cascade;
drop table if exists relocation_contacts cascade;
drop table if exists relocation_tasks cascade;
drop table if exists relocation_plans cascade;
drop table if exists user_saved_searches cascade;

-- 5. Agro pivot remnants (legacy names — not public_shipments)
drop table if exists price_submissions cascade;
drop table if exists commodity_prices cascade;
drop table if exists shipment_events cascade;
drop table if exists shipments cascade;
drop table if exists transporter_profiles cascade;
drop table if exists produce_listings cascade;

-- 6. Leftover property marketplace tables (older dual-product schema)
drop table if exists saved_properties cascade;
drop table if exists properties cascade;
drop table if exists enquiries cascade;
drop table if exists subscriptions cascade;
drop table if exists transactions cascade;
drop table if exists verifications cascade;

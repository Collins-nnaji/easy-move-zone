-- Cleanup for tables not used by the current (move/relocation) app.
-- Safe to run multiple times (drop ... if exists).
--
-- NOT included here: `clients` / `messages`. db/migrations/20260309_crm_core.sql
-- and the old db/platform-schema.sql both define a table named `clients` with
-- different columns ("create table if not exists" — whichever ran first won).
-- The CRM feature (app/api/crm/*) depends on its version being intact. Check
-- `\d clients` in the Neon SQL editor before touching it — dropping the wrong
-- one loses live CRM data.
--
-- Run npm run db:setup (or db/migrations/*.sql individually) FIRST to make
-- sure the tables the app actually needs exist before dropping the rest.

-- 1. Today's abandoned visa-app pivot — never wired up in the reverted app.
drop table if exists visa_checklist_items cascade;
drop table if exists visa_documents cascade;
drop table if exists visa_applications cascade;
drop table if exists visa_requirement_templates cascade;
drop table if exists embassies cascade;

-- 2. The earlier abandoned "service catalog" pivot (db/service-enabled-schema.sql).
-- Never referenced by any route in the app.
drop table if exists service_requests cascade;
drop table if exists platform_services cascade;

-- 3. Real-estate marketplace remnants (db/platform-schema.sql,
-- db/property-finder-schema.sql, db/property-platform-schema.sql,
-- db/dual-product-schema.sql). Superseded by the move/relocation product;
-- no current route reads these. `clients`/`messages` intentionally excluded
-- — see note above.
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

-- 4. Old relocation / move product (replaced by driver platform July 2026).
drop table if exists community_reports cascade;
drop table if exists community_replies cascade;
drop table if exists community_topics cascade;
drop table if exists service_bookings cascade;
drop table if exists service_managers cascade;
drop table if exists relocation_requests cascade;
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

-- 5. Agro pivot remnants
drop table if exists price_submissions cascade;
drop table if exists commodity_prices cascade;
drop table if exists shipment_events cascade;
drop table if exists shipments cascade;
drop table if exists transporter_profiles cascade;
drop table if exists produce_listings cascade;

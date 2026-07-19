-- Remove tables from the old relocation/move product (replaced by driver platform).
-- Safe to re-run. Run AFTER 20260720_driver_platform.sql on existing databases.

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

-- Retired Rekruuter/jobs, career, education and migration-planning features.
-- Applied only after a private backup; deliberately excluded from db:setup.
BEGIN;
DROP TABLE IF EXISTS
  "career"."assessment_attempts",
  "career"."assessment_badges",
  "career"."immigration_news",
  "career"."specialist_enquiries",
  "public"."education_applications",
  "public"."education_courses",
  "public"."education_universities",
  "public"."mobility_check_documents",
  "public"."mobility_check_runs",
  "public"."mobility_featured_jobs",
  "public"."rate_limit_events",
  "skilledjobs"."company_logos",
  "skilledjobs"."company_sponsor_matches",
  "skilledjobs"."cover_letters",
  "skilledjobs"."cv_documents",
  "skilledjobs"."cv_optimizations",
  "skilledjobs"."cvs",
  "skilledjobs"."job_applications",
  "skilledjobs"."job_fetch_history",
  "skilledjobs"."job_fit_requirements",
  "skilledjobs"."job_sponsor_checks",
  "skilledjobs"."jobs",
  "skilledjobs"."managed_application_items",
  "skilledjobs"."managed_application_messages",
  "skilledjobs"."managed_job_applications",
  "skilledjobs"."occupation_codes",
  "skilledjobs"."profile_boost_enquiries",
  "skilledjobs"."saved_job_urls",
  "skilledjobs"."saved_jobs",
  "skilledjobs"."sponsor_register_entries",
  "skilledjobs"."sponsor_register_lists",
  "skilledjobs"."sponsored_companies",
  "skilledjobs"."staff_companies",
  "skilledjobs"."staged_jobs",
  "skilledjobs"."url_validation_history",
  "skilledjobs"."user_skills",
  "skilledjobs"."users",
  "skilledjobs"."work_experience"
RESTRICT;
DROP SCHEMA IF EXISTS career RESTRICT;
DROP SCHEMA IF EXISTS skilledjobs RESTRICT;
COMMIT;

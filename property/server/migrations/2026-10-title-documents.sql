-- ============================================================================
-- Title and land documents ticked on the Sell form.
--
-- YOU DO NOT NORMALLY NEED TO RUN THIS. server/db.js applies the same
-- statement on every server start. Safe to run more than once.
--
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f 2026-10-title-documents.sql
-- ============================================================================

-- [{ id, name, files: [{ url, name }] }] — which papers the owner holds (C of O,
-- Governor's Consent, survey plan, …) and the files they uploaded for each.
-- Private: never returned by a public route, never served by /api/media/public.
ALTER TABLE listings ADD COLUMN IF NOT EXISTS title_documents JSONB NOT NULL DEFAULT '[]'::jsonb;

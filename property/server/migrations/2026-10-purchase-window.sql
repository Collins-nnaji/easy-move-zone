-- ============================================================================
-- The EasyMoveZone offer's completion window.
--
-- YOU DO NOT NORMALLY NEED TO RUN THIS. server/db.js applies the same
-- statement on every server start. Safe to run more than once.
--
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f 2026-10-purchase-window.sql
-- ============================================================================

-- Set when an admin issues a purchase offer (which means inspection and title
-- verification are done): the date we complete by if the owner accepts. Offers
-- issued before this change have no window and are left as they are.
ALTER TABLE listings ADD COLUMN IF NOT EXISTS purchase_by TIMESTAMPTZ;

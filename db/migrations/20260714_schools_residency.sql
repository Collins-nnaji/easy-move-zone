-- Schools & study programs get a standalone directory page (independent of
-- the destination-picker flow), focused on which programs offer a realistic
-- path from student visa to residency. Values are backfilled by re-running
-- the catalog seed (node scripts/seed-move-catalog.mjs) after this migration.
alter table move_schools add column if not exists residency_pathway text;

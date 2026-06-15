# Database seeding & migrations

Run from an environment where the Neon database is reachable (the cloud sandbox's
egress allowlist does **not** include the Neon host, so these can't be run from a
Claude Code web session). Set `DATABASE_URL` (or `NEON_DATABASE_URL`) first, then
use the existing runner — it is idempotent, so re-running is safe.

```bash
export DATABASE_URL="postgresql://…/neondb?sslmode=require"
```

## 1. Prerequisite schema (only if not already applied)

```bash
node scripts/run-sql-file.mjs db/property-platform-schema.sql        # properties, enquiries, saved_properties, transactions
node scripts/run-sql-file.mjs db/property-finder-schema.sql          # city_markets, property_listings, relocation_*
node scripts/run-sql-file.mjs db/migrations/20260309_user_profiles.sql
node scripts/run-sql-file.mjs db/migrations/20260310_agent_flag_and_admin.sql
node scripts/run-sql-file.mjs db/migrations/20260312_relocation_hub.sql
node scripts/run-sql-file.mjs db/migrations/20260312_relocation_guides.sql
```

## 2. New migration (this change)

```bash
node scripts/run-sql-file.mjs db/migrations/20260615_vendors.sql      # vendors + vendor_enquiries
```

## 3. Seeds (this change)

```bash
node scripts/run-sql-file.mjs db/seeds/20260615_property_marketplace_seed.sql      # agents, city_markets, ~18 listings
node scripts/run-sql-file.mjs db/seeds/20260615_vendors_seed.sql                   # 6 move-service vendors
node scripts/run-sql-file.mjs db/seeds/20260615_relocation_and_dashboard_seed.sql  # country guides + admin dashboard demo
```

The dashboard demo rows resolve the admin user by email (`collinsnnaji1@gmail.com`)
from `neon_auth.users_sync`; that block no-ops if the auth table/user isn't present,
so dashboard data simply starts empty and fills as the account uses the app.

## What this powers

- Home, `/purchase`, `/own`, `/properties/[id]` — real Nigerian listings.
- `/vendor` and `/admin/vendors` — real move-service vendors (approve/reject persists).
- `/relocate` + `/move` "Save my plan" — guides for the matched destinations.
- `/dashboard` — seeded saved properties, enquiries and transactions for the admin user.
</content>

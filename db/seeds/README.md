# Database migrations & seeding — EasyMoveZone (Move product)

Run from a machine that can reach your Neon database. Set `DATABASE_URL` (or
`NEON_DATABASE_URL`) first.

```bash
export DATABASE_URL="postgresql://…/neondb?sslmode=require"
```

## Quick start (recommended)

Runs all Move-product migrations and country-guide seeds in order:

```bash
node scripts/run-move-setup.mjs
```

Copy `.env.example` → `.env.local` and fill in Neon Auth + database values before
starting the app.

## What the Move setup includes

| Step | File | Powers |
|------|------|--------|
| Contact | `db/add-contact-submissions.sql` | `/contact` form submissions |
| Profiles | `db/migrations/20260309_user_profiles.sql` | `/api/profile`, saved searches |
| Admin | `db/migrations/20260310_agent_flag_and_admin.sql` | `/admin/*`, `admin_users` table |
| Relocation hub | `db/migrations/20260312_relocation_hub.sql` | Plan, tasks, contacts (used by `/move`) |
| Country guides | `db/migrations/20260312_relocation_guides.sql` | Settle tab content in `/move` |
| Bookings | `db/migrations/20260616_move_bookings.sql` | `/move` trip/stay/visa reservations |
| Move catalog | `db/migrations/20260622_move_catalog.sql` | Destinations, trips, stays, visa tiers |
| Guides seed | `db/seeds/20260615_relocation_and_dashboard_seed.sql` | Portugal, Mexico, Thailand, etc. |
| Catalog seed | `node scripts/seed-move-catalog.mjs` | Populates move_* tables from `move-catalog.json` |
| Demo journey | `npm run db:seed:demo` | Sample Lisbon plan, 8 tasks, 2 contacts, 3 bookings (after sign-up) |

After editing `app/move/data.ts`, regenerate the JSON and re-seed:

```bash
npm run catalog:json
npm run db:seed:catalog
```

The runner is idempotent — re-running is safe.

## Manual run (single file)

```bash
node scripts/run-sql-file.mjs db/migrations/20260616_move_bookings.sql
```

## Admin access

After migrations, your email must exist in `admin_users`:

```sql
insert into admin_users (email) values ('you@example.com')
on conflict (email) do nothing;
```

The seed migration pre-inserts `collinsnnaji1@gmail.com`. Change or add rows as needed.

## Optional: property marketplace schema

Only needed if you restore the property/search product (not required for Move):

```bash
node scripts/run-sql-file.mjs db/property-platform-schema.sql
node scripts/run-sql-file.mjs db/property-finder-schema.sql
node scripts/run-sql-file.mjs db/migrations/20260615_vendors.sql
node scripts/run-sql-file.mjs db/seeds/20260615_property_marketplace_seed.sql
node scripts/run-sql-file.mjs db/seeds/20260615_vendors_seed.sql
```

The relocation dashboard demo block in the guides seed no-ops if property tables or
the auth sync user are absent.

## Demo walkthrough (Day 7)

After `npm run db:setup` and signing up at `/auth`:

```bash
npm run db:seed:demo
# or: DEMO_USER_EMAIL=you@example.com npm run db:seed:demo
```

Then walk through the product in order:

1. **Home** (`/`) — hero CTA into the Move Spectrum
2. **Move** (`/move`) — pick stay length → explore matches → open Lisbon detail
3. **Book** tab — review seeded trip/stay/visa options; confirm a booking
4. **Move app** (`/move`) — Lisbon plan data, Settle tab, bookings after demo seed
5. **Profile** (`/profile`) — preferences, plan summary, saved searches

The demo seed no-ops if `neon_auth.users_sync` has no matching user — sign up first.

## Smoke test (Day 1)

1. `npm run dev`
2. Sign up at `/auth`
3. Complete `/move` → **Save my plan** → **Book** a trip/stay/visa
4. Open `/move` — plan, Settle tab, and bookings visible when signed in
5. `curl localhost:3000/api/move/destinations` — `"source":"database"`
7. Visit `/admin/users` as an admin — user list loads

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Profile API 500 | Ensure `user_profiles.auth_user_id` column exists (run user_profiles migration) |
| Settle empty | Run guides migration + relocation seed |
| Bookings fail | Run `20260616_move_bookings.sql` |
| Admin 403 | Add your email to `admin_users` |
| Auth redirect loop | Set `NEON_AUTH_*` vars in `.env.local` |

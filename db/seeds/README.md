# Database migrations & seeding — EasyMoveZone (visa product)

Run from a machine that can reach your Neon database. Set `DATABASE_URL` (or
`NEON_DATABASE_URL`) first.

```bash
export DATABASE_URL="postgresql://…/neondb?sslmode=require"
```

## Quick start (recommended)

Runs all visa-product migrations and starter seeds in order:

```bash
npm run db:setup
```

## What the visa setup includes

| Step | File | Powers |
|------|------|--------|
| Contact | `db/add-contact-submissions.sql` | `/contact` form submissions |
| Profiles | `db/migrations/20260309_user_profiles.sql` | `/api/profile` |
| Admin | `db/migrations/20260310_agent_flag_and_admin.sql` | `/admin/*`, `admin_users` table |
| Visa pivot | `db/migrations/20260701_visa_pivot.sql` | `visa_applications`, `visa_checklist_items`, `visa_documents`, `visa_requirement_templates`, `embassies` |
| Requirement templates seed | `db/seeds/20260701_visa_requirement_templates_seed.sql` | Starter curated visa requirements for a few common destinations |
| Embassies seed | `db/seeds/20260701_embassies_seed.sql` | A handful of verified embassy contact entries |

The runner is idempotent — re-running is safe.

## Manual run (single file)

```bash
node scripts/run-sql-file.mjs db/migrations/20260701_visa_pivot.sql
```

## Admin access

After migrations, your email must exist in `admin_users`:

```sql
insert into admin_users (email) values ('you@example.com')
on conflict (email) do nothing;
```

## Smoke test

1. `npm run dev`
2. Sign up at `/auth`
3. Visit `/visa` and look up requirements for a nationality/destination/visa type
4. Start tracking an application at `/visa/applications/new`
5. Generate a checklist and upload a document with an expiry date
6. Visit `/embassies` — confirm the seeded entries appear
7. As an admin, visit `/admin/visa-templates` and `/admin/embassies`

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Profile API 500 | Ensure `user_profiles.auth_user_id` column exists (run user_profiles migration) |
| Visa requirements always AI-generated | Run the requirement templates seed |
| Embassy directory empty | Run the embassies seed, or add entries via `/admin/embassies` |
| Admin 403 | Add your email to `admin_users` |
| Auth redirect loop | Set `NEON_AUTH_*` vars in `.env.local` |

## Historical migrations

`db/migrations/archive/` holds migrations for the relocation/move-catalog/settle-guide
tables that `20260701_visa_pivot.sql` superseded and dropped. Kept for schema history —
do not run them against a fresh database.

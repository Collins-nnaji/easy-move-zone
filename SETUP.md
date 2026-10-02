# EasyMoveZone setup

## App and authentication

Install dependencies with `npm install`. Configure `.env` using `.env.example`:

```bash
DATABASE_URL=                 # Neon PostgreSQL connection string
NEON_AUTH_COOKIE_SECRET=      # Neon Auth session secret
NEON_AUTH_BASE_URL=           # Neon Console Auth endpoint
NEXT_PUBLIC_APP_URL=          # Public app URL
NEXT_PUBLIC_WHATSAPP_NUMBER=  # Optional business number, international digits
```

`NEON_DATABASE_URL` is accepted as a fallback for `DATABASE_URL`. Keep all credentials private. Neon Auth manages its own `neon_auth` schema; application migrations must not drop it.

## Database

```bash
npm run db:setup
```

Setup is idempotent, preserves existing records and prepares these application tables:

| Table | Purpose |
| --- | --- |
| `emz_moves` | Move inventories, photos, contacts, access details, quotes, crew and progress |
| `contact_submissions` | Support, damage reports and partner enquiries |
| `emz_enquiry_states` | Internal support status and follow-up notes |
| `admin_users` | Administrator email allowlist |
| `user_profiles` | Account administration profiles |

`emz_moves_updated_idx` supports the operations queue. Setup also installs the contact indexes. The app ensures moving/support tables on first use, so its database role needs table creation permission.

Authorize administrators through the existing `admin_users` allowlist. Authentication alone does not grant admin access. `/admin/users` uses the account/profile tables and Neon Auth records.

## Booking and operations

- `/book` submits quote requests to `/api/moves`. Database failures return an error rather than a booking confirmation.
- `/admin` reviews inventories, photos and access; confirms quotes in naira; assigns crews; and records arrival updates.
- `/track` uses a private move reference and omits customer contacts, addresses, inventories and photos. Anyone with the reference can see its tracking details.
- `/admin/enquiries` manages customer support, damage reports and partner follow-up.
- Setting `NEXT_PUBLIC_WHATSAPP_NUMBER` enables the WhatsApp link on Contact. Email and the contact form remain available.

Quotes and job coordination are manual. This flow does not take payments or provide live GPS tracking. Optional email, SMS, analytics and support-widget settings are documented in `.env.example`.

## Retired database products

The 27 produce, driver, fleet, marketplace and relocation tables were backed up and removed for the moving-platform migration. Their APIs return HTTP 410. Both old setup script names now delegate to moving setup so they cannot recreate retired tables.

The explicit drop list is in `db/migrations/20261003_retire_legacy_tables.sql`. Use `node --env-file=.env scripts/retire-legacy-tables.mjs` to create a private backup only, or append `--apply` to execute that retirement. The script saves records, table definitions, constraints, indexes, triggers, sequence metadata and restore SQL in `.local/database-backups/`, which is excluded from Git. It locks the target tables, rejects data changes since the backup and uses `RESTRICT` in one transaction. Keep the backup secure; it can contain personal data.

Historical SQL files are archived migration history. Do not run historical driver or agricultural migrations against the current database.

## Validation

Run `npm run dev` for local development. Validate changes with `npx tsc --noEmit`, `npm run lint`, `npm test` and `npm run build`.

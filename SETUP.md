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

| Table                 | Purpose                                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------------------- |
| `emz_marketplace`     | Pricing, payments, accounts, condition records, claims, reviews, partner verification, fleet and payouts |
| `emz_workers`         | Moving crews and primary vehicle owners                                                                  |
| `emz_moves`           | Move inventories, photos, contacts, access details, quotes, crew and progress                            |
| `contact_submissions` | Support, damage reports and partner enquiries                                                            |
| `emz_enquiry_states`  | Internal support status and follow-up notes                                                              |
| `admin_users`         | Administrator email allowlist                                                                            |
| `user_profiles`       | Account administration profiles                                                                          |

`emz_moves_updated_idx` supports the operations queue. Setup also installs the contact indexes. The app ensures moving/support tables on first use, so its database role needs table creation permission.

Authorize administrators through the existing `admin_users` allowlist. Authentication alone does not grant admin access. The admin's Accounts section (`/admin?section=accounts`) uses the account/profile tables and Neon Auth records.

## Property site

The property site (`property/app`) and its API (`property/server`, served at `/api/property`) use the same database, Neon Auth and object storage. Their tables (`listings`, `agencies`, `management_requests`, `renovation_requests`, `passport_requests`, `consultations`, `leads`, `property_profiles` and related) are created on the first API request. The property admin is `/admin`, and the same `admin_users` allowlist grants it. Production media uploads need `MEDIA_TOKEN_SECRET`. Agent listing alerts run from `POST /api/property-jobs/listing-alerts` with `Authorization: Bearer <CRON_SECRET>`. See [docs/property-platform.md](docs/property-platform.md).

## Moving: booking and operations

- `/moving/book` submits quote requests to `/api/moves`. Database failures return an error rather than a booking confirmation.
- `/admin?section=moves` reviews inventories, photos and access; confirms quotes in naira; assigns crews; and records arrival updates.
- `/moving/track` uses a private move reference and omits customer contacts, addresses, inventories and photos. Anyone with the reference can see its tracking details.
- `/admin?section=moving-enquiries` manages customer support, damage reports and partner follow-up.
- Setting `NEXT_PUBLIC_WHATSAPP_NUMBER` enables the WhatsApp link on Contact. Email and the contact form remain available.

Estimates are instant; final quotes and partner verification are reviewed by operations. Paystack checkout collects deposits and delivery balances. Customer accounts, condition records, reviews, claims, fleet listings, commission statements and payout records are available. Tracking refreshes recorded job stages every 15 seconds. Automated WhatsApp/SMS updates need provider credentials and a scheduler. See [marketplace setup and operations](docs/moving-marketplace.md) for payment webhooks, business information and messaging setup.

## Retired database products

The old produce, driver, fleet, marketplace and relocation tables were backed up and removed in October 2026, and their code has since been deleted. `db/migrations/` keeps the SQL history; do not run historical driver or agricultural migrations against the current database.

## Validation

Run `npm run dev` for local development. Validate changes with `npx tsc --noEmit`, `npm run lint`, `npm test` and `npm run build`.

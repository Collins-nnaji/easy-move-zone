# EasyMoveZone

A mobile-friendly moving platform for home moves, office relocations and bulky-item transport in Nigeria, starting in Lagos. Built with Next.js, React, Neon authentication and PostgreSQL.

Customers request quotes with an inventory, up to three photos, addresses, floors, access restrictions and optional services. The team reviews requests in `/admin`, assigns quotes and crews, and records arrival and move status updates. Customers use their private move reference at `/track`.

## Development

Install dependencies with `npm install`, then run `npm run dev`. Use `npm run lint`, `npm test` and `npm run build` for validation. See `.env.example` and `SETUP.md` for authentication and database configuration.

Run `npm run db:setup` to prepare the moving, account and support tables. The moving store uses `DATABASE_URL` (or `NEON_DATABASE_URL`) and also ensures moving/support tables on first use. Database credentials require table creation permission. Failed storage returns an error rather than a booking confirmation. Photos are stored with the request and accessible to administrators; public tracking omits contact details, addresses and photos. Estimates, Paystack checkout, customer accounts, signed item checklists, partner verification, fleet listings, reviews, claims, configurable pricing and reporting extend the original moving flow. Tracking refreshes recorded statuses; automated WhatsApp/SMS delivery requires provider settings and a scheduler. Bank transfers and refunds are recorded/reviewed by operations. See [marketplace setup and operations](docs/moving-marketplace.md).

Existing agricultural public URLs redirect to the moving pages. Retired APIs return HTTP 410 and cannot recreate the old tables. Legacy database records were backed up privately before removal. See `db/migrations/20261003_retire_legacy_tables.sql` and `scripts/retire-legacy-tables.mjs` for the transaction and backup workflow.

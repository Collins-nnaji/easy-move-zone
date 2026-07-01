# EasyMoveZone

EasyMoveZone is a visa preparation tool: look up visa requirements by nationality and
destination, track a document checklist per application, find embassies and
consulates, and get AI-assisted guidance throughout.

## Core Features

- **Visa requirements lookup** — nationality + destination + visa type → documents,
  fees, processing time. Curated data first, AI-generated and cached on a miss.
- **Application tracking & document checklist** — one workspace per visa application,
  with AI-generated or manually built checklists and status tracking.
- **Document management** — upload passports, letters, and statements with per-document
  expiry tracking (passport, insurance, visa itself).
- **Embassy directory** — admin-curated embassy, consulate, and visa application
  center contact details (never AI-generated, to avoid wrong addresses/phone numbers).
- **AI assistant** — Q&A grounded only in the facts on file, wired into requirements,
  checklist, and application pages.

## Local Development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

Set up the database (requires `DATABASE_URL` or `NEON_DATABASE_URL`):

```bash
npm run db:setup
```

See [db/seeds/README.md](db/seeds/README.md) for details and troubleshooting.

## Main App Areas

- Public marketing site: `app/page.tsx` and `components/platform/*`
- Visa app: `app/visa/*`, `app/embassies/*`
- Auth and user workspace: `app/auth/*`, `app/profile/*`, `app/dashboard/*`
- Admin: `app/admin/*` (visa requirement templates, embassy directory, users)
- APIs: `app/api/visa/*`, `app/api/embassies/*`, `app/api/admin/*`
- Shared libraries: `lib/visa/*`, `lib/ai/*`, `lib/storage/*`

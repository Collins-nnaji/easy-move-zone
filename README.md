# EasyMoveZone

Rent a home, check a rental before you pay, and let and manage property in Nigeria — and move home. Built with Next.js, React, Neon Auth, PostgreSQL and S3-compatible object storage.

## What's in the app

- **Property site** (`property/app`) — a rental platform: the landing page (`/`), homes to rent (`/listings`, `/listings/:slug`), checking a rental before you pay (`/check`), listing a home as an agent (`/list`), renovation for landlords (`/renovate`), management (`/manage`), the signed-in portal under `/portal` (landlord `/portal/landlord/*`, tenant `/portal/tenant/*`, agent `/portal/agent/*`; `/portal` opens the one used last, and old `/manage/…`, `/tenant…` and `/agent…` links redirect), advisers (`/consult`), `/contact`, `/help`, `/privacy`, `/terms` and the one admin for property and moving (`/admin`). It is a react-router app styled with styled-components; every one of those URLs is rewritten to `app/property-app` (see `next.config.ts`), which mounts it.
- **Neighbourhoods** (`/areas`, `/areas/:slug`) — one page per area across Nigeria: residents' scores (light, water, flooding, security, roads, noise, network), a moderated board of posts and replies, typical rents from our live rentals, and location tools (map, commute check, what is nearby, links to rent, verify and move). Areas live in the `areas` table, seeded from `property/server/data/areas.json`; staff open, edit and hide them and moderate posts in `/admin` → Community. Posts are about places, not people: contact details are refused and anything that may name or accuse someone waits for review (`property/server/services/moderation.js`).
- **Property API** (`property/server`) — an Express app served at `/api/property/*` by `app/api/property/[...path]/route.ts`. Its schema is created on first request (`property/server/db.js`).
- **Moving** (`/moving`, routed inside the property site so it shares its navbar) — home, office and bulky-item moves on one page: services, prices, booking, tracking, account, crew hub, coverage, care policy, reviews and FAQs. Checkout is `/moving/checkout`; moving terms, privacy and cookies live under `/moving/`. Old moving URLs (`/book`, `/track`, `/profile`, `/hub`, …) redirect to their section in `middleware.ts`. Moving is run from the same `/admin`, in its Moving sections.

See [docs/property-platform.md](docs/property-platform.md) for how the property site is wired in, and [marketplace setup and operations](docs/moving-marketplace.md) for moving.

## Development

Install dependencies with `npm install`, then run `npm run dev`. Use `npm run lint`, `npm test` and `npm run build` for validation. See `.env.example` and `SETUP.md` for authentication, database and storage configuration.

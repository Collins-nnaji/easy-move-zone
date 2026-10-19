# EasyMoveZone

Buy, sell and manage property in Nigeria — and move home. Built with Next.js, React, Neon Auth, PostgreSQL and S3-compatible object storage.

## What's in the app

- **Property site** (`property/app`) — the landing page (`/`), the marketplace (`/listings`, `/listings/rent`, `/listings/:slug`, `/listings/sell`), verification (`/verify`, `/verify/photo-scan`), renovation (`/renovate`), management (`/manage`, the owner portal at `/manage/*` and the tenant portal at `/tenant/*`, picked by `/portal`), advisers (`/consult`), `/contact`, `/help`, `/privacy`, `/terms` and the one admin for property and moving (`/admin`). It is a react-router app styled with styled-components; every one of those URLs is rewritten to `app/property-app` (see `next.config.ts`), which mounts it.
- **Property API** (`property/server`) — an Express app served at `/api/property/*` by `app/api/property/[...path]/route.ts`. Its schema is created on first request (`property/server/db.js`).
- **Moving** (`/moving`, routed inside the property site so it shares its navbar) — home, office and bulky-item moves on one page: services, prices, booking, tracking, account, crew hub, coverage, care policy, reviews and FAQs. Checkout is `/moving/checkout`; moving terms, privacy and cookies live under `/moving/`. Old moving URLs (`/book`, `/track`, `/profile`, `/hub`, …) redirect to their section in `middleware.ts`. Moving is run from the same `/admin`, in its Moving sections.

See [docs/property-platform.md](docs/property-platform.md) for how the property site is wired in, and [marketplace setup and operations](docs/moving-marketplace.md) for moving.

## Development

Install dependencies with `npm install`, then run `npm run dev`. Use `npm run lint`, `npm test` and `npm run build` for validation. See `.env.example` and `SETUP.md` for authentication, database and storage configuration.

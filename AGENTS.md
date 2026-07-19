# AGENTS.md

## Cursor Cloud specific instructions

EasyMoveZone is a single Next.js 16 (App Router) + React 19 + TypeScript app (package manager: **npm**, lockfile `package-lock.json`). It is not a monorepo. Standard commands live in `package.json` scripts and `README.md`; run everything from the repo root.

- Dev server: `npm run dev` (http://localhost:3000). This is the primary way to run/test the app.
- Lint / test / build: `npm run lint`, `npm test` (vitest), `npm run build`. See `package.json` scripts.

### Non-obvious caveats

- No secrets are required to run the app for core UI/flows. The product degrades gracefully: `lib/move/get-catalog.ts` and `lib/crm/data.ts` return static fallback data when `DATABASE_URL` is unset, and `lib/ai/openai.ts` returns canned fallbacks when no OpenAI/Azure key is set. The `/move` travel-intelligence flow (explore destinations, destination detail, visa details, mood search) works fully without any secrets.
- `npm run lint` currently exits non-zero due to **pre-existing** errors in `components/platform/PlatformNav.tsx` (`react-hooks/set-state-in-effect`) plus an unused-var warning. These are unrelated to environment setup — do not treat them as setup breakage.
- `npm run build` (production) fails at the "Collecting page data" step with `Missing environment variable: NEON_AUTH_BASE_URL` because `app/api/auth/[...path]` evaluates Neon Auth at build time. This is expected without Neon Auth secrets. Use `npm run dev` for development; dev mode does not pre-collect page data and boots fine.
- Auth-gated routes require Neon Auth env and return HTTP 500 without it: `/dashboard`, `/admin` (and `/profile`), gated by `middleware.ts`. `/`, `/move`, and `/auth` work without secrets.
- Optional env vars enable deeper functionality: `DATABASE_URL` (Neon Postgres; then `npm run db:setup`), Neon Auth (`NEON_AUTH_BASE_URL` etc.), `OPENAI_API_KEY` or the `AZURE_OPENAI_*` set (real AI output), plus optional `RESEND_*`, `TWILIO_*`, `NEXT_PUBLIC_CRISP_WEBSITE_ID`. Integration status is visible at `GET /api/health/integrations`.
- DB migrations/seeds are orchestrated by `scripts/run-move-setup.mjs` (`npm run db:setup`); they require `DATABASE_URL`/`NEON_DATABASE_URL`.

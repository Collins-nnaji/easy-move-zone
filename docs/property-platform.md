# Property platform

The property site (marketplace, verification, selling, letting and management, renovation) was moved in from the former Bloomvest project in October 2026. It runs entirely on EasyMoveZone's own infrastructure: Neon Auth, the `DATABASE_URL` database and the `AWS_*` object storage. Nothing points back at the old project.

## How it is wired in

| Piece | Where | Notes |
| --- | --- | --- |
| Frontend | `property/app` | React + react-router + styled-components. `App.js` holds the routes. |
| Mount | `app/property-app/page.tsx`, `components/property/PropertyApp.tsx` | Client-only (`ssr: false`). `generateMetadata` uses `property/app/config/seo.js` with the `x-emz-path` header set by `middleware.ts`, so the first HTML carries the right title. |
| Routing | `next.config.ts` → `rewrites().fallback` | Any page URL that is not a Next.js route is rewritten to `/property-app`. One fixed route means react-router navigation never remounts the app. |
| API | `property/server` (Express) | Served by `app/api/property/[...path]/route.ts`, which maps `/api/property/*` to the app's `/api/*`. The client calls `/api/property` (`property/app/api.js`). |
| Schema | `property/server/db.js` | Applied on the first API request. Its profile table is `property_profiles`, so it does not collide with EasyMoveZone's `user_profiles`. |

`/auth` is the one Next.js page outside the property app; in-app links to it go through `SiteAuthRedirect`. Moving is routed inside the property app (`property/app/pages/MovingRoutes.jsx`) so it shares the navbar, footer and tab bar. `/moving` is a short hero and a grid of cards (`components/moving/MovingPage.tsx`). Each card opens a full-page panel, a Radix Dialog closed with ✕, Esc or Back, at its own URL: `/moving/book`, `/prices`, `/track` (with `#my-moves`), `/crew`, `/how`, `/areas`, `/care` and `/help`. `/moving/checkout` and the moving terms, privacy and cookies pages are ordinary pages. The moving components live in `components/moving` and `components/marketplace`, use `components/ui/AppLink` (react-router inside the app, Next link elsewhere), and take `embedded` to drop their old standalone page headings.

Upstream Bloomvest changes were merged in October 2026 with a three-way merge per file (base `17a3177`, upstream `696b2ba`), after applying the same renames to both sides.

## Portals, rentals and rent

- **One portal at `/portal`**, three sides sharing `ConsoleShell` (left sidebar, portal switcher): **landlord** (`/portal/landlord/*`), **tenant** (`/portal/tenant/*`, `TenantConsolePage`) and **agent** (`/portal/agent/*`). `/portal` ("My portal" in the navbar once signed in) opens the side used last. Tenants join through a single-use invite at `/portal/tenant/join/:token`. Agencies apply at `/portal/agent/apply`, inside the portal shell once signed in; staff verify them in Admin → Agents. Old `/manage/…`, `/tenant…` and `/agent…` addresses redirect (`legacyPortalPath`, in the middleware and the router).
- **Rentals:** vacant managed homes are let through the public `/listings/rent` grid. Applications land in the admin's Rentals tab.
- **Rent:** charges are raised from each tenancy (`property/server/services/rent.js`) and can be paid online with Paystack. Paystack has one webhook URL per account, so it stays `/api/payments/webhook`. That route passes rent references (`EMZRENT-…`) on to `/api/property/tenant/pay/webhook` with the signed body intact. Overdue marking and reminders run from `POST /api/property-jobs/rent-reminders` (Bearer `CRON_SECRET`). Schedule it every few hours.
- **Notices** (`services/notify.js`) always land in the in-app bell, and also go by email (Resend) and SMS (Termii) when those keys are set. Notices and the staff audit row are written after the reply. The API route finishes them with Next's `after()`.

## Auth and admin

- Sign-in is EasyMoveZone's `/auth` page and `lib/auth/client`. `property/app/auth.js` wraps that client. In-app links to `/auth` hand over to it with `?redirect=`.
- **Who is calling** is decided in one place, `app/api/property/[...path]/route.ts`. It drops every identity header a browser sends (`x-admin-key`, `x-emz-user-*`, `x-emz-admin-email`, `x-dev-user`), then verifies the Neon Auth session and passes the user as `x-emz-user-id` / `x-emz-user-email` / `x-emz-user-name`. For a user on the `admin_users` allowlist, it adds the internal admin key (`property/server/adminKey.js`) and `x-emz-admin-email`. `property/server/auth.js` reads only those (`sessionUser`, `requireUser`, `adminActor`, `requireAdmin`). Owner and tenant routes use the session email, never an email from the query or body.
- **One admin** (`/admin`): property sections (Overview, Passports, Consultations, Marketplace, Rentals, Management, Tenants, Renovations, Messages, Agents) and moving sections (Moves, Crew & vehicles, Enquiries, Marketplace ops, Accounts — EasyMoveZone's moving admin components, via `property/app/components/MovingAdminSections.jsx`). The section is in the URL (`/admin?section=moves`). Old `/admin/moving/*` URLs redirect there. Staff changes are written to `admin_audit`.
- **`requireVerifiedAgent`** (`property/server/auth.js`) is signed-in plus an active member of a `verified` agency. Agency membership is the real permission; `user_profiles.is_agent` is kept in sync for Accounts.

## Files and photos

- Uploads go straight from the browser to object storage with a presigned PUT URL from `POST /api/property/media/sas` (the bucket allows cross-origin PUT). The caller must be signed in. Prefix `agent` also needs a verified agency. Production requires `MEDIA_TOKEN_SECRET` (fail closed). Files are stored under `property/` in `AWS_S3_VAULT_BUCKET` (or `PROPERTY_MEDIA_BUCKET`) and referenced in the database as `s3://<bucket>/<key>`.
- The bucket is private. A live listing's photo loads through `GET /api/property/media/public?u=…` (client: `publicMediaUrl()`). It checks the listing is `live` and redirects to a short-lived signed URL. Admin screens get 15-minute signed URLs (`/media/read`, `/media/read-many`). Never render a raw storage URL.
- `DELETE /api/property/media` needs the uploader's delete token or an admin session.
- Title documents never go in a listing's `media`. Keeping them apart is what keeps them out of the public photo route.
- In an `<input type=file>` handler, copy `e.target.files` with `Array.from` before clearing `e.target.value`.

## Marketplace rules (carried over — keep them)

- Only `status = 'live'` listings are public, and public responses use the `PUBLIC_COLUMNS` allowlist in `property/server/routes/listings.js`. Owner contact details, the signed consent name and `offer_amount` never appear publicly. Agent listings may show public agency name, slug, phone and logo only.
- Publishing needs the owner's `publish_consent` or `route = 'company_owned'`, except `agent_listed` rows which a verified agency submits to `pending_review` and staff approve. The consent box is unticked by default on EasyOffer. Do not default it or bypass the check.
- Agent listing packages (Starter 5 / Pro 25 / Premium 100) live in `property/server/agentPlans.js` and `property/app/config/agentPlans.js`. Paystack references start `EMZAGENT-` and fan out from `/api/payments/webhook`. Staff can grant a plan. Quota counts `live` + `pending_review`.
- Find an Agent is `/agents` and `/agents/:slug`. Mortgage calculator is `/mortgage`. Saved-search emails run from `POST /api/property-jobs/listing-alerts` (Bearer `CRON_SECRET`).
- "Owned by EasyMoveZone" (`company_owned`) needs the purchase on record (`bought_at`, set only by the `bought` step from `offer_made`).
- `PURCHASE_DAYS` (14) lives in both `property/app/config/platform.js` and `property/server/routes/listings.js`. Change both. Plan, verification and title-document catalogues are likewise duplicated between `property/app/config/*` and `property/server/*Catalog.js` / `titleDocuments.js`.
- Assisted intake drafts (`status = 'draft'`) are never public. The owner confirms through a single-use `/listings/confirm/:token` link.

## Tests

- `npm test` (Vitest) runs the property site's component tests (`property/app/**/*.test.jsx`, jsdom, set up in `tests/jsdom-setup.ts`) with the rest of the app's tests.
- `npm run test:property-server` runs the API's `node --test` suites. `api.test.js` needs `TEST_DATABASE_URL` (a throwaway Postgres) and is skipped without it.

## Style

The property site uses EasyMoveZone's look through the tokens in `property/app/styles/GlobalStyles.jsx`. Those are cream paper (`#faf8f2`), sage bands, deep green `#2f5d50`, the terracotta accent dot, Bricolage Grotesque headings and Plus Jakarta Sans text (from `next/font` in `app/layout.tsx`), plus the 6px buttons in `components/page.jsx`. Use the tokens rather than raw hex. Styled-component style props take a `$` prefix. Use `minmax(0, 1fr)`, not a bare `1fr`, for stacking grids. Motion goes through `property/app/components/motion.jsx`, and SVG illustrations (`graphics.jsx`) take `play` from `useStartInView()` rather than observing the viewport themselves.

## Payments

Property Passport checkout and renovation milestones use Stripe (`STRIPE_SECRET_KEY`). Without it, they fall back to advisers sending payment links. Moving payments use Paystack (see `docs/moving-marketplace.md`).

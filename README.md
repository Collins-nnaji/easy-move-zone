# EasyMoveZone

EasyMoveZone is an international logistics and export company moving freight between Nigeria and the world — sea, air, road, customs clearance, and warehousing.

## Day-one live surfaces

- **Marketing site:** `/` · `/services` · `/quote` · `/track` · `/about` · `/contact`
- **Client portal:** `/app` (shipper + carrier workspaces)
- **Admin:** `/admin` (quotes/leads under Requests)

## Local development

```bash
npm run dev
```

Open `http://localhost:3000`.

## Product notes

- Brand and design tokens live in `lib/brand.ts` and `app/globals.css` (cream / terracotta).
- Freight catalog (modes, corridors, cargo classes): `lib/logistics/catalog.ts`
- Quote intake: `POST /api/quote` → contact submissions (+ optional `freight_quotes` table)
- Public tracking: `GET /api/track/[ref]` — demo refs `EMZ-NG-1001`, `EMZ-NG-1002`
- Legacy `/move` and `/fleet` redirect into `/app`
- Apply DB migration when ready: `db/migrations/20260920_freight_quotes_and_tracking.sql`

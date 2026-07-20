# EasyMoveZone — make it real

Simplified product surface:

| Path | Who | Purpose |
|------|-----|---------|
| `/` | Everyone | Marketing |
| `/move` | Drivers / truck owners | Claim loads, schedule, wallet, vault |
| `/fleet` | Fleet operators | Post loads, find drivers, fund & manage workload |
| `/auth` | Everyone | Sign in / sign up |
| `/profile` | Signed-in users | Marketplace account |
| `/contact` | Everyone | Support |

## Phase 4 marketplace ops (live)

- **KYC queue** — `/admin/kyc` — approve/reject driver vault uploads (uploads stay `pending` until approved)
- **Cashout monitor** — `/admin/cashouts` — failed Stripe transfers logged in `marketplace_payments`
- **Dispute flags** — `/admin/disputes` — triage 1–2 star ratings on completed loads
- **Access** — email must be in `admin_users` table (see `db/migrations/20260310_agent_flag_and_admin.sql`)

## Phase 3 trust & legal (live)

- **Vault uploads:** Drivers upload CDL / background / medical / insurance files from `/move/vault` (stored as base64 in Postgres for now; max ~1.5MB)
- **Verified badge:** All four required docs must be **approved by ops** in `/admin/kyc`; verified drivers sort first in fleet Find Drivers
- **Bilateral ratings:** After a load completes, driver and fleet each get a rating sheet (1–5 + optional comment)
- **Legal pages:** `/legal/terms`, `/legal/privacy`, `/legal/independent-contractor` (linked in footer)

For object storage at scale, swap vault `file_data` for S3/R2/Blob and keep the same API shape.

## Phase 2 escrow (live)

- Drivers can **only claim funded loads**
- Completing a load only pays out if escrow was funded
- Fleet post → auto-funds escrow (Stripe Checkout if keys set; ledger escrow otherwise)
- Seeded demo loads are pre-funded

**Add for real card payments:**
```
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

## Phase 1 booking (live)

- Drivers: Home → **Book a load** → `/move/shifts` → slide to claim (sign in only if needed)
- Fleet: **Book this driver** → pick open load → driver gets Accept offer
- Claim emails: set `RESEND_API_KEY` + `RESEND_FROM_EMAIL` (otherwise in-app notification only)

Then run:

```bash
npm run db:setup
```

## 1. Already wired (Neon)

These should already exist in your hosting environment:

```bash
DATABASE_URL=                 # Neon Postgres connection string
NEON_AUTH_COOKIE_SECRET=      # Neon Auth session secret
NEON_AUTH_BASE_URL=           # e.g. https://your-app.vercel.app
NEON_DATA_API_URL=            # Neon Data API URL
NEXT_PUBLIC_APP_URL=          # Public site URL (same as production URL)
```

Then run:

```bash
npm run db:setup
```

## 2. Add Stripe (required for real money)

Create a Stripe account → Developers → API keys.

```bash
STRIPE_SECRET_KEY=sk_test_...                 # or sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # or pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...               # from Stripe CLI or Dashboard webhook
```

### Enable in Stripe Dashboard

1. **Connect** → Settings → enable **Express** accounts (for driver payouts)
2. **Transfers** capability on connected accounts
3. Webhook endpoint: `https://YOUR_DOMAIN/api/payments/webhook`
   - Events: `checkout.session.completed`
4. Local testing: `stripe listen --forward-to localhost:3000/api/payments/webhook`

### What Stripe powers in the app

- **Drivers** → Wallet → “Connect bank account” (Stripe Connect Express) → Instant cashout transfers money to their bank
- **Fleet** → My Loads → “Fund with Stripe” (Checkout) → Escrows the driver payout on the load

Without Stripe keys, cashouts stay ledger-only (safe for demos) and funding returns a clear error.

## 3. Optional but recommended

```bash
# Support chat (Crisp)
NEXT_PUBLIC_CRISP_WEBSITE_ID=

# Email delivery for contact form (if you wire Resend later)
RESEND_API_KEY=
RESEND_FROM_EMAIL=
```

## 4. What you still need to add (product checklist)

| Capability | Status | What to add |
|------------|--------|-------------|
| Auth (email + Google) | Live via Neon Auth | Confirm Google OAuth credentials in Neon Auth console |
| Driver wallet ledger | Live | — |
| Stripe Connect payouts | Code ready | Stripe keys + Connect Express + webhook |
| Fleet load funding | Code ready | Same Stripe account + Checkout |
| Document uploads (Vault) | Live (DB base64 + ops review) | S3/R2/Blob for scale |
| Bilateral ratings | Live | — |
| Marketplace ops admin | Live (`/admin`) | Formal dispute workflow |
| Terms / Privacy / IC notice | Live | Legal counsel review before production |
| Live GPS / maps | Placeholder waypoints | Google Maps or Mapbox API key + geolocation |
| SMS / push notifications | Not built | Twilio or OneSignal |
| Marketplace admin ops | Live at `/admin` | Formal disputes, KYC automation |
| Tax 1099 | Mentioned in UI only | Stripe Tax / year-end export |

## 5. Clean flows (after this update)

```
Home
 ├─ Driver app (/move)
 │    welcome → zone → vehicle → shifts → schedule → wallet → vault
 │    claim / cashout require sign-in
 │    complete load credits wallet (minus 8% commission)
 │    rate fleet → upload vault docs for Verified badge
 │
 └─ Fleet console (/fleet)
      setup → dashboard → post load → find drivers → my loads
      fund load via Stripe Checkout
      mark complete → driver paid, commission recorded
      rate driver · Verified badge on partner cards
```

Dead relocation/travel routes (explore, visas, schools, etc.) have been removed from the app tree.

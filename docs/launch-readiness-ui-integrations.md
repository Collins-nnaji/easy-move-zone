# EasyMoveZone — Launch Readiness: UI, Flow, Animation & Integrations

> Goal: take the current build from "convincing prototype" to "a real product people
> can trust with their money and their trucks." This document is the working plan for
> the UI/UX polish and the third-party integrations that make the app production-real.

**Product**: A commission-based logistics marketplace for Nigeria connecting **drivers /
truck owners** (`/move`) with **fleet operators** (`/fleet`). Companies post funded loads,
drivers claim and run them, both sides rate each other, money settles in naira, and an
8% platform fee is charged only on completion.

**Stack today**: Next.js 16 (App Router), React 19, Tailwind v4, Framer Motion 12,
Neon Postgres + Neon Auth, Stripe (escrow/Connect), Resend, Twilio, Web Push (VAPID),
Sentry-compatible monitoring, OpenAI/Azure for AI, OpenStreetMap embeds for maps.

---

## Implementation status (updated)

Shipped on this branch:

- **UI/animation layer** — global toast system (with retry actions), animated
  count-ups on wallet + fleet stats, a claim-success confetti celebration,
  haptic + threshold feedback on slide-to-claim, success toasts across claim /
  complete / rate / upload / fund / book / cancel, **directional page
  transitions**, and **shift-feed skeletons**.
- **Payments provider abstraction** — `lib/payments/paystack.ts`: a typed
  Paystack client (funding init/verify, account resolve, transfer recipient +
  payout, HMAC-SHA512 webhook verification) with unit tests. Load **funding**
  and the **webhook** now switch to Paystack when `PAYMENTS_PROVIDER=paystack`
  and `PAYSTACK_SECRET_KEY` are set; Stripe/ledger remain the default so nothing
  changes until you flip the flag.
- **Config + health** — new provider env vars in `.env.example`, and
  `/api/health/integrations` reports what's wired.

Still requires live credentials + a test environment to finish and verify:

- **Paystack driver payouts (cash-out)** — the transfer helpers exist and are
  tested, but wiring them into cash-out needs a driver **bank-details capture
  flow** (account number + bank code → resolve name → recipient code), which is
  a schema + UI addition. Funding is wired; payouts are the remaining half.
- **Maps/routing, KYC, local SMS, realtime** — provider accounts + keys needed.

## Part 1 — Where the app is today (honest baseline)

| Area | State | Notes |
|------|-------|-------|
| Marketing site (`/`) | ✅ Strong | Good motion, clear two-sided story, live-corridor teaser |
| Driver app (`/move`) | 🟡 Works, mock-feeling | welcome → setup → vehicle → shifts → schedule → wallet → vault |
| Fleet app (`/fleet`) | 🟡 Works, mock-feeling | welcome → setup → dashboard → jobs → history → drivers |
| Slide-to-claim, bottom sheets, stagger lists | ✅ Nice foundation | `SlideToClaim`, `AnimatedSheet`, `StaggerList` |
| Payments | 🟡 Wired but Stripe-first | Escrow + Connect payouts; **Stripe is weak for Nigeria** |
| Maps / tracking | 🟡 Static | OSM iframe embed + geolocation ping; no live route line or ETA |
| KYC / vault | 🟡 Manual | Files as base64 in Postgres, ops approve by hand in `/admin/kyc` |
| Notifications | ✅ Multi-channel | in-app + email + SMS + push, each optional |
| Auth | 🟡 Email-first | Neon Auth; no phone/OTP, which is how Nigeria actually signs in |

The bones are good. What makes it still feel like a demo: **empty/loading/error states are
thin, success moments aren't celebrated, tracking is static, and money + identity rely on
rails that don't work well in-market.** Parts 2–4 fix exactly those.

---

## Part 2 — UI & Flow improvements

### 2.1 Onboarding that earns trust before asking for work

The current flow (`welcome → setup → vehicle → shifts`) drops a new driver straight onto a
job board. For a marketplace handling money and heavy goods, add trust checkpoints:

1. **Progressive disclosure** — keep the 3-step flow but show a persistent progress rail
   ("Step 1 of 3") so people know it's short.
2. **Phone-number-first identity** (see 4.4) — Nigerians expect to sign up with a phone
   number and OTP, not an email/password.
3. **"Why we ask" microcopy** on every sensitive field (BVN/NIN, licence upload) — a single
   grey line explaining the value ("Verified drivers get first pick of tanker routes").
4. **Deferred KYC** — let a driver browse the board immediately but gate *claiming* behind
   verification, with a clear "Verify to claim" state on locked cards. This is the single
   biggest conversion lever: value first, paperwork second.
5. **Resumable onboarding** — persist partial progress server-side (today it's `localStorage`
   via `saveDriverFlowState`); if someone drops off, an SMS/push can pull them back.

### 2.2 The shift-claim flow — the money moment

`SlideToClaim` is the app's signature interaction. Make it feel physical and safe:

- **Haptics** — `navigator.vibrate(10)` on grab, a stronger pulse on commit. Cheap, huge.
- **Threshold feedback** — the track already fades the label; add a colour shift to green as
  the thumb passes ~70% so the commit feels earned.
- **Optimistic + reconcile** — on release, immediately show "Claiming…" then the success
  state; if the API rejects (already claimed), snap back with a specific message. Today
  `handleClaim` claims then reloads; make the intermediate state explicit so a slow network
  doesn't feel broken.
- **Confetti/checkmark burst** on success (respect `prefers-reduced-motion`) before the 600ms
  route to `/schedule`. A claimed job is a win — celebrate it once.
- **Contention handling** — two drivers can slide the same job. Surface "Just taken" gracefully
  with a suggested next job, not a raw error.

### 2.3 System states: the difference between demo and product

Audit every screen for the **four states**: loading, empty, error, and success. Right now
error handling is a single `actionError`/`loadError` string. Upgrade to:

- **Skeletons over spinners** — you already have `Skeleton` / `PageSkeletons`; use them on the
  shifts feed, wallet ledger, and driver directory so the layout never jumps.
- **Purposeful empty states** — "No open loads in your zone yet" with a CTA to widen the zone
  filter or turn on alerts, not a blank list. (The homepage already models this well.)
- **Inline, recoverable errors** — replace top-level error banners with per-action toasts that
  offer a retry. Add a lightweight toast system (context + `AnimatePresence`) — there isn't one
  yet, and it's the missing glue for optimistic UI.
- **Offline / poor-network awareness** — drivers work in low-signal areas. Detect `navigator.onLine`,
  queue the clock-in/arrived/complete actions, and show a subtle "Saved — will sync" chip.

### 2.4 Live tracking that looks alive

The schedule screen embeds a static OSM iframe and pings GPS every 20s. To feel real:

- **Draw the route line and remaining ETA**, not just a bounding box. Needs a real routing
  provider (see 4.2).
- **Animate the driver marker** smoothly between pings (interpolate) instead of teleporting.
- **Waypoint checklist that advances** — "Arrived" should visibly tick the stop and re-focus the
  map on the next leg.
- **Fleet-side live view** — operators should watch their active loads move on a map in the
  dashboard, with per-load status chips.

### 2.5 Wallet & money clarity

- **Animated balance count-up** when the wallet loads or a payout clears.
- **Payout timeline** — a visual "Escrowed → Released → Paid out" tracker per job so drivers
  trust the 8% and the timing.
- **Cash-out sheet**: show the fee (₦500) and net *before* confirm, with a success state that
  reflects real bank-transfer timing ("Arrives in ~minutes via [bank]").
- **Naira formatting everywhere** — you have `formatMoney`; make sure fee math, tax summary,
  and Connect states never leak cents/USD.

### 2.6 Cross-cutting polish

- **Route/page transitions** — the move/fleet shells use a 0.14s fade; add directional slide
  for forward/back within a flow so navigation has spatial meaning.
- **Shared-element continuity** — a shift card that expands into its detail sheet using
  `layoutId` feels premium and orients the user.
- **Consistent design tokens** — colours are inlined as hex constants (`PRIMARY`, `INK`) across
  many files. Promote them to CSS variables / a Tailwind theme so light/dark and future
  rebrands are one change, not a hundred.
- **Accessibility pass** — focus rings, `aria-live` for claim/clock-in results, 44px min touch
  targets (mostly there), and colour-contrast on the sand palette. `useReducedMotion` is already
  respected in key places — extend it to the new confetti/count-up.
- **Skeleton the AI features** — CRM AI draft, clarify, destination generation: stream tokens or
  show a typing shimmer so AI latency reads as "thinking," not "frozen."

---

## Part 3 — Animation spec (concrete)

Framer Motion presets already live in `lib/motion/presets.ts`. Extend that file so motion stays
centralized and consistent.

| Interaction | Spec | Where |
|-------------|------|-------|
| Slide-to-claim commit | Thumb springs to end (`softSpring`), track fills green, checkmark scales 0→1, haptic pulse | `SlideToClaim` |
| Claim success | One-shot confetti/check burst, 500ms, reduced-motion → simple fade | new `ClaimSuccess` |
| Balance change | Number count-up over 800ms `easeOutExpo` | Wallet |
| Bottom sheet | Keep current spring; add backdrop blur ramp | `AnimatedSheet` |
| List load | `staggerContainer` / `staggerItem` (0.055s stagger) — already present, apply to wallet ledger + driver list | `StaggerList` |
| Screen change within flow | Directional slide (x: ±24 → 0) instead of pure opacity | move/fleet shells |
| Card → detail | `layoutId` shared element | shift & driver cards |
| Live marker | Interpolated position tween between GPS pings | `RouteMap` |
| Toasts | Slide-up + fade, auto-dismiss, `AnimatePresence` exit | new toast system |

**Rules**: every animation checks `useReducedMotion`; nothing blocks input; keep durations
120–400ms for UI, ≤800ms for celebratory moments; use the existing `easeOutExpo` curve so the
whole app shares one feel.

---

## Part 4 — Integrations to make it real

Ordered by how much they move the needle for a **Nigerian** launch.

### 4.1 Payments — the #1 blocker (🔴 critical)

Stripe is wired for escrow and Connect payouts, but **Stripe does not support Nigerian
businesses or naira payouts to local banks.** For a real launch you need a local processor:

- **Paystack** or **Flutterwave** for: card/bank/USSD/transfer collection (fleet funding a load)
  and **payouts/transfers to Nigerian bank accounts** (driver cash-out).
- **Escrow model**: fleet funds → held → 8% fee taken on completion → net transferred to driver's
  bank. Mirror the existing escrow ledger shape (`marketplace_payments`) so the swap is contained
  to `lib/payments/*`.
- **Bank account resolution** — Paystack/Flutterwave "resolve account number → account name" so
  drivers enter a NUBAN and see their name confirmed before cash-out.
- **Keep Stripe** behind an interface for any future international corridor, but make the default
  provider pluggable via env (`PAYMENTS_PROVIDER=paystack`).
- **Webhooks** — you already have `/api/payments/webhook`; add Paystack/Flutterwave signature
  verification and idempotency.

### 4.2 Maps, routing & live tracking (🔴 critical)

OSM embeds are fine for a demo, not for dispatch. Add a real provider:

- **Mapbox** (or Google Maps Platform) for interactive tiles, **Directions API** (route line,
  distance, ETA), and **Geocoding** (address → pin when fleets post loads).
- **Live location transport** — replace the 20s POST-ping with a realtime channel
  (**Pusher / Ably / Supabase Realtime**, or a self-hosted WebSocket) so fleet dashboards see
  drivers move without polling.
- **Distance-based pricing hints** — once you have Directions, suggest fair payouts from
  route length, which sharpens the "pay drivers fairly" promise.
- Reserve `MAPBOX_TOKEN` (already referenced in the health check) as the config key.

### 4.3 Identity & KYC verification (🔴 critical for trust)

Manual base64 uploads + hand review won't scale and won't satisfy insurers. Use a Nigerian
identity provider:

- **Dojah**, **Smile Identity**, **VerifyMe**, or **Prembly/Identitypass** for **NIN / BVN /
  driver's licence verification**, liveness/selfie match, and document OCR.
- **Vehicle/plate checks** where available (FRSC plate verification via aggregators).
- Auto-set the driver's `verified` flag from the provider result; keep `/admin/kyc` only for
  edge-case manual review, not the default path.
- **Insurance / dangerous-goods certs** — OCR expiry dates and auto-flag "expiring soon"
  (the vault already has an `expiring` status to drive off).

### 4.4 Object storage for the vault (🟠 high)

Documents live as base64 in Postgres (max ~1.5MB) — noted in `SETUP.md` as temporary.

- Move to **Cloudflare R2 / AWS S3 / Vercel Blob / Supabase Storage** with signed upload +
  signed read URLs. Keep the current `/api/driver/vault` API shape so the UI is untouched.
- Enables larger files, image/PDF previews, and the KYC provider reading originals.

### 4.5 Phone auth + local SMS (🟠 high)

- **Phone/OTP sign-in** — the default identity for this market. Neon Auth can carry the session;
  the OTP itself should go through a **Nigerian SMS provider** for deliverability:
  **Termii**, **Africa's Talking**, or **Sendchamp**. Twilio works but is pricier and less
  reliable for NG delivery.
- Route all transactional SMS (claim/book/complete alerts) through the same local provider,
  behind the existing `lib/notify/sms` interface.

### 4.6 Realtime messaging between driver & fleet (🟠 high)

A claimed load needs a conversation ("gate code," "I'm 10 min out"). There's a CRM/threads
scaffold (`lib/crm`, `components/crm`) — extend it to a **per-load chat** over the same realtime
channel as tracking, with push notifications on new messages.

### 4.7 Analytics & product telemetry (🟡 medium)

You can't tune a funnel you can't see.

- **PostHog** (self-host-friendly, good for funnels + session replay) or **Mixpanel/Amplitude**.
- Instrument the key events: `onboarding_step`, `job_view`, `slide_claim_start/commit`,
  `clock_in`, `complete`, `cashout`. These map directly to the flows above.
- Keep **Sentry** (already supported) for errors; add release + user context.

### 4.8 Push, PWA & app store presence (🟡 medium)

- Web Push (VAPID) is wired — ship a proper **service worker + installable PWA** (`manifest.ts`
  exists) so drivers can "Add to Home Screen" and get background notifications.
- For a store presence later, wrap the PWA with **Capacitor** to reach the Play Store cheaply,
  which also unlocks native GPS/background location and reliable push.

### 4.9 Supporting integrations (🟢 as-needed)

- **Transactional email** — Resend is wired; add branded templates + receipts.
- **Compliance/legal** — you have `/legal/*`; add click-through acceptance logging at signup.
- **Tax** — 1099 export exists (US-shaped); for NG, plan simple earnings statements instead.
- **Feature flags** — PostHog or a lightweight flag service to dark-launch the new tracking/payment
  paths.

---

## Part 5 — Suggested sequencing

1. **Real payments (Paystack/Flutterwave) + bank payouts** — nothing else matters if money
   doesn't move. (4.1)
2. **KYC provider + object storage** — trust and scale for verification. (4.3, 4.4)
3. **Maps/routing + realtime tracking** — the "it's actually happening" feel. (4.2, 4.6)
4. **Phone/OTP auth + local SMS** — remove the biggest signup friction. (4.5)
5. **UI states + animation polish** — skeletons, toasts, empty states, claim celebration,
   count-ups. (Parts 2–3) — do this *alongside* the above, per screen as you touch it.
6. **Analytics + PWA + flags** — measure, retain, and iterate. (4.7, 4.8)

---

## Part 6 — Environment variables to add

Extends `.env.example`. Nothing here is a secret value — placeholders only.

```bash
# Payments (Nigeria) — pick one as default
PAYMENTS_PROVIDER=paystack            # paystack | flutterwave | stripe
PAYSTACK_SECRET_KEY=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=
PAYSTACK_WEBHOOK_SECRET=
FLUTTERWAVE_SECRET_KEY=
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=
FLUTTERWAVE_WEBHOOK_HASH=

# Maps & routing
MAPBOX_TOKEN=
NEXT_PUBLIC_MAPBOX_TOKEN=

# Realtime (tracking + chat) — pick one
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
NEXT_PUBLIC_PUSHER_KEY=
# or ABLY_API_KEY=

# KYC / identity — pick one
DOJAH_APP_ID=
DOJAH_API_KEY=
# or SMILE_PARTNER_ID= / SMILE_API_KEY=

# Object storage — pick one
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
# or S3_* / BLOB_READ_WRITE_TOKEN=

# Local SMS / OTP — pick one
TERMII_API_KEY=
# or AT_API_KEY= / AT_USERNAME=

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

---

## Part 7 — Definition of "real" (launch checklist)

- [ ] A fleet can fund a load with a Nigerian card/transfer and see it escrowed.
- [ ] A verified driver can claim, run (live tracked), complete, and **cash out to their bank**.
- [ ] Identity is verified against NIN/BVN/licence automatically, not by hand.
- [ ] Documents are in real object storage with signed access.
- [ ] Sign-up is phone/OTP with reliable NG SMS delivery.
- [ ] Driver ↔ fleet can message on an active load, with push.
- [ ] Every screen has intentional loading, empty, error, and success states.
- [ ] The claim moment is celebrated; balances animate; tracking moves.
- [ ] Errors report to Sentry; funnels report to analytics.
- [ ] The app is installable (PWA) and sends background push.
</content>
</invoke>

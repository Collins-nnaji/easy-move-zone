# Moving marketplace launch and operations

The moving app now supports configurable estimates, reviewed quotes, Paystack deposits and delivery balances, customer move history, repeat bookings, saved addresses, business profiles, signed condition checklists, moderated reviews, cancellation/rescheduling, claims, partner document review, fleet listings, job acceptance, earnings statements, payout records and queued SMS/WhatsApp status messages.

## Setup

1. Configure Neon database and authentication as described in SETUP.md. Run `npm run db:setup`. The additive `20261010_moving_marketplace.sql` migration preserves existing records. Runtime also creates the marketplace table on first use. No existing bookings are assigned to newly created customer accounts by email; new bookings made while signed in store the account ID.
2. Set `PAYSTACK_SECRET_KEY` to your test key first and `NEXT_PUBLIC_APP_URL` to the application origin. In Paystack, set the webhook URL to `https://your-domain/api/payments/webhook`. The Paystack secret key validates the raw webhook HMAC; a separate webhook secret is not used. The implementation uses NGN kobo and verifies reference, amount, currency and success state server-side. A webhook and browser callback can be repeated without a second credit. Only one pending checkout per move is permitted. Paid quotes cannot be edited, and pending checkout also prevents quote revision.
3. Set your real `NEXT_PUBLIC_CONTACT_PHONE` and `NEXT_PUBLIC_WHATSAPP_NUMBER` (international digits). These show on Contact, in the footer, and as the WhatsApp support button. No phone number is fabricated if settings are missing.
4. Set `EMZ_LEGAL_NAME`, `EMZ_CAC_NUMBER`, `EMZ_BUSINESS_ADDRESS` and `EMZ_TEAM_DESCRIPTION` using verified business information. The About page does not claim a registration number or insurance cover when none is supplied.
5. For automated updates set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_PHONE`, `TWILIO_WHATSAPP_FROM` and `TWILIO_WHATSAPP_CONTENT_SID`. Create an approved WhatsApp utility template with variables `1` for move reference and `2` for the status label. Customers explicitly opt in when booking. Configure a scheduler to POST `/api/notifications/process` every minute with `Authorization: Bearer <CRON_SECRET>`. Operations can also process the queue at `/admin/operations`. No messages are delivered by development tests.

## Booking workflow

Customers see a price range immediately. The road distance is customer-entered, not geocoded; operations checks it before confirming. Lagos, Abuja and Port Harcourt accept requests subject to availability. Intercity moves go through support.

Requests start at `requested` without a payable quote. Operations reviews photos/inventory and enters a quote, moving the request to `quoted`. The customer follows the private reference to Track and checkout. A verified deposit changes the status to `scheduled`. Only verified, available partners can be assigned. Scheduling serializes writes and rejects overlapping dates for the same crew or vehicle owner. The conservative rule reserves a partner for one job per date, even if its listed fleet has several vehicles.

Partners accept or decline the assignment. Accepted partners progress through arriving, arrived, loaded, transit and completed. Balance checkout opens after completion. Tracking refreshes every 15 seconds and displays recorded job stages, not live GPS coordinates.

## Customers and evidence

Sign in before booking to save move history. Account IDs, not email matching, protect customer records. Guest references expose only a limited tracking and checkout summary; treat the reference as a private bearer token. Signed-in customers and assigned partners can add pickup/delivery item conditions and photos. Only the owning customer can sign the saved checklist; signed records cannot be edited, including during concurrent writes. Claims accept photos and have customer-visible outcome notes. Reviews can only be submitted for completed moves and require publication by operations.

Online changes close 48 hours before moving day and once crew travel starts. Paid cancellations are recorded for manual refund review. There is no automatic refund execution. Guest changes and claims go through Contact. The damage policy deliberately makes no unverified insurance promise.

## Operations

`/admin` manages the booking pipeline, quotes, crew and vehicle assignment. `/admin/operations` contains pricing, reports, partner verification, claims, reviews, payment reconciliation, payouts and message queue. Pricing controls cover distance, stairs multiplier, city, vehicle size, area supplements, deposit and commission (10–20%). Existing requests retain their saved estimates and commercial percentages.

Partner verification is manual document review, not automated NIN/BVN validation. The existing profile identifies a primary vehicle and additional fleet vehicles are listed in partner details. Bank payout records are entered only after a real transfer and require a bank reference, a completed fully paid job, and an assigned partner. All partner payouts together are capped at the job's net earnings after commission. The app does not initiate bank transfers; operations agrees each partner's share. Refunds are likewise handled through the payment provider by the team.

If checkout initialization is interrupted after provider acceptance, its pending ledger entry is retained to avoid duplicate charges. Use Payments in operations to verify successful payments or release failed/abandoned/reversed checkouts. Pending provider states are never marked paid. Unknown initialization outcomes without a checkout URL require support/provider investigation.

Notification delivery uses a durable queue, exclusive batch claims and up to five attempts. Missing channel credentials leave messages queued. A provider acceptance followed by a lost database acknowledgement may lead to a duplicate retry (at-least-once delivery). Enable your scheduler for automation. Messages marked sent mean accepted by the provider, not confirmed delivered to the handset.

Reports currently cover the latest 100 moves and 500 records per ledger collection. Large fleets and long histories need pagination/export in a later scaling change. Photos and verification documents remain in access-controlled database JSON like the pre-existing booking photos; production document retention and storage access should follow the organisation's privacy process.

## Validation

Run `npm run lint`, `npm test`, `npx tsc --noEmit` and `npm run build`. Test provider checkout and webhook delivery with Paystack test keys, and approved WhatsApp templates with your Twilio test setup, before accepting real bookings. Local automated tests cover access control, paid status gating, tampered signatures, mismatched transaction amounts, duplicate callbacks, immutable signed evidence and change deadlines.

Provider references: [Paystack transactions](https://paystack.com/docs/api/transaction/), [Paystack webhooks](https://paystack.com/docs/payments/webhooks/), [Twilio WhatsApp templates](https://www.twilio.com/docs/whatsapp/tutorial/send-whatsapp-notification-messages-templates).

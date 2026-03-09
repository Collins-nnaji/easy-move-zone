# CRM Feature Pack (Next.js + Neon)

This folder provides a functional CRM foundation:

- **Schema + seed data** (prospects, clients, messages, tasks, activities, roles)
- **Repository layer** for dashboards/lists/inbox
- **Communication adapters** for in-app/email/SMS
- **AI draft helper** for follow-up replies
- **React components** for dashboard/tables/inbox

## 1) Apply database migrations

Run in order:

1. `db/migrations/20260309_crm_core.sql`
2. `db/migrations/20260309_crm_views.sql`
3. `db/seeds/20260309_small_demo_seed.sql`

If you use `psql`:

```bash
psql "$DATABASE_URL" -f db/migrations/20260309_crm_core.sql
psql "$DATABASE_URL" -f db/migrations/20260309_crm_views.sql
psql "$DATABASE_URL" -f db/seeds/20260309_small_demo_seed.sql
```

## 2) Wire to your existing auth

You already have auth set up. Map your auth user id to `crm_users.auth_user_id`.

Then query `crm_user_roles` + `crm_roles` for role-aware access control.

## 3) Required environment variables

Already provided by you:

- `DATABASE_URL`
- `NEON_AUTH_COOKIE_SECRET`
- `NEON_AUTH_BASE_URL`
- `NEON_DATA_API_URL`

Add for communication:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_PHONE`

Add for AI:

- `OPENAI_API_KEY`

## 4) Suggested route wiring

Use your existing App Router page and fetch data server-side via `CrmRepository`.

High-level route map:

- `/crm` (dashboard)
- `/crm/prospects`
- `/crm/clients`
- `/crm/inbox`
- `/crm/inbox/[threadId]`

## 5) Communication flow

When sending a message:

1. Insert into `communication_messages`.
2. If channel is `email`, call `sendOutboundMessage({ channel: "email", ... })` then store provider result in `email_deliveries`.
3. If channel is `sms`, call `sendOutboundMessage({ channel: "sms", ... })` then store provider result in `sms_deliveries`.
4. Update `communication_threads.last_message_at`.

## 6) AI drafting

Use `draftAiReply(...)` in compose UI for one-click suggested follow-up text.

---

Security note: rotate any credentials that were previously shared in plaintext.

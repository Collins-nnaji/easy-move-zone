import Stripe from "stripe"
import { neon } from "@neondatabase/serverless"

const secretKey = process.env.STRIPE_SECRET_KEY?.trim()
const databaseUrl = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL

export const JOBS_SUBSCRIPTION_PRICE_ID =
  process.env.STRIPE_JOBS_PRICE_ID?.trim() || "price_1RXV8cRt3Wt49gX5ItxFxPQX"
export const JOBS_PAYMENT_LINK =
  process.env.NEXT_PUBLIC_STRIPE_JOBS_PAYMENT_LINK?.trim() || "https://buy.stripe.com/14A6oJ788abk9n27dbfnO0p"

export const stripe = secretKey ? new Stripe(secretKey) : null
const sql = databaseUrl ? neon(databaseUrl) : null

export type SubscriptionState = {
  active: boolean
  status: string
  customerId: string | null
  subscriptionId: string | null
}

const ACTIVE_STATUSES = new Set(["active", "trialing"])

export async function getJobsSubscription(userId: string): Promise<SubscriptionState> {
  if (!sql) return { active: false, status: "unconfigured", customerId: null, subscriptionId: null }
  try {
    const rows = await sql`
      select stripe_customer_id, stripe_subscription_id, subscription_status
      from skilledjobs.users where id = ${userId} limit 1
    `
    const row = rows[0]
    const status = String(row?.subscription_status ?? "inactive")
    return {
      active: ACTIVE_STATUSES.has(status),
      status,
      customerId: row?.stripe_customer_id ? String(row.stripe_customer_id) : null,
      subscriptionId: row?.stripe_subscription_id ? String(row.stripe_subscription_id) : null,
    }
  } catch {
    return { active: false, status: "inactive", customerId: null, subscriptionId: null }
  }
}

export async function saveStripeCustomer(input: {
  userId: string
  email?: string | null
  customerId: string
}) {
  if (!sql) throw new Error("Database is not configured")
  await sql`
    insert into skilledjobs.users (id, email, stripe_customer_id, created_at, updated_at)
    values (${input.userId}, ${input.email || null}, ${input.customerId}, now(), now())
    on conflict (id) do update set
      email = coalesce(excluded.email, skilledjobs.users.email),
      stripe_customer_id = excluded.stripe_customer_id,
      updated_at = now()
  `
}

export async function updateStripeSubscription(input: {
  customerId: string
  subscriptionId?: string | null
  status: string
  userId?: string | null
  email?: string | null
}) {
  if (!sql) throw new Error("Database is not configured")
  let resolvedUserId = input.userId
  if (!resolvedUserId && input.email) {
    const authRows = await sql.query(
      `select id from neon_auth."user" where lower(email) = lower($1) limit 1`,
      [input.email],
    ) as Array<{ id: string }>
    resolvedUserId = authRows[0]?.id || null
  }
  if (resolvedUserId) {
    await sql`
      insert into skilledjobs.users (
        id, email, stripe_customer_id, stripe_subscription_id, subscription_status, created_at, updated_at
      ) values (
        ${resolvedUserId}, ${input.email || null}, ${input.customerId}, ${input.subscriptionId || null}, ${input.status}, now(), now()
      )
      on conflict (id) do update set
        email = coalesce(excluded.email, skilledjobs.users.email),
        stripe_customer_id = excluded.stripe_customer_id,
        stripe_subscription_id = excluded.stripe_subscription_id,
        subscription_status = excluded.subscription_status,
        updated_at = now()
    `
    return
  }
  await sql`
    update skilledjobs.users set
      stripe_customer_id = ${input.customerId},
      stripe_subscription_id = ${input.subscriptionId || null},
      subscription_status = ${input.status},
      updated_at = now()
    where stripe_customer_id = ${input.customerId}
       or (${input.email || null}::text is not null and stripe_customer_id is null and email = ${input.email || null})
  `
}

export function absoluteAppUrl(request: Request, path: string) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim()?.replace(/\/$/, "")
  return `${configured || new URL(request.url).origin}${path}`
}

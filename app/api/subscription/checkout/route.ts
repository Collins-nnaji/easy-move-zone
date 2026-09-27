import { neonAuth } from "@neondatabase/auth/next/server"
import {
  absoluteAppUrl,
  getJobsSubscription,
  JOBS_PAYMENT_LINK,
  JOBS_SUBSCRIPTION_PRICE_ID,
  saveStripeCustomer,
  stripe,
} from "@/lib/payments/jobs-subscription"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const { session, user } = await neonAuth()
  if (!session || !user) return Response.json({ error: "Unauthorized" }, { status: 401 })
  if (!stripe) return Response.json({ url: JOBS_PAYMENT_LINK, hostedLink: true })

  const userId = String(user.id)
  const current = await getJobsSubscription(userId)
  if (current.active) return Response.json({ error: "You already have an active subscription." }, { status: 409 })

  let customerId = current.customerId
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email || undefined,
      name: user.name || undefined,
      metadata: { easymove_user_id: userId },
    })
    customerId = customer.id
    await saveStripeCustomer({ userId, email: user.email, customerId })
  }

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: JOBS_SUBSCRIPTION_PRICE_ID, quantity: 1 }],
    success_url: absoluteAppUrl(request, "/jobs?subscription=success"),
    cancel_url: absoluteAppUrl(request, "/jobs?subscription=cancelled"),
    allow_promotion_codes: true,
    client_reference_id: userId,
    metadata: { easymove_user_id: userId, product: "jobs" },
    subscription_data: { metadata: { easymove_user_id: userId, product: "jobs" } },
  })

  return Response.json({ url: checkout.url })
}

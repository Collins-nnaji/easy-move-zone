import { neonAuth } from "@neondatabase/auth/next/server"
import { absoluteAppUrl, getJobsSubscription, stripe } from "@/lib/payments/jobs-subscription"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const { session, user } = await neonAuth()
  if (!session || !user) return Response.json({ error: "Unauthorized" }, { status: 401 })
  if (!stripe) return Response.json({ error: "Stripe is not configured." }, { status: 503 })

  const subscription = await getJobsSubscription(String(user.id))
  if (!subscription.customerId) {
    return Response.json({ error: "No Stripe customer is connected to this account yet." }, { status: 404 })
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: subscription.customerId,
    return_url: absoluteAppUrl(request, "/jobs"),
  })
  return Response.json({ url: portal.url })
}

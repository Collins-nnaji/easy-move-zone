import { neonAuth } from "@neondatabase/auth/next/server"
import { getJobsSubscription, JOBS_PAYMENT_LINK } from "@/lib/payments/jobs-subscription"

export const runtime = "nodejs"

export async function GET() {
  const { session, user } = await neonAuth()
  if (!session || !user) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const subscription = await getJobsSubscription(String(user.id))
  return Response.json({ ...subscription, paymentLink: JOBS_PAYMENT_LINK })
}

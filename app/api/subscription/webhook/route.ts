import type Stripe from "stripe"
import { stripe, updateStripeSubscription } from "@/lib/payments/jobs-subscription"

export const runtime = "nodejs"

function customerId(value: string | Stripe.Customer | Stripe.DeletedCustomer | null) {
  return typeof value === "string" ? value : value?.id || null
}

export async function POST(request: Request) {
  if (!stripe) return Response.json({ error: "Stripe is not configured." }, { status: 503 })
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim()
  const signature = request.headers.get("stripe-signature")
  if (!secret || !signature) return Response.json({ error: "Webhook is not configured." }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret)
  } catch {
    return Response.json({ error: "Invalid webhook signature." }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const checkout = event.data.object as Stripe.Checkout.Session
    const customer = customerId(checkout.customer)
    const subscriptionId = typeof checkout.subscription === "string" ? checkout.subscription : checkout.subscription?.id
    if (customer && subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      await updateStripeSubscription({
        customerId: customer,
        subscriptionId,
        status: subscription.status,
        userId: checkout.client_reference_id || checkout.metadata?.easymove_user_id,
        email: checkout.customer_details?.email,
      })
    }
  }

  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription
    const customer = customerId(subscription.customer)
    if (customer) {
      const customerRecord = await stripe.customers.retrieve(customer)
      await updateStripeSubscription({
        customerId: customer,
        subscriptionId: subscription.id,
        status: subscription.status,
        userId: subscription.metadata.easymove_user_id || null,
        email: !customerRecord.deleted ? customerRecord.email : null,
      })
    }
  }

  return Response.json({ received: true })
}

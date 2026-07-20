import { requireStripe } from "@/lib/payments/stripe";
import { markLoadFundedFromSession } from "@/lib/payments/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return Response.json({ error: "STRIPE_WEBHOOK_SECRET not configured." }, { status: 500 });
  }

  try {
    const stripe = requireStripe();
    const signature = request.headers.get("stripe-signature");
    if (!signature) return Response.json({ error: "Missing signature." }, { status: 400 });

    const rawBody = await request.text();
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      if (session.metadata?.kind === "load_fund" && typeof session.id === "string") {
        await markLoadFundedFromSession(
          session.id,
          typeof session.payment_intent === "string" ? session.payment_intent : null,
        );
      }
    }

    return Response.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook error.";
    return Response.json({ error: message }, { status: 400 });
  }
}

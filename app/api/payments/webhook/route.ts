import { requireStripe } from "@/lib/payments/stripe";
import { verifyPaystackSignature } from "@/lib/payments/paystack";
import { markLoadFundedFromSession } from "@/lib/payments/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // Paystack (Nigeria) signs the raw body with HMAC-SHA512 in x-paystack-signature.
  const paystackSignature = request.headers.get("x-paystack-signature");
  if (paystackSignature) {
    return handlePaystackWebhook(request, paystackSignature);
  }
  return handleStripeWebhook(request);
}

async function handlePaystackWebhook(request: Request, signature: string) {
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!secret) {
    return Response.json({ error: "PAYSTACK_SECRET_KEY not configured." }, { status: 500 });
  }

  const rawBody = await request.text();
  if (!verifyPaystackSignature(rawBody, signature, secret)) {
    return Response.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    const event = JSON.parse(rawBody) as {
      event?: string;
      data?: { reference?: string };
    };

    // markLoadFundedFromSession matches the stored reference, so it is a no-op
    // for any reference that is not a pending load_fund payment.
    if (event.event === "charge.success" && event.data?.reference) {
      await markLoadFundedFromSession(event.data.reference);
    }

    return Response.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook error.";
    return Response.json({ error: message }, { status: 400 });
  }
}

async function handleStripeWebhook(request: Request) {
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

import { neonAuth } from "@neondatabase/auth/next/server";
import { createConnectOnboardingLink, getDriverPaymentStatus, refreshConnectStatus } from "@/lib/payments/service";
import { isStripeConfigured } from "@/lib/payments/stripe";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { user } = await neonAuth();
    if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });
    const status = await getDriverPaymentStatus(String(user.id));
    return Response.json({ ...status, configured: isStripeConfigured });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to load payment status.";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await neonAuth();
    if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });

    const body = (await request.json().catch(() => ({}))) as { action?: string };
    if (body.action === "refresh") {
      const result = await refreshConnectStatus(String(user.id));
      return Response.json(result);
    }

    const result = await createConnectOnboardingLink(String(user.id), user.email);
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to start payout onboarding.";
    return Response.json({ error: message }, { status: 400 });
  }
}

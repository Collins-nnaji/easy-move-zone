import { neonAuth } from "@neondatabase/auth/next/server";
import { cashOutWithStripe } from "@/lib/payments/service";

export const runtime = "nodejs";

export async function POST() {
  try {
    const { user } = await neonAuth();
    if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });

    const result = await cashOutWithStripe(String(user.id));
    return Response.json({ amount: result.amount, mode: result.mode, message: result.message });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to cash out.";
    return Response.json({ error: message }, { status: 400 });
  }
}

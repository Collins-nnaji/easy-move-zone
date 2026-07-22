import { neonAuth } from "@neondatabase/auth/next/server";
import { createLoadFundingCheckout } from "@/lib/payments/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { user } = await neonAuth();
    if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });

    const body = (await request.json()) as { shiftId?: string };
    if (!body.shiftId) return Response.json({ error: "shiftId is required." }, { status: 400 });

    const result = await createLoadFundingCheckout(String(user.id), body.shiftId, {
      email: user.email,
    });
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to start funding checkout.";
    return Response.json({ error: message }, { status: 400 });
  }
}

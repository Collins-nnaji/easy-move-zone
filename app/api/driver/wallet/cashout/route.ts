import { neonAuth } from "@neondatabase/auth/next/server";
import { cashOut } from "@/lib/driver/service";

export const runtime = "nodejs";

export async function POST() {
  try {
    const { session, user } = await neonAuth();
    if (!session || !user) return Response.json({ error: "Sign in to cash out." }, { status: 401 });

    const amount = await cashOut(String(user.id));
    return Response.json({ amount });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to process cashout.";
    return Response.json({ error: message }, { status: 400 });
  }
}

import { neonAuth } from "@neondatabase/auth/next/server";
import { rateOperator } from "@/lib/driver/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { user } = await neonAuth();
    if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });

    const body = (await request.json()) as { shiftId?: string; stars?: number; comment?: string };
    if (!body.shiftId || !body.stars) {
      return Response.json({ error: "shiftId and stars are required." }, { status: 400 });
    }

    await rateOperator(String(user.id), body.shiftId, body.stars, body.comment);
    return Response.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to submit rating.";
    return Response.json({ error: message }, { status: 400 });
  }
}

import { neonAuth } from "@neondatabase/auth/next/server";
import { submitRating } from "@/lib/fleet/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { user } = await neonAuth();
    if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });

    const body = (await request.json()) as { shiftId?: string; stars?: number; comment?: string };
    if (!body.shiftId || !body.stars) {
      return Response.json({ error: "shiftId and stars are required." }, { status: 400 });
    }

    await submitRating(String(user.id), { shiftId: body.shiftId, stars: body.stars, comment: body.comment }, "fleet");
    return Response.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to submit rating.";
    return Response.json({ error: message }, { status: 400 });
  }
}

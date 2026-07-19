import { neonAuth } from "@neondatabase/auth/next/server";
import { completeShift } from "@/lib/fleet/service";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user } = await neonAuth();
    if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });

    const { id } = await params;
    await completeShift(String(user.id), id, "fleet");
    return Response.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to complete shift.";
    return Response.json({ error: message }, { status: 400 });
  }
}

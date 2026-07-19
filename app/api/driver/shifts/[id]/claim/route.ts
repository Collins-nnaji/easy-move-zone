import { neonAuth } from "@neondatabase/auth/next/server";
import { claimShift } from "@/lib/driver/service";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { session, user } = await neonAuth();
    if (!session || !user) return Response.json({ error: "Sign in to claim shifts." }, { status: 401 });

    const { id } = await params;
    await claimShift(String(user.id), id);
    return Response.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to claim shift.";
    return Response.json({ error: message }, { status: 400 });
  }
}

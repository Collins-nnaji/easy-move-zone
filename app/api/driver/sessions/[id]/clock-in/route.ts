import { neonAuth } from "@neondatabase/auth/next/server";
import { clockInSession } from "@/lib/driver/service";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { session, user } = await neonAuth();
    if (!session || !user) return Response.json({ error: "Sign in to clock in." }, { status: 401 });

    const { id } = await params;
    await clockInSession(String(user.id), id);
    return Response.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to clock in.";
    return Response.json({ error: message }, { status: 400 });
  }
}

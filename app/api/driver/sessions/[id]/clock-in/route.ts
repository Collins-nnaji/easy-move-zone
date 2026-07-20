import { neonAuth } from "@neondatabase/auth/next/server";
import { clockInSession } from "@/lib/driver/service";
import { captureException } from "@/lib/monitoring/sentry";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { session, user } = await neonAuth();
    if (!session || !user) return Response.json({ error: "Sign in to clock in." }, { status: 401 });

    const { id } = await params;
    let location: { lat?: number; lng?: number } | undefined;
    try {
      const body = (await request.json()) as { lat?: number; lng?: number };
      if (typeof body.lat === "number" && typeof body.lng === "number") {
        location = { lat: body.lat, lng: body.lng };
      }
    } catch {
      /* body optional */
    }

    await clockInSession(String(user.id), id, location);
    return Response.json({ ok: true, gps: Boolean(location) });
  } catch (err) {
    await captureException(err, { tags: { route: "clock-in" } });
    const message = err instanceof Error ? err.message : "Unable to clock in.";
    return Response.json({ error: message }, { status: 400 });
  }
}

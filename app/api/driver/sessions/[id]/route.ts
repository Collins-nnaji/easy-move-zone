import { neonAuth } from "@neondatabase/auth/next/server";
import { markWaypointDone, updateSessionLocation } from "@/lib/driver/service";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { session, user } = await neonAuth();
    if (!session || !user) return Response.json({ error: "Sign in required." }, { status: 401 });

    const { id } = await params;
    const body = (await request.json()) as {
      lat?: number;
      lng?: number;
      waypointId?: string;
    };

    if (body.waypointId) {
      const waypoints = await markWaypointDone(String(user.id), id, body.waypointId);
      return Response.json({ ok: true, waypoints });
    }

    if (typeof body.lat === "number" && typeof body.lng === "number") {
      await updateSessionLocation(String(user.id), id, { lat: body.lat, lng: body.lng });
      return Response.json({ ok: true });
    }

    return Response.json({ error: "Provide location or waypointId." }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to update session.";
    return Response.json({ error: message }, { status: 400 });
  }
}

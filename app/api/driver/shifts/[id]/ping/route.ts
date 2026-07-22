import { neonAuth } from "@neondatabase/auth/next/server";
import { driverSql } from "@/lib/driver/db";
import { recordLocationPing } from "@/lib/escrow/service";

export const runtime = "nodejs";

/**
 * GPS breadcrumb from the driver app while a load is active. The trail is the
 * evidence base for route-deviation and no-show disputes.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { session, user } = await neonAuth();
    if (!session || !user) return Response.json({ error: "Sign in required." }, { status: 401 });

    const { id } = await params;
    const body = (await request.json()) as { lat?: number; lng?: number; accuracyM?: number };

    if (typeof body.lat !== "number" || typeof body.lng !== "number") {
      return Response.json({ error: "lat and lng are required." }, { status: 400 });
    }

    const authUserId = String(user.id);

    if (driverSql) {
      const rows = (await driverSql.query(
        `select claimed_by from driver_shifts where id = $1`,
        [id],
      )) as Array<{ claimed_by: string | null }>;
      if (rows[0]?.claimed_by !== authUserId) {
        return Response.json({ error: "Not your load." }, { status: 403 });
      }
    }

    await recordLocationPing({
      shiftId: id,
      authUserId,
      lat: body.lat,
      lng: body.lng,
      accuracyM: typeof body.accuracyM === "number" ? body.accuracyM : null,
    });

    // Keep the session's last-known position in sync for fleet tracking.
    if (driverSql) {
      await driverSql.query(
        `update driver_shift_sessions
         set last_lat = $3, last_lng = $4, last_location_at = now(), updated_at = now()
         where shift_id = $1 and auth_user_id = $2`,
        [id, authUserId, body.lat, body.lng],
      );
    }

    return Response.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to record location.";
    return Response.json({ error: message }, { status: 400 });
  }
}

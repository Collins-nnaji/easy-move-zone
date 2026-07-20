import { neonAuth } from "@neondatabase/auth/next/server";
import { claimShift, ensureDriverProfile } from "@/lib/driver/service";
import { notifyFleetOfClaim, saveContactEmail } from "@/lib/booking/offers";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { session, user } = await neonAuth();
    if (!session || !user) return Response.json({ error: "Sign in to claim shifts." }, { status: 401 });

    const authUserId = String(user.id);
    const { id } = await params;

    if (user.email) await saveContactEmail("driver", authUserId, String(user.email));

    await claimShift(authUserId, id);

    const profile = await ensureDriverProfile(authUserId);
    await notifyFleetOfClaim({
      shiftId: id,
      driverUserId: authUserId,
      driverName: profile.displayName ?? user.name ?? user.email,
    });

    return Response.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to claim shift.";
    return Response.json({ error: message }, { status: 400 });
  }
}

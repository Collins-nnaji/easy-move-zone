import { neonAuth } from "@neondatabase/auth/next/server";
import { acceptOffer, declineOffer, notifyFleetOfClaim, saveContactEmail } from "@/lib/booking/offers";
import { ensureDriverProfile } from "@/lib/driver/service";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user } = await neonAuth();
    if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });

    const authUserId = String(user.id);
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as { action?: "accept" | "decline" };
    const action = body.action ?? "accept";

    if (user.email) await saveContactEmail("driver", authUserId, String(user.email));

    if (action === "decline") {
      await declineOffer(authUserId, id);
      return Response.json({ ok: true });
    }

    const result = await acceptOffer(authUserId, id);
    const profile = await ensureDriverProfile(authUserId);
    await notifyFleetOfClaim({
      shiftId: result.shiftId,
      driverUserId: authUserId,
      driverName: profile.displayName ?? user.name ?? user.email,
    });

    return Response.json({ ok: true, shiftId: result.shiftId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to update offer.";
    return Response.json({ error: message }, { status: 400 });
  }
}

import { neonAuth } from "@neondatabase/auth/next/server";
import { getDeliveryOtpForFleet, ensureMilestones } from "@/lib/escrow/service";

export const runtime = "nodejs";

/**
 * The delivery code for a load, readable only by the operator who posted it.
 * They pass it to the receiver, who reads it back to the driver at drop-off —
 * that hand-off is what proves someone at the destination signed for the cargo.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { session, user } = await neonAuth();
    if (!session || !user) return Response.json({ error: "Sign in required." }, { status: 401 });

    const { id } = await params;
    await ensureMilestones(id);
    const code = await getDeliveryOtpForFleet(String(user.id), id);

    return Response.json({ code });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to load delivery code.";
    return Response.json({ error: message }, { status: 400 });
  }
}

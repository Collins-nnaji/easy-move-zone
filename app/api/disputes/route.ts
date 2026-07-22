import { neonAuth } from "@neondatabase/auth/next/server";
import { openDispute, evaluateAndAdvance, getDisputesForShift } from "@/lib/disputes/service";
import type { DisputeCategory } from "@/lib/disputes/rules";
import { captureException } from "@/lib/monitoring/sentry";

export const runtime = "nodejs";

const CATEGORIES: DisputeCategory[] = [
  "no_show",
  "cargo_damage",
  "shortage",
  "non_payment",
  "route_deviation",
  "safety_incident",
  "other",
];

/** Disputes on a load — either party to it can read them. */
export async function GET(request: Request) {
  try {
    const { session, user } = await neonAuth();
    if (!session || !user) return Response.json({ error: "Sign in required." }, { status: 401 });

    const shiftId = new URL(request.url).searchParams.get("shiftId");
    if (!shiftId) return Response.json({ error: "shiftId is required." }, { status: 400 });

    const items = await getDisputesForShift(shiftId);
    return Response.json({ items });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to load disputes.";
    return Response.json({ error: message }, { status: 400 });
  }
}

/** Open a dispute. Freezes escrow, then runs the auto-resolve rules. */
export async function POST(request: Request) {
  try {
    const { session, user } = await neonAuth();
    if (!session || !user) {
      return Response.json({ error: "Sign in to file a dispute." }, { status: 401 });
    }

    const body = (await request.json()) as {
      shiftId?: string;
      category?: string;
      description?: string;
    };

    if (!body.shiftId) return Response.json({ error: "shiftId is required." }, { status: 400 });
    const category = body.category as DisputeCategory | undefined;
    if (!category || !CATEGORIES.includes(category)) {
      return Response.json({ error: "Unknown dispute category." }, { status: 400 });
    }

    const dispute = await openDispute({
      authUserId: String(user.id),
      shiftId: body.shiftId,
      category,
      description: body.description ?? null,
    });

    // Cheap deterministic rules first; only what they can't settle queues for ops.
    const outcome = await evaluateAndAdvance(dispute.id);

    return Response.json({ ok: true, dispute, outcome });
  } catch (err) {
    await captureException(err, { tags: { route: "dispute-open" } });
    const message = err instanceof Error ? err.message : "Unable to file dispute.";
    return Response.json({ error: message }, { status: 400 });
  }
}

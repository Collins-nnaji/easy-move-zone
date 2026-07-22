import { neonAuth } from "@neondatabase/auth/next/server";
import { confirmMilestone, getEscrowSummary, ensureMilestones } from "@/lib/escrow/service";
import type { MilestoneKind } from "@/lib/escrow/schedule";
import { captureException } from "@/lib/monitoring/sentry";

export const runtime = "nodejs";

const VALID_KINDS: MilestoneKind[] = ["pickup", "checkpoint", "delivery", "holdback"];

/** Escrow schedule + progress for a load. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { session, user } = await neonAuth();
    if (!session || !user) return Response.json({ error: "Sign in required." }, { status: 401 });

    const { id } = await params;
    await ensureMilestones(id);
    const escrow = await getEscrowSummary(id);
    return Response.json({ escrow });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to load escrow.";
    return Response.json({ error: message }, { status: 400 });
  }
}

/** Driver confirms a milestone (pickup / checkpoint / delivery). */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { session, user } = await neonAuth();
    if (!session || !user) {
      return Response.json({ error: "Sign in to confirm milestones." }, { status: 401 });
    }

    const { id } = await params;
    const body = (await request.json()) as {
      kind?: string;
      lat?: number;
      lng?: number;
      photoData?: string;
      photoMime?: string;
      otp?: string;
      note?: string;
    };

    const kind = body.kind as MilestoneKind | undefined;
    if (!kind || !VALID_KINDS.includes(kind)) {
      return Response.json({ error: "Unknown milestone." }, { status: 400 });
    }
    if (kind === "holdback") {
      return Response.json(
        { error: "The holdback releases automatically once the dispute window closes." },
        { status: 400 },
      );
    }

    const result = await confirmMilestone(kind, {
      authUserId: String(user.id),
      shiftId: id,
      lat: typeof body.lat === "number" ? body.lat : null,
      lng: typeof body.lng === "number" ? body.lng : null,
      photoData: body.photoData ?? null,
      photoMime: body.photoMime ?? null,
      otp: body.otp ?? null,
      note: body.note ?? null,
    });

    const escrow = await getEscrowSummary(id);
    return Response.json({ ok: true, result, escrow });
  } catch (err) {
    await captureException(err, { tags: { route: "milestone-confirm" } });
    const message = err instanceof Error ? err.message : "Unable to confirm milestone.";
    return Response.json({ error: message }, { status: 400 });
  }
}

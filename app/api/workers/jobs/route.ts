import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth/session";
import { getMove } from "@/lib/moving/store";
import { changeMove } from "@/lib/marketplace/moves";
import { resolveWorkerForUser } from "@/lib/moving/worker-store";
import { workerExtras } from "@/lib/marketplace/store";
import { body, InputError, reference } from "@/lib/marketplace/http";
import { queueUpdate } from "@/lib/marketplace/notifications";
export async function PATCH(request: Request) {
  try {
    const user = await requireSessionUser();
    if (!user) throw new InputError("Sign in required.", 401);
    const b = await body(request);
    if (!reference(b.reference)) throw new InputError("Invalid job reference.");
    const worker = await resolveWorkerForUser(user);
    const m = await getMove(b.reference);
    if (!worker || !m || ![m.moverId, m.vehicleId].includes(worker.id))
      throw new InputError("This job is not assigned to you.", 404);
    if ((await workerExtras(worker.id)).verification.status !== "verified")
      throw new InputError("Your profile must be verified first.", 403);
    if (["cancelled", "completed", "requested", "quoted"].includes(m.status))
      throw new InputError("This job is not available for crew updates.", 409);
    if (["accept", "decline"].includes(b.decision)) {
      const accepted = new Set(m.acceptedBy ?? []),
        declined = new Set(m.declinedBy ?? []);
      if (b.decision === "accept") {
        accepted.add(worker.id);
        declined.delete(worker.id);
      } else {
        declined.add(worker.id);
        accepted.delete(worker.id);
      }
      return NextResponse.json({
        move: await changeMove(m, {
          acceptedBy: [...accepted],
          declinedBy: [...declined],
        }),
      });
    }
    const order = [
      "scheduled",
      "arriving",
      "arrived",
      "loaded",
      "transit",
      "completed",
    ];
    if (
      !(m.acceptedBy ?? []).includes(worker.id) ||
      order.indexOf(b.status) !== order.indexOf(m.status) + 1 ||
      typeof b.arrival !== "string" ||
      b.arrival.length > 200
    )
      throw new InputError(
        "Accept the job and update each stage in order.",
        409,
      );
    const move = await changeMove(m, { status: b.status, arrival: b.arrival });
    await queueUpdate(move);
    return NextResponse.json({ move });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof InputError ? e.message : "Could not update job." },
      { status: e instanceof InputError ? e.status : 503 },
    );
  }
}

import { NextResponse } from "next/server";
import {
  assertAdminApi,
  AdminForbiddenError,
} from "@/lib/auth/assert-admin-api";
import { STATUSES } from "@/lib/moving/model";
import { listMoves, getMove } from "@/lib/moving/store";
import { getWorker } from "@/lib/moving/worker-store";
import { crewLabel, isWorkerId } from "@/lib/moving/workers";

import { changeMove } from "@/lib/marketplace/moves";
import { workerExtras } from "@/lib/marketplace/store";
import { InputError } from "@/lib/marketplace/http";
import { queueUpdate } from "@/lib/marketplace/notifications";
export async function GET() {
  try {
    await assertAdminApi();
    return NextResponse.json(
      { moves: await listMoves() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof AdminForbiddenError
            ? "Forbidden"
            : "Could not load moves.",
      },
      {
        status:
          e instanceof InputError
            ? e.status
            : e instanceof AdminForbiddenError
              ? 403
              : 503,
      },
    );
  }
}
export async function PATCH(request: Request) {
  try {
    await assertAdminApi();
    if (
      request.headers.get("origin") &&
      request.headers.get("origin") !== new URL(request.url).origin
    )
      return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
    const b = await request.json();
    const assignmentRequested = "moverId" in b || "vehicleId" in b;
    if (
      !STATUSES.includes(b.status) ||
      !(
        b.quote === null ||
        (typeof b.quote === "number" && Number.isFinite(b.quote) && b.quote > 0)
      ) ||
      typeof b.crew !== "string" ||
      b.crew.length > 200 ||
      typeof b.arrival !== "string" ||
      b.arrival.length > 200 ||
      typeof b.reference !== "string" ||
      (assignmentRequested &&
        ![b.moverId, b.vehicleId].every((id) => id === null || isWorkerId(id)))
    )
      return NextResponse.json(
        { error: "Check the status, quote and crew details." },
        { status: 400 },
      );
    const current = await getMove(b.reference);
    if (!current)
      return NextResponse.json({ error: "Move not found." }, { status: 404 });
    if (current.paidAmount && b.quote !== current.quote)
      throw new InputError(
        "Paid quotes cannot be changed. Resolve adjustments with support.",
        409,
      );
    if (
      [
        "scheduled",
        "arriving",
        "arrived",
        "loaded",
        "transit",
        "completed",
      ].includes(b.status) &&
      (!b.quote ||
        (current.paidAmount ?? 0) <
          Math.round((b.quote * (current.depositPercent ?? 30)) / 100))
    )
      throw new InputError(
        "Verify the deposit before scheduling or progressing this job.",
        409,
      );
    let crew = b.crew;
    let assignment:
      | { moverId: string | null; vehicleId: string | null }
      | undefined;
    if (assignmentRequested) {
      const mover = b.moverId ? ((await getWorker(b.moverId)) ?? null) : null;
      const vehicle = b.vehicleId
        ? ((await getWorker(b.vehicleId)) ?? null)
        : null;
      if (b.moverId && (!mover || mover.kind !== "mover"))
        return NextResponse.json(
          { error: "Choose an onboarded mover." },
          { status: 400 },
        );
      if (b.vehicleId && (!vehicle || vehicle.kind !== "vehicle"))
        return NextResponse.json(
          { error: "Choose an onboarded vehicle." },
          { status: 400 },
        );
      for (const w of [mover, vehicle])
        if (w) {
          const x = await workerExtras(w.id);
          if (x.verification.status !== "verified" || !x.available)
            throw new InputError(
              "Assign a verified, available worker or vehicle owner.",
              409,
            );
        }
      assignment = {
        moverId: mover?.id ?? null,
        vehicleId: vehicle?.id ?? null,
      };
      const label = crewLabel(mover, vehicle);
      if (label) crew = label;
    }
    const move = await changeMove(current, {
      status: b.status,
      quote: b.quote,
      crew,
      arrival: b.arrival,
      ...assignment,
    });
    await queueUpdate(move);
    return NextResponse.json(move ? { move } : { error: "Move not found." }, {
      status: move ? 200 : 404,
    });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof InputError
            ? e.message
            : e instanceof AdminForbiddenError
              ? "Forbidden"
              : "Could not update move.",
      },
      {
        status:
          e instanceof InputError
            ? e.status
            : e instanceof AdminForbiddenError
              ? 403
              : 503,
      },
    );
  }
}

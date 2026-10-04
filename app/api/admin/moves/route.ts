import { NextResponse } from "next/server";
import {
  assertAdminApi,
  AdminForbiddenError,
} from "@/lib/auth/assert-admin-api";
import { STATUSES } from "@/lib/moving/model";
import { listMoves, updateMove } from "@/lib/moving/store";
import { getWorker } from "@/lib/moving/worker-store";
import { crewLabel, isWorkerId } from "@/lib/moving/workers";

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
      { status: e instanceof AdminForbiddenError ? 403 : 503 },
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
        ![b.moverId, b.vehicleId].every(
          (id) => id === null || isWorkerId(id),
        ))
    )
      return NextResponse.json(
        { error: "Check the status, quote and crew details." },
        { status: 400 },
      );
    let crew = b.crew;
    let assignment: { moverId: string | null; vehicleId: string | null } | undefined;
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
      assignment = {
        moverId: mover?.id ?? null,
        vehicleId: vehicle?.id ?? null,
      };
      const label = crewLabel(mover, vehicle);
      if (label) crew = label;
    }
    const move = await updateMove(b.reference, {
      status: b.status,
      quote: b.quote,
      crew,
      arrival: b.arrival,
      ...assignment,
    });
    return NextResponse.json(move ? { move } : { error: "Move not found." }, {
      status: move ? 200 : 404,
    });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof AdminForbiddenError
            ? "Forbidden"
            : "Could not update move.",
      },
      { status: e instanceof AdminForbiddenError ? 403 : 503 },
    );
  }
}

import { NextResponse } from "next/server";
import {
  assertAdminApi,
  AdminForbiddenError,
} from "@/lib/auth/assert-admin-api";
import { listMoves, updateMove } from "@/lib/moving/store";
import { STATUSES } from "@/lib/moving/model";
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
      typeof b.reference !== "string"
    )
      return NextResponse.json(
        { error: "Check the status, quote and crew details." },
        { status: 400 },
      );
    const move = await updateMove(b.reference, {
      status: b.status,
      quote: b.quote,
      crew: b.crew,
      arrival: b.arrival,
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

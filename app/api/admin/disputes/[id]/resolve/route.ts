import { NextResponse } from "next/server";
import { assertAdminApi, AdminForbiddenError } from "@/lib/auth/assert-admin-api";
import { applyResolution } from "@/lib/disputes/service";
import type { DisputeResolution } from "@/lib/disputes/rules";

export const runtime = "nodejs";

const RESOLUTIONS: DisputeResolution[] = [
  "release_to_driver",
  "refund_to_fleet",
  "split",
  "no_action",
];

/** Ops decision on an escalated dispute. Moves the held escrow. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await assertAdminApi();
    const { id } = await params;
    const body = (await request.json()) as {
      resolution?: string;
      driverShare?: number;
      note?: string;
    };

    const resolution = body.resolution as DisputeResolution | undefined;
    if (!resolution || !RESOLUTIONS.includes(resolution)) {
      return NextResponse.json({ error: "Unknown resolution." }, { status: 400 });
    }

    // A split needs an explicit share; the other outcomes imply one.
    const driverShare =
      resolution === "split"
        ? typeof body.driverShare === "number"
          ? body.driverShare
          : 0.5
        : resolution === "release_to_driver" || resolution === "no_action"
          ? 1
          : 0;

    const result = await applyResolution({
      disputeId: id,
      resolution,
      driverShare,
      note: body.note ?? null,
      resolvedBy: String(admin.id),
      autoResolved: false,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof AdminForbiddenError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const message = err instanceof Error ? err.message : "Unable to resolve dispute.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import { validateMove } from "@/lib/moving/model";
import { saveMove } from "@/lib/moving/store";
import { requireSessionUser } from "@/lib/auth/session";
import { pricing } from "@/lib/marketplace/store";
import { estimateMove } from "@/lib/marketplace/model";
export async function POST(request: Request) {
  if (
    request.headers.get("origin") &&
    request.headers.get("origin") !== new URL(request.url).origin
  )
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  try {
    const raw = await request.text();
    if (raw.length > 8500000)
      return NextResponse.json(
        { error: "Photos are too large." },
        { status: 413 },
      );
    const input = JSON.parse(raw);
    const requestId = input?.requestId;
    if (
      !validateMove(input) ||
      typeof requestId !== "string" ||
      !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(
        requestId,
      )
    )
      return NextResponse.json(
        {
          error:
            "Check your addresses, move date, inventory and contact details.",
        },
        { status: 400 },
      );
    const {
      service,
      inventory,
      size,
      pickup,
      destination,
      date,
      pickupFloor,
      destinationFloor,
      access,
      extras,
      name,
      email,
      phone,
      photos,
    } = input;
    const user = await requireSessionUser();
    const details = {
      city: input.city ?? "Lagos",
      distanceKm: input.distanceKm ?? 10,
      truckSize: input.truckSize ?? "Auto",
      notifications: input.notifications === true,
      service,
      inventory,
      size,
      pickup,
      destination,
      date,
      pickupFloor,
      destinationFloor,
      access,
      extras,
      name,
      email: user?.email ?? email.trim().toLowerCase(),
      phone,
      photos,
    };
    const rules = await pricing();
    const estimate = estimateMove(details, rules);
    const move = await saveMove({
      ...details,
      reference: `EMZ-${requestId.replaceAll("-", "").toUpperCase()}`,
      userId: user?.userId ?? null,
      status: "requested",
      quote: null,
      estimate,
      depositPercent: rules.depositPercent,
      commissionPercent: rules.commissionPercent,
      paidAmount: 0,
      crew: "",
      arrival: "",
      moverId: null,
      vehicleId: null,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json(
      { reference: move.reference, quote: move.quote, estimate: move.estimate },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      {
        error:
          "We couldn’t save your move. Please try again or contact our team.",
      },
      { status: 503 },
    );
  }
}

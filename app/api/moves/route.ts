import { NextResponse } from "next/server";
import { validateMove } from "@/lib/moving/model";
import { saveMove } from "@/lib/moving/store";
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
    const details = {
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
    };
    const move = await saveMove({
      ...details,
      reference: `EMZ-${requestId.replaceAll("-", "").toUpperCase()}`,
      status: "requested",
      quote: null,
      crew: "",
      arrival: "",
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ reference: move.reference }, { status: 201 });
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

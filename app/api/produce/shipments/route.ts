import { NextResponse } from "next/server";
import { createShipment, readCatalog } from "@/lib/produce/store";
import { estimateFare } from "@/lib/produce/catalog";
export async function POST(request: Request) {
  try {
    if (
      request.headers.get("origin") &&
      request.headers.get("origin") !== new URL(request.url).origin
    )
      return NextResponse.json(
        { error: "Invalid request origin." },
        { status: 403 },
      );
    const raw = await request.text();
    if (raw.length > 6000)
      return NextResponse.json(
        { error: "Request is too large." },
        { status: 413 },
      );
    let b;
    try {
      b = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "Invalid delivery request." },
        { status: 400 },
      );
    }
    if (!b || typeof b !== "object" || Array.isArray(b))
      return NextResponse.json(
        { error: "Invalid delivery request." },
        { status: 400 },
      );
    const { catalog } = await readCatalog();
    const crop = catalog.commodities.find(
        (c) => c.id === b.commodityId && c.active !== false,
      ),
      origin = catalog.places.find(
        (p) => p.id === b.originId && p.active !== false,
      ),
      destination = catalog.places.find(
        (p) => p.id === b.destinationId && p.active !== false,
      );
    const dateValid =
      typeof b.readyDate === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(b.readyDate) &&
      Number.isFinite(Date.parse(b.readyDate)) &&
      new Date(b.readyDate).toISOString().slice(0, 10) === b.readyDate;
    if (
      !crop ||
      !origin ||
      !destination ||
      origin.id === destination.id ||
      typeof b.tonnes !== "number" ||
      !Number.isFinite(b.tonnes) ||
      b.tonnes < 0.1 ||
      b.tonnes > 500 ||
      !dateValid ||
      typeof b.contact !== "string" ||
      b.contact.trim().length < 3 ||
      b.contact.length > 200 ||
      !["farmer", "trader", "exporter"].includes(b.role)
    )
      return NextResponse.json(
        {
          error:
            "Please check your produce, route, weight, collection date and contact details.",
        },
        { status: 400 },
      );
    const route = catalog.corridors.find(
      (r) =>
        r.active !== false &&
        ((r.from === origin.id && r.to === destination.id) ||
          (r.from === destination.id && r.to === origin.id)),
    );
    const shipment = await createShipment({
      reference: `EMZ-${(typeof b.requestId === "string" && /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(b.requestId) ? b.requestId : crypto.randomUUID()).replaceAll("-", "").slice(0, 20).toUpperCase()}`,
      role: b.role,
      commodityId: crop.id,
      tonnes: b.tonnes,
      originId: origin.id,
      destinationId: destination.id,
      readyDate: b.readyDate,
      contact: b.contact.trim(),
      collectionAddress:
        typeof b.collectionAddress === "string"
          ? b.collectionAddress.slice(0, 500)
          : "",
      deliveryAddress:
        typeof b.deliveryAddress === "string"
          ? b.deliveryAddress.slice(0, 500)
          : "",
      fare: route ? estimateFare(route.km, b.tonnes).total : null,
      km: route?.km ?? null,
      status: "confirmed",
      createdAt: new Date().toISOString(),
      ...(typeof b.lotId === "string" &&
      catalog.lots.some((l) => l.id === b.lotId)
        ? { lotId: b.lotId }
        : {}),
    });
    const { internalNotes, ...publicResult } = shipment as typeof shipment & {
      internalNotes?: string;
    };
    void internalNotes;
    return NextResponse.json({ shipment: publicResult }, { status: 201 });
  } catch {
    return NextResponse.json(
      {
        error:
          "We could not send your delivery request. Please try again or contact our team.",
      },
      { status: 503 },
    );
  }
}

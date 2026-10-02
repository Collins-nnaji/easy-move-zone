import { NextResponse } from "next/server";
import { readShipment } from "@/lib/produce/store";
export const dynamic = "force-dynamic";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  const { reference } = await params;
  if (!/^EMZ-[A-F0-9]{20}$/.test(reference))
    return NextResponse.json({ error: "Shipment not found." }, { status: 404 });
  try {
    const shipment = await readShipment(reference);
    if (!shipment)
      return NextResponse.json(
        { error: "Shipment not found." },
        { status: 404 },
      );
    const {
      internalNotes,
      contact,
      collectionAddress,
      deliveryAddress,
      ...publicShipment
    } = shipment;
    void internalNotes;
    void contact;
    void collectionAddress;
    void deliveryAddress;
    return NextResponse.json(
      { shipment: { ...publicShipment, contact: "Contact our team" } },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Tracking is temporarily unavailable. Try again shortly." },
      { status: 503 },
    );
  }
}

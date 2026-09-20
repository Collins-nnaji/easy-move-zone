import { NextResponse } from "next/server"
import { getShipmentByReference } from "@/lib/logistics/shipments"

export const runtime = "nodejs"

export async function GET(
  _req: Request,
  context: { params: Promise<{ ref: string }> },
) {
  const { ref } = await context.params
  const shipment = await getShipmentByReference(decodeURIComponent(ref))
  if (!shipment) {
    return NextResponse.json({ error: "Shipment not found." }, { status: 404 })
  }
  return NextResponse.json(shipment)
}

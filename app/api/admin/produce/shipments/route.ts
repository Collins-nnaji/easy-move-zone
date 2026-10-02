import { NextResponse } from "next/server";
import { guardAdmin, adminError } from "@/lib/produce/admin-api";
import {
  database,
  ensureProduceStore,
  readShipment,
} from "@/lib/produce/store";
import { STATUS_STEPS } from "@/lib/produce/shipments";
import { ValidationError } from "@/lib/produce/validation";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    await guardAdmin();
    await ensureProduceStore();
    const rows =
      await database()`SELECT data,updated_at FROM emz_produce_shipments ORDER BY updated_at DESC LIMIT 500`;
    return NextResponse.json({
      shipments: rows.map((r) => ({ ...r.data, updatedAt: r.updated_at })),
    });
  } catch (e) {
    return adminError(e);
  }
}
export async function PATCH(request: Request) {
  try {
    await guardAdmin(request);
    const body = await request.json();
    if (
      typeof body.reference !== "string" ||
      !STATUS_STEPS.some((s) => s.id === body.status) ||
      typeof body.internalNotes !== "string" ||
      body.internalNotes.length > 5000
    )
      throw new ValidationError("Check the shipment status and notes.");
    const old = await readShipment(body.reference);
    if (!old)
      return NextResponse.json(
        { error: "Shipment not found." },
        { status: 404 },
      );
    const patch = {
      status: body.status,
      internalNotes: body.internalNotes.trim(),
    };
    const rows =
      await database()`UPDATE emz_produce_shipments SET data=data || ${JSON.stringify(patch)}::jsonb,updated_at=now() WHERE reference=${body.reference} RETURNING data,updated_at`;
    return NextResponse.json({
      shipment: { ...rows[0].data, updatedAt: rows[0].updated_at },
    });
  } catch (e) {
    return adminError(e);
  }
}

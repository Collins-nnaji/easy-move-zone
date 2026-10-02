import { NextResponse } from "next/server";
import { guardAdmin, adminError } from "@/lib/produce/admin-api";
import { database, ensureMovingStore } from "@/lib/database";
import { ValidationError } from "@/lib/produce/validation";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    await guardAdmin();
    await ensureMovingStore();
    const enquiries =
      await database()`SELECT c.*,coalesce(s.status,CASE WHEN c.status='new' THEN 'new' WHEN c.status='read' THEN 'in-progress' ELSE 'closed' END) AS management_status,coalesce(s.notes,'') AS management_notes FROM contact_submissions c LEFT JOIN emz_enquiry_states s ON s.id=c.id::text ORDER BY c.created_at DESC LIMIT 500`;
    return NextResponse.json({
      enquiries: enquiries.map((item) => ({ ...item, id: String(item.id) })),
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
      typeof body.id !== "string" ||
      body.id.length > 100 ||
      !["new", "in-progress", "closed"].includes(body.status) ||
      typeof body.notes !== "string" ||
      body.notes.length > 5000
    )
      throw new ValidationError("Check the enquiry status and notes.");
    await ensureMovingStore();
    const rows =
      await database()`SELECT id FROM contact_submissions WHERE id::text=${body.id}`;
    if (!rows.length)
      return NextResponse.json(
        { error: "Enquiry not found." },
        { status: 404 },
      );
    await database()`INSERT INTO emz_enquiry_states (id,status,notes) VALUES (${body.id},${body.status},${body.notes.trim()}) ON CONFLICT (id) DO UPDATE SET status=EXCLUDED.status,notes=EXCLUDED.notes,updated_at=now()`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return adminError(e);
  }
}

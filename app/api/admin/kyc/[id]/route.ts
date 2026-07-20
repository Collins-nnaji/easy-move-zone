import { NextResponse } from "next/server";
import { assertAdminApi, AdminForbiddenError } from "@/lib/auth/assert-admin-api";
import { reviewKycDocument } from "@/lib/admin/marketplace-ops";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await assertAdminApi();
    const { id } = await params;
    const body = (await request.json()) as { action?: string; notes?: string };
    const action = body.action === "reject" ? "reject" : body.action === "approve" ? "approve" : null;
    if (!action) {
      return NextResponse.json({ error: "action must be approve or reject" }, { status: 400 });
    }

    const result = await reviewKycDocument({
      docId: id,
      action,
      reviewerEmail: String(user.email),
      notes: body.notes,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof AdminForbiddenError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

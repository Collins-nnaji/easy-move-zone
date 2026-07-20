import { NextResponse } from "next/server";
import { assertAdminApi, AdminForbiddenError } from "@/lib/auth/assert-admin-api";
import { listDisputeFlags } from "@/lib/admin/marketplace-ops";

export const runtime = "nodejs";

export async function GET() {
  try {
    await assertAdminApi();
    const items = await listDisputeFlags();
    return NextResponse.json({ items });
  } catch (err) {
    if (err instanceof AdminForbiddenError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

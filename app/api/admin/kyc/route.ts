import { NextResponse } from "next/server";
import { assertAdminApi, AdminForbiddenError } from "@/lib/auth/assert-admin-api";
import { listKycQueue } from "@/lib/admin/marketplace-ops";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await assertAdminApi();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") === "all" ? "all" : "pending";
    const items = await listKycQueue(status);
    return NextResponse.json({ items });
  } catch (err) {
    if (err instanceof AdminForbiddenError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

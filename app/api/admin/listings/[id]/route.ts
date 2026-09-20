import { NextResponse } from "next/server"
import { assertAdminApi, AdminForbiddenError } from "@/lib/auth/assert-admin-api"
import { reviewListing } from "@/lib/cars/marketplace"

export const runtime = "nodejs"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await assertAdminApi()
    const { id } = await params
    const body = (await request.json().catch(() => null)) as { action?: string; notes?: string } | null
    const action = body?.action
    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "action must be approve or reject" }, { status: 400 })
    }
    const listing = await reviewListing(id, action, admin.email ?? admin.id, body?.notes)
    if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    return NextResponse.json({ listing })
  } catch (err) {
    if (err instanceof AdminForbiddenError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    const message = err instanceof Error ? err.message : "Server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

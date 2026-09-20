import { NextResponse } from "next/server"
import { assertAdminApi, AdminForbiddenError } from "@/lib/auth/assert-admin-api"
import { listAdminListings, type ListingStatus } from "@/lib/cars/marketplace"

export const runtime = "nodejs"

export async function GET(request: Request) {
  try {
    await assertAdminApi()
    const { searchParams } = new URL(request.url)
    const raw = searchParams.get("status")
    const status: ListingStatus | "all" =
      raw === "approved" || raw === "rejected" || raw === "pending" || raw === "all" ? raw : "pending"
    const items = await listAdminListings(status)
    return NextResponse.json({ items })
  } catch (err) {
    if (err instanceof AdminForbiddenError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    const message = err instanceof Error ? err.message : "Server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

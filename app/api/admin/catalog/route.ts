import { NextResponse } from "next/server"
import { assertAdminApi, AdminForbiddenError } from "@/lib/auth/assert-admin-api"
import { getMoveDestinations, getMoveInventory } from "@/lib/move/get-catalog"

export const runtime = "nodejs"

export async function GET() {
  try {
    await assertAdminApi()
    const [{ destinations, source: destSource }, { inventory, source: invSource }] = await Promise.all([
      getMoveDestinations(),
      getMoveInventory(),
    ])
    const source = destSource === "database" && invSource === "database" ? "database" : "static"
    return NextResponse.json({ destinations, inventory, source })
  } catch (err) {
    if (err instanceof AdminForbiddenError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

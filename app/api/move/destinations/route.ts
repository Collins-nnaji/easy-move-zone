import { NextResponse } from "next/server"
import { getMoveDestinations } from "@/lib/move/get-catalog"

export const runtime = "nodejs"

export async function GET() {
  try {
    const { destinations, source } = await getMoveDestinations()
    return NextResponse.json({ destinations, source })
  } catch (err) {
    console.error("[move/destinations]", err)
    return NextResponse.json({ error: "Unable to load destinations." }, { status: 500 })
  }
}

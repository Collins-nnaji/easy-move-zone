import { NextRequest, NextResponse } from "next/server"
import { getMoveInventory } from "@/lib/move/get-catalog"
import type { Mode } from "@/app/move/data"

export const runtime = "nodejs"

const MODES: Mode[] = ["trip", "nomad", "move"]

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const destinationId = searchParams.get("destinationId")?.trim() || null
    const modeParam = searchParams.get("mode")?.trim() as Mode | undefined
    const mode = modeParam && MODES.includes(modeParam) ? modeParam : null

    const { inventory, source } = await getMoveInventory()

    let trips = inventory.trips
    let stays = inventory.stays
    let visaServices = inventory.visaServices

    if (destinationId) {
      trips = { [destinationId]: inventory.trips[destinationId] ?? [] }
      stays = { [destinationId]: inventory.stays[destinationId] ?? [] }
    }

    if (mode) {
      visaServices = {
        trip: mode === "trip" ? inventory.visaServices.trip : [],
        nomad: mode === "nomad" ? inventory.visaServices.nomad : [],
        move: mode === "move" ? inventory.visaServices.move : [],
      }
    }

    return NextResponse.json({ trips, stays, visaServices, source })
  } catch (err) {
    console.error("[move/inventory]", err)
    return NextResponse.json({ error: "Unable to load inventory." }, { status: 500 })
  }
}

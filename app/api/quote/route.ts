import { NextRequest, NextResponse } from "next/server"
import { rateLimit } from "@/lib/rate-limit"
import { neon } from "@neondatabase/serverless"
import {
  FREIGHT_MODES,
  SHIPMENT_DIRECTIONS,
  type FreightMode,
  type ShipmentDirection,
} from "@/lib/logistics/catalog"
import { insertFreightQuote } from "@/lib/logistics/quotes"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

const MAX = {
  name: 120,
  email: 254,
  phone: 40,
  company: 160,
  country: 80,
  cargoClass: 60,
  weight: 40,
  volume: 40,
  incoterm: 12,
  cargoDescription: 4000,
  notes: 2000,
} as const

function asString(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : ""
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>
    const name = asString(body.name, MAX.name)
    const email = asString(body.email, MAX.email).toLowerCase()
    const phone = asString(body.phone, MAX.phone) || null
    const company = asString(body.company, MAX.company) || null
    const directionRaw = asString(body.direction, 20)
    const originCountry = asString(body.originCountry, MAX.country)
    const destinationCountry = asString(body.destinationCountry, MAX.country)
    const modeRaw = asString(body.mode, 40)
    const cargoClass = asString(body.cargoClass, MAX.cargoClass) || "general"
    const weightKg = asString(body.weightKg, MAX.weight) || null
    const volumeCbm = asString(body.volumeCbm, MAX.volume) || null
    const incoterm = asString(body.incoterm, MAX.incoterm) || null
    const cargoDescription = asString(body.cargoDescription, MAX.cargoDescription)
    const notes = asString(body.notes, MAX.notes) || null

    if (name.length < 2) return NextResponse.json({ error: "Please enter your name." }, { status: 400 })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 })
    }
    if (!SHIPMENT_DIRECTIONS.includes(directionRaw as ShipmentDirection)) {
      return NextResponse.json({ error: "Choose export or import." }, { status: 400 })
    }
    if (!originCountry || !destinationCountry) {
      return NextResponse.json({ error: "Origin and destination countries are required." }, { status: 400 })
    }
    if (!FREIGHT_MODES.includes(modeRaw as FreightMode)) {
      return NextResponse.json({ error: "Choose a freight mode." }, { status: 400 })
    }
    if (cargoDescription.length < 8) {
      return NextResponse.json({ error: "Describe the cargo (at least a short summary)." }, { status: 400 })
    }

    if (sql) {
      const limit = await rateLimit(sql, `email:${email}`, "freight_quote", 8, 3600)
      if (!limit.ok) {
        return NextResponse.json(
          { error: "You've sent a few quote requests already. We'll be in touch soon." },
          { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
        )
      }
    }

    const row = await insertFreightQuote({
      name,
      email,
      phone,
      company,
      direction: directionRaw as ShipmentDirection,
      originCountry,
      destinationCountry,
      mode: modeRaw,
      cargoClass,
      weightKg,
      volumeCbm,
      incoterm,
      cargoDescription,
      notes,
    })

    if (!row) {
      return NextResponse.json(
        { error: "We could not save your quote request. Try emailing us or try again later." },
        { status: 503 },
      )
    }

    return NextResponse.json({ ok: true, id: row.id }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }
}

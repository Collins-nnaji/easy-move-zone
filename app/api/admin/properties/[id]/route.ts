import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { requireAdmin } from "@/lib/auth/admin"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL

const PROPERTY_TYPES = new Set(["land", "house", "apartment", "commercial", "mixed-use"])
const VERIFICATION = new Set(["unverified", "pending", "verified", "flagged", "rejected"])

type PatchBody = {
  title?: string
  description?: string | null
  property_type?: string
  city?: string
  state?: string
  country?: string
  neighborhood?: string | null
  address?: string | null
  price_ngn?: number | null
  land_size_sqm?: number | null
  building_size_sqm?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  images?: string[]
  verification_status?: string
  is_published?: boolean
  is_featured?: boolean
  ai_valuation_ngn?: number | null
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  if (!DATABASE_URL) return NextResponse.json({ error: "Database not configured" }, { status: 500 })

  const { id } = await params
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  let body: PatchBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const sql = neon(DATABASE_URL)

  try {
    const existing = await sql`SELECT * FROM properties WHERE id = ${id} LIMIT 1`
    if (existing.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const cur = existing[0] as Record<string, unknown>

    const title =
      typeof body.title === "string" && body.title.trim() ? body.title.trim() : (cur.title as string)
    const description =
      body.description !== undefined
        ? typeof body.description === "string"
          ? body.description
          : null
        : (cur.description as string | null)
    const propertyTypeRaw = body.property_type ?? (cur.property_type as string)
    const propertyType = String(propertyTypeRaw).trim()
    if (!PROPERTY_TYPES.has(propertyType)) {
      return NextResponse.json({ error: "Invalid property_type" }, { status: 400 })
    }
    const city = typeof body.city === "string" && body.city.trim() ? body.city.trim() : (cur.city as string)
    const state = typeof body.state === "string" && body.state.trim() ? body.state.trim() : (cur.state as string)
    const country =
      typeof body.country === "string" && body.country.trim() ? body.country.trim() : (cur.country as string)
    const neighborhood =
      body.neighborhood !== undefined
        ? typeof body.neighborhood === "string" && body.neighborhood.trim()
          ? body.neighborhood.trim()
          : null
        : (cur.neighborhood as string | null)
    const address =
      body.address !== undefined
        ? typeof body.address === "string" && body.address.trim()
          ? body.address.trim()
          : null
        : (cur.address as string | null)

    const priceNgn =
      body.price_ngn !== undefined
        ? body.price_ngn != null && Number.isFinite(Number(body.price_ngn))
          ? Math.round(Number(body.price_ngn))
          : null
        : (cur.price_ngn as number | null)
    const landSize =
      body.land_size_sqm !== undefined
        ? body.land_size_sqm != null && Number.isFinite(Number(body.land_size_sqm))
          ? Number(body.land_size_sqm)
          : null
        : (cur.land_size_sqm as number | null)
    const buildingSize =
      body.building_size_sqm !== undefined
        ? body.building_size_sqm != null && Number.isFinite(Number(body.building_size_sqm))
          ? Number(body.building_size_sqm)
          : null
        : (cur.building_size_sqm as number | null)
    const bedrooms =
      body.bedrooms !== undefined
        ? body.bedrooms != null && Number.isFinite(Number(body.bedrooms))
          ? Math.round(Number(body.bedrooms))
          : null
        : (cur.bedrooms as number | null)
    const bathrooms =
      body.bathrooms !== undefined
        ? body.bathrooms != null && Number.isFinite(Number(body.bathrooms))
          ? Math.round(Number(body.bathrooms))
          : null
        : (cur.bathrooms as number | null)

    let imagesJson: string
    if (Array.isArray(body.images)) {
      imagesJson = JSON.stringify(body.images.filter((u) => typeof u === "string" && u.length > 0))
    } else {
      const raw = cur.images
      if (raw == null) imagesJson = "[]"
      else if (typeof raw === "string") imagesJson = raw.startsWith("[") ? raw : JSON.stringify([raw])
      else imagesJson = JSON.stringify(raw)
    }

    const verificationRaw = body.verification_status ?? (cur.verification_status as string)
    const verification = VERIFICATION.has(verificationRaw) ? verificationRaw : "verified"
    const isPublished = body.is_published !== undefined ? Boolean(body.is_published) : Boolean(cur.is_published)
    const isFeatured = body.is_featured !== undefined ? Boolean(body.is_featured) : Boolean(cur.is_featured)
    const aiVal =
      body.ai_valuation_ngn !== undefined
        ? body.ai_valuation_ngn != null && Number.isFinite(Number(body.ai_valuation_ngn))
          ? Math.round(Number(body.ai_valuation_ngn))
          : null
        : (cur.ai_valuation_ngn as number | null)

    await sql`
      UPDATE properties SET
        title = ${title},
        description = ${description},
        property_type = ${propertyType},
        city = ${city},
        state = ${state},
        country = ${country},
        neighborhood = ${neighborhood},
        address = ${address},
        price_ngn = ${priceNgn},
        land_size_sqm = ${landSize},
        building_size_sqm = ${buildingSize},
        bedrooms = ${bedrooms},
        bathrooms = ${bathrooms},
        images = ${imagesJson}::jsonb,
        verification_status = ${verification},
        is_published = ${isPublished},
        is_featured = ${isFeatured},
        ai_valuation_ngn = ${aiVal},
        updated_at = now()
      WHERE id = ${id}
    `

    return NextResponse.json({ ok: true, id })
  } catch (e) {
    console.error("[admin/properties PATCH]", e)
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 })
  }
}

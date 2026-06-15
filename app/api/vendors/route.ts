import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { authServer } from "@/lib/auth/server"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

const SERVICE_TYPES = new Set([
  "removals", "packing", "cleaning", "handyman", "international", "storage", "other",
])

const SELECT = `
  SELECT
    v.id, v.auth_user_id, v.business_name, v.service_type, v.city, v.tagline,
    v.description, v.base_price, v.price_label, v.currency, v.coverage_areas,
    v.features, v.experience_years, v.rating, v.contact_name, v.contact_email,
    v.contact_phone, v.website, v.logo_url, v.images, v.status, v.reviewer_notes,
    v.is_featured, v.view_count, v.created_at,
    (SELECT count(*) FROM vendor_enquiries e WHERE e.vendor_id = v.id) AS enquiry_count
  FROM vendors v`

// GET /api/vendors            -> live vendors (public marketplace)
// GET /api/vendors?mine=1     -> the signed-in user's own vendors (any status)
// GET /api/vendors?service_type=removals  -> filter
export async function GET(req: NextRequest) {
  if (!sql) return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  try {
    const { searchParams } = new URL(req.url)
    const mine = searchParams.get("mine") === "1"
    const serviceType = searchParams.get("service_type")
    const q = (searchParams.get("q") ?? "").trim()

    const where: string[] = []
    const params: unknown[] = []

    if (mine) {
      const session = await authServer.getSession()
      const userId = session?.data?.user?.id
      if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      params.push(String(userId))
      where.push(`v.auth_user_id = $${params.length}`)
    } else {
      where.push(`v.status = 'live'`)
    }

    if (serviceType && SERVICE_TYPES.has(serviceType)) {
      params.push(serviceType)
      where.push(`v.service_type = $${params.length}`)
    }
    if (q) {
      params.push(`%${q.toLowerCase()}%`)
      where.push(`(lower(v.business_name) LIKE $${params.length} OR lower(coalesce(v.city,'')) LIKE $${params.length})`)
    }

    const rows = await sql.query(
      `${SELECT} WHERE ${where.join(" AND ")} ORDER BY v.is_featured DESC, v.created_at DESC LIMIT 100`,
      params,
    )
    return NextResponse.json({ vendors: rows })
  } catch {
    return NextResponse.json({ error: "Failed to load vendors" }, { status: 500 })
  }
}

// POST /api/vendors -> create a vendor listing (status: pending) for the signed-in user
export async function POST(req: NextRequest) {
  if (!sql) return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  const session = await authServer.getSession()
  const userId = session?.data?.user?.id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const b = await req.json()
    const businessName = String(b.business_name ?? b.businessName ?? "").trim()
    if (!businessName) return NextResponse.json({ error: "Business name is required" }, { status: 400 })

    const serviceType = SERVICE_TYPES.has(b.service_type) ? b.service_type : "other"
    const coverage = Array.isArray(b.coverage_areas) ? b.coverage_areas.map(String) : []
    const features = Array.isArray(b.features) ? b.features.map(String) : []
    const images = Array.isArray(b.images) ? b.images.filter((u: unknown) => typeof u === "string") : []

    const rows = await sql.query(
      `INSERT INTO vendors (
        auth_user_id, business_name, service_type, city, tagline, description,
        base_price, price_label, currency, coverage_areas, features, experience_years,
        contact_name, contact_email, contact_phone, website, images, status
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17::jsonb,'pending')
       RETURNING id`,
      [
        String(userId), businessName, serviceType,
        b.city ?? null, b.tagline ?? null, b.description ?? null,
        b.base_price != null ? Number(b.base_price) : null,
        b.price_label ?? null, (b.currency ?? "GBP"),
        coverage, features, b.experience_years != null ? Number(b.experience_years) : 0,
        b.contact_name ?? null, b.contact_email ?? null, b.contact_phone ?? null,
        b.website ?? null, JSON.stringify(images),
      ],
    )
    const id = (rows as Array<{ id: string }>)[0]?.id
    return NextResponse.json({ id, status: "pending" }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create vendor listing" }, { status: 500 })
  }
}

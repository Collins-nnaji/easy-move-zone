import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { authServer } from "@/lib/auth/server"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

export async function POST(req: NextRequest) {
  if (!sql) return NextResponse.json({ error: "Database not configured" }, { status: 500 })

  const session = await authServer.getSession()
  if (!session?.data?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = session.data.user.id

  try {
    const body = await req.json()
    const {
      title, description, listing_type, property_type,
      city, state, address, neighborhood,
      price_ngn, price_label,
      bedrooms, bathrooms, land_size_sqm, building_size_sqm,
      seller_name, seller_phone, seller_email,
      images,
    } = body

    if (!title || !listing_type || !property_type || !city) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const rows = await sql`
      INSERT INTO property_listings (
        title, description, listing_type, property_type,
        city, state, address, neighborhood,
        price_ngn,
        bedrooms, bathrooms, land_size_sqm, building_size_sqm,
        images,
        submitted_by, submission_status,
        is_published, is_featured,
        verification_status,
        seller_name, seller_phone, seller_email
      ) VALUES (
        ${title}, ${description ?? null}, ${listing_type}, ${property_type},
        ${city}, ${state ?? null}, ${address ?? null}, ${neighborhood ?? null},
        ${price_ngn ? Number(price_ngn) : null},
        ${bedrooms ? Number(bedrooms) : null}, ${bathrooms ? Number(bathrooms) : null},
        ${land_size_sqm ? Number(land_size_sqm) : null}, ${building_size_sqm ? Number(building_size_sqm) : null},
        ${JSON.stringify(images ?? [])}::jsonb,
        ${userId}, 'pending',
        false, false,
        'unverified',
        ${seller_name ?? null}, ${seller_phone ?? null}, ${seller_email ?? null}
      )
      RETURNING id
    `

    return NextResponse.json({ id: rows[0].id })
  } catch (err) {
    console.error("Sell submission error:", err)
    return NextResponse.json({ error: "Submission failed" }, { status: 500 })
  }
}

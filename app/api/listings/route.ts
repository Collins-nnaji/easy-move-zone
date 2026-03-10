import { NextRequest, NextResponse } from "next/server"
import { neonAuth } from "@neondatabase/auth/next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  const { session, user } = await neonAuth()
  if (!session || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const data = body as Record<string, unknown>

  // Required fields validation
  const required = ["title", "citySlug", "country", "neighborhood", "type", "priceUsd", "description"]
  for (const field of required) {
    if (!data[field]) {
      return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
    }
  }

  // Video is mandatory
  if (!data.videoUrl || typeof data.videoUrl !== "string" || !data.videoUrl.trim()) {
    return NextResponse.json({ error: "A property video is required before submitting." }, { status: 400 })
  }

  // Images array validation
  const images = Array.isArray(data.images) ? (data.images as string[]) : []

  const id = crypto.randomUUID()

  try {
    await sql`
      INSERT INTO property_listings (
        id,
        title,
        city_slug,
        country,
        neighborhood,
        type,
        price_usd,
        bedrooms,
        bathrooms,
        area_sqm,
        verified,
        move_in_ready,
        schools_nearby,
        commute_minutes,
        description,
        images,
        agent_id,
        video_url,
        submitted_by,
        submission_status,
        submitted_at
      ) VALUES (
        ${id},
        ${String(data.title)},
        ${String(data.citySlug)},
        ${String(data.country)},
        ${String(data.neighborhood)},
        ${String(data.type)},
        ${Number(data.priceUsd)},
        ${Number(data.bedrooms ?? 0)},
        ${Number(data.bathrooms ?? 0)},
        ${Number(data.areaSqm ?? 0)},
        false,
        ${Boolean(data.moveInReady ?? false)},
        ${Number(data.schoolsNearby ?? 0)},
        ${Number(data.commuteMinutes ?? 0)},
        ${String(data.description)},
        ${JSON.stringify(images)},
        ${String(data.agentId ?? "self")},
        ${String(data.videoUrl)},
        ${user.id},
        'pending',
        NOW()
      )
    `

    return NextResponse.json({ id, status: "pending", message: "Listing submitted for review." }, { status: 201 })
  } catch (err) {
    console.error("[listings POST] DB error:", err)
    return NextResponse.json({ error: "Failed to submit listing. Please try again." }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { session, user } = await neonAuth()
  if (!session || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const rows = await sql`
      SELECT
        id,
        title,
        city_slug,
        country,
        neighborhood,
        type,
        price_usd,
        bedrooms,
        bathrooms,
        area_sqm,
        verified,
        move_in_ready,
        schools_nearby,
        commute_minutes,
        description,
        images,
        video_url,
        submission_status,
        submitted_at,
        reviewer_notes
      FROM property_listings
      WHERE submitted_by = ${user.id}
      ORDER BY submitted_at DESC
    `

    return NextResponse.json({ listings: rows })
  } catch (err) {
    console.error("[listings GET] DB error:", err)
    return NextResponse.json({ error: "Failed to fetch listings." }, { status: 500 })
  }
}

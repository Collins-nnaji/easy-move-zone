import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!sql) return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  const { id } = await params

  try {
    const rows = await sql`SELECT * FROM properties WHERE id = ${id}`
    if (rows.length === 0) return NextResponse.json({ error: "Property not found" }, { status: 404 })

    return NextResponse.json({ property: rows[0] })
  } catch {
    return NextResponse.json({ error: "Failed to fetch property" }, { status: 500 })
  }
}

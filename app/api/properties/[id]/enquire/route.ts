import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { authServer } from "@/lib/auth/server"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!sql) return NextResponse.json({ error: "Database not configured" }, { status: 500 })

  const session = await authServer.getSession()
  if (!session?.data?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { message } = body as { message: string }

  if (!message?.trim()) return NextResponse.json({ error: "Message is required" }, { status: 400 })

  try {
    const property = await sql`SELECT agent_id FROM properties WHERE id = ${id}`
    if (property.length === 0) return NextResponse.json({ error: "Property not found" }, { status: 404 })

    await sql`
      INSERT INTO enquiries (property_id, user_id, agent_id, message)
      VALUES (${id}, ${session.data.user.id}, ${property[0].agent_id}, ${message.trim()})
    `

    await sql`UPDATE properties SET enquiry_count = enquiry_count + 1 WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to send enquiry" }, { status: 500 })
  }
}

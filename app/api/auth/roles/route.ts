import { NextResponse } from "next/server"
import { neonAuth } from "@neondatabase/auth/next/server"

export const runtime = "nodejs"

/** Logistics roles removed — career product uses a single account. */
export async function GET() {
  const { session, user } = await neonAuth()
  if (!session || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  return NextResponse.json({
    userId: String(user.id),
    email: user.email ?? null,
    roles: [],
    home: "/workspace",
  })
}

export async function POST() {
  return NextResponse.json(
    { error: "Driver and company roles have been removed from EasyMoveZone." },
    { status: 410 },
  )
}

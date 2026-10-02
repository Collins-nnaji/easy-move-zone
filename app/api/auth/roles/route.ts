import { NextResponse } from "next/server"
import { neonAuth } from "@neondatabase/auth/next/server"

export const runtime = "nodejs"

/** Current produce platform accounts use a single sign-in. */
export async function GET() {
  const { session, user } = await neonAuth()
  if (!session || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  return NextResponse.json({
    userId: String(user.id),
    email: user.email ?? null,
    roles: [],
    home: "/book",
  })
}

export async function POST() {
  return NextResponse.json(
    { error: "Driver and company roles have been removed from EasyMoveZone." },
    { status: 410 },
  )
}

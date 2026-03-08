import { NextRequest, NextResponse } from "next/server"
import { subscribeToNewsletter } from "@/lib/platform"

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string; listType?: string }
    if (!body.email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 })
    }
    await subscribeToNewsletter(body.email, body.listType ?? "general")
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Unable to subscribe email." }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { generateMonthlyDigest } from "@/lib/ai/platform"

export async function POST() {
  try {
    const result = await generateMonthlyDigest()
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Unable to generate digest." }, { status: 500 })
  }
}

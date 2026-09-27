import { NextResponse } from "next/server"
import { isEducationDbConfigured, listCourses } from "@/lib/education/store"

export const runtime = "nodejs"

export async function GET(request: Request) {
  if (!isEducationDbConfigured()) return NextResponse.json({ courses: [], error: "Education catalogue is not configured." }, { status: 503 })
  const params = new URL(request.url).searchParams
  try {
    const courses = await listCourses({
      country: params.get("country"),
      level: params.get("level"),
      subject: params.get("subject"),
      q: params.get("q"),
    })
    return NextResponse.json({ courses })
  } catch (error) {
    return NextResponse.json({ courses: [], error: error instanceof Error ? error.message : "Could not load courses" }, { status: 500 })
  }
}

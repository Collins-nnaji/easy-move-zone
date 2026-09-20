import { NextResponse } from "next/server"
import { neonAuth } from "@neondatabase/auth/next/server"
import { isObjectStorageConfigured, uploadListingPhoto } from "@/lib/storage/s3"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const { session, user } = await neonAuth()
  if (!session || !user?.id) {
    return NextResponse.json({ error: "Sign in to upload photos" }, { status: 401 })
  }
  if (!isObjectStorageConfigured()) {
    return NextResponse.json({ error: "Photo storage is not configured" }, { status: 503 })
  }

  const form = await request.formData()
  const file = form.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose a photo" }, { status: 400 })
  }

  try {
    const uploaded = await uploadListingPhoto(user.id, file)
    return NextResponse.json(uploaded)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { neonAuth } from "@neondatabase/auth/next/server"
import { uploadFileToIdrive, validateFileType, validateFileSize, type AllowedFileType } from "@/lib/storage/idrive"

export const runtime = "nodejs"

// Next.js 16 requires this to allow large file uploads
export const maxDuration = 60

export async function POST(request: NextRequest) {
  // Auth check
  const { session, user } = await neonAuth()
  if (!session || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
  }

  const file = formData.get("file") as File | null
  const fileType = (formData.get("type") as AllowedFileType | null) ?? "image"
  const listingId = (formData.get("listingId") as string | null) ?? user.id

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  if (!validateFileType(file.type, fileType)) {
    return NextResponse.json(
      { error: `Invalid file type: ${file.type}. Allowed: ${fileType === "image" ? "JPEG, PNG, WebP, GIF, AVIF" : "MP4, WebM, MOV, AVI"}` },
      { status: 400 }
    )
  }

  if (!validateFileSize(file.size, fileType)) {
    const limit = fileType === "image" ? "10 MB" : "500 MB"
    return NextResponse.json({ error: `File too large. Maximum size for ${fileType}: ${limit}` }, { status: 400 })
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const uploaded = await uploadFileToIdrive(buffer, file.name, file.type, fileType, listingId)
    return NextResponse.json({ url: uploaded.url, key: uploaded.key })
  } catch (err) {
    console.error("[upload] iDrive upload failed:", err)
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 })
  }
}

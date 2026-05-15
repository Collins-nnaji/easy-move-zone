/**
 * POST /api/sell/upload
 * Accepts a multipart form with: file, propertyId (temp draft id), fileType ("image"|"video")
 * Uploads to Azure Blob (or IDrive fallback) under properties/{propertyId}/
 * Returns { url }
 */
import { NextRequest, NextResponse } from "next/server"
import { authServer } from "@/lib/auth/server"
import {
  isAzureConfigured,
  uploadToAzure,
  validateFileType,
  validateFileSize,
} from "@/lib/storage/azure"
import {
  uploadFileToIdrive,
  validateFileType as validateIdriveType,
  validateFileSize as validateIdriveSize,
} from "@/lib/storage/idrive"

const VIDEO_MIME_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
])
const MAX_VIDEO_BYTES = 200 * 1024 * 1024 // 200 MB

export async function POST(req: NextRequest) {
  const session = await authServer.getSession()
  if (!session?.data?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const propertyId = (formData.get("propertyId") as string) || `draft-${Date.now()}`
    const fileType = (formData.get("fileType") as string) ?? "image"

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const isVideo = fileType === "video" || VIDEO_MIME_TYPES.has(file.type)

    let fileUrl = ""

    if (isVideo) {
      // Videos: Azure only (too large for IDrive limits)
      if (!isAzureConfigured()) {
        return NextResponse.json({ error: "Video storage not configured" }, { status: 503 })
      }
      if (!VIDEO_MIME_TYPES.has(file.type)) {
        return NextResponse.json({ error: "Invalid video type" }, { status: 400 })
      }
      if (buffer.length > MAX_VIDEO_BYTES) {
        return NextResponse.json({ error: "Video too large (max 200 MB)" }, { status: 400 })
      }
      const result = await uploadToAzure(buffer, file.name, file.type, "image", propertyId)
      fileUrl = result.url
    } else if (isAzureConfigured()) {
      if (!validateFileType(file.type, "image")) {
        return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
      }
      if (!validateFileSize(buffer.length, "image")) {
        return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 400 })
      }
      const result = await uploadToAzure(buffer, file.name, file.type, "image", propertyId)
      fileUrl = result.url
    } else {
      if (!validateIdriveType(file.type, "image")) {
        return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
      }
      if (!validateIdriveSize(buffer.length, "image")) {
        return NextResponse.json({ error: "File too large" }, { status: 400 })
      }
      const result = await uploadFileToIdrive(buffer, file.name, file.type, "image", propertyId)
      fileUrl = result.url
    }

    return NextResponse.json({ url: fileUrl, propertyId })
  } catch (err) {
    console.error("Sell upload error:", err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

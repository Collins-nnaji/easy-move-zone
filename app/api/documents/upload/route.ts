import { NextRequest, NextResponse } from "next/server"
import { neonAuth } from "@neondatabase/auth/next/server"
import { isAzureConfigured, uploadToAzure, validateFileType, validateFileSize } from "@/lib/storage/azure"

export const runtime = "nodejs"
export const maxDuration = 60

// Saves a relocation document (passport, funds proof, certificates, …) to Azure
// Blob Storage under a per-user, per-destination folder. Reuses the existing
// lib/storage/azure helper, which already supports the "document" file type
// (PDF/JPEG/PNG/DOC/DOCX, 25 MB) and routes to a .../documents/ path.
export async function POST(request: NextRequest) {
  const { session, user } = await neonAuth()
  if (!session || !user) {
    return NextResponse.json({ error: "Sign in to save documents." }, { status: 401 })
  }

  if (!isAzureConfigured()) {
    return NextResponse.json(
      { error: "Document storage isn't configured yet. Set AZURE_STORAGE_CONNECTION_STRING to enable saving." },
      { status: 503 },
    )
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
  }

  const file = formData.get("file") as File | null
  const destId = (formData.get("destId") as string | null) ?? "general"
  const label = (formData.get("label") as string | null) ?? ""

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }
  if (!validateFileType(file.type, "document")) {
    return NextResponse.json(
      { error: `Invalid file type: ${file.type || "unknown"}. Allowed: PDF, JPEG, PNG, DOC, DOCX.` },
      { status: 400 },
    )
  }
  if (!validateFileSize(file.size, "document")) {
    return NextResponse.json({ error: "File too large. Maximum size for documents: 25 MB." }, { status: 400 })
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    // The helper's last arg is used as a path segment — scope docs to the user
    // and destination so they don't collide across users.
    const scope = `${user.id}/${destId.replace(/[^a-zA-Z0-9._-]/g, "_")}`
    const uploaded = await uploadToAzure(buffer, file.name, file.type, "document", scope)
    return NextResponse.json({ url: uploaded.url, key: uploaded.key, label: label || file.name })
  } catch (err) {
    console.error("[documents/upload] Azure upload failed:", err)
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 })
  }
}

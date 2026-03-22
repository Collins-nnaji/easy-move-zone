import { NextRequest, NextResponse } from "next/server"
import { authServer } from "@/lib/auth/server"
import { isAzureConfigured, uploadToAzure, validateFileType, validateFileSize } from "@/lib/storage/azure"
import { uploadFileToIdrive, validateFileType as validateIdriveType, validateFileSize as validateIdriveSize } from "@/lib/storage/idrive"

export async function POST(req: NextRequest) {
  const session = await authServer.getSession()
  if (!session?.data?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const propertyId = formData.get("propertyId") as string
    const fileType = (formData.get("fileType") as string) ?? "image"

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })
    if (!propertyId) return NextResponse.json({ error: "Property ID required" }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())

    if (isAzureConfigured()) {
      const azureType = fileType === "document" ? "document" as const : "image" as const
      if (!validateFileType(file.type, azureType)) {
        return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
      }
      if (!validateFileSize(buffer.length, azureType)) {
        return NextResponse.json({ error: "File too large" }, { status: 400 })
      }
      const result = await uploadToAzure(buffer, file.name, file.type, azureType, propertyId)
      return NextResponse.json(result)
    }

    const idriveType = "image" as const
    if (!validateIdriveType(file.type, idriveType)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }
    if (!validateIdriveSize(buffer.length, idriveType)) {
      return NextResponse.json({ error: "File too large" }, { status: 400 })
    }
    const result = await uploadFileToIdrive(buffer, file.name, file.type, idriveType, propertyId)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

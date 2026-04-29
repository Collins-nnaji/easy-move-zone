import { NextRequest, NextResponse } from "next/server"
import { authServer } from "@/lib/auth/server"
import { isAzureConfigured, uploadToAzure, validateFileType, validateFileSize } from "@/lib/storage/azure"
import { uploadFileToIdrive, validateFileType as validateIdriveType, validateFileSize as validateIdriveSize } from "@/lib/storage/idrive"
import { neon } from "@neondatabase/serverless"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

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
    let fileUrl = ""

    if (isAzureConfigured()) {
      const azureType = fileType === "document" ? "document" as const : "image" as const
      if (!validateFileType(file.type, azureType)) {
        return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
      }
      if (!validateFileSize(buffer.length, azureType)) {
        return NextResponse.json({ error: "File too large" }, { status: 400 })
      }
      const result = await uploadToAzure(buffer, file.name, file.type, azureType, propertyId)
      fileUrl = result.url
    } else {
      const idriveType = "image" as const
      if (!validateIdriveType(file.type, idriveType)) {
        return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
      }
      if (!validateIdriveSize(buffer.length, idriveType)) {
        return NextResponse.json({ error: "File too large" }, { status: 400 })
      }
      const result = await uploadFileToIdrive(buffer, file.name, file.type, idriveType, propertyId)
      fileUrl = result.url
    }

    // Database update for image association
    if (sql && fileUrl) {
      try {
        const rows = await sql`SELECT images FROM properties WHERE id = ${propertyId}`
        let currentImages: string[] = []
        
        if (rows.length > 0) {
          const imgData = rows[0].images
          if (Array.isArray(imgData)) {
            currentImages = imgData.filter((i): i is string => typeof i === "string")
          } else if (typeof imgData === "string") {
            try {
              const parsed = JSON.parse(imgData)
              if (Array.isArray(parsed)) {
                currentImages = parsed.filter((i): i is string => typeof i === "string")
              }
            } catch {
              currentImages = []
            }
          }
        }

        if (!currentImages.includes(fileUrl)) {
          currentImages.push(fileUrl)
        }

        await sql`
          UPDATE properties
          SET images = ${JSON.stringify(currentImages)}::jsonb
          WHERE id = ${propertyId}
        `
      } catch (dbError) {
        console.error("DB Update failure:", dbError)
        return NextResponse.json({ error: "Failed to save image association" }, { status: 500 })
      }
    }

    return NextResponse.json({ key: propertyId, url: fileUrl })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

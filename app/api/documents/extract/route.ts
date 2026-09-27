import { NextResponse } from "next/server"
import { neonAuth } from "@neondatabase/auth/next/server"
import { DocumentUploadError, extractTextFromUploadedFile } from "@/lib/documents/upload"
import { extractCvFromText } from "@/lib/documents/cv-ai"
import { excerptFromText } from "@/lib/check/extract-text"
import { saveCheckDocument } from "@/lib/check/documents-store"
import { isObjectStorageConfigured, storeAppFile, vaultBucket } from "@/lib/storage/s3"

export const runtime = "nodejs"

/**
 * Rekruuter-style CV extract endpoint.
 * Accepts multipart `cvFile` OR JSON { base64, fileName, fileMime, sessionId, persist? }.
 */
export async function POST(request: Request) {
  try {
    const { user } = await neonAuth()
    const contentType = request.headers.get("content-type") || ""

    let buffer: Buffer
    let fileName: string
    let mime: string | null = null
    let sessionId = request.headers.get("x-check-session")?.trim() || ""
    let persist = true
    let kind: "cv" | "certificate" | "offer" | "passport" | "other" = "cv"
    let processWithAi = true

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData()
      const file = form.get("cvFile") || form.get("file")
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "Please select one PDF or DOCX file." }, { status: 400 })
      }
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "This CV file is too large. Please upload a file smaller than 10 MB." }, { status: 413 })
      }
      buffer = Buffer.from(await file.arrayBuffer())
      fileName = file.name
      mime = file.type || null
      sessionId = String(form.get("sessionId") || sessionId)
      persist = form.get("persist") !== "0"
      const k = String(form.get("kind") || "cv")
      if (["cv", "certificate", "offer", "passport", "other"].includes(k)) kind = k as typeof kind
      processWithAi = form.get("processWithAi") !== "0"
    } else {
      const body = (await request.json().catch(() => null)) as {
        base64?: string
        fileName?: string
        fileMime?: string
        sessionId?: string
        persist?: boolean
        kind?: string
        processWithAi?: boolean
      } | null
      if (!body?.base64 || !body.fileName) {
        return NextResponse.json({ error: "fileName and base64 are required." }, { status: 400 })
      }
      buffer = Buffer.from(body.base64, "base64")
      fileName = body.fileName
      mime = body.fileMime ?? null
      sessionId = body.sessionId || sessionId
      persist = body.persist !== false
      if (body.kind && ["cv", "certificate", "offer", "passport", "other"].includes(body.kind)) {
        kind = body.kind as typeof kind
      }
      processWithAi = body.processWithAi !== false
    }

    const text = await extractTextFromUploadedFile({
      buffer,
      originalName: fileName,
      mimeType: mime,
    })
    const cvData = kind === "cv" && processWithAi ? await extractCvFromText(text) : null

    let documentId: string | null = null
    let storageKey: string | null = null
    if (persist && sessionId.length >= 8) {
      const saved = await saveCheckDocument({
        sessionId,
        authUserId: user?.id ? String(user.id) : null,
        kind,
        fileName,
        fileMime: mime,
        base64: buffer.toString("base64"),
        extractedText: text,
        extractedData: cvData,
      })
      documentId = saved.id
    } else if (isObjectStorageConfigured() && user?.id) {
      const stored = await storeAppFile({
        prefix: "check/cv",
        userId: String(user.id),
        mime: mime || "application/octet-stream",
        base64: buffer.toString("base64"),
        bucket: vaultBucket(),
      })
      storageKey = stored.key
    }

    return NextResponse.json({
      text,
      excerpt: excerptFromText(text),
      fileName,
      documentId,
      storageKey,
      chars: text.length,
      cvData,
    })
  } catch (error) {
    if (error instanceof DocumentUploadError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Extract failed" },
      { status: 500 },
    )
  }
}

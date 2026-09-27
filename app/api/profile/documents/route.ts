import { NextResponse } from "next/server"
import { neonAuth } from "@neondatabase/auth/next/server"
import {
  deleteProfileDocument,
  getProfileDocument,
  getProfileDocumentFile,
  listProfileDocuments,
  profileVaultSessionId,
  saveCheckDocument,
} from "@/lib/check/documents-store"
import type { CheckDocumentKind } from "@/lib/check/types"
import { mergeCareerSkills } from "@/lib/career/profile-store"
import { buildDigitalTwin } from "@/lib/career-lab/intelligence"
import { extractTextFromUploadedFile } from "@/lib/documents/upload"
import { extractCvFromText } from "@/lib/documents/cv-ai"
import { DOCUMENT_KINDS, detectDocumentKind } from "@/lib/documents/kind"
import { getObjectBuffer, mimeForFileName } from "@/lib/storage/s3"

export const runtime = "nodejs"
export const maxDuration = 60

function contentDisposition(type: "inline" | "attachment", fileName: string) {
  const ascii = fileName.replace(/[^\x20-\x7e]+/g, "_").replace(/["\\]/g, "")
  return `${type}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(fileName)}`
}

async function serveFile(id: string, authUserId: string, download: boolean) {
  const file = await getProfileDocumentFile(id, authUserId)
  if (!file) return NextResponse.json({ error: "Document not found." }, { status: 404 })
  const buffer = file.bucket && file.key ? await getObjectBuffer(file.bucket, file.key).catch(() => null) : null
  const body = buffer ?? (file.text ? Buffer.from(file.text, "utf8") : null)
  if (!body) return NextResponse.json({ error: "The original file is not available." }, { status: 404 })
  const mime = buffer
    ? file.fileMime || mimeForFileName(file.fileName) || "application/octet-stream"
    : "text/plain"
  const fileName = buffer ? file.fileName : file.fileName.replace(/\.[^.]+$/, "") + ".txt"
  const headers: Record<string, string> = {
    "Content-Type": mime.startsWith("text/") ? `${mime}; charset=utf-8` : mime,
    "Content-Length": String(body.byteLength),
    "Content-Disposition": contentDisposition(download ? "attachment" : "inline", fileName),
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  }
  // Chrome refuses to render PDFs inside a sandboxed CSP.
  if (mime !== "application/pdf") headers["Content-Security-Policy"] = "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox"
  return new NextResponse(new Uint8Array(body), { headers })
}

export async function GET(request: Request) {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const params = new URL(request.url).searchParams
    const id = params.get("id")?.trim()
    const fileMode = params.get("file")
    if (id && (fileMode === "view" || fileMode === "download")) {
      return serveFile(id, String(user.id), fileMode === "download")
    }
    if (id) {
      const document = await getProfileDocument(id, String(user.id))
      return document
        ? NextResponse.json({ document })
        : NextResponse.json({ error: "Document not found." }, { status: 404 })
    }
    const documents = await listProfileDocuments(String(user.id))
    return NextResponse.json({ documents })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to list documents." },
      { status: 500 },
    )
  }
}

function parseKind(value: unknown): CheckDocumentKind | "auto" {
  const kind = String(value || "cv")
  return kind === "auto" || DOCUMENT_KINDS.includes(kind as CheckDocumentKind) ? kind as CheckDocumentKind | "auto" : "cv"
}

export async function POST(request: Request) {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const authUserId = String(user.id)
    const email = String(user.email ?? "")
    const contentType = request.headers.get("content-type") || ""

    let base64: string
    let fileName: string
    let fileMime: string | null = null
    let requestedKind: CheckDocumentKind | "auto" = "cv"

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData()
      const file = form.get("file") || form.get("cvFile")
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "Choose a file to upload." }, { status: 400 })
      }
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "File must be under 10 MB." }, { status: 413 })
      }
      base64 = Buffer.from(await file.arrayBuffer()).toString("base64")
      fileName = file.name
      fileMime = file.type || null
      requestedKind = parseKind(form.get("kind"))
    } else {
      const body = (await request.json().catch(() => null)) as {
        base64?: string
        fileName?: string
        fileMime?: string
        kind?: string
      } | null
      if (!body?.base64 || !body.fileName) {
        return NextResponse.json({ error: "fileName and base64 are required." }, { status: 400 })
      }
      base64 = body.base64
      fileName = body.fileName
      fileMime = body.fileMime ?? null
      requestedKind = parseKind(body.kind)
    }
    fileMime ||= mimeForFileName(fileName)

    const buffer = Buffer.from(base64, "base64")
    let extractedText = ""
    try {
      extractedText = await extractTextFromUploadedFile({ buffer, originalName: fileName, mimeType: fileMime })
    } catch (error) {
      if (requestedKind === "cv") throw error
    }
    const kind = requestedKind === "auto" ? detectDocumentKind(fileName, extractedText) : requestedKind
    const extractedData = kind === "cv" && extractedText ? await extractCvFromText(extractedText) : null
    const document = await saveCheckDocument({
      sessionId: profileVaultSessionId(authUserId),
      authUserId,
      kind,
      fileName,
      fileMime,
      base64,
      extractedText,
      extractedData,
      requireText: kind === "cv",
      allowImages: kind !== "cv",
    })

    let extractedSkills: string[] = []
    if (kind === "cv" && extractedText) {
      try {
        const twin = await buildDigitalTwin({
          officialTitle: "",
          experienceText: extractedText.slice(0, 16000),
        })
        extractedSkills = twin.extractedSkills ?? []
        if (extractedSkills.length) {
          await mergeCareerSkills(authUserId, extractedSkills, email)
        }
      } catch {
        /* extraction is best-effort */
      }
    }

    const documents = await listProfileDocuments(authUserId)
    return NextResponse.json({ document, documents, extractedSkills, cvData: extractedData })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const url = new URL(request.url)
    const id = url.searchParams.get("id")?.trim()
    if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 })

    await deleteProfileDocument(id, String(user.id))
    const documents = await listProfileDocuments(String(user.id))
    return NextResponse.json({ documents })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Delete failed." },
      { status: 500 },
    )
  }
}

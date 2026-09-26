import { NextResponse } from "next/server"
import { neonAuth } from "@neondatabase/auth/next/server"
import {
  deleteProfileDocument,
  listProfileDocuments,
  profileVaultSessionId,
  saveCheckDocument,
} from "@/lib/check/documents-store"
import { mergeCareerSkills } from "@/lib/career/profile-store"
import { buildDigitalTwin } from "@/lib/career-lab/intelligence"

export const runtime = "nodejs"
export const maxDuration = 60

export async function GET() {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const documents = await listProfileDocuments(String(user.id))
    return NextResponse.json({ documents })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to list documents." },
      { status: 500 },
    )
  }
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
    let kind: "cv" | "certificate" | "offer" | "passport" | "other" = "cv"

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData()
      const file = form.get("file") || form.get("cvFile")
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "Choose a PDF, Word, or text file." }, { status: 400 })
      }
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "File must be under 10 MB." }, { status: 413 })
      }
      base64 = Buffer.from(await file.arrayBuffer()).toString("base64")
      fileName = file.name
      fileMime = file.type || null
      const k = String(form.get("kind") || "cv")
      if (["cv", "certificate", "offer", "passport", "other"].includes(k)) kind = k as typeof kind
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
      if (body.kind && ["cv", "certificate", "offer", "passport", "other"].includes(body.kind)) {
        kind = body.kind as typeof kind
      }
    }

    const document = await saveCheckDocument({
      sessionId: profileVaultSessionId(authUserId),
      authUserId,
      kind,
      fileName,
      fileMime,
      base64,
    })

    let extractedSkills: string[] = []
    if (kind === "cv" && document.excerpt) {
      try {
        const twin = await buildDigitalTwin({
          officialTitle: "",
          experienceText: document.excerpt,
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
    return NextResponse.json({ document, documents, extractedSkills })
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

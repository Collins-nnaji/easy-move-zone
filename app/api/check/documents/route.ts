import { NextResponse } from "next/server"
import { neonAuth } from "@neondatabase/auth/next/server"
import {
  deleteCheckDocument,
  listCheckDocuments,
  saveCheckDocument,
} from "@/lib/check/documents-store"
import type { CheckDocumentKind } from "@/lib/check/types"

export const runtime = "nodejs"

const KINDS = new Set<CheckDocumentKind>(["cv", "passport", "certificate", "offer", "other"])

function sessionOrThrow(request: Request, bodySession?: string | null) {
  const header = request.headers.get("x-check-session")?.trim()
  const sessionId = (bodySession || header || "").trim()
  if (!sessionId || sessionId.length < 8 || sessionId.length > 80) {
    return null
  }
  return sessionId
}

export async function GET(request: Request) {
  const sessionId = sessionOrThrow(request)
  if (!sessionId) {
    return NextResponse.json({ error: "Missing check session." }, { status: 400 })
  }
  const documents = await listCheckDocuments(sessionId)
  return NextResponse.json({ documents })
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    sessionId?: string
    kind?: string
    fileName?: string
    fileMime?: string
    base64?: string
  } | null

  const sessionId = sessionOrThrow(request, body?.sessionId)
  if (!sessionId) {
    return NextResponse.json({ error: "Missing check session." }, { status: 400 })
  }

  const kind = (KINDS.has(body?.kind as CheckDocumentKind) ? body?.kind : "other") as CheckDocumentKind
  const fileName = String(body?.fileName ?? "").trim()
  const base64 = String(body?.base64 ?? "").trim()
  if (!fileName || !base64) {
    return NextResponse.json({ error: "fileName and base64 are required." }, { status: 400 })
  }

  try {
    const { user } = await neonAuth()
    const document = await saveCheckDocument({
      sessionId,
      authUserId: user?.id ? String(user.id) : null,
      kind,
      fileName,
      fileMime: body?.fileMime ?? null,
      base64,
    })
    return NextResponse.json({ document })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 },
    )
  }
}

export async function DELETE(request: Request) {
  const url = new URL(request.url)
  const id = url.searchParams.get("id")
  const sessionId = sessionOrThrow(request, url.searchParams.get("sessionId"))
  if (!sessionId || !id) {
    return NextResponse.json({ error: "id and session are required." }, { status: 400 })
  }
  await deleteCheckDocument(id, sessionId)
  return NextResponse.json({ ok: true })
}

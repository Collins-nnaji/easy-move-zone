import { NextResponse } from "next/server"
import { neonAuth } from "@neondatabase/auth/next/server"
import { runAiMoveCheck } from "@/lib/check/assess"
import { loadDocumentTexts, saveCheckRun } from "@/lib/check/documents-store"
import type { CheckInput } from "@/lib/check/types"
import { listDestinations } from "@/lib/mobility/catalog"
import { getCountryBySlug } from "@/lib/mobility/countries"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    sessionId?: string
    documentIds?: string[]
    profile?: Partial<CheckInput>
  } | null

  const sessionId = String(body?.sessionId || request.headers.get("x-check-session") || "").trim()
  if (!sessionId || sessionId.length < 8) {
    return NextResponse.json({ error: "Missing check session." }, { status: 400 })
  }

  const toSlug = String(body?.profile?.toSlug || "").trim()
  if (!toSlug) {
    return NextResponse.json({ error: "Choose a destination country." }, { status: 400 })
  }
  const destination =
    listDestinations().find((item) => item.slug === toSlug) || getCountryBySlug(toSlug)

  const rawTargets = Array.isArray((body?.profile as { targetRoles?: unknown })?.targetRoles)
    ? ((body!.profile as { targetRoles: unknown[] }).targetRoles || []).map(String)
    : []
  const fromSingular = body?.profile?.targetRole ? [String(body.profile.targetRole)] : []
  const targetRoles = [...new Set([...rawTargets, ...fromSingular].map((r) => r.trim()).filter(Boolean))].slice(0, 4)
  const targetRole = targetRoles[0] || String(body?.profile?.currentRole || "")

  const profile: CheckInput = {
    fromCountry: String(body?.profile?.fromCountry || "Nigeria"),
    toCountry: String(body?.profile?.toCountry || destination?.name || toSlug),
    toSlug,
    currentRole: String(body?.profile?.currentRole || ""),
    targetRole,
    targetRoles: targetRoles.length ? targetRoles : undefined,
    age: Math.max(18, Number(body?.profile?.age) || 29),
    experienceYears: Math.max(0, Number(body?.profile?.experienceYears) || 0),
    education: String(body?.profile?.education || "bachelor"),
    englishLevel: String(body?.profile?.englishLevel || "intermediate"),
    savingsGbp: Math.max(0, Number(body?.profile?.savingsGbp) || 0),
    family: String(body?.profile?.family || "single"),
    needsSponsorship: body?.profile?.needsSponsorship !== false,
    hasJobOffer: Boolean(body?.profile?.hasJobOffer),
    notes: body?.profile?.notes ? String(body.profile.notes) : undefined,
  }

  if (!profile.currentRole && !profile.targetRole) {
    return NextResponse.json({ error: "Tell us your current role or at least one target career." }, { status: 400 })
  }

  const documentIds = Array.isArray(body?.documentIds)
    ? body!.documentIds.map(String).filter(Boolean).slice(0, 8)
    : []

  try {
    const documents = await loadDocumentTexts(documentIds, sessionId)
    const result = await runAiMoveCheck({ profile, documents })
    const { user } = await neonAuth()
    const runId = await saveCheckRun({
      sessionId,
      authUserId: user?.id ? String(user.id) : null,
      payload: { profile, documentIds },
      result,
      sources: result.sources,
    })
    return NextResponse.json({ result, runId, documentsUsed: documents.length })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Check failed" },
      { status: 500 },
    )
  }
}

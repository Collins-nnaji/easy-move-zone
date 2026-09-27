import { NextResponse } from "next/server"
import { runCareerSimulation, runSkillRoi } from "@/lib/career-lab/simulate"
import {
  buildDigitalTwin,
  buildGapProject,
  diagnoseApplications,
  translateExperience,
} from "@/lib/career-lab/intelligence"
import { buildFitCheck } from "@/lib/career-lab/fit-check"
import { loadDocumentTexts } from "@/lib/check/documents-store"
import { neonAuth } from "@neondatabase/auth/next/server"
import { getJobsSubscription } from "@/lib/payments/jobs-subscription"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  const action = String(body?.action ?? "")

  try {
    if (action === "simulate") {
      const result = await runCareerSimulation({
        currentRole: String(body?.currentRole ?? ""),
        targetRole: String(body?.targetRole ?? ""),
        userSkills: Array.isArray(body?.userSkills) ? body.userSkills.map(String) : [],
        experienceYears: Number(body?.experienceYears) || 3,
        learnSkills: Array.isArray(body?.learnSkills) ? body.learnSkills.map(String) : [],
      })
      return NextResponse.json({ result })
    }

    if (action === "skill-roi") {
      const result = await runSkillRoi({
        targetRole: String(body?.targetRole ?? ""),
        userSkills: Array.isArray(body?.userSkills) ? body.userSkills.map(String) : [],
        candidateSkills: Array.isArray(body?.candidateSkills) ? body.candidateSkills.map(String) : undefined,
      })
      return NextResponse.json({ result })
    }

    if (action === "twin") {
      let experienceText = String(body?.experienceText ?? "")
      const sessionId = String(body?.sessionId ?? request.headers.get("x-check-session") ?? "")
      const documentIds = Array.isArray(body?.documentIds) ? body.documentIds.map(String) : []
      if (sessionId && documentIds.length) {
        const docs = await loadDocumentTexts(documentIds, sessionId)
        experienceText = `${experienceText}\n\n${docs.map((doc) => doc.text).join("\n\n")}`.trim()
      }
      const result = await buildDigitalTwin({
        officialTitle: String(body?.officialTitle ?? ""),
        experienceText,
      })
      return NextResponse.json({ result })
    }

    if (action === "translate") {
      const result = await translateExperience({
        bullet: String(body?.bullet ?? ""),
        targets: Array.isArray(body?.targets) ? body.targets.map(String) : undefined,
      })
      return NextResponse.json({ result })
    }

    if (action === "diagnosis") {
      const result = await diagnoseApplications({
        applications: Number(body?.applications) || 0,
        rejected: Number(body?.rejected) || 0,
        noResponse: Number(body?.noResponse) || 0,
        interviews: Number(body?.interviews) || 0,
        notes: body?.notes ? String(body.notes) : undefined,
        twinSkills: Array.isArray(body?.twinSkills) ? body.twinSkills.map(String) : [],
        targetRole: body?.targetRole ? String(body.targetRole) : undefined,
      })
      return NextResponse.json({ result })
    }

    if (action === "gap-project") {
      const result = await buildGapProject({
        missingSkill: String(body?.missingSkill ?? ""),
        targetRole: String(body?.targetRole ?? ""),
      })
      return NextResponse.json({ result })
    }

    if (action === "fit-check" || action === "job-dna") {
      const { session, user } = await neonAuth()
      if (!session || !user) return NextResponse.json({ error: "Sign in required" }, { status: 401 })
      const subscription = await getJobsSubscription(String(user.id))
      if (!subscription.active) {
        return NextResponse.json({ error: "An active jobs subscription is required", code: "subscription_required" }, { status: 402 })
      }
      const result = await buildFitCheck({
        jobId: String(body?.jobId ?? ""),
        userSkills: Array.isArray(body?.userSkills) ? body.userSkills.map(String) : [],
        userSummary: body?.userSummary ? String(body.userSummary) : undefined,
      })
      if (!result) return NextResponse.json({ error: "Job not found" }, { status: 404 })
      return NextResponse.json({ result })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Request failed" },
      { status: 500 },
    )
  }
}

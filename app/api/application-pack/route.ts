import { neonAuth } from "@neondatabase/auth/next/server"
import { chatJson } from "@/lib/ai/openai"
import { generateApplicationPack, normalizeApplicationPack, saveApplicationPack, type ApplicationPackData } from "@/lib/career/application-pack"
import { loadLatestProfileCv, loadLatestProfileCvText } from "@/lib/check/documents-store"
import { getJobsSubscription } from "@/lib/payments/jobs-subscription"

export const runtime = "nodejs"
export const maxDuration = 60

async function member() {
  const { session, user } = await neonAuth()
  if (!session || !user) return { error: Response.json({ error: "Unauthorized" }, { status: 401 }) }
  const subscription = await getJobsSubscription(String(user.id))
  if (!subscription.active) {
    return { error: Response.json({ error: "An active jobs subscription is required", code: "subscription_required" }, { status: 402 }) }
  }
  return { user }
}

export async function GET() {
  const auth = await member()
  if (auth.error) return auth.error
  const cv = await loadLatestProfileCv(String(auth.user.id))
  return Response.json({ available: cv.text.length >= 80, cvText: cv.text, cvData: cv.data })
}

export async function POST(request: Request) {
  const auth = await member()
  if (auth.error) return auth.error
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return Response.json({ error: "Invalid request" }, { status: 400 })

  if (body.action === "answer") {
    const question = String(body.question ?? "").trim()
    const cvText = String(body.cvText ?? "").trim()
    const jobTitle = String(body.jobTitle ?? "").trim()
    const company = String(body.company ?? "").trim()
    if (question.length < 3 || cvText.length < 40) return Response.json({ error: "Add a question and CV first." }, { status: 400 })
    const result = await chatJson(
      "Draft a concise job application answer in first-person UK English using only facts in the CV. Never invent evidence. Return JSON only.",
      `Role: ${jobTitle} at ${company}\nQuestion: ${question}\nCV:\n${cvText.slice(0, 14000)}\nReturn {"answer":"..."}.`,
      { answer: "I would tailor this answer using the evidence in my CV and the requirements of this role." },
      { maxTokens: 900, temperature: 0.2 },
    )
    return Response.json(result)
  }

  const jobId = Number(body.jobId)
  const cvText = String(body.cvText ?? "").trim() || await loadLatestProfileCvText(String(auth.user.id))
  if (!Number.isFinite(jobId)) return Response.json({ error: "Choose a valid job." }, { status: 400 })
  if (cvText.length < 80) return Response.json({ error: "Upload a CV before creating the pack." }, { status: 400 })

  try {
    const generated = await generateApplicationPack({ jobId, cvText, cvData: body.cvData, user: auth.user })
    const cvId = await saveApplicationPack({
      userId: String(auth.user.id), jobId, jobTitle: generated.job.title, data: generated.data,
    })
    return Response.json({ data: generated.data, cvId })
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not create application pack." }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const auth = await member()
  if (auth.error) return auth.error
  const body = (await request.json().catch(() => null)) as { cvId?: number; jobId?: number; jobTitle?: string; data?: Partial<ApplicationPackData> } | null
  if (!body?.cvId || !body.jobId || !body.data) return Response.json({ error: "Missing CV data." }, { status: 400 })

  const fallback = body.data as ApplicationPackData
  const data = normalizeApplicationPack(body.data, fallback)
  const cvId = await saveApplicationPack({
    userId: String(auth.user.id), id: body.cvId, jobId: body.jobId,
    jobTitle: String(body.jobTitle || "Tailored"), data,
  })
  if (!cvId) return Response.json({ error: "CV not found." }, { status: 404 })
  return Response.json({ saved: true, cvId })
}

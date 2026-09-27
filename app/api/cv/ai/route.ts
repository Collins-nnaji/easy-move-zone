import { neonAuth } from "@neondatabase/auth/next/server"
import { chatJson } from "@/lib/ai/openai"
import { extractCvFromText } from "@/lib/documents/cv-ai"

export const runtime = "nodejs"
export const maxDuration = 60

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : {}
}

export async function POST(request: Request) {
  const { session, user } = await neonAuth()
  if (!session || !user) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const body = object(await request.json().catch(() => null))
  const action = String(body.action || "refine-section")

  if (action === "parse-text") {
    const text = String(body.text || "").trim().slice(0, 40000)
    if (text.length < 40) return Response.json({ error: "There is not enough CV text to process." }, { status: 400 })
    return Response.json({ cvData: await extractCvFromText(text) })
  }

  if (action === "refine-section" || action === "draft-section") {
    const section = String(body.section || "section").slice(0, 80)
    const content = String(body.content || "").slice(0, 12000)
    const instruction = String(body.instruction || (action === "draft-section" ? "Write a concise professional draft" : "Improve clarity and impact")).slice(0, 1000)
    const context = object(body.context)
    const fallback = { text: content }
    const result = await chatJson(
      `You are a careful UK CV writer. ${action === "draft-section" ? "Draft" : "Refine"} only the requested ${section}. Preserve every fact and never invent employers, dates, qualifications, metrics, tools or achievements. Return JSON {"text":"..."}. For experience descriptions return one achievement per line, each starting with "• ". For skills return comma-separated skill names only.`,
      `Instruction: ${instruction}\nContext: ${JSON.stringify(context)}\nCurrent content:\n${content}`,
      fallback, { maxTokens: 1600, temperature: 0.25 },
    )
    return Response.json(result)
  }

  if (action === "edit-cv") {
    const cv = object(body.cvData)
    const instruction = String(body.instruction || "Improve clarity and impact throughout").slice(0, 2000)
    const result = await chatJson(
      "You are an expert UK CV editor. Apply the user's instruction to the supplied CV. Preserve all facts and ids. Never invent facts, metrics, employers, dates, skills or qualifications. Keep the same JSON structure and return JSON only. Experience descriptions stay as one achievement per line, each starting with \"• \".",
      `Instruction: ${instruction}\nCV JSON:\n${JSON.stringify(cv).slice(0, 30000)}`,
      cv, { maxTokens: 4500, temperature: 0.2 },
    )
    return Response.json({ cvData: result })
  }

  return Response.json({ error: "Unknown CV action" }, { status: 400 })
}

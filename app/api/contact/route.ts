import { NextRequest, NextResponse } from "next/server"
import { insertContactSubmission, type ContactSubmissionInput } from "@/lib/contact/submissions"

const MAX_LEN = {
  name: 120,
  email: 254,
  phone: 40,
  subject: 200,
  message: 8000,
  pageContext: 2000,
} as const

function validate(body: unknown): { ok: true; data: ContactSubmissionInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid request." }
  const o = body as Record<string, unknown>
  const name = typeof o.name === "string" ? o.name.trim() : ""
  const email = typeof o.email === "string" ? o.email.trim() : ""
  const phone = typeof o.phone === "string" ? o.phone.trim() : ""
  const subject = typeof o.subject === "string" ? o.subject.trim() : ""
  const message = typeof o.message === "string" ? o.message.trim() : ""
  const pageContext = typeof o.pageContext === "string" ? o.pageContext.trim() : ""

  if (name.length < 2 || name.length > MAX_LEN.name) return { ok: false, error: "Please enter your name." }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > MAX_LEN.email) {
    return { ok: false, error: "Please enter a valid email." }
  }
  if (message.length < 10 || message.length > MAX_LEN.message) {
    return { ok: false, error: "Message should be at least 10 characters." }
  }
  if (phone.length > MAX_LEN.phone) return { ok: false, error: "Phone is too long." }
  if (subject.length > MAX_LEN.subject) return { ok: false, error: "Subject is too long." }
  if (pageContext.length > MAX_LEN.pageContext) return { ok: false, error: "Invalid context." }

  return {
    ok: true,
    data: {
      name,
      email,
      phone: phone || null,
      subject: subject || null,
      message,
      pageContext: pageContext || null,
    },
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = validate(body)
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

    const row = await insertContactSubmission(parsed.data)
    if (!row) {
      return NextResponse.json(
        { error: "We could not save your message. Try email instead or try again later." },
        { status: 503 },
      )
    }

    return NextResponse.json({ ok: true, id: row.id })
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }
}

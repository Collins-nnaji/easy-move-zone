import { NextResponse } from "next/server"
import { createSpecialistEnquiry } from "@/lib/career/specialist-enquiry"

export const runtime = "nodejs"

const GOALS = new Set(["work", "study", "family", "business", "asylum_humanitarian", "other"])
const CONTACTS = new Set(["email", "phone", "whatsapp"])

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 })

  const fullName = String(body.fullName ?? "").trim()
  const email = String(body.email ?? "").trim()
  const message = String(body.message ?? "").trim()
  const primaryGoal = String(body.primaryGoal ?? "work")
  const preferredContact = String(body.preferredContact ?? "email")
  const consent = Boolean(body.consent)
  const destinationCountries = Array.isArray(body.destinationCountries)
    ? body.destinationCountries.map(String).map((s) => s.trim()).filter(Boolean).slice(0, 8)
    : []
  const challenges = Array.isArray(body.challenges)
    ? body.challenges.map(String).map((s) => s.trim()).filter(Boolean).slice(0, 12)
    : []

  if (fullName.length < 2) return NextResponse.json({ error: "Please enter your full name." }, { status: 400 })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 })
  }
  if (!destinationCountries.length) {
    return NextResponse.json({ error: "Add at least one destination country." }, { status: 400 })
  }
  if (!GOALS.has(primaryGoal)) return NextResponse.json({ error: "Invalid goal." }, { status: 400 })
  if (!CONTACTS.has(preferredContact)) return NextResponse.json({ error: "Invalid contact preference." }, { status: 400 })
  if (message.length < 20) {
    return NextResponse.json({ error: "Tell us a bit more (at least 20 characters)." }, { status: 400 })
  }
  if (!consent) return NextResponse.json({ error: "Consent is required to submit." }, { status: 400 })

  const yearsRaw = body.yearsExperience
  const yearsExperience =
    yearsRaw === "" || yearsRaw == null ? null : Math.max(0, Math.min(50, Number(yearsRaw) || 0))
  const dependents = Math.max(0, Math.min(20, Number(body.dependents) || 0))

  try {
    const row = await createSpecialistEnquiry({
      fullName,
      email,
      phone: body.phone != null ? String(body.phone) : null,
      nationality: body.nationality != null ? String(body.nationality) : null,
      currentCountry: body.currentCountry != null ? String(body.currentCountry) : null,
      destinationCountries,
      primaryGoal,
      timeline: body.timeline != null ? String(body.timeline) : null,
      currentOccupation: body.currentOccupation != null ? String(body.currentOccupation) : null,
      targetOccupation: body.targetOccupation != null ? String(body.targetOccupation) : null,
      yearsExperience,
      educationLevel: body.educationLevel != null ? String(body.educationLevel) : null,
      englishLevel: body.englishLevel != null ? String(body.englishLevel) : null,
      visaStatus: body.visaStatus != null ? String(body.visaStatus) : null,
      alreadyAbroad: Boolean(body.alreadyAbroad),
      dependents,
      budgetRange: body.budgetRange != null ? String(body.budgetRange) : null,
      challenges,
      preferredContact,
      message,
      consent,
    })
    return NextResponse.json({ ok: true, id: row.id })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save enquiry" },
      { status: 500 },
    )
  }
}

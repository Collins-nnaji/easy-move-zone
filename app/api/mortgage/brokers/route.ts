import { NextRequest, NextResponse } from "next/server"
import { createLead } from "@/lib/platform"
import { getBrokersByCountry, getAllBrokers } from "@/lib/mortgage/brokers"

// GET: list brokers, optionally filtered by country
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const country = searchParams.get("country") ?? ""

  const brokers = country
    ? getBrokersByCountry(country)
    : getAllBrokers()

  return NextResponse.json({ brokers })
}

// POST: onboard a new broker (creates a lead for team follow-up)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      company?: string
      contactName?: string
      email?: string
      phone?: string
      countries?: string[]
      message?: string
    }
    const company = (body.company ?? "").trim() || "Mortgage broker"
    const contactName = (body.contactName ?? "").trim() || "Broker"
    const email = (body.email ?? "").trim()
    const phone = (body.phone ?? "").trim()
    const countries = Array.isArray(body.countries) ? body.countries : []
    let message = (body.message ?? "").trim() || "Request to join as a partner mortgage broker. Countries: " + (countries.length ? countries.join(", ") : "Not specified.")
    if (message.length < 60) message = message + " I would like to be onboarded as a partner broker and can serve the markets above."

    if (!email) return NextResponse.json({ error: "Email is required." }, { status: 400 })

    const parts = contactName.split(/\s+/).filter(Boolean)
    const firstName = parts[0] || "Broker"
    const lastName = parts.slice(1).join(" ") || "Onboarding"

    await createLead(
      {
        firstName,
        lastName,
        company,
        email,
        phone: phone || undefined,
        direction: "Mortgage broker onboarding",
        targetMarket: countries.length ? countries.join(", ") : "Not specified",
        businessSector: "Residential",
        timeline: "Exploring options",
        budgetRange: "Let's discuss",
        message,
        source: "Mortgage page (broker onboarding)",
      },
      "Mortgage broker onboarding request. Follow up to verify and add to partner list."
    )

    return NextResponse.json({
      success: true,
      message: "Thanks! Our team will be in touch to onboard you as a partner broker.",
    })
  } catch (e) {
    console.error("[mortgage/brokers] POST error:", e)
    return NextResponse.json({ error: "Could not submit broker request." }, { status: 500 })
  }
}

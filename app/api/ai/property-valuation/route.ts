import { NextRequest, NextResponse } from "next/server"
import { chatJson } from "@/lib/ai/openai"

export async function POST(req: NextRequest) {
  try {
    const { city, neighborhood, propertyType, sizeSqm, bedrooms, features } = await req.json() as {
      city: string
      neighborhood: string
      propertyType: string
      sizeSqm: number
      bedrooms?: number
      features?: string[]
    }

    if (!city || !sizeSqm) return NextResponse.json({ error: "City and size are required" }, { status: 400 })

    const result = await chatJson(
      `You are an AI property valuation engine for EasyMoveZone.
Estimate fair market value for properties in African cities based on location, size, type, and comparable market data.

Return JSON:
{
  "estimatedValueNgn": { "low": number, "mid": number, "high": number },
  "confidence": number (0-100),
  "comparables": "brief description of comparable sales used",
  "factors": ["key factors affecting the valuation"],
  "marketTrend": "rising|stable|declining"
}`,
      `Property details:
City: ${city}
Neighborhood: ${neighborhood ?? "N/A"}
Type: ${propertyType}
Size: ${sizeSqm} sqm
Bedrooms: ${bedrooms ?? "N/A"}
Features: ${features?.join(", ") ?? "None specified"}`,
      {
        estimatedValueNgn: { low: sizeSqm * 80000, mid: sizeSqm * 100000, high: sizeSqm * 120000 },
        confidence: 72,
        comparables: "Based on general market rates for the area.",
        factors: ["Location", "Property size", "Market conditions"],
        marketTrend: "stable",
      }
    )

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Valuation failed" }, { status: 500 })
  }
}

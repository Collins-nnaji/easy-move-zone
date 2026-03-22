import { NextRequest, NextResponse } from "next/server"
import { chatJson } from "@/lib/ai/openai"

export async function POST(req: NextRequest) {
  try {
    const { query } = (await req.json()) as { query: string }
    if (!query?.trim()) return NextResponse.json({ error: "Query is required" }, { status: 400 })

    const result = await chatJson(
      `You are an AI property search assistant for EasyMoveZone, a trusted land and property platform for African cities.
Parse the user's natural language search query and extract structured filters.

Return JSON only:
{
  "city": "city name or null",
  "propertyType": "land|house|apartment|commercial|mixed-use|null",
  "maxPrice": number or null (in NGN),
  "minPrice": number or null (in NGN),
  "minSize": number or null (in sqm),
  "maxSize": number or null (in sqm),
  "bedrooms": number or null,
  "verifiedOnly": boolean,
  "keywords": ["array of relevant search terms"],
  "interpretation": "one sentence describing what the user wants"
}`,
      query,
      {
        city: null,
        propertyType: null,
        maxPrice: null,
        minPrice: null,
        minSize: null,
        maxSize: null,
        bedrooms: null,
        verifiedOnly: false,
        keywords: [],
        interpretation: query,
      }
    )

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Failed to process search" }, { status: 500 })
  }
}

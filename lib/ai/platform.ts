import OpenAI from "openai"
import { getCorridors, getMarkets, getReports, getServices } from "@/lib/platform"
import type { LeadInput } from "@/lib/platform/types"
import { getCityMarkets, getPropertyListings } from "@/lib/property"

const apiKey = process.env.OPENAI_API_KEY
const openai = apiKey ? new OpenAI({ apiKey }) : null

async function chatJson<T>(systemPrompt: string, userPrompt: string, fallback: T): Promise<T> {
  if (!openai) return fallback
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 700,
    })
    const content = completion.choices[0]?.message?.content?.trim() ?? ""
    const parsed = JSON.parse(content) as T
    return parsed
  } catch {
    return fallback
  }
}

export async function detectDirection(description: string) {
  const lower = description.toLowerCase()
  const fallbackJourney =
    lower.includes("uk") || lower.includes("canada") || lower.includes("diaspora")
      ? "diaspora"
      : lower.includes("accra") || lower.includes("nairobi") || lower.includes("johannesburg")
        ? "pan_african"
        : "domestic"

  return chatJson(
    "You classify EasyMoveZone Property Finder mover profiles. Always return JSON.",
    `Move description: ${description}
Return JSON with:
{
  "moverJourney": "domestic" | "diaspora" | "pan_african",
  "suggestedCities": ["city1","city2","city3"],
  "suggestedPlan": "Essential Move Plan | Verified Move Plan | Concierge Move Plan",
  "reasoning": "short reason"
}`,
    {
      moverJourney: fallbackJourney,
      suggestedCities:
        fallbackJourney === "diaspora"
          ? ["Lagos", "Abuja", "Accra"]
          : fallbackJourney === "pan_african"
            ? ["Accra", "Nairobi", "Kigali"]
            : ["Lagos", "Abuja", "Port Harcourt"],
      suggestedPlan:
        fallbackJourney === "diaspora"
          ? "Concierge Move Plan"
          : fallbackJourney === "pan_african"
            ? "Verified Move Plan"
            : "Essential Move Plan",
      reasoning: "Recommendation based on route, urgency, and property verification needs.",
    }
  )
}

export async function recommendService(payload: {
  businessType: string
  targetMarket: string
  timelineBudget: string
}) {
  const services = await getServices()
  const compactServices = services.map((service) => ({
    name: service.name,
    direction: service.direction,
    timeline: service.timeline,
    priceRange: `$${service.priceMin}-$${service.priceMax}`,
  }))

  return chatJson(
    "You are an EasyMoveZone advisor. Return JSON only.",
    `User answers:
Business type: ${payload.businessType}
Target market: ${payload.targetMarket}
Timeline and budget: ${payload.timelineBudget}
Services: ${JSON.stringify(compactServices)}

Return:
{
 "recommendedService":"string",
 "direction":"inbound|outbound",
 "explanation":"1 paragraph explanation"
}`,
    {
      recommendedService: "Trade Bridge",
      direction: payload.targetMarket.toLowerCase().includes("nigeria") ? "inbound" : "outbound",
      explanation:
        "Trade Bridge balances speed and execution depth, making it a strong default when teams want monthly support and active corridor introductions.",
    }
  )
}

export async function intelligenceChat(question: string) {
  const listings = await getPropertyListings()
  const listingSnippets = listings
    .slice(0, 20)
    .map((listing) => `${listing.title} (${listing.citySlug}, ${listing.neighborhood}) - ${listing.description}`)
    .join("\n")

  return chatJson(
    "You are EasyMoveZone Property Finder assistant. Use listing and city context. Return JSON only.",
    `Question: ${question}
Listing context:
${listingSnippets}

Return:
{
  "answer":"Clear answer with practical city/neighbourhood recommendation."
}`,
    {
      answer:
        "Based on available listings and city context, shortlist two verified neighbourhood options and compare commute and school access before booking viewings.",
    }
  )
}

export async function compareMarkets(marketAId: string, marketBId: string) {
  const markets = await getCityMarkets()
  const a = markets.find((market) => market.id === marketAId)
  const b = markets.find((market) => market.id === marketBId)
  const fallback = {
    summary: `Comparison between ${a?.name ?? "Market A"} and ${b?.name ?? "Market B"}.`,
    marketSize: `${a?.name ?? "A"} average buy: $${a?.avgBuyUsd?.toLocaleString() ?? "n/a"} vs $${b?.avgBuyUsd?.toLocaleString() ?? "n/a"} in ${b?.name ?? "B"}.`,
    regulatoryEase: `${a?.name ?? "A"} security ${a?.securityScore ?? "n/a"}/100 vs ${b?.name ?? "B"} security ${b?.securityScore ?? "n/a"}/100.`,
    sectorOpportunity: `${a?.topSectors.join(", ") ?? "n/a"} vs ${b?.topSectors.join(", ") ?? "n/a"}.`,
    competitionLevel: "High-demand neighborhoods move faster and require early verification.",
    recommendedApproach: "Start with verified shortlists and virtual tours before in-person final selection.",
    estimatedTimelineAndCost: "2-6 weeks and $299-$1.5K service spend depending on support tier.",
  }

  return chatJson(
    "You are EasyMoveZone market analyst. Return JSON only.",
    `Compare these two markets:
Market A: ${JSON.stringify(a)}
Market B: ${JSON.stringify(b)}

Return:
{
  "summary":"string",
  "marketSize":"string",
  "regulatoryEase":"string",
  "sectorOpportunity":"string",
  "competitionLevel":"string",
  "recommendedApproach":"string",
  "estimatedTimelineAndCost":"string"
}`,
    fallback
  )
}

export async function leadPrequalification(lead: LeadInput) {
  const serviceRecommendations = await getServices()
  return chatJson(
    "You are EasyMoveZone internal lead triage assistant. JSON only.",
    `Lead:
${JSON.stringify(lead)}
Service catalog: ${JSON.stringify(serviceRecommendations.map((service) => service.name))}

Return:
{
  "summary":"2-3 sentence lead summary",
  "likelyServiceMatch":"string",
  "priorityLevel":"high|medium|low",
  "talkingPoints":["point 1","point 2","point 3"],
  "redFlags":["flag 1"]
}`,
    {
      summary: "This lead appears to have clear intent and enough detail for a strategy call.",
      likelyServiceMatch: "Trade Bridge",
      priorityLevel: "medium",
      talkingPoints: [
        "Clarify target market sequence and first-market objective.",
        "Validate budget-to-timeline alignment.",
        "Confirm required deliverables for first 90 days.",
      ],
      redFlags: [],
    }
  )
}

export async function askMarket(corridorId: string, question: string) {
  const [corridors, reports] = await Promise.all([getCorridors(), getReports()])
  const corridor = corridors.find((item) => item.id === corridorId)
  const relatedReports = reports.filter(
    (report) => report.marketId === corridor?.originMarketId || report.marketId === corridor?.destinationMarketId
  )
  const context = relatedReports.map((report) => `${report.title}: ${report.summary}`).join("\n")
  return chatJson(
    "You are EasyMoveZone client assistant. Return JSON only.",
    `Corridor: ${JSON.stringify(corridor)}
Question: ${question}
Context:
${context}

Return:
{
  "answer":"specific answer grounded in provided context"
}`,
    {
      answer:
        "Based on your corridor context, the best immediate step is to validate regulatory updates and prioritize partner conversations in your target market this month.",
    }
  )
}

export async function generateMonthlyDigest() {
  const [corridors, reports, markets] = await Promise.all([getCorridors(), getReports(), getMarkets()])
  const prompt = `Draft a monthly intelligence digest for EasyMoveZone.
Corridors: ${JSON.stringify(corridors.slice(0, 10))}
Reports: ${JSON.stringify(reports.slice(0, 10).map((report) => ({ title: report.title, marketId: report.marketId, summary: report.summary })))}
Markets: ${JSON.stringify(markets.slice(0, 10).map((market) => ({ name: market.name, status: market.status, sectors: market.topSectors })))}

Return JSON:
{
  "draft":"newsletter draft in sections"
}`

  return chatJson(
    "You are EasyMoveZone editorial assistant. Return JSON only.",
    prompt,
    {
      draft:
        "Monthly Intelligence Draft\n\n1) Corridor momentum\n- Nigeria and UK corridor remains highest velocity.\n\n2) Regulatory watch\n- Compliance sequencing remains key for first-time entrants.\n\n3) Market opportunities\n- Strong demand pockets in fintech, FMCG, and logistics.\n\n4) Recommended client actions\n- Prioritize launch-readiness reviews and partner due diligence this month.",
    }
  )
}

function collectUrls(value: unknown, out: Set<string>) {
  if (!value) return
  if (Array.isArray(value)) {
    for (const item of value) collectUrls(item, out)
    return
  }
  if (typeof value === "object") {
    for (const [key, nested] of Object.entries(value)) {
      if (key.toLowerCase().includes("url") && typeof nested === "string" && nested.startsWith("http")) {
        out.add(nested)
      } else {
        collectUrls(nested, out)
      }
    }
  }
}

export async function cityIntelWithWeb(cityId: string, question: string) {
  const cities = await getCityMarkets()
  const city = cities.find((item) => item.id === cityId || item.slug === cityId)

  const fallback = {
    answer:
      city
        ? `${city.name} currently shows security ${city.securityScore}/100, commute ${city.commuteScore}/100, and lifestyle ${city.lifestyleScore}/100. Use this as your baseline, then validate current infrastructure and policy updates before deciding.`
        : "Pick a city first, then ask about commute reality, safety, sector fit, and cost exposure.",
    sources: [] as string[],
  }

  if (!apiKey || !city) return fallback

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        tools: [{ type: "web_search_preview" }],
        temperature: 0.2,
        input: [
          {
            role: "system",
            content:
              "You are a relocation city intelligence analyst. Use web search results plus given map context. Keep response practical, concise, and action-oriented for movers. Mention uncertainties where needed.",
          },
          {
            role: "user",
            content: `City map context:
name: ${city.name}
country: ${city.country}
coordinates: ${city.latitude}, ${city.longitude}
status: ${city.status}
avgRentUsd: ${city.avgRentUsd}
avgBuyUsd: ${city.avgBuyUsd}
securityScore: ${city.securityScore}
commuteScore: ${city.commuteScore}
lifestyleScore: ${city.lifestyleScore}
topSectors: ${city.topSectors.join(", ")}

Question: ${question}

Return a short practical recommendation and 3-5 bullet point findings.`,
          },
        ],
      }),
    })

    if (!response.ok) return fallback
    const payload = (await response.json()) as { output_text?: string }

    const sourceSet = new Set<string>()
    collectUrls(payload, sourceSet)
    return {
      answer: payload.output_text?.trim() || fallback.answer,
      sources: Array.from(sourceSet).slice(0, 6),
    }
  } catch {
    return fallback
  }
}


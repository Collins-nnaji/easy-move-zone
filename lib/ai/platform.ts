import OpenAI from "openai"
import { getCorridors, getMarkets, getReports, getServices } from "@/lib/platform"
import type { LeadInput } from "@/lib/platform/types"

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
  return chatJson(
    "You classify EasyMoveZone prospects. Always return JSON.",
    `Business description: ${description}
Return JSON with:
{
  "direction": "inbound" or "outbound",
  "markets": ["market1","market2","market3"],
  "serviceTier": "Explorer|Trade Bridge|Full Entry",
  "reasoning": "short reason"
}`,
    {
      direction: description.toLowerCase().includes("export") ? "outbound" : "inbound",
      markets: ["Nigeria", "Ghana", "United Kingdom"],
      serviceTier: "Trade Bridge",
      reasoning: "Initial recommendation based on your business description and expansion intent.",
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
  const reports = await getReports()
  const reportSnippets = reports.map((report) => `${report.title} (${report.direction}): ${report.summary}`).join("\n")

  return chatJson(
    "You are EasyMoveZone intelligence assistant. Use report context. Return JSON only.",
    `Question: ${question}
Report context:
${reportSnippets}

Return:
{
  "answer":"Clear answer with recommendation of one report title if applicable."
}`,
    {
      answer:
        "Based on current intelligence context, the best next step is to review the most relevant market report and validate regulatory sequencing before execution.",
    }
  )
}

export async function compareMarkets(marketAId: string, marketBId: string) {
  const markets = await getMarkets()
  const a = markets.find((market) => market.id === marketAId)
  const b = markets.find((market) => market.id === marketBId)
  const fallback = {
    summary: `Comparison between ${a?.name ?? "Market A"} and ${b?.name ?? "Market B"}.`,
    marketSize: `${a?.name ?? "A"} has ${a?.population ?? "n/a"} population vs ${b?.population ?? "n/a"} for ${b?.name ?? "B"}.`,
    regulatoryEase: `${a?.name ?? "A"} rank: ${a?.easeOfDoingBusinessRank ?? "n/a"}, ${b?.name ?? "B"} rank: ${b?.easeOfDoingBusinessRank ?? "n/a"}.`,
    sectorOpportunity: `${a?.topSectors.join(", ") ?? "n/a"} vs ${b?.topSectors.join(", ") ?? "n/a"}.`,
    competitionLevel: "Moderate in both markets with corridor-dependent intensity.",
    recommendedApproach: "Start with targeted pilot distribution and regulatory pre-work before full rollout.",
    estimatedTimelineAndCost: "3-6 months for pilot entry and $15K-$50K depending on sector complexity.",
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


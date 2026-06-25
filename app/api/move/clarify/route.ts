import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { type Destination, type Mode } from "@/app/move/data"
import { getMoveDestinations } from "@/lib/move/get-catalog"
import { settleCardsForCity } from "@/lib/settle/cards"
import { GUIDE_SELECT, mapGuideRow } from "@/lib/settle/map-guide"
import { chatJson, getAiProvider } from "@/lib/ai/openai"
import type { SettleCard } from "@/lib/relocate/types"

const VALID_MODES: Mode[] = ["trip", "nomad", "move"]
const MODE_NAME: Record<Mode, string> = { trip: "short trip", nomad: "nomad stint", move: "long-term move" }

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL

interface ClarifyResult {
  answer: string
}

interface GuideTips {
  healthcareTip: string
  bankingTip: string
  schoolingTip: string
}

async function loadGuideTips(country: string): Promise<GuideTips | null> {
  if (!DATABASE_URL) return null
  try {
    const sql = neon(DATABASE_URL)
    const rows = await sql.query(
      `select ${GUIDE_SELECT} from relocation_country_guides where lower(country) = lower($1) limit 1`,
      [country],
    )
    if (!Array.isArray(rows) || rows.length === 0) return null
    const guide = mapGuideRow(rows[0] as Parameters<typeof mapGuideRow>[0])
    return { healthcareTip: guide.healthcareTip, bankingTip: guide.bankingTip, schoolingTip: guide.schoolingTip }
  } catch {
    return null
  }
}

async function loadSettleCards(country: string, citySlug: string): Promise<SettleCard[]> {
  if (!DATABASE_URL) return settleCardsForCity(citySlug, null)
  try {
    const sql = neon(DATABASE_URL)
    const rows = await sql.query(
      `select ${GUIDE_SELECT} from relocation_country_guides where lower(country) = lower($1) limit 1`,
      [country],
    )
    const fromDb = Array.isArray(rows) && rows.length > 0
      ? mapGuideRow(rows[0] as Parameters<typeof mapGuideRow>[0]).settleCards
      : null
    return settleCardsForCity(citySlug, fromDb)
  } catch {
    return settleCardsForCity(citySlug, null)
  }
}

function heuristicAnswer(
  question: string,
  mode: Mode,
  dest: Destination,
  settleCards: SettleCard[],
  tips: GuideTips | null,
): ClarifyResult {
  const words = question
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2)

  const snippets: { text: string }[] = [
    { text: `${dest.visa[mode].headline}. ${dest.visa[mode].body}` },
    ...settleCards.map((c) => ({ text: `${c.title} — ${c.body}` })),
  ]
  if (tips?.healthcareTip) snippets.push({ text: tips.healthcareTip })
  if (tips?.bankingTip) snippets.push({ text: tips.bankingTip })
  if (tips?.schoolingTip) snippets.push({ text: tips.schoolingTip })

  const scored = snippets
    .map((s) => ({ ...s, hits: words.filter((w) => s.text.toLowerCase().includes(w)).length }))
    .sort((a, b) => b.hits - a.hits)

  const best = scored[0]
  if (best && best.hits > 0) {
    return { answer: best.text }
  }
  return {
    answer: `I don't have a specific note on that for ${dest.city} yet — try asking about visas, schooling, healthcare, banking or neighbourhoods, or check an official source.`,
  }
}

export async function POST(req: NextRequest) {
  let body: { destinationId?: unknown; mode?: unknown; question?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const destinationId = typeof body.destinationId === "string" ? body.destinationId : ""
  const mode: Mode = VALID_MODES.includes(body.mode as Mode) ? (body.mode as Mode) : "nomad"
  const question = typeof body.question === "string" ? body.question.trim().slice(0, 300) : ""

  if (!question) {
    return NextResponse.json({ error: "Ask a question first." }, { status: 400 })
  }

  const { destinations } = await getMoveDestinations()
  const dest = destinations.find((d) => d.id === destinationId)
  if (!dest) {
    return NextResponse.json({ error: "Unknown destination." }, { status: 400 })
  }

  const [settleCards, tips] = await Promise.all([
    loadSettleCards(dest.country, dest.id),
    loadGuideTips(dest.country),
  ])

  const fallback = heuristicAnswer(question, mode, dest, settleCards, tips)

  if (!getAiProvider()) {
    return NextResponse.json(fallback)
  }

  const contextLines = [
    `Visa (${MODE_NAME[mode]}): ${dest.visa[mode].headline}. ${dest.visa[mode].body}`,
    `Honest take (${MODE_NAME[mode]}): ${dest.honest[mode]}`,
    `Stats: ${dest.stats[mode].map(([k, v]) => `${k} ${v}`).join("; ")}`,
    ...settleCards.map((c) => `${c.tag}: ${c.title} — ${c.body}`),
  ]
  if (tips?.healthcareTip) contextLines.push(`Healthcare: ${tips.healthcareTip}`)
  if (tips?.bankingTip) contextLines.push(`Banking: ${tips.bankingTip}`)
  if (tips?.schoolingTip) contextLines.push(`Schooling: ${tips.schoolingTip}`)

  const result = await chatJson<ClarifyResult>(
    `You are a relocation assistant inside a relocation app, answering a question about ${dest.city}, ${dest.country} for someone planning a ${MODE_NAME[mode]}. Answer ONLY using the facts given below — never invent visa rules, prices or other specifics that aren't provided. If the facts don't cover the question, say so honestly and suggest checking an official source. Keep it to 2-4 warm, direct sentences. Respond with raw JSON: {"answer": "..."}.`,
    `Question: "${question}"\n\nFacts about ${dest.city}:\n${contextLines.join("\n")}`,
    fallback,
  )

  const answer = typeof result.answer === "string" && result.answer.trim() ? result.answer.trim() : fallback.answer
  return NextResponse.json({ answer })
}

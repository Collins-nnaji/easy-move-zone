import { NextRequest, NextResponse } from "next/server"
import { DESTINATIONS, type Mode } from "@/app/move/data"
import { chatJson, getAiProvider } from "@/lib/ai/openai"

const VALID_MODES: Mode[] = ["trip", "nomad", "move"]
const MODE_NAME: Record<Mode, string> = { trip: "short trip", nomad: "nomad stint", move: "long-term move" }

interface SearchResult {
  ranking: string[]
  note: string
}

// Plain keyword scoring against each destination's honest take, stats and visa
// copy — used when no AI key is configured, and as a safety net when it is.
function heuristicRanking(mood: string, mode: Mode): SearchResult {
  const words = mood
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2)

  const scored = DESTINATIONS.map((d) => {
    const haystack = [
      d.city,
      d.country,
      d.region,
      d.honest[mode],
      ...d.stats[mode].flat(),
      d.visa[mode].headline,
      d.visa[mode].body,
      d.visa[mode].tag,
    ]
      .join(" ")
      .toLowerCase()

    const hits = words.filter((w) => haystack.includes(w)).length
    return { id: d.id, hits, score: hits * 12 + d.match[mode] * 0.3 }
  }).sort((a, b) => b.score - a.score)

  const note = scored[0] && scored[0].hits > 0
    ? "Ranked by how closely each city's honest take matches what you described."
    : `No exact keyword hits, so these are ranked by how well each city suits a ${MODE_NAME[mode]}.`

  return { ranking: scored.map((s) => s.id), note }
}

export async function POST(req: NextRequest) {
  let body: { mood?: unknown; mode?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const mood = typeof body.mood === "string" ? body.mood.trim().slice(0, 400) : ""
  const mode: Mode = VALID_MODES.includes(body.mode as Mode) ? (body.mode as Mode) : "nomad"

  if (!mood) {
    return NextResponse.json({ error: "Tell us a bit about what you're after." }, { status: 400 })
  }

  const fallback = heuristicRanking(mood, mode)

  if (!getAiProvider()) {
    return NextResponse.json(fallback)
  }

  const destSummaries = DESTINATIONS.map(
    (d) =>
      `${d.id}: ${d.city}, ${d.country} (${d.region}) — ${d.honest[mode]} Stats: ${d.stats[mode]
        .map(([k, v]) => `${k} ${v}`)
        .join("; ")}.`,
  ).join("\n")

  const result = await chatJson<SearchResult>(
    `You are a destination-matching assistant inside a relocation app. Given a traveller's freeform "mood" description and a list of candidate cities (with an honest take for a ${MODE_NAME[mode]}), rank the city ids from best to worst fit and write one short, warm sentence explaining the top pick. Only use the ids given to you, and include every id exactly once. Respond with raw JSON: {"ranking": ["id1","id2","id3","id4"], "note": "..."}.`,
    `Mood: "${mood}"\n\nCandidates:\n${destSummaries}`,
    fallback,
  )

  const validIds = new Set(DESTINATIONS.map((d) => d.id))
  const ranking = Array.isArray(result.ranking)
    ? result.ranking.filter((id): id is string => typeof id === "string" && validIds.has(id))
    : []
  for (const id of fallback.ranking) {
    if (!ranking.includes(id)) ranking.push(id)
  }

  const note = typeof result.note === "string" && result.note.trim() ? result.note.trim() : fallback.note

  return NextResponse.json({ ranking, note })
}

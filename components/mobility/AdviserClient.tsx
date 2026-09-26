"use client"

import { useMemo, useState } from "react"
import { ADVISER_PROMPTS } from "@/lib/mobility/adviser"
import { assessAll } from "@/lib/mobility/score"
import { MobilityFrame } from "./MobilityFrame"
import { useMobilityProfile } from "./useProfile"

type Turn = { role: "you" | "moveai"; text: string; source?: string }

export function AdviserClient() {
  const { profile } = useMobilityProfile()
  const results = useMemo(() => assessAll(profile), [profile])
  const [question, setQuestion] = useState("")
  const [turns, setTurns] = useState<Turn[]>([])
  const [busy, setBusy] = useState(false)

  async function ask(text: string) {
    const trimmed = text.trim()
    if (!trimmed || busy) return
    setBusy(true)
    setTurns((current) => [...current, { role: "you", text: trimmed }])
    setQuestion("")
    try {
      const res = await fetch("/api/mobility/advise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, profile }),
      })
      const data = (await res.json()) as { answer?: string; source?: string; error?: string }
      setTurns((current) => [
        ...current,
        {
          role: "moveai",
          text: data.answer ?? data.error ?? "Unable to answer right now.",
          source: data.source,
        },
      ])
    } catch {
      setTurns((current) => [
        ...current,
        { role: "moveai", text: "Unable to reach MoveAI right now.", source: "error" },
      ])
    } finally {
      setBusy(false)
    }
  }

  return (
    <MobilityFrame
      title="MoveAI"
      lede="It already knows your mobility profile, so the answer is about your move rather than a generic article."
    >
      <dl className="mb-6 grid gap-3 rounded-3xl bg-[#f6f3ec] p-4 text-sm sm:grid-cols-3">
        <div><dt className="text-[#7c827a]">Citizenship</dt><dd className="font-bold">{profile.citizenship}</dd></div>
        <div><dt className="text-[#7c827a]">Lives in</dt><dd className="font-bold">{profile.currentCountry}</dd></div>
        <div><dt className="text-[#7c827a]">Profession</dt><dd className="font-bold">{profile.profession}</dd></div>
        <div><dt className="text-[#7c827a]">Experience</dt><dd className="font-bold">{profile.experienceYears} years</dd></div>
        <div><dt className="text-[#7c827a]">Household</dt><dd className="font-bold">{profile.family}</dd></div>
        <div><dt className="text-[#7c827a]">Top match</dt><dd className="font-bold">{results[0]?.destination.name ?? "—"}</dd></div>
      </dl>

      <div className="flex flex-wrap gap-2">
        {ADVISER_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            disabled={busy}
            className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-[#4a5047] disabled:opacity-50"
            onClick={() => void ask(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {turns.map((turn, index) => (
          <div key={`${turn.role}-${index}`}>
            <p className={`max-w-2xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${turn.role === "you" ? "ml-auto bg-[#1b231e] text-white" : "bg-white text-[#1b231e]"}`}>
              {turn.text}
            </p>
            {turn.role === "moveai" && turn.source && (
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-[#9aa097]">
                {turn.source === "ai" ? "Azure / OpenAI" : turn.source === "rules-fallback" ? "Local fallback" : turn.source}
              </p>
            )}
          </div>
        ))}
        {busy && <p className="text-sm text-[#7c827a]">Thinking…</p>}
      </div>

      <form
        className="mt-6 flex max-w-2xl gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          void ask(question)
        }}
      >
        <input
          className="h-12 flex-1 rounded-2xl border border-[#e4dfd5] bg-white px-4 text-sm"
          placeholder="Ask about your move"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
        />
        <button type="submit" disabled={busy} className="h-12 rounded-2xl bg-[#e0511f] px-5 text-sm font-bold text-white disabled:opacity-50">
          Ask
        </button>
      </form>
    </MobilityFrame>
  )
}

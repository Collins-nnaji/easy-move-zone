"use client"

import { FormEvent, useState } from "react"

interface DirectionResult {
  moverJourney: "domestic" | "diaspora" | "pan_african"
  suggestedCities: string[]
  suggestedPlan: string
  reasoning: string
}

export function DirectionDetector({ dark = false }: { dark?: boolean }) {
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DirectionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!description.trim()) return
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ai/direction-detector", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      })
      if (!response.ok) throw new Error("Could not process description")
      const json = (await response.json()) as DirectionResult
      setResult(json)
    } catch {
      setError("We could not analyze that just now. Please try again.")
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`rounded-2xl p-5 shadow-sm ${dark ? "border border-white/20 bg-white/10 backdrop-blur-md" : "emz-gloss-card"}`}>
      <h3 className={`font-[var(--font-playfair)] text-2xl font-bold ${dark ? "text-white" : "text-[#0f172a]"}`}>Ownership Profile Assistant</h3>
      <p className={`mt-2 text-sm ${dark ? "text-slate-200" : "text-[#64748b]"}`}>
        Describe your buy/sell goal in one sentence. We suggest a best-fit journey, cities, and support plan.
      </p>
      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Example: I want to sell my 2-bed apartment, add savings, and buy a 4-bed home in Lagos."
          className={`flex-1 rounded-xl px-4 py-3 text-sm outline-none ${dark
            ? "border border-white/25 bg-[#0a1420] text-white placeholder:text-slate-400 focus:border-[#7cc8ff]"
            : "border border-[#c8d8f0] bg-white focus:border-[#e0511f]"}`}
        />
        <button
          type="submit"
          disabled={loading}
          className="emz-pill-cta rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-60"
        >
          {loading ? "Analyzing..." : "Analyze profile"}
        </button>
      </form>

      {error ? <p className={`mt-3 text-sm ${dark ? "text-red-300" : "text-red-600"}`}>{error}</p> : null}
      {result ? (
        <div className={`mt-4 rounded-xl border p-4 ${dark ? "border-white/20 bg-[#102538] text-slate-100" : "border-[#b9cef0] bg-[#eef4ff]"}`}>
          <p className="text-sm"><strong>Profile journey:</strong> {result.moverJourney.replace("_", " ")}</p>
          <p className="mt-1 text-sm"><strong>Suggested cities:</strong> {result.suggestedCities.join(", ")}</p>
          <p className="mt-1 text-sm"><strong>Suggested plan:</strong> {result.suggestedPlan}</p>
          <p className={`mt-2 text-sm ${dark ? "text-slate-300" : "text-[#64748b]"}`}>{result.reasoning}</p>
        </div>
      ) : null}
    </div>
  )
}

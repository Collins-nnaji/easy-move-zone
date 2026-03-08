"use client"

import { FormEvent, useState } from "react"

interface DirectionResult {
  direction: "inbound" | "outbound"
  markets: string[]
  serviceTier: string
  reasoning: string
}

export function DirectionDetector() {
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
    <div className="emz-gloss-card rounded-2xl p-5 shadow-sm">
      <h3 className="font-[var(--font-playfair)] text-2xl font-bold text-[#0d0d0d]">Smart Direction Detector</h3>
      <p className="mt-2 text-sm text-[#6b6560]">
        Describe your business in one sentence and we will suggest your best direction, relevant markets, and service tier.
      </p>
      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe your business in one sentence..."
          className="flex-1 rounded-xl border border-black/15 bg-[#f5f0e8] px-4 py-3 text-sm outline-none focus:border-[#c9a84c]"
        />
        <button
          type="submit"
          disabled={loading}
          className="emz-pill-cta rounded-xl bg-[#0d0d0d] px-4 py-3 text-sm font-medium text-[#f5f0e8] transition hover:bg-[#1a3a2a] disabled:opacity-60"
        >
          {loading ? "Analyzing..." : "Detect Direction"}
        </button>
      </form>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      {result ? (
        <div className="mt-4 rounded-xl border border-[#c9a84c]/40 bg-[#ede8de] p-4">
          <p className="text-sm"><strong>Direction:</strong> {result.direction === "inbound" ? "Entering Africa" : "Expanding from Africa"}</p>
          <p className="mt-1 text-sm"><strong>Relevant Markets:</strong> {result.markets.join(", ")}</p>
          <p className="mt-1 text-sm"><strong>Suggested Tier:</strong> {result.serviceTier}</p>
          <p className="mt-2 text-sm text-[#6b6560]">{result.reasoning}</p>
        </div>
      ) : null}
    </div>
  )
}

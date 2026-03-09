"use client"

import { FormEvent, useState } from "react"

interface DirectionResult {
  moverJourney: "domestic" | "diaspora" | "pan_african"
  suggestedCities: string[]
  suggestedPlan: string
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
      <h3 className="font-[var(--font-playfair)] text-2xl font-bold text-[#0f172a]">Smart Move Profile Detector</h3>
      <p className="mt-2 text-sm text-[#64748b]">
        Describe your move in one sentence. We suggest your mover journey, best-fit cities, and support plan.
      </p>
      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Example: Returning from London with family, need a secure 3-bed near good schools in Lagos."
          className="flex-1 rounded-xl border border-[#c8d8f0] bg-white px-4 py-3 text-sm outline-none focus:border-[#155eef]"
        />
        <button
          type="submit"
          disabled={loading}
          className="emz-pill-cta rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-60"
        >
          {loading ? "Analyzing..." : "Detect Journey"}
        </button>
      </form>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      {result ? (
        <div className="mt-4 rounded-xl border border-[#b9cef0] bg-[#eef4ff] p-4">
          <p className="text-sm"><strong>Mover journey:</strong> {result.moverJourney.replace("_", " ")}</p>
          <p className="mt-1 text-sm"><strong>Suggested cities:</strong> {result.suggestedCities.join(", ")}</p>
          <p className="mt-1 text-sm"><strong>Suggested plan:</strong> {result.suggestedPlan}</p>
          <p className="mt-2 text-sm text-[#64748b]">{result.reasoning}</p>
        </div>
      ) : null}
    </div>
  )
}

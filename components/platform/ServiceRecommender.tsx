"use client"

import { FormEvent, useState } from "react"

interface RecommendationResponse {
  recommendedService: string
  direction: "inbound" | "outbound"
  explanation: string
}

export function ServiceRecommender() {
  const [businessType, setBusinessType] = useState("")
  const [targetMarket, setTargetMarket] = useState("")
  const [timelineBudget, setTimelineBudget] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RecommendationResponse | null>(null)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    try {
      const response = await fetch("/api/ai/service-recommender", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessType, targetMarket, timelineBudget }),
      })
      if (!response.ok) throw new Error("failed")
      setResult((await response.json()) as RecommendationResponse)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <h3 className="font-[var(--font-playfair)] text-2xl font-bold text-[#0d0d0d]">AI Service Recommender</h3>
      <p className="mt-2 text-sm text-[#6b6560]">
        Answer three quick questions and get a package recommendation with rationale.
      </p>
      <form onSubmit={onSubmit} className="mt-4 grid gap-3 md:grid-cols-3">
        <input
          value={businessType}
          onChange={(event) => setBusinessType(event.target.value)}
          placeholder="Business type"
          className="rounded-xl border border-black/15 bg-[#f5f0e8] px-4 py-3 text-sm outline-none focus:border-[#c9a84c]"
          required
        />
        <input
          value={targetMarket}
          onChange={(event) => setTargetMarket(event.target.value)}
          placeholder="Target market"
          className="rounded-xl border border-black/15 bg-[#f5f0e8] px-4 py-3 text-sm outline-none focus:border-[#c9a84c]"
          required
        />
        <input
          value={timelineBudget}
          onChange={(event) => setTimelineBudget(event.target.value)}
          placeholder="Timeline + budget range"
          className="rounded-xl border border-black/15 bg-[#f5f0e8] px-4 py-3 text-sm outline-none focus:border-[#c9a84c]"
          required
        />
        <div className="md:col-span-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-[#0d0d0d] px-4 py-3 text-sm font-medium text-[#f5f0e8] hover:bg-[#1a3a2a] disabled:opacity-60"
          >
            {loading ? "Analyzing..." : "Recommend Package"}
          </button>
        </div>
      </form>

      {result ? (
        <div className="mt-4 rounded-xl border border-[#c9a84c]/30 bg-[#ede8de] p-4">
          <p className="text-sm"><strong>Direction:</strong> {result.direction}</p>
          <p className="mt-1 text-sm"><strong>Recommended package:</strong> {result.recommendedService}</p>
          <p className="mt-2 text-sm text-[#6b6560]">{result.explanation}</p>
          <a
            href={`/contact?direction=${result.direction}&recommendedService=${encodeURIComponent(result.recommendedService)}`}
            className="mt-3 inline-block rounded-full bg-[#0d0d0d] px-4 py-2 text-sm text-[#f5f0e8]"
          >
            Get Started with This Package
          </a>
        </div>
      ) : null}
    </div>
  )
}

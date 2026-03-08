"use client"

import { FormEvent, useState } from "react"
import type { Market } from "@/lib/platform/types"

interface ComparisonResult {
  summary: string
  marketSize: string
  regulatoryEase: string
  sectorOpportunity: string
  competitionLevel: string
  recommendedApproach: string
  estimatedTimelineAndCost: string
}

export function MarketComparisonTool({ markets }: { markets: Market[] }) {
  const [marketA, setMarketA] = useState(markets[0]?.id ?? "")
  const [marketB, setMarketB] = useState(markets[1]?.id ?? "")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ComparisonResult | null>(null)

  async function onCompare(event: FormEvent) {
    event.preventDefault()
    if (!marketA || !marketB || marketA === marketB) return
    setLoading(true)
    try {
      const response = await fetch("/api/ai/market-comparison", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketA, marketB }),
      })
      if (!response.ok) throw new Error("failed")
      setResult((await response.json()) as ComparisonResult)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="emz-gloss-card rounded-2xl p-5 shadow-sm">
      <h3 className="font-[var(--font-playfair)] text-2xl font-bold text-[#0d0d0d]">AI Market Comparison Tool</h3>
      <form onSubmit={onCompare} className="mt-3 grid gap-3 md:grid-cols-3">
        <select
          value={marketA}
          onChange={(event) => setMarketA(event.target.value)}
          className="rounded-xl border border-black/15 bg-[#f5f0e8] px-3 py-2 text-sm"
        >
          {markets.map((market) => (
            <option key={`a-${market.id}`} value={market.id}>{market.name}</option>
          ))}
        </select>
        <select
          value={marketB}
          onChange={(event) => setMarketB(event.target.value)}
          className="rounded-xl border border-black/15 bg-[#f5f0e8] px-3 py-2 text-sm"
        >
          {markets.map((market) => (
            <option key={`b-${market.id}`} value={market.id}>{market.name}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={loading}
          className="emz-pill-cta rounded-xl bg-[#0d0d0d] px-4 py-2 text-sm font-medium text-[#f5f0e8] disabled:opacity-60"
        >
          {loading ? "Comparing..." : "Compare"}
        </button>
      </form>

      {result ? (
        <div className="mt-4 rounded-xl border border-[#c9a84c]/30 bg-[#ede8de] p-4 text-sm text-[#1a1a1a]">
          <p className="mb-2">{result.summary}</p>
          <ul className="space-y-1 text-[#6b6560]">
            <li><strong className="text-[#1a1a1a]">Market size:</strong> {result.marketSize}</li>
            <li><strong className="text-[#1a1a1a]">Regulatory ease:</strong> {result.regulatoryEase}</li>
            <li><strong className="text-[#1a1a1a]">Sector opportunity:</strong> {result.sectorOpportunity}</li>
            <li><strong className="text-[#1a1a1a]">Competition:</strong> {result.competitionLevel}</li>
            <li><strong className="text-[#1a1a1a]">Recommended approach:</strong> {result.recommendedApproach}</li>
            <li><strong className="text-[#1a1a1a]">Timeline & cost:</strong> {result.estimatedTimelineAndCost}</li>
          </ul>
        </div>
      ) : null}
    </div>
  )
}

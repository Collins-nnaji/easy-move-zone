"use client"

import { FormEvent, useMemo, useState } from "react"
import { MarketsMap } from "@/components/platform/MarketsMap"
import type { CityMarket } from "@/lib/property/types"

interface CityIntelResult {
  answer: string
  sources?: string[]
}

export function CitiesIntelWorkbench({
  markets,
  initialCitySlug,
}: {
  markets: CityMarket[]
  initialCitySlug?: string
}) {
  const initialCity =
    markets.find((item) => item.slug === initialCitySlug) ??
    markets.find((item) => item.status === "active") ??
    markets[0]

  const [activeMarketId, setActiveMarketId] = useState(initialCity?.id ?? "")
  const [question, setQuestion] = useState("What are the key relocation trade-offs for this city in the next 12 months?")
  const [result, setResult] = useState<CityIntelResult | null>(null)
  const [loading, setLoading] = useState(false)

  const activeMarket = useMemo(
    () => markets.find((item) => item.id === activeMarketId) ?? markets[0],
    [activeMarketId, markets],
  )

  async function askIntel(event: FormEvent) {
    event.preventDefault()
    if (!activeMarket || !question.trim()) return
    setLoading(true)
    try {
      const response = await fetch("/api/ai/city-intel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cityId: activeMarket.id, question: question.trim() }),
      })
      if (!response.ok) throw new Error("failed")
      setResult((await response.json()) as CityIntelResult)
    } catch {
      setResult({
        answer: "Intel service is temporarily unavailable. Please retry shortly.",
        sources: [],
      })
    } finally {
      setLoading(false)
    }
  }

  if (!activeMarket) return null

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <MarketsMap markets={markets} activeMarketId={activeMarket.id} onSelectMarket={setActiveMarketId} />

      <aside className="emz-gloss-card rounded-2xl p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-[#64748b]">City overview</p>
        <h2 className="mt-2 font-[var(--font-playfair)] text-4xl font-bold text-[#0f172a]">
          {activeMarket.flagEmoji} {activeMarket.name}
        </h2>
        <p className="mt-1 text-xs uppercase tracking-wider text-[#64748b]">
          {activeMarket.country} · {activeMarket.status.replace("_", " ")}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-[#dbe4f0] bg-[#f8fbff] p-3">
            <p className="text-xs text-[#64748b]">Avg rent</p>
            <p className="font-semibold text-[#0f172a]">${activeMarket.avgRentUsd.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-[#dbe4f0] bg-[#f8fbff] p-3">
            <p className="text-xs text-[#64748b]">Avg buy</p>
            <p className="font-semibold text-[#0f172a]">${activeMarket.avgBuyUsd.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-[#dbe4f0] bg-[#f8fbff] p-3">
            <p className="text-xs text-[#64748b]">Security</p>
            <p className="font-semibold text-[#0f172a]">{activeMarket.securityScore}/100</p>
          </div>
          <div className="rounded-xl border border-[#dbe4f0] bg-[#f8fbff] p-3">
            <p className="text-xs text-[#64748b]">Commute</p>
            <p className="font-semibold text-[#0f172a]">{activeMarket.commuteScore}/100</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#155eef]">Top sectors</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {activeMarket.topSectors.map((sector) => (
              <span key={sector} className="rounded-full bg-[#eef4ff] px-2 py-1 text-[11px] text-[#155eef]">
                {sector}
              </span>
            ))}
          </div>
        </div>

        <div id="intel-tool" className="mt-5 rounded-xl border border-[#dbe4f0] bg-white p-4">
          <h3 className="font-[var(--font-playfair)] text-2xl font-bold text-[#0f172a]">AI Neighbourhood Intel</h3>
          <p className="mt-1 text-sm text-[#64748b]">
            Uses AI + map context + live web search signals for current city insights.
          </p>
          <form onSubmit={askIntel} className="mt-3 space-y-2">
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              rows={4}
              className="w-full rounded-xl border border-[#c8d8f0] px-3 py-2 text-sm"
              placeholder="Ask about security, infrastructure, schools, demand trends, policy changes..."
            />
            <button
              type="submit"
              disabled={loading}
              className="emz-pill-cta rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-60"
            >
              {loading ? "Researching..." : `Research ${activeMarket.name}`}
            </button>
          </form>

          {result ? (
            <div className="mt-3 rounded-xl border border-[#b9cef0] bg-[#eef4ff] p-3 text-sm text-[#0f172a]">
              <p className="whitespace-pre-wrap">{result.answer}</p>
              {result.sources?.length ? (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-[#475569]">
                  {result.sources.map((source) => (
                    <li key={source}>
                      <a href={source} target="_blank" rel="noreferrer" className="underline">
                        {source}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  )
}

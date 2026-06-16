"use client"

import { useMemo, useRef, useState, useEffect, FormEvent } from "react"
import Link from "next/link"
import { getPrimaryListingImage } from "@/lib/property/media"
import type { CityMarket, PropertyListing } from "@/lib/property/types"
import {
  MapPin, TrendingUp, Shield, Sparkles,
  ChevronRight, Send, Loader2, BarChart3, Home,
  Star, ArrowRight, Building2
} from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────────────────

interface CityRow {
  market: CityMarket
  listingCount: number
  avgListingPrice: number
  readyToClose: number
  valueScore: number
  growthScore: number
  costOfLivingIndex: number
}

interface AiMessage {
  role: "user" | "assistant"
  content: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function valueScore(market: CityMarket): number {
  const affordability = Math.max(0, 100 - market.avgBuyUsd / 3500)
  return Math.round(
    market.securityScore * 0.28 +
    market.commuteScore * 0.22 +
    market.lifestyleScore * 0.25 +
    affordability * 0.25
  )
}

function growthScore(market: CityMarket): number {
  const sectorLift = Math.min(100, market.topSectors.length * 18)
  return Math.round(
    market.commuteScore * 0.45 +
    market.lifestyleScore * 0.25 +
    sectorLift * 0.3
  )
}

function costOfLivingIndex(market: CityMarket): number {
  const weightedCost = market.avgRentUsd * 0.55 + market.avgBuyUsd * 0.45
  return Math.max(1, Math.min(100, Math.round(weightedCost / 4200)))
}

function scoreBar(value: number, color: string) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e8edf6]">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
    </div>
  )
}

function formatUsd(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

const SUGGESTED_QUESTIONS = [
  "What neighbourhoods are best for families?",
  "How safe is it for expats?",
  "What is the typical commute like?",
  "Are there good international schools nearby?",
  "What's the cost of living compared to Lagos?",
]

// Google Maps embed using free Embed API (no key needed for basic map)
function GoogleMapEmbed({ city }: { city: CityMarket }) {
  const query = encodeURIComponent(`${city.name}, ${city.country}`)
  // Fallback to no-key search embed
  const fallbackSrc = `https://maps.google.com/maps?q=${query}&z=12&output=embed`
  return (
    <iframe
      key={city.id}
      src={fallbackSrc}
      className="h-full w-full border-0"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title={`Map of ${city.name}`}
      allowFullScreen
    />
  )
}

// ─── Stat pill ────────────────────────────────────────────────────────────────

function StatPill({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-[#dbe4f0] bg-white p-3">
      <div className="flex items-center gap-1.5 text-[#64748b]">
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em]">{label}</span>
      </div>
      <p className="text-base font-bold text-[#0f172a]">{value}</p>
    </div>
  )
}

// ─── Score ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score, label }: { score: number; label: string }) {
  const r = 22
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={58} height={58} viewBox="0 0 58 58">
        <circle cx={29} cy={29} r={r} fill="none" stroke="#e8edf6" strokeWidth={5} />
        <circle
          cx={29} cy={29} r={r} fill="none"
          stroke={score >= 75 ? "#22c55e" : score >= 60 ? "#f0b14b" : "#ef4444"}
          strokeWidth={5}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          transform="rotate(-90 29 29)"
        />
        <text x={29} y={33} textAnchor="middle" fontSize={13} fontWeight={700} fill="#0f172a">{score}</text>
      </svg>
      <span className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wider">{label}</span>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CitiesPageClient({
  markets,
  listings,
}: {
  markets: CityMarket[]
  listings: PropertyListing[]
}) {
  const activeMarkets = markets.filter((m) => m.status === "active")
  const comingSoon = markets.filter((m) => m.status !== "active")
  // Use all markets so cities page matches homepage (same city list)
  const allMarketsForList = markets

  const [activeCityId, setActiveCityId] = useState(allMarketsForList[0]?.id ?? "")
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([])
  const [aiInput, setAiInput] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [compareA, setCompareA] = useState(allMarketsForList[0]?.id ?? "")
  const [compareB, setCompareB] = useState(allMarketsForList[1]?.id ?? "")
  const [compareResult, setCompareResult] = useState<Record<string, string> | null>(null)
  const [compareLoading, setCompareLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "listings" | "ai" | "compare">("overview")
  const chatBottomRef = useRef<HTMLDivElement>(null)

  const activeCity = markets.find((m) => m.id === activeCityId) ?? allMarketsForList[0]

  const cityRows = useMemo<CityRow[]>(() =>
    allMarketsForList.map((market) => {
      const cityListings = listings.filter((l) => l.citySlug === market.slug)
      return {
        market,
        listingCount: cityListings.length,
        avgListingPrice: cityListings.length
          ? Math.round(cityListings.reduce((s, l) => s + l.priceUsd, 0) / cityListings.length)
          : market.avgBuyUsd,
        readyToClose: cityListings.filter((l) => l.moveInReady).length,
        valueScore: valueScore(market),
        growthScore: growthScore(market),
        costOfLivingIndex: costOfLivingIndex(market),
      }
    }).sort((a, b) => b.valueScore - a.valueScore),
    [allMarketsForList, listings]
  )

  const cityListings = useMemo(
    () => listings.filter((l) => l.citySlug === activeCity?.slug)
      .sort((a, b) => Number(b.verified) * 4 + Number(b.moveInReady) * 3 - b.priceUsd / 1e6
        - (Number(a.verified) * 4 + Number(a.moveInReady) * 3 - a.priceUsd / 1e6)),
    [activeCity, listings]
  )

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [aiMessages])

  // Reset AI chat when city changes
  useEffect(() => {
    setAiMessages([])
  }, [activeCityId])

  async function sendAiMessage(question: string) {
    if (!question.trim() || !activeCity) return
    const userMsg: AiMessage = { role: "user", content: question }
    setAiMessages((prev) => [...prev, userMsg])
    setAiInput("")
    setAiLoading(true)
    try {
      const res = await fetch("/api/ai/city-intel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cityId: activeCity.id, question }),
      })
      const data = (await res.json()) as { answer?: string }
      setAiMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer ?? "I could not get an answer right now. Please try again." },
      ])
    } catch {
      setAiMessages((prev) => [...prev, { role: "assistant", content: "Connection error. Please try again." }])
    } finally {
      setAiLoading(false)
    }
  }

  async function runComparison(event: FormEvent) {
    event.preventDefault()
    if (compareA === compareB) return
    setCompareLoading(true)
    setCompareResult(null)
    try {
      const res = await fetch("/api/ai/market-comparison", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketA: compareA, marketB: compareB }),
      })
      const data = (await res.json()) as Record<string, string>
      setCompareResult(data)
    } catch {
      setCompareResult({ summary: "Comparison unavailable right now. Please try again." })
    } finally {
      setCompareLoading(false)
    }
  }

  if (!activeCity) return null

  const activeRow = cityRows.find((r) => r.market.id === activeCityId)

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-4 sm:px-6 lg:px-8">

      {/* ── Top bar: city selector ───────────────────────────────────────── */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#64748b]">Select city</span>
        {allMarketsForList.map((market) => {
          const row = cityRows.find((r) => r.market.id === market.id)
          const isActive = market.id === activeCityId
          return (
            <button
              key={market.id}
              type="button"
              onClick={() => { setActiveCityId(market.id); setActiveTab("overview") }}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
                isActive
                  ? "border-[#e0511f] bg-[#e0511f] text-white shadow-md"
                  : "border-[#dbe4f0] bg-white text-[#0f172a] hover:border-[#e0511f] hover:bg-[#eef4ff]"
              }`}
            >
              <span>{market.flagEmoji}</span>
              {market.name}
              {row && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${isActive ? "bg-white/20 text-white" : "bg-[#f0f4fa] text-[#334155]"}`}>
                  {row.valueScore}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Main two-column layout ───────────────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">

        {/* ── Left: Map + tabs ─────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Map */}
          <div className="relative overflow-hidden rounded-2xl border border-[#dbe4f0] shadow-sm" style={{ height: 380 }}>
            <GoogleMapEmbed city={activeCity} />
            {/* City badge overlaid on map */}
            <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-xl border border-white/60 bg-white/90 px-3 py-2 shadow-lg backdrop-blur-sm">
              <MapPin className="h-4 w-4 text-[#e0511f]" />
              <div>
                <p className="text-sm font-bold text-[#0f172a]">{activeCity.flagEmoji} {activeCity.name}</p>
                <p className="text-[10px] text-[#64748b]">{activeCity.country}</p>
              </div>
            </div>
            {/* Status badge */}
            <div className="pointer-events-none absolute right-4 top-4">
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                activeCity.status === "active"
                  ? "bg-green-500 text-white"
                  : "bg-amber-400 text-[#091520]"
              }`}>
                {activeCity.status.replace("_", " ")}
              </span>
            </div>
          </div>

          {/* Tab strip */}
          <div className="flex gap-1 overflow-x-auto rounded-xl border border-[#dbe4f0] bg-[#f8fbff] p-1">
            {(["overview", "listings", "ai", "compare"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold capitalize transition ${
                  activeTab === tab
                    ? "bg-white text-[#e0511f] shadow-sm"
                    : "text-[#475569] hover:text-[#0f172a]"
                }`}
              >
                {tab === "overview" && <BarChart3 className="h-3.5 w-3.5" />}
                {tab === "listings" && <Home className="h-3.5 w-3.5" />}
                {tab === "ai" && <Sparkles className="h-3.5 w-3.5" />}
                {tab === "compare" && <TrendingUp className="h-3.5 w-3.5" />}
                {tab === "overview" ? "City Overview" : tab === "ai" ? "AI Advisor" : tab === "compare" ? "Compare Cities" : "Listings"}
                {tab === "listings" && cityListings.length > 0 && (
                  <span className="rounded-full bg-[#e8f1ff] px-1.5 text-[10px] text-[#e0511f]">{cityListings.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* Tab: Overview */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* Score rings */}
              <div className="rounded-2xl border border-[#dbe4f0] bg-white p-5">
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-[#e0511f]">City scorecard</p>
                <div className="flex flex-wrap justify-around gap-4">
                  <ScoreRing score={activeCity.securityScore} label="Safety" />
                  <ScoreRing score={activeRow?.growthScore ?? 0} label="Growth" />
                  <ScoreRing score={activeCity.lifestyleScore} label="Community" />
                  <ScoreRing score={activeRow?.valueScore ?? 0} label="Opportunity" />
                </div>
              </div>

              {/* Key stats */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatPill
                  label="Cost of living"
                  value={`${activeRow?.costOfLivingIndex ?? 0}/100`}
                  icon={<Building2 className="h-3.5 w-3.5" />}
                />
                <StatPill
                  label="Growth score"
                  value={`${activeRow?.growthScore ?? 0}/100`}
                  icon={<TrendingUp className="h-3.5 w-3.5" />}
                />
                <StatPill
                  label="Opportunity index"
                  value={`${activeRow?.valueScore ?? 0}/100`}
                  icon={<BarChart3 className="h-3.5 w-3.5" />}
                />
                <StatPill
                  label="Community vibe"
                  value={`${activeCity.lifestyleScore}/100`}
                  icon={<Sparkles className="h-3.5 w-3.5" />}
                />
              </div>

              {/* Top sectors */}
              <div className="rounded-2xl border border-[#dbe4f0] bg-white p-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#e0511f]">Top employment sectors</p>
                <div className="flex flex-wrap gap-2">
                  {activeCity.topSectors.map((sector) => (
                    <span key={sector} className="rounded-full border border-[#c8d8f0] bg-[#eef4ff] px-3 py-1.5 text-xs font-semibold text-[#e0511f]">
                      {sector}
                    </span>
                  ))}
                </div>
              </div>

              {/* City ranking table */}
              <div className="rounded-2xl border border-[#dbe4f0] bg-white p-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#e0511f]">All cities ranked</p>
                  <span className="text-[10px] text-[#94a3b8]">safety · growth · community · opportunity</span>
                </div>
                <div className="space-y-2">
                  {cityRows.map((row, i) => {
                    const isThis = row.market.id === activeCityId
                    return (
                      <button
                        key={row.market.id}
                        type="button"
                        onClick={() => setActiveCityId(row.market.id)}
                        className={`w-full rounded-xl border px-4 py-2.5 text-left transition ${
                          isThis
                            ? "border-[#e0511f] bg-[#eef4ff]"
                            : "border-[#e8edf6] bg-[#f8fbff] hover:border-[#c8d8f0]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-5 text-center text-xs font-bold text-[#94a3b8]">#{i + 1}</span>
                          <span className="text-base">{row.market.flagEmoji}</span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-[#0f172a]">{row.market.name}</p>
                              <span className={`text-xs font-bold ${isThis ? "text-[#e0511f]" : "text-[#334155]"}`}>
                                {row.valueScore}/100
                              </span>
                            </div>
                            <div className="mt-1.5">
                              {scoreBar(row.valueScore, isThis ? "bg-[#e0511f]" : "bg-[#94a3b8]")}
                            </div>
                            <p className="mt-1 text-[11px] text-[#64748b]">
                              {row.listingCount} listings · COL {row.costOfLivingIndex}/100 · growth {row.growthScore}/100
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* CTA */}
              <Link
                href={`/contact?market=${encodeURIComponent(activeCity.name)}`}
                className="flex items-center justify-between rounded-2xl border border-[#e0511f]/30 bg-gradient-to-r from-[#eef4ff] to-[#f0faf9] p-5 transition hover:border-[#e0511f]"
              >
                <div>
                  <p className="font-semibold text-[#0f172a]">Ready to move to {activeCity.name}?</p>
                  <p className="mt-0.5 text-xs text-[#64748b]">Talk to an advisor. Free initial consultation.</p>
                </div>
                <ArrowRight className="h-5 w-5 text-[#e0511f]" />
              </Link>
            </div>
          )}

          {/* Tab: Listings */}
          {activeTab === "listings" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#0f172a]">
                  {cityListings.length} properties in {activeCity.name}
                </p>
                <Link href="/services" className="text-xs font-semibold text-[#e0511f] hover:underline">
                  See all listings →
                </Link>
              </div>
              {cityListings.length === 0 ? (
                <div className="rounded-2xl border border-[#e0511f]/20 bg-gradient-to-br from-white to-slate-50 p-8 text-center shadow-sm">
                  <span className="inline-block rounded-full bg-[#e0511f]/10 border border-[#e0511f]/20 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#e0511f] mb-3">
                    Coming Soon
                  </span>
                  <p className="text-sm font-bold text-[#0f172a]">New Properties &amp; Prices Dropping Soon</p>
                  <p className="mt-1 text-xs text-[#64748b]">We&apos;re adding listings for {activeCity.name} now.</p>
                  <Link href="/contact" className="mt-3 inline-block text-xs font-semibold text-[#e0511f] hover:underline">
                    Get notified
                  </Link>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {cityListings.slice(0, 8).map((listing) => (
                    <article key={listing.id} className="overflow-hidden rounded-2xl border border-[#dbe4f0] bg-white transition hover:-translate-y-0.5 hover:shadow-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={getPrimaryListingImage(listing)} alt={listing.title} className="h-40 w-full object-cover" />
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-semibold leading-tight text-[#0f172a]">{listing.title}</h3>
                          {listing.verified && (
                            <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">✓ Verified</span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-[#64748b]">{listing.neighborhood}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-[#475569]">
                          <span>🛏 {listing.bedrooms}</span>
                          <span>🚿 {listing.bathrooms}</span>
                          <span>📐 {listing.areaSqm} sqm</span>
                          {listing.commuteMinutes > 0 && <span>🚗 {listing.commuteMinutes}min</span>}
                        </div>
                        <div className="mt-2.5 flex items-center justify-between">
                          <p className="font-bold text-[#0f172a]">{formatUsd(listing.priceUsd)}</p>
                          <Link
                            href={`/contact?market=${listing.citySlug}&message=I+want+to+enquire+about+${encodeURIComponent(listing.title)}`}
                            className="rounded-lg bg-[#091520] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#e0511f]"
                          >
                            Enquire
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
              {cityListings.length > 8 && (
                <Link href={`/services`} className="emz-pill-cta flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold">
                  View all {cityListings.length} listings in {activeCity.name} <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          )}

          {/* Tab: AI Advisor */}
          {activeTab === "ai" && (
            <div className="rounded-2xl border border-[#dbe4f0] bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e0511f]">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0f172a]">AI City Advisor — {activeCity.flagEmoji} {activeCity.name}</p>
                  <p className="text-[11px] text-[#64748b]">Web-informed · answers update in real time</p>
                </div>
              </div>

              {/* Chat area */}
              <div className="mb-3 min-h-[220px] max-h-[340px] space-y-3 overflow-y-auto rounded-xl border border-[#e8edf6] bg-[#f8fbff] p-3">
                {aiMessages.length === 0 && (
                  <div className="flex h-full flex-col items-center justify-center py-6 text-center">
                    <Sparkles className="mb-2 h-8 w-8 text-[#c8d8f0]" />
                    <p className="text-sm font-semibold text-[#334155]">Ask anything about {activeCity.name}</p>
                    <p className="mt-1 text-xs text-[#94a3b8]">Safety, commute, schools, cost of living, neighbourhoods…</p>
                  </div>
                )}
                {aiMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`max-w-[90%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "ml-auto bg-[#e0511f] text-white"
                        : "bg-white text-[#0f172a] shadow-sm border border-[#e8edf6]"
                    }`}
                  >
                    {msg.content}
                  </div>
                ))}
                {aiLoading && (
                  <div className="flex items-center gap-2 rounded-xl border border-[#e8edf6] bg-white px-3.5 py-2.5 text-sm text-[#64748b] shadow-sm">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#e0511f]" />
                    Researching {activeCity.name}…
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Suggested questions */}
              {aiMessages.length === 0 && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => void sendAiMessage(q)}
                      disabled={aiLoading}
                      className="rounded-full border border-[#c8d8f0] bg-[#eef4ff] px-3 py-1 text-[11px] font-semibold text-[#e0511f] transition hover:bg-[#dbeafe] disabled:opacity-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <form
                onSubmit={(e) => { e.preventDefault(); void sendAiMessage(aiInput) }}
                className="flex gap-2"
              >
                <input
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder={`Ask about ${activeCity.name}…`}
                  disabled={aiLoading}
                  className="flex-1 rounded-xl border border-[#c8d8f0] bg-[#f8fbff] px-3 py-2 text-sm outline-none focus:border-[#e0511f] disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={aiLoading || !aiInput.trim()}
                  className="flex items-center gap-1.5 rounded-xl bg-[#e0511f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#e0511f] disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  Ask
                </button>
              </form>
            </div>
          )}

          {/* Tab: Compare */}
          {activeTab === "compare" && (
            <div className="rounded-2xl border border-[#dbe4f0] bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#e0511f]" />
                <p className="font-bold text-[#0f172a]">AI City Comparison</p>
              </div>

              <form onSubmit={runComparison} className="grid gap-3 sm:grid-cols-3">
                <select
                  value={compareA}
                  onChange={(e) => setCompareA(e.target.value)}
                  className="rounded-xl border border-[#c8d8f0] bg-[#f8fbff] px-3 py-2.5 text-sm"
                >
                  {allMarketsForList.map((m) => (
                    <option key={m.id} value={m.id}>{m.flagEmoji} {m.name}</option>
                  ))}
                </select>
                <select
                  value={compareB}
                  onChange={(e) => setCompareB(e.target.value)}
                  className="rounded-xl border border-[#c8d8f0] bg-[#f8fbff] px-3 py-2.5 text-sm"
                >
                  {allMarketsForList.map((m) => (
                    <option key={m.id} value={m.id}>{m.flagEmoji} {m.name}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={compareLoading || compareA === compareB}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#091520] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e0511f] disabled:opacity-50"
                >
                  {compareLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-4 w-4" />}
                  {compareLoading ? "Comparing…" : "Compare"}
                </button>
              </form>

              {compareA === compareB && (
                <p className="mt-2 text-xs text-[#94a3b8]">Select two different cities to compare.</p>
              )}

              {compareResult && (
                <div className="mt-4 space-y-3 rounded-xl border border-[#b9cef0] bg-[#eef4ff] p-4">
                  {Object.entries(compareResult).map(([key, val]) => {
                    const labels: Record<string, string> = {
                      summary: "Summary",
                      marketSize: "Pricing context",
                      regulatoryEase: "Security & ease of living",
                      sectorOpportunity: "Sector opportunity",
                      competitionLevel: "Market competition",
                      recommendedApproach: "Recommended approach",
                      estimatedTimelineAndCost: "Timeline & budget",
                    }
                    if (!val) return null
                    return (
                      <div key={key}>
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#e0511f]">{labels[key] ?? key}</p>
                        <p className="mt-0.5 text-sm text-[#0f172a]">{val}</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right sidebar ─────────────────────────────────────────────── */}
        <aside className="space-y-4 lg:sticky lg:top-[76px] lg:h-fit">

          {/* City quick facts */}
          <div className="rounded-2xl border border-[#dbe4f0] bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-[var(--font-playfair)] text-2xl font-bold text-[#0f172a]">
                {activeCity.flagEmoji} {activeCity.name}
              </h2>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                activeCity.status === "active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
              }`}>
                {activeCity.status.replace("_", " ")}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#64748b]">{activeCity.country}</p>

            <div className="mt-4 space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-[#475569]"><Shield className="h-3.5 w-3.5" /> Safety</span>
                <div className="flex items-center gap-2">
                  <div className="w-24">{scoreBar(activeCity.securityScore, "bg-[#22c55e]")}</div>
                  <span className="w-7 text-right text-xs font-bold text-[#0f172a]">{activeCity.securityScore}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-[#475569]"><TrendingUp className="h-3.5 w-3.5" /> Growth</span>
                <div className="flex items-center gap-2">
                  <div className="w-24">{scoreBar(activeRow?.growthScore ?? 0, "bg-[#f0b14b]")}</div>
                  <span className="w-7 text-right text-xs font-bold text-[#0f172a]">{activeRow?.growthScore ?? 0}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-[#475569]"><Star className="h-3.5 w-3.5" /> Community vibe</span>
                <div className="flex items-center gap-2">
                  <div className="w-24">{scoreBar(activeCity.lifestyleScore, "bg-[#e0511f]")}</div>
                  <span className="w-7 text-right text-xs font-bold text-[#0f172a]">{activeCity.lifestyleScore}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[#e8edf6] pt-4">
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-wider text-[#64748b]">Cost index</p>
                <p className="mt-0.5 text-sm font-bold text-[#0f172a]">{activeRow?.costOfLivingIndex ?? 0}/100</p>
                <p className="text-[10px] text-[#94a3b8]">Lower = more affordable</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-wider text-[#64748b]">Opportunity</p>
                <p className="mt-0.5 text-sm font-bold text-[#0f172a]">{activeRow?.valueScore ?? 0}/100</p>
                <p className="text-[10px] text-[#94a3b8]">Safety + growth + lifestyle</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {activeCity.topSectors.map((s) => (
                <span key={s} className="rounded-full bg-[#eef4ff] px-2 py-1 text-[11px] font-semibold text-[#e0511f]">{s}</span>
              ))}
            </div>

            <Link
              href={`/contact?market=${encodeURIComponent(activeCity.name)}`}
              className="emz-pill-cta mt-4 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold"
            >
              Talk to an advisor <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Top listing in this city */}
          {cityListings[0] && (
            <div className="rounded-2xl border border-[#dbe4f0] bg-white p-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#e0511f]">Top listing in {activeCity.name}</p>
              <article className="overflow-hidden rounded-xl border border-[#e8edf6]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={getPrimaryListingImage(cityListings[0])} alt={cityListings[0].title} className="h-36 w-full object-cover" />
                <div className="p-3">
                  <p className="text-sm font-semibold text-[#0f172a]">{cityListings[0].title}</p>
                  <p className="text-xs text-[#64748b]">{cityListings[0].neighborhood}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="font-bold text-[#0f172a]">{formatUsd(cityListings[0].priceUsd)}</p>
                    <Link
                      href={`/contact?market=${cityListings[0].citySlug}&message=I+want+to+enquire+about+${encodeURIComponent(cityListings[0].title)}`}
                      className="rounded-lg bg-[#091520] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#e0511f]"
                    >
                      Enquire
                    </Link>
                  </div>
                </div>
              </article>
              <button
                type="button"
                onClick={() => setActiveTab("listings")}
                className="mt-2 flex w-full items-center justify-center gap-1 text-xs font-semibold text-[#e0511f] hover:underline"
              >
                View all {cityListings.length} listings <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* AI teaser */}
          <button
            type="button"
            onClick={() => setActiveTab("ai")}
            className="group flex w-full items-center gap-3 rounded-2xl border border-[#e0511f]/25 bg-gradient-to-br from-[#eef4ff] to-[#f0faf9] p-4 text-left transition hover:border-[#e0511f]/60"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e0511f]">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0f172a]">Ask the AI Advisor</p>
              <p className="mt-0.5 text-xs text-[#64748b]">Safety, schools, commute, cost of living for {activeCity.name}</p>
            </div>
            <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-[#e0511f] transition group-hover:translate-x-0.5" />
          </button>

          {/* Coming soon */}
          {comingSoon.length > 0 && (
            <div className="rounded-2xl border border-[#dbe4f0] bg-white p-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#64748b]">Coming soon</p>
              <div className="flex flex-wrap gap-1.5">
                {comingSoon.map((m) => (
                  <span key={m.id} className="rounded-full border border-[#dbe4f0] bg-[#f8fbff] px-2.5 py-1 text-xs text-[#475569]">
                    {m.flagEmoji} {m.name}
                  </span>
                ))}
              </div>
              <Link href="/contact" className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#e0511f] hover:underline">
                Register interest <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

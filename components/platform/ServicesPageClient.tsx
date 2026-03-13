"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Heart, ChevronDown, Sparkles, Phone, Star } from "lucide-react"
import { getPrimaryListingImage } from "@/lib/property/media"
import type { AgentProfile, CityMarket, PropertyFaq, PropertyListing } from "@/lib/property/types"

interface ServicesPageClientProps {
  cities: CityMarket[]
  listings: PropertyListing[]
  agents: AgentProfile[]
  faqs: PropertyFaq[]
}

type PathwayFilter = "all" | "direct_purchase" | "installment" | "sell_top_up" | "commercial"
type PropertyTypeFilter = "all" | "apartment" | "duplex" | "commercial"
type BedroomFilter = "any" | "1_2" | "3_4" | "5_plus"
type SortBy = "best_match" | "price_low_high" | "price_high_low" | "ready_first"
type ViewMode = "grid" | "list"

function classifyPathway(listing: PropertyListing): Exclude<PathwayFilter, "all"> {
  if (listing.type === "commercial") return "commercial"
  if (listing.priceUsd <= 230000 || listing.moveInReady) return "installment"
  if (listing.priceUsd >= 360000 || listing.bedrooms >= 4) return "sell_top_up"
  return "direct_purchase"
}

function classifyPropertyType(listing: PropertyListing): Exclude<PropertyTypeFilter, "all"> {
  if (listing.type === "commercial") return "commercial"
  if (listing.bedrooms >= 4 || listing.areaSqm >= 250) return "duplex"
  return "apartment"
}

function slugToLabel(value: string) {
  return value.replaceAll("-", " ")
}

function formatPrice(priceUsd: number) {
  return `$${priceUsd.toLocaleString()}`
}

function pathwayBadge(pathway: Exclude<PathwayFilter, "all">) {
  if (pathway === "installment") {
    return { label: "Installment", className: "bg-[#f0b14b] text-[#091520]" }
  }
  if (pathway === "sell_top_up") {
    return { label: "Sell & Top-Up", className: "bg-[#0f766e] text-white" }
  }
  if (pathway === "commercial") {
    return { label: "Commercial", className: "bg-[#7b28c8] text-white" }
  }
  return { label: "Buy", className: "bg-[#1769d0] text-white" }
}

function cityColor(citySlug: string) {
  if (citySlug === "lagos") return "text-[#1769d0]"
  if (citySlug === "abuja") return "text-[#0f766e]"
  if (citySlug === "nairobi") return "text-[#7b28c8]"
  if (citySlug === "accra") return "text-[#b45309]"
  return "text-[#334155]"
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`rounded-2xl border bg-white transition-all ${open ? "border-[#1769d0]" : "border-[#dbe4f0]"}`}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-start justify-between gap-4 p-5 text-left"
      >
        <span className="text-sm font-semibold text-[#0f172a]">{question}</span>
        <ChevronDown className={`mt-0.5 h-4 w-4 shrink-0 text-[#64748b] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <p className="border-t border-[#e8edf6] px-5 pb-5 pt-3 text-sm leading-7 text-[#64748b]">{answer}</p>
      )}
    </div>
  )
}

export function ServicesPageClient({ cities, listings, agents, faqs }: ServicesPageClientProps) {
  const [citySlug, setCitySlug] = useState<string>("all")
  const [pathwayFilter, setPathwayFilter] = useState<PathwayFilter>("all")
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<PropertyTypeFilter>("all")
  const [bedroomFilter, setBedroomFilter] = useState<BedroomFilter>("any")
  const [minBudget, setMinBudget] = useState<number>(0)
  const [maxBudget, setMaxBudget] = useState<number>(5000000)
  const [moveInReadyOnly, setMoveInReadyOnly] = useState<boolean>(false)
  const [sortBy, setSortBy] = useState<SortBy>("best_match")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([])

  const cityCounts = useMemo(
    () =>
      listings.reduce<Record<string, number>>((acc, listing) => {
        acc[listing.citySlug] = (acc[listing.citySlug] ?? 0) + 1
        return acc
      }, {}),
    [listings]
  )

  const baseFiltered = useMemo(() => {
    const safeMin = Math.min(minBudget, maxBudget)
    const safeMax = Math.max(minBudget, maxBudget)

    return listings
      .filter((listing) => (citySlug === "all" ? true : listing.citySlug === citySlug))
      .filter((listing) => {
        if (propertyTypeFilter === "all") return true
        return classifyPropertyType(listing) === propertyTypeFilter
      })
      .filter((listing) => {
        if (bedroomFilter === "any") return true
        if (bedroomFilter === "1_2") return listing.bedrooms >= 1 && listing.bedrooms <= 2
        if (bedroomFilter === "3_4") return listing.bedrooms >= 3 && listing.bedrooms <= 4
        return listing.bedrooms >= 5
      })
      .filter((listing) => listing.priceUsd >= safeMin && listing.priceUsd <= safeMax)
      .filter((listing) => (moveInReadyOnly ? listing.moveInReady : true))
  }, [bedroomFilter, citySlug, listings, maxBudget, minBudget, moveInReadyOnly, propertyTypeFilter])

  const filtered = useMemo(() => {
    const scoped =
      pathwayFilter === "all"
        ? baseFiltered
        : baseFiltered.filter((listing) => classifyPathway(listing) === pathwayFilter)

    const sorted = [...scoped]
    if (sortBy === "price_low_high") sorted.sort((a, b) => a.priceUsd - b.priceUsd)
    else if (sortBy === "price_high_low") sorted.sort((a, b) => b.priceUsd - a.priceUsd)
    else if (sortBy === "ready_first") sorted.sort((a, b) => Number(b.moveInReady) - Number(a.moveInReady))
    else {
      sorted.sort((a, b) => {
        const scoreA =
          Number(a.verified) * 4 + Number(a.moveInReady) * 3 + (a.type === "commercial" ? 1 : 0) - a.priceUsd / 1000000
        const scoreB =
          Number(b.verified) * 4 + Number(b.moveInReady) * 3 + (b.type === "commercial" ? 1 : 0) - b.priceUsd / 1000000
        return scoreB - scoreA
      })
    }
    return sorted
  }, [baseFiltered, pathwayFilter, sortBy])

  const pathwayCounts = useMemo(
    () => ({
      all: baseFiltered.length,
      direct_purchase: baseFiltered.filter((listing) => classifyPathway(listing) === "direct_purchase").length,
      installment: baseFiltered.filter((listing) => classifyPathway(listing) === "installment").length,
      sell_top_up: baseFiltered.filter((listing) => classifyPathway(listing) === "sell_top_up").length,
      commercial: baseFiltered.filter((listing) => classifyPathway(listing) === "commercial").length,
    }),
    [baseFiltered]
  )

  const featured = filtered[0]
  const rest = filtered.slice(1)

  function toggleShortlist(listingId: string) {
    setShortlistedIds((prev) => (prev.includes(listingId) ? prev.filter((id) => id !== listingId) : [...prev, listingId]))
  }

  function pathwaySubtext(pathway: Exclude<PathwayFilter, "all">) {
    if (pathway === "installment") return "Installment-friendly"
    if (pathway === "sell_top_up") return "Upgrade candidate"
    if (pathway === "commercial") return "Business-ready"
    return "Direct purchase"
  }

  const pathwayTabs: Array<{ id: PathwayFilter; label: string }> = [
    { id: "all", label: "All Listings" },
    { id: "direct_purchase", label: "Direct Purchase" },
    { id: "installment", label: "Installment Plans" },
    { id: "sell_top_up", label: "Sell & Top-Up" },
    { id: "commercial", label: "Commercial" },
  ]

  return (
    <>
      <section className="emz-hero-section">
        <div className="relative overflow-hidden rounded-3xl border border-[#1a3555] bg-[#091520] p-5 text-white md:p-8">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(62,198,245,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(62,198,245,0.045)_1px,transparent_1px)] bg-[size:56px_56px]" />
          <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[#1769d0]/30 blur-3xl" />
          <div className="absolute -bottom-10 left-12 h-48 w-48 rounded-full bg-[#3ec6f5]/20 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_420px] lg:items-end">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#7dd3fc]">Listings — tied to scouted territories</span>
              <h1 className="mt-3 font-[var(--font-playfair)] text-5xl font-bold leading-[0.95] md:text-6xl">
                Find the right property.
                <br />
                Move with confidence.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/65">
                Every listing is connected to city intelligence and relocation planning. Filter by budget, type,
                and relocation readiness to shortlist homes that fit your move plan.
              </p>
              <p className="mt-2 text-xs text-white/40 italic">
                Need help with logistics or moving? Browse the <a href="/hub" className="underline hover:text-white/70">verified vendor marketplace</a> for packing, removals, and more.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70">✓ Verified supply</span>
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70">📍 {cities.length}+ cities</span>
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70">🏠 Relocation-ready options</span>
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70">🧭 Scout-to-settle flow</span>
              </div>
            </div>

            <div className="rounded-[22px] border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7dd3fc]">Quick Search</p>
              <div className="mt-3 space-y-2.5">
                <select
                  value={citySlug}
                  onChange={(event) => setCitySlug(event.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-[#10253b] px-3 py-2.5 text-sm text-white outline-none focus:border-[#3ec6f5]"
                >
                  <option value="all">All cities</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.slug}>
                      {city.name}
                    </option>
                  ))}
                </select>
                <select
                  value={pathwayFilter}
                  onChange={(event) => setPathwayFilter(event.target.value as PathwayFilter)}
                  className="w-full rounded-xl border border-white/20 bg-[#10253b] px-3 py-2.5 text-sm text-white outline-none focus:border-[#3ec6f5]"
                >
                  <option value="all">All pathways</option>
                  <option value="direct_purchase">Direct purchase</option>
                  <option value="installment">Installment plan</option>
                  <option value="sell_top_up">Sell & top-up</option>
                  <option value="commercial">Commercial</option>
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-[10px] text-white/50">
                    Min budget (USD)
                    <input
                      value={minBudget}
                      onChange={(event) => setMinBudget(Number(event.target.value))}
                      type="number"
                      min={0}
                      placeholder="0"
                      className="mt-1 w-full rounded-xl border border-white/20 bg-[#10253b] px-3 py-2.5 text-sm text-white outline-none focus:border-[#3ec6f5]"
                    />
                  </label>
                  <label className="text-[10px] text-white/50">
                    Max budget (USD)
                    <input
                      value={maxBudget}
                      onChange={(event) => setMaxBudget(Number(event.target.value))}
                      type="number"
                      min={0}
                      placeholder="5,000,000"
                      className="mt-1 w-full rounded-xl border border-white/20 bg-[#10253b] px-3 py-2.5 text-sm text-white outline-none focus:border-[#3ec6f5]"
                    />
                  </label>
                </div>
                <label className="inline-flex items-center gap-2 text-xs text-white/75">
                  <input type="checkbox" checked={moveInReadyOnly} onChange={(event) => setMoveInReadyOnly(event.target.checked)} />
                  Relocation-ready only
                </label>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sticky top-[66px] z-20 border-y border-[#dbe4f0] bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl gap-1 overflow-x-auto px-4 py-2.5 sm:px-6 lg:px-8">
          {pathwayTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPathwayFilter(tab.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                pathwayFilter === tab.id
                  ? "border-[#1769d0] bg-[#e8f1ff] text-[#1769d0]"
                  : "border-[#dbe4f0] bg-white text-[#475569] hover:border-[#bfd2f2]"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {tab.label}
              <span className="rounded-full bg-[#f0f4fa] px-1.5 py-0.5 text-[10px] text-[#334155]">
                {pathwayCounts[tab.id]}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-10 pt-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-4 lg:sticky lg:top-[132px] lg:h-fit">
            <div className="rounded-2xl border border-[#dbe4f0] bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1769d0]">Filter by City</p>
              <div className="mt-3 space-y-1">
                <button
                  type="button"
                  onClick={() => setCitySlug("all")}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm transition ${
                    citySlug === "all" ? "bg-[#e8f1ff] text-[#1769d0]" : "text-[#0f172a] hover:bg-[#f3f7fd]"
                  }`}
                >
                  <span>All cities</span>
                  <span className="rounded-full bg-[#eef2f8] px-2 py-0.5 text-xs text-[#334155]">{listings.length}</span>
                </button>
                {cities.map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => setCitySlug(city.slug)}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm transition ${
                      citySlug === city.slug ? "bg-[#e8f1ff] text-[#1769d0]" : "text-[#0f172a] hover:bg-[#f3f7fd]"
                    }`}
                  >
                    <span>{city.name}</span>
                    <span className="rounded-full bg-[#eef2f8] px-2 py-0.5 text-xs text-[#334155]">{cityCounts[city.slug] ?? 0}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#dbe4f0] bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1769d0]">Refine</p>
              <div className="mt-3 space-y-4">
                <div>
                  <p className="mb-2 text-sm font-semibold text-[#1f2937]">Property Type</p>
                  <div className="flex flex-wrap gap-1.5">
                    {([
                      ["all", "Any"],
                      ["apartment", "Apartment"],
                      ["duplex", "Duplex"],
                      ["commercial", "Commercial"],
                    ] as Array<[PropertyTypeFilter, string]>).map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPropertyTypeFilter(id)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                          propertyTypeFilter === id
                            ? "border-[#1769d0] bg-[#e8f1ff] text-[#1769d0]"
                            : "border-[#dbe4f0] text-[#475569] hover:border-[#bfd2f2]"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold text-[#1f2937]">Bedrooms</p>
                  <div className="flex flex-wrap gap-1.5">
                    {([
                      ["any", "Any"],
                      ["1_2", "1-2"],
                      ["3_4", "3-4"],
                      ["5_plus", "5+"],
                    ] as Array<[BedroomFilter, string]>).map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setBedroomFilter(id)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                          bedroomFilter === id
                            ? "border-[#1769d0] bg-[#e8f1ff] text-[#1769d0]"
                            : "border-[#dbe4f0] text-[#475569] hover:border-[#bfd2f2]"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#1f2937]">Budget Range</p>
                    <span className="text-xs text-[#64748b]">{formatPrice(maxBudget)} selected</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={5000000}
                    step={5000}
                    value={maxBudget}
                    onChange={(event) => setMaxBudget(Number(event.target.value))}
                    className="w-full accent-[#1769d0]"
                  />
                  <div className="mt-1 flex justify-between text-[11px] text-[#94a3b8]">
                    <span>$0</span>
                    <span>$5M+</span>
                  </div>
                </div>
                <label className="inline-flex items-center gap-2 text-xs text-[#475569]">
                  <input type="checkbox" checked={moveInReadyOnly} onChange={(event) => setMoveInReadyOnly(event.target.checked)} />
                  Relocation-ready only
                </label>
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-[var(--font-playfair)] text-4xl font-bold text-[#091520]">{filtered.length} Properties</h2>
                <p className="text-sm text-[#64748b]">Across {cities.length} cities · relocation-aware inventory</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#64748b]">Sort by</span>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as SortBy)}
                  className="rounded-lg border border-[#dbe4f0] bg-white px-2.5 py-1.5 text-sm text-[#0f172a]"
                >
                  <option value="best_match">Best match</option>
                  <option value="price_low_high">Price: Low to High</option>
                  <option value="price_high_low">Price: High to Low</option>
                  <option value="ready_first">Ready first</option>
                </select>
                <div className="overflow-hidden rounded-lg border border-[#dbe4f0]">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-1.5 text-sm ${viewMode === "grid" ? "bg-[#091520] text-white" : "bg-white text-[#475569]"}`}
                  >
                    ▦
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`border-l border-[#dbe4f0] px-3 py-1.5 text-sm ${viewMode === "list" ? "bg-[#091520] text-white" : "bg-white text-[#475569]"}`}
                  >
                    ☰
                  </button>
                </div>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-[#dbe4f0] bg-white p-8 text-center">
                <h3 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a]">No listings match these filters</h3>
                <p className="mt-2 text-sm text-[#64748b]">Try widening city, budget, or relocation readiness filters.</p>
              </div>
            ) : (
              <div className={`grid gap-4 ${viewMode === "grid" ? "md:grid-cols-2" : "grid-cols-1"}`}>
                {featured ? (
                  <article
                    className={`overflow-hidden rounded-3xl border border-[#dbe4f0] bg-white shadow-[0_16px_48px_-30px_rgba(15,23,42,0.5)] ${
                      viewMode === "grid" ? "md:col-span-2 md:grid md:grid-cols-[1.15fr_1fr]" : ""
                    }`}
                  >
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={getPrimaryListingImage(featured)} alt={featured.title} className="h-60 w-full object-cover md:h-full" />
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 to-transparent" />
                      <span className="absolute left-3 top-3 rounded-md bg-[#f0b14b] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#091520]">
                        Featured
                      </span>
                      {featured.verified ? (
                        <span className="absolute bottom-3 left-3 rounded-md bg-black/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                          ✓ Verified
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-col p-5 md:p-6">
                      <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${cityColor(featured.citySlug)}`}>
                        {slugToLabel(featured.citySlug)} · {pathwayBadge(classifyPathway(featured)).label}
                      </p>
                      <h3 className="mt-2 font-[var(--font-playfair)] text-4xl font-bold leading-tight text-[#091520]">{featured.title}</h3>
                      <p className="mt-1 text-sm text-[#64748b]">
                        {featured.neighborhood}, {featured.country}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-3 text-sm text-[#475569]">
                        <span>🛏 {featured.bedrooms} beds</span>
                        <span>🚿 {featured.bathrooms} baths</span>
                        <span>📐 {featured.areaSqm.toLocaleString()} sqm</span>
                      </div>
                      <div className="mt-auto flex items-end justify-between border-t border-[#e8edf6] pt-4">
                        <div>
                          <p className="font-[var(--font-playfair)] text-4xl font-bold leading-none text-[#091520]">{formatPrice(featured.priceUsd)}</p>
                          <p className="mt-1 text-xs text-[#64748b]">{pathwaySubtext(classifyPathway(featured))}</p>
                        </div>
                        <Link
                          href={`/listings/${featured.id}`}
                          className="rounded-xl bg-[#091520] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1769d0]"
                        >
                          View listing
                        </Link>
                      </div>
                    </div>
                  </article>
                ) : null}

                {rest.map((listing) => {
                  const pathway = classifyPathway(listing)
                  const badge = pathwayBadge(pathway)
                  const isShortlisted = shortlistedIds.includes(listing.id)
                  return (
                    <article
                      key={listing.id}
                      className="group overflow-hidden rounded-2xl border border-[#dbe4f0] bg-white shadow-[0_16px_42px_-30px_rgba(15,23,42,0.45)] transition hover:-translate-y-1 hover:shadow-[0_24px_46px_-24px_rgba(15,23,42,0.35)]"
                    >
                      <div className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={getPrimaryListingImage(listing)} alt={listing.title} className="h-56 w-full object-cover" />
                        <div className="absolute left-3 top-3 flex items-center gap-2">
                          <span className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${badge.className}`}>
                            {badge.label}
                          </span>
                        </div>
                        <button
                          type="button"
                          aria-label={isShortlisted ? "Remove from shortlist" : "Add to shortlist"}
                          onClick={() => toggleShortlist(listing.id)}
                          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/65 bg-white/90 text-[#091520] backdrop-blur-sm transition md:opacity-0 md:group-hover:opacity-100 ${
                            isShortlisted ? "opacity-100 text-[#1769d0]" : "opacity-100"
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${isShortlisted ? "fill-current" : ""}`} />
                        </button>
                        {listing.verified ? (
                          <span className="absolute bottom-3 left-3 rounded-md bg-black/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                            ✓ Verified
                          </span>
                        ) : null}
                      </div>
                      <div className="p-4">
                        <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${cityColor(listing.citySlug)}`}>
                          {slugToLabel(listing.citySlug)} · {classifyPropertyType(listing)}
                        </p>
                        <h3 className="mt-1 font-[var(--font-playfair)] text-[1.7rem] font-bold leading-tight text-[#091520]">
                          {listing.title}
                        </h3>
                        <p className="mt-1 text-sm text-[#64748b]">
                          {listing.neighborhood}, {listing.country}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-3 text-sm text-[#475569]">
                          <span>🛏 {listing.bedrooms} beds</span>
                          <span>🚿 {listing.bathrooms} baths</span>
                          <span>📐 {listing.areaSqm.toLocaleString()} sqm</span>
                        </div>
                        <div className="mt-4 flex items-end justify-between border-t border-[#e8edf6] pt-3">
                          <div>
                            <p className="font-[var(--font-playfair)] text-3xl font-bold leading-none text-[#091520]">
                              {formatPrice(listing.priceUsd)}
                            </p>
                            <p className="mt-1 text-xs text-[#64748b]">{pathwaySubtext(pathway)}</p>
                          </div>
                          <Link
                            href={`/listings/${listing.id}`}
                            className="rounded-lg bg-[#091520] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#1769d0]"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Mortgage cross-sell ── */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b1f4a] via-[#0f2f6e] to-[#1a3fa0] p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 mb-3">
                <Sparkles className="h-3.5 w-3.5 text-[#f0b14b]" />
                AI Mortgage Advisor
              </div>
              <h2 className="font-[var(--font-playfair)] text-3xl font-bold text-white md:text-4xl">
                Found a home? Let&apos;s finance it.
              </h2>
              <p className="mt-2 max-w-lg text-sm text-white/65">
                Tell our AI your situation in plain language and get matched with the right lender in under 60 seconds, then continue to Relocate Hub for move execution.
              </p>
            </div>
            <Link
              href="/hub"
              className="shrink-0 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-[#155eef] transition hover:bg-[#f0f4ff]"
            >
              Find my mortgage →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Agents ── */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1769d0]">Our team</p>
            <h2 className="mt-1 font-[var(--font-playfair)] text-4xl font-bold text-[#091520]">Trusted agents</h2>
          </div>
          <Link href="/contact" className="text-sm font-semibold text-[#1769d0]">Work with us →</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <article key={agent.id} className="flex flex-col rounded-2xl border border-[#dbe4f0] bg-white p-5 shadow-sm">
              {/* Avatar placeholder */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#c8d8f0] to-[#e8f1ff] text-xl font-bold text-[#1769d0]">
                  {agent.name[0]}
                </div>
                <div>
                  <p className="font-bold text-[#0f172a]">{agent.name}</p>
                  <p className="text-xs text-[#64748b]">{agent.company}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(agent.rating) ? "fill-[#f0b14b] text-[#f0b14b]" : "text-[#e2e8f0]"}`} />
                ))}
                <span className="ml-1 text-xs font-semibold text-[#0f172a]">{agent.rating}</span>
                <span className="text-xs text-[#64748b]">· {agent.transactions} deals</span>
              </div>

              {/* Cities */}
              <div className="flex flex-wrap gap-1 mb-4">
                {agent.cityCoverage.map(c => (
                  <span key={c} className="rounded-full border border-[#dbe4f0] bg-[#f8fbff] px-2.5 py-0.5 text-[11px] text-[#475569]">
                    {slugToLabel(c)}
                  </span>
                ))}
              </div>

              <Link
                href={`/contact?agent=${encodeURIComponent(agent.name)}`}
                className="mt-auto flex items-center gap-1.5 rounded-xl border border-[#dbe4f0] px-4 py-2.5 text-sm font-semibold text-[#0f172a] transition hover:border-[#1769d0] hover:text-[#1769d0]"
              >
                <Phone className="h-4 w-4" /> Contact agent
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-[#f4f7fb] py-14">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1769d0]">Questions</p>
            <h2 className="mt-1 font-[var(--font-playfair)] text-4xl font-bold text-[#091520]">Frequently asked</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {faqs.map((faq) => (
              <FaqItem key={faq.id} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

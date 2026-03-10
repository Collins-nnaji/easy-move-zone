"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Heart } from "lucide-react"
import { getPrimaryListingImage } from "@/lib/property/media"
import type { AgentProfile, CityMarket, PropertyFaq, PropertyListing } from "@/lib/property/types"

interface ServicesPageClientProps {
  cities: CityMarket[]
  listings: PropertyListing[]
  agents: AgentProfile[]
  faqs: PropertyFaq[]
}

type PathwayFilter = "all" | "direct_purchase" | "installment" | "sell_top_up"
type SortBy = "best_match" | "price_low_high" | "price_high_low"

function classifyPathway(listing: PropertyListing): Exclude<PathwayFilter, "all"> {
  if (listing.type === "commercial") return "sell_top_up"
  if (listing.priceUsd <= 250000) return "installment"
  if (listing.priceUsd >= 350000) return "sell_top_up"
  return "direct_purchase"
}

function getCityAccent(citySlug: string): { badge: string; text: string } {
  if (citySlug === "lagos") {
    return { badge: "bg-[#e6efff] text-[#155eef] border-[#bfd1ff]", text: "text-[#155eef]" }
  }
  if (citySlug === "abuja") {
    return { badge: "bg-[#e8f8ef] text-[#0f766e] border-[#b9e8cd]", text: "text-[#0f766e]" }
  }
  if (citySlug === "nairobi") {
    return { badge: "bg-[#f1ecff] text-[#6d28d9] border-[#d4c5ff]", text: "text-[#6d28d9]" }
  }
  if (citySlug === "accra") {
    return { badge: "bg-[#fff5e6] text-[#b45309] border-[#fcd9a7]", text: "text-[#b45309]" }
  }
  return { badge: "bg-[#eef2ff] text-[#475569] border-[#dbe4f0]", text: "text-[#334155]" }
}

export function ServicesPageClient({ cities, listings, agents, faqs }: ServicesPageClientProps) {
  const [citySlug, setCitySlug] = useState<string>("all")
  const [listingType, setListingType] = useState<"all" | "buy" | "commercial">("all")
  const [minBudget, setMinBudget] = useState<number>(50000)
  const [maxBudget, setMaxBudget] = useState<number>(650000)
  const [moveInReadyOnly, setMoveInReadyOnly] = useState(false)
  const [pathwayFilter, setPathwayFilter] = useState<PathwayFilter>("all")
  const [sortBy, setSortBy] = useState<SortBy>("best_match")
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
      .filter((listing) => (listingType === "all" ? true : listing.type === listingType))
      .filter((listing) => listing.priceUsd >= safeMin && listing.priceUsd <= safeMax)
      .filter((listing) => (moveInReadyOnly ? listing.moveInReady : true))
  }, [listings, citySlug, listingType, minBudget, maxBudget, moveInReadyOnly])

  const pathwayCounts = useMemo(
    () => ({
      all: baseFiltered.length,
      direct_purchase: baseFiltered.filter((listing) => classifyPathway(listing) === "direct_purchase").length,
      installment: baseFiltered.filter((listing) => classifyPathway(listing) === "installment").length,
      sell_top_up: baseFiltered.filter((listing) => classifyPathway(listing) === "sell_top_up").length,
    }),
    [baseFiltered]
  )

  const filtered = useMemo(() => {
    const scoped =
      pathwayFilter === "all"
        ? baseFiltered
        : baseFiltered.filter((listing) => classifyPathway(listing) === pathwayFilter)

    const sorted = [...scoped]
    if (sortBy === "price_low_high") {
      sorted.sort((a, b) => a.priceUsd - b.priceUsd)
    } else if (sortBy === "price_high_low") {
      sorted.sort((a, b) => b.priceUsd - a.priceUsd)
    } else {
      sorted.sort((a, b) => {
        const scoreA = Number(a.verified) * 5 + Number(a.moveInReady) * 2 - a.priceUsd / 1000000
        const scoreB = Number(b.verified) * 5 + Number(b.moveInReady) * 2 - b.priceUsd / 1000000
        return scoreB - scoreA
      })
    }
    return sorted
  }, [baseFiltered, pathwayFilter, sortBy])

  const pathwayMeta: Array<{ id: PathwayFilter; label: string; description: string }> = [
    { id: "all", label: "All Listings", description: "See every ownership option" },
    { id: "direct_purchase", label: "Direct Purchase", description: "Pay and close with standard terms" },
    { id: "installment", label: "Installment Plans", description: "Spread payments over milestones" },
    { id: "sell_top_up", label: "Sell & Top-Up", description: "Upgrade with proceeds + additional funds" },
  ]

  function toggleShortlist(id: string) {
    setShortlistedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  function scrollToResults() {
    const el = document.getElementById("listing-results")
    el?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <>
      <section className="emz-hero-section">
        <div className="relative overflow-hidden rounded-3xl border border-[#1b3656] bg-[linear-gradient(135deg,#0d1b2a_0%,#163554_56%,#1d4e79_100%)] p-5 text-white shadow-[0_36px_70px_-48px_rgba(13,27,42,0.9)] md:p-8">
          <div className="absolute -right-20 -top-20 h-[22rem] w-[22rem] rounded-full bg-[#7cc8ff]/10 blur-3xl" />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_410px] lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#7cc8ff]">Verified property inventory</p>
              <h1 className="mt-3 font-[var(--font-playfair)] text-5xl font-bold leading-[0.94] md:text-6xl">
                Browse verified homes for ownership
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-200">
                Compare buy opportunities, set your budget, and shortlist faster for purchase, installment, or trade-up plans.
              </p>
              <div className="mt-6 flex flex-wrap gap-5 text-sm">
                <div>
                  <p className="font-[var(--font-playfair)] text-3xl font-bold">{cities.length}+</p>
                  <p className="text-slate-300">Cities</p>
                </div>
                <div>
                  <p className="font-[var(--font-playfair)] text-3xl font-bold">{listings.length}</p>
                  <p className="text-slate-300">Verified listings</p>
                </div>
                <div>
                  <p className="font-[var(--font-playfair)] text-3xl font-bold">3</p>
                  <p className="text-slate-300">Ownership pathways</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
              <p className="text-xs uppercase tracking-[0.18em] text-[#7cc8ff]">Quick Search</p>
              <div className="mt-3 space-y-2.5">
                <select
                  value={citySlug}
                  onChange={(event) => setCitySlug(event.target.value)}
                  className="w-full rounded-xl border border-white/25 bg-[#0c2137] px-3 py-2 text-sm text-white outline-none focus:border-[#7cc8ff]"
                >
                  <option value="all">All cities</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.slug}>{city.name}</option>
                  ))}
                </select>
                <select
                  value={listingType}
                  onChange={(event) => setListingType(event.target.value as "all" | "buy" | "commercial")}
                  className="w-full rounded-xl border border-white/25 bg-[#0c2137] px-3 py-2 text-sm text-white outline-none focus:border-[#7cc8ff]"
                >
                  <option value="all">All ownership types</option>
                  <option value="buy">Buy</option>
                  <option value="commercial">Commercial</option>
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min={0}
                    value={minBudget}
                    onChange={(event) => setMinBudget(Number(event.target.value))}
                    className="w-full rounded-xl border border-white/25 bg-[#0c2137] px-3 py-2 text-sm text-white outline-none focus:border-[#7cc8ff]"
                  />
                  <input
                    type="number"
                    min={0}
                    value={maxBudget}
                    onChange={(event) => setMaxBudget(Number(event.target.value))}
                    className="w-full rounded-xl border border-white/25 bg-[#0c2137] px-3 py-2 text-sm text-white outline-none focus:border-[#7cc8ff]"
                  />
                </div>
                <button
                  type="button"
                  onClick={scrollToResults}
                  className="w-full rounded-xl bg-[#1976d2] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1e88e5]"
                >
                  Search listings
                </button>
                <label className="inline-flex items-center gap-2 text-xs text-slate-200">
                  <input type="checkbox" checked={moveInReadyOnly} onChange={(event) => setMoveInReadyOnly(event.target.checked)} />
                  Ready-to-close only
                </label>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
        <div className="emz-gloss-card rounded-2xl p-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="mr-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#64748b]">Ownership type</p>
            {(["all", "buy", "commercial"] as const).map((type) => {
              const active = listingType === type
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setListingType(type)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "border-[#155eef] bg-[#e8efff] text-[#155eef]"
                      : "border-[#dbe4f0] bg-white text-[#475569] hover:border-[#bfd1ee]"
                  }`}
                >
                  {type === "all" ? "Any" : type}
                </button>
              )
            })}
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-[#64748b]">Sort by</span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortBy)}
                className="rounded-xl border border-[#c8d8f0] bg-white px-3 py-2 text-sm"
              >
                <option value="best_match">Best match</option>
                <option value="price_low_high">Price low-high</option>
                <option value="price_high_low">Price high-low</option>
              </select>
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1.2fr]">
            <div className="rounded-2xl border border-[#dbe4f0] bg-[#f8fbff] p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#64748b]">City</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setCitySlug("all")}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm transition ${
                    citySlug === "all" ? "border-[#155eef] bg-[#e8efff] text-[#155eef]" : "border-[#dbe4f0] bg-white"
                  }`}
                >
                  <span>All cities</span>
                  <span className="text-xs">{listings.length}</span>
                </button>
                {cities.map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => setCitySlug(city.slug)}
                    className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm transition ${
                      citySlug === city.slug ? "border-[#155eef] bg-[#e8efff] text-[#155eef]" : "border-[#dbe4f0] bg-white"
                    }`}
                  >
                    <span>{city.name}</span>
                    <span className="text-xs">{cityCounts[city.slug] ?? 0}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#dbe4f0] bg-white p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#64748b]">Budget range (USD)</p>
                <label className="inline-flex items-center gap-2 text-xs text-[#475569]">
                  <input type="checkbox" checked={moveInReadyOnly} onChange={(event) => setMoveInReadyOnly(event.target.checked)} />
                  Ready-to-close only
                </label>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min={0}
                  value={minBudget}
                  onChange={(event) => setMinBudget(Number(event.target.value))}
                  className="rounded-xl border-2 border-[#d7e2f3] bg-[#f8fbff] px-3 py-2 text-sm font-semibold text-[#0f172a]"
                />
                <input
                  type="number"
                  min={0}
                  value={maxBudget}
                  onChange={(event) => setMaxBudget(Number(event.target.value))}
                  className="rounded-xl border-2 border-[#d7e2f3] bg-[#f8fbff] px-3 py-2 text-sm font-semibold text-[#0f172a]"
                />
              </div>
              <input
                type="range"
                min={10000}
                max={1200000}
                step={5000}
                value={maxBudget}
                onChange={(event) => setMaxBudget(Number(event.target.value))}
                className="emz-budget-slider mt-3 w-full"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {pathwayMeta.map((pathway) => {
            const active = pathwayFilter === pathway.id
            const count = pathwayCounts[pathway.id]
            return (
              <button
                key={pathway.id}
                type="button"
                onClick={() => setPathwayFilter(pathway.id)}
                className={`rounded-2xl border p-4 text-left transition ${
                  active
                    ? "border-[#0d1b2a] bg-[#0d1b2a] text-white shadow-[0_16px_34px_-24px_rgba(13,27,42,0.9)]"
                    : "emz-gloss-card border-[#dbe4f0] bg-white text-[#0f172a] hover:border-[#bfd1ee]"
                }`}
              >
                <p className={`text-xs uppercase tracking-[0.18em] ${active ? "text-sky-200" : "text-[#64748b]"}`}>{count} listings</p>
                <h2 className="mt-2 text-lg font-bold">{pathway.label}</h2>
                <p className={`mt-1 text-sm ${active ? "text-slate-200" : "text-[#64748b]"}`}>{pathway.description}</p>
              </button>
            )
          })}
        </div>
      </section>

      <section id="listing-results" className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        {filtered.length === 0 ? (
          <div className="emz-gloss-card rounded-2xl p-6 text-center">
            <h3 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a]">No listings match these filters</h3>
            <p className="mt-2 text-sm text-[#64748b]">Try widening budget range, changing city, or selecting a different pathway.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((listing) => {
              const cityAccent = getCityAccent(listing.citySlug)
              const pathway = classifyPathway(listing)
              const isShortlisted = shortlistedIds.includes(listing.id)
              const listingBadge =
                pathway === "installment" ? "Installment" : listing.type === "commercial" ? "Commercial" : "Buy"

              return (
                <article key={listing.id} className="group overflow-hidden rounded-2xl border border-[#dbe4f0] bg-white shadow-[0_18px_40px_-30px_rgba(15,23,42,0.45)] transition hover:-translate-y-1 hover:shadow-[0_22px_45px_-26px_rgba(13,27,42,0.4)]">
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={getPrimaryListingImage(listing)} alt={listing.title} className="h-52 w-full object-cover" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 to-transparent" />
                    <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                      <span className={`rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                        listingBadge === "Installment"
                          ? "bg-[#f4a836] text-[#0d1b2a]"
                          : listingBadge === "Commercial"
                            ? "bg-[#6d28d9] text-white"
                            : "bg-[#1976d2] text-white"
                      }`}>
                        {listingBadge}
                      </span>
                      <span className={`rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${cityAccent.badge}`}>
                        {listing.citySlug.replace("-", " ")}
                      </span>
                    </div>
                    <button
                      type="button"
                      aria-label={isShortlisted ? "Remove from shortlist" : "Add to shortlist"}
                      onClick={() => toggleShortlist(listing.id)}
                      className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-sm transition ${
                        isShortlisted
                          ? "border-[#1976d2] bg-white text-[#1976d2]"
                          : "border-white/60 bg-white/85 text-[#0f172a] opacity-100 md:opacity-0 md:group-hover:opacity-100"
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${isShortlisted ? "fill-current" : ""}`} />
                    </button>
                    {listing.verified ? (
                      <span className="absolute bottom-3 left-3 rounded-md bg-black/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                        Verified
                      </span>
                    ) : null}
                  </div>

                  <div className="p-4">
                    <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${cityAccent.text}`}>
                      {listing.citySlug.replace("-", " ")} · {listing.type}
                    </p>
                    <h3 className="mt-1 font-[var(--font-playfair)] text-2xl font-bold text-[#0f172a]">{listing.title}</h3>
                    <p className="mt-1 text-sm text-[#64748b]">{listing.neighborhood}, {listing.country}</p>
                    <div className="mt-3 flex items-center gap-3 text-sm text-[#475569]">
                      <span>{listing.bedrooms} bed</span>
                      <span>{listing.bathrooms} bath</span>
                      <span>{listing.areaSqm} sqm</span>
                    </div>
                    <div className="mt-4 flex items-end justify-between border-t border-[#e8edf6] pt-3">
                      <div>
                        <p className="font-[var(--font-playfair)] text-3xl font-bold leading-none text-[#0d1b2a]">
                          ${listing.priceUsd.toLocaleString()}
                        </p>
                        <p className="mt-1 text-xs text-[#64748b]">
                          {pathway === "installment" ? "Installment-friendly" : pathway === "sell_top_up" ? "Top-up candidate" : "Direct purchase"}
                        </p>
                      </div>
                      <Link
                        href={`/contact?market=${listing.citySlug}&message=I%20want%20to%20view%20${encodeURIComponent(listing.title)}`}
                        className="rounded-xl bg-[#0d1b2a] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#1976d2]"
                      >
                        View listing
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <h2 className="property-section-title text-[#0f172a]">Trusted agents</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {agents.map((agent) => (
            <article key={agent.id} className="emz-gloss-card rounded-xl p-4">
              <h3 className="text-lg font-semibold text-[#0f172a]">{agent.name}</h3>
              <p className="text-sm text-[#64748b]">{agent.company}</p>
              <p className="mt-1 text-sm text-[#64748b]">Cities: {agent.cityCoverage.join(", ")}</p>
              <p className="text-sm text-[#64748b]">Rating: {agent.rating} · {agent.transactions} completed transactions</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <h2 className="property-section-title text-[#0f172a]">Frequently asked questions</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {faqs.map((faq) => (
            <details key={faq.id} className="emz-gloss-card rounded-xl p-4">
              <summary className="cursor-pointer text-sm font-semibold text-[#0f172a]">{faq.question}</summary>
              <p className="mt-2 text-sm text-[#64748b]">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  )
}

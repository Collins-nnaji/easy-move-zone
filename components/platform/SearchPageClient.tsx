"use client"

import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import {
  Search,
  MapPin,
  SlidersHorizontal,
  Home,
  TrendingUp,
  ArrowRight,
  BadgeCheck,
  Trees,
  BedDouble,
  Loader2,
  CheckCircle2,
} from "lucide-react"
import { BuyBuildEstimator } from "@/components/platform/BuyBuildEstimator"
import type { BrowseMode } from "@/lib/search/demo-listings"
import { estimateBuildCost, formatNgn } from "@/lib/search/buy-build-estimate"
import type { PropertyRow } from "@/lib/property/db-row"
import {
  cheapestHomeInCity,
  filterPublicByMode,
  listingHeroStyle,
  rowToPublicCard,
  type PublicListingCard,
} from "@/lib/property/map-public"
import { clsx } from "clsx"
import { BuildGuidedForm } from "@/components/platform/BuildGuidedForm"
import { HardHat } from "lucide-react"

const cities = ["All Cities", "Lagos", "Abuja", "Port Harcourt", "Ibadan", "Enugu", "Kano"]

const statusStyles: Record<string, { bg: string; color: string }> = {
  verified: { bg: "rgba(16, 185, 129, 0.15)", color: "#34d399" },
  pending: { bg: "rgba(245, 158, 11, 0.12)", color: "#fbbf24" },
  unverified: { bg: "rgba(148, 163, 184, 0.12)", color: "#94a3b8" },
}

const modes: { id: BrowseMode; label: string; hint: string; icon: typeof Home }[] = [
  { id: "homes", label: "Buy Finished Homes", hint: "Ready to close", icon: Home },
  { id: "land", label: "Build From Scratch", hint: "Find land & build", icon: Trees },
]

const easeOut = [0.16, 1, 0.3, 1] as const

function sortListings(list: PublicListingCard[], sort: string): PublicListingCard[] {
  const copy = [...list]
  if (sort === "price-asc") copy.sort((a, b) => a.priceNgn - b.priceNgn)
  else if (sort === "price-desc") copy.sort((a, b) => b.priceNgn - a.priceNgn)
  else if (sort === "size-desc") copy.sort((a, b) => b.sizeSqm - a.sizeSqm)
  return copy
}

export function SearchPageClient() {
  const reduceMotion = useReducedMotion()
  const [browseMode, setBrowseMode] = useState<BrowseMode>("homes")
  const showEstimator = browseMode === "land" || browseMode === "all"
  const [cityFilter, setCityFilter] = useState<string>("All Cities")
  const [sort, setSort] = useState("relevant")
  const [query, setQuery] = useState("")
  const [allListings, setAllListings] = useState<PublicListingCard[]>([])
  const [loadState, setLoadState] = useState<"loading" | "ok" | "error">("loading")
  const [estimatorLandNgn, setEstimatorLandNgn] = useState(85_000_000)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const m = params.get("mode")
      if (m === "homes" || m === "land" || m === "all") {
        setBrowseMode(m)
      }
      const c = params.get("city")
      if (c) {
        const match = cities.find((item) => item.toLowerCase() === c.toLowerCase())
        if (match) setCityFilter(match)
      }
      const q = params.get("q")
      if (q) {
        setQuery(q)
      }
    }
  }, [])

  const fetchListings = useCallback(async () => {
    setLoadState("loading")
    try {
      const res = await fetch("/api/properties?limit=100")
      if (!res.ok) throw new Error("bad")
      const data = (await res.json()) as { properties: PropertyRow[] }
      const cards = (data.properties ?? []).map((r) => rowToPublicCard(r))
      setAllListings(cards)
      setLoadState("ok")
      const firstLand = cards.find((l) => l.category === "land")
      if (firstLand && firstLand.priceNgn > 0) setEstimatorLandNgn(firstLand.priceNgn)
    } catch {
      setAllListings([])
      setLoadState("error")
    }
  }, [])

  useEffect(() => {
    void fetchListings()
  }, [fetchListings])

  const filtered = useMemo(() => {
    let list = filterPublicByMode(allListings, browseMode)
    if (cityFilter !== "All Cities") {
      list = list.filter((l) => l.city === cityFilter)
    }
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q) ||
          (l.neighborhood ?? "").toLowerCase().includes(q) ||
          l.type.toLowerCase().includes(q),
      )
    }
    if (sort !== "relevant") return sortListings(list, sort)
    return list
  }, [allListings, browseMode, cityFilter, query, sort])

  const comparableForEstimator = useMemo(() => {
    const firstCity = allListings.find((l) => l.category === "land")?.city ?? "Lagos"
    const city = cityFilter !== "All Cities" ? cityFilter : firstCity
    const home = cheapestHomeInCity(allListings, city)
    return { city, home }
  }, [allListings, cityFilter])

  return (
    <>
      {/* Compact page header — no photo */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 sm:py-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#e0511f] mb-1">Browse</p>
              <h1 className="text-2xl font-bold tracking-tight text-[#0f172a] sm:text-3xl">
                Verified homes &amp; land
              </h1>
              <p className="mt-1.5 text-sm text-slate-500 max-w-md">
                Transparent pricing, guaranteed quality. Every listing is title-checked before it goes live.
              </p>
            </div>

            {/* Buy outright vs Buy & Build toggle */}
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">What are you looking for?</p>
              <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 shadow-sm">
                {modes.map((m) => {
                  const Icon = m.icon
                  const active = browseMode === m.id
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setBrowseMode(m.id)}
                      className={clsx(
                        "flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-all duration-200",
                        active
                          ? m.id === "homes"
                            ? "bg-[#e0511f] text-white shadow"
                            : "bg-amber-500 text-white shadow"
                          : "text-slate-500 hover:text-[#0f172a]"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{m.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Search + filters */}
          <div className="mt-6 flex flex-col gap-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="City, neighbourhood, title, or type…"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-[14px] text-[#0f172a] placeholder:text-slate-400 focus:border-[#e0511f]/40 focus:outline-none focus:ring-2 focus:ring-[#e0511f]/10 shadow-sm"
                />
              </div>
              <button
                type="button"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 shadow-sm"
                aria-label="Filters coming soon"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {cities.map((city) => {
                const active = cityFilter === city
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setCityFilter(city)}
                    className={clsx(
                      "rounded-full px-3.5 py-1.5 text-xs font-semibold border transition",
                      active
                        ? "bg-[#e0511f] text-white border-[#e0511f] shadow-sm"
                        : "bg-white text-slate-500 border-slate-200 hover:border-[#e0511f]/30 hover:text-[#e0511f]",
                    )}
                  >
                    {city}
                  </button>
                )
              })}
              <span className="ml-auto self-center text-xs text-slate-400">
                {allListings.length} properties live
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="relative bg-slate-50/60 py-12 md:py-16 isolation-auto">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#bf6a3c]/5 via-transparent to-transparent opacity-70" aria-hidden />
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-10 xl:gap-12">
            <div className={clsx("min-w-0 transition-all duration-300", showEstimator ? "lg:col-span-8" : "lg:col-span-12")}>

              <div className="mb-8 flex flex-col gap-4 border-b border-slate-200/90 pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm text-slate-600">
                    {loadState === "loading" ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-[#e0511f]" /> Loading listings…
                      </span>
                    ) : loadState === "error" ? (
                      <span className="text-amber-700">Could not load listings. Check database configuration.</span>
                    ) : (
                      <>
                        <span className="text-2xl font-semibold tabular-nums text-[#0f172a]">{filtered.length}</span>
                        <span className="text-slate-600">
                          {" "}
                          {browseMode === "homes" ? "homes" : browseMode === "land" ? "land listings" : "properties"}
                        </span>
                      </>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {browseMode === "homes" && "Houses & apartments ready to close"}
                    {browseMode === "land" && "Plots — use the estimator for total project cost"}
                    {browseMode === "all" && "Switch mode in the hero to focus on homes or land"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Sort</span>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="rounded-xl border border-slate-200/90 bg-white px-4 py-2.5 text-sm font-medium text-[#0f172a] shadow-sm focus:border-[#e0511f]/40 focus:outline-none focus:ring-2 focus:ring-[#e0511f]/10"
                  >
                    <option value="relevant">Most relevant</option>
                    <option value="price-asc">Price: low to high</option>
                    <option value="price-desc">Price: high to low</option>
                    <option value="size-desc">Land / size: largest first</option>
                  </select>
                </div>
              </div>

              <AnimatePresence mode="popLayout">
                <motion.div layout className="grid gap-5 sm:grid-cols-2">
                  {filtered.map((listing, i) => (
                    <motion.div
                      key={listing.id}
                      layout
                      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ delay: reduceMotion ? 0 : Math.min(i * 0.03, 0.15), duration: 0.4, ease: easeOut }}
                    >
                      <ListingCard
                        listing={listing}
                        onUseLandPrice={
                          listing.category === "land"
                            ? () => {
                                setEstimatorLandNgn(listing.priceNgn)
                              }
                            : undefined
                        }
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>

              {loadState === "ok" && filtered.length === 0 && (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl border border-[#bf6a3c]/20 bg-gradient-to-br from-white to-slate-50 py-20 text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
                >
                  <span className="inline-block rounded-full bg-[#bf6a3c]/10 border border-[#bf6a3c]/20 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-[#bf6a3c] mb-4">
                    Coming Soon
                  </span>
                  <p className="text-xl font-bold text-[#0f172a]">New Properties &amp; Prices Dropping Soon</p>
                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                    We&apos;re adding verified listings now. Try a different search, or{" "}
                    <a href="/contact" className="text-[#bf6a3c] hover:underline underline-offset-2">
                      contact us
                    </a>{" "}
                    to be notified when new properties go live.
                  </p>
                </motion.div>
              )}

              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: easeOut }}
                className="relative mt-16 overflow-hidden rounded-3xl border border-[#bf6a3c]/30 bg-gradient-to-br from-[#030712] via-[#0a1128] to-[#020617] p-10 text-center shadow-2xl md:p-14 ring-1 ring-white/10"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(191,106,60,0.3),transparent)]" aria-hidden />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%)] bg-[length:250%_250%] animate-pulse" aria-hidden />
                <p className="relative text-2xl font-bold tracking-tight text-white md:text-3xl">Not seeing a perfect match?</p>
                <p className="relative mx-auto mt-3 max-w-lg text-sm text-slate-400 leading-relaxed">
                  Tell us what you need — we prioritise new verified inventory on the platform.
                </p>
                <Link
                  href="/contact"
                  className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-[#bf6a3c] px-8 py-3 text-sm font-bold text-white shadow-lg shadow-[#bf6a3c]/30 transition-all duration-200 hover:bg-[#c8451a] hover:shadow-[#bf6a3c]/40 hover:-translate-y-0.5"
                >
                  Contact us <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </div>

            {showEstimator && (
              <aside className="mt-10 lg:sticky lg:top-24 lg:mt-0 flex flex-col lg:col-span-4">
                <div className="space-y-6">
                  {browseMode === "land" && (
                      <div className="space-y-6">
                        {/* 1. Guided Form */}
                        <div className="rounded-3xl border border-amber-500/20 bg-[#0a0f1e] p-6 text-white shadow-xl">
                          <div className="flex items-center gap-2.5 mb-4">
                            <HardHat className="h-5 w-5 text-amber-400" />
                            <h3 className="text-lg font-bold">Managed Build-to-Suit</h3>
                          </div>
                          <p className="text-xs text-slate-400 mb-6">Answer a few questions to get an accurate fixed price scope.</p>
                          <BuildGuidedForm />
                        </div>

                        {/* 2. How it Works & Our Promise merged & compact */}
                        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm">
                          <h4 className="text-sm font-bold text-[#0f172a] mb-4 flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-600">1</span>
                            Blueprint to Handover
                          </h4>
                          <div className="grid gap-3.5 text-[13px]">
                            {[
                              "Architectural Design — Match vision & codes",
                              "Government Permits — Filed & chased on your behalf",
                              "Quality-Controlled Build — Supervised engineering",
                              "Digital Milestone Logs — Follow along remotely",
                              "Snagging & Handover — Strict quality inspections",
                              "12-Month Structural Warranty — Protected asset",
                            ].map((step, i) => (
                              <div key={i} className="flex items-center gap-2 text-slate-600">
                                <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                                <span>{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm">
                          <h4 className="text-sm font-bold text-[#0f172a] mb-4 flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">2</span>
                            Our Promise
                          </h4>
                          <div className="grid gap-3.5 text-[13px]">
                            {[
                              "Pre-vetted licensed contractors only",
                              "Independent site engineers on every project",
                              "Fixed-price contracts — zero escalation",
                              "Milestone-based escrow fund management",
                              "Diaspora-friendly portal integration",
                              "Zero-compromise material controls",
                            ].map((p, i) => (
                              <div key={i} className="flex items-center gap-2 text-slate-600">
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                                <span>{p}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <BuyBuildEstimator
                      landPriceNgn={estimatorLandNgn}
                      onLandPriceChange={setEstimatorLandNgn}
                      cityLabel={comparableForEstimator.city}
                      comparableHome={
                        comparableForEstimator.home
                          ? {
                              priceNgn: comparableForEstimator.home.priceNgn,
                              title: comparableForEstimator.home.title,
                            }
                          : undefined
                      }
                    />
                    <p className="text-center text-[11px] text-slate-500 lg:text-left">
                      On a land card, use <span className="font-semibold text-slate-700">&quot;Use this land price&quot;</span> to load it here.
                    </p>
                  </div>
              </aside>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

function ListingCard({
  listing,
  onUseLandPrice,
}: {
  listing: PublicListingCard
  onUseLandPrice?: () => void
}) {
  const sty = statusStyles[listing.status]
  const buildHint = useMemo(() => {
    if (listing.category !== "land") return null
    const e = estimateBuildCost(220, "standard")
    const low = listing.priceNgn + e.low
    const high = listing.priceNgn + e.high
    return { low, high }
  }, [listing])

  return (
    <div className="group/card flex h-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white/95 backdrop-blur-sm shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-500 hover:-translate-y-1.5 hover:border-[#bf6a3c]/30 hover:shadow-[0_20px_40px_rgba(224,81,31,0.08)] hover:ring-1 hover:ring-[#bf6a3c]/20">
      <Link href={`/properties/${listing.id}`} className="flex min-h-0 flex-1 flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-[#bf6a3c]/35">
        <div className="relative h-52 overflow-hidden">
          <div
            className="absolute inset-0 transition duration-700 group-hover/card:scale-[1.03]"
            style={listingHeroStyle(listing)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/70 via-[#020617]/10 to-transparent" />
          <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
            <span
              className={clsx(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur-md",
                listing.category === "home"
                  ? "bg-[#e0511f]/90 text-white ring-1 ring-white/20"
                  : "bg-emerald-600/90 text-white ring-1 ring-white/20",
              )}
            >
              {listing.category === "home" ? (
                <>
                  <Home className="h-3 w-3" /> Home
                </>
              ) : (
                <>
                  <Trees className="h-3 w-3" /> Land
                </>
              )}
            </span>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur-md ring-1 ring-white/15"
              style={{ backgroundColor: sty.bg, color: sty.color }}
            >
              {listing.status === "verified" && <BadgeCheck className="h-3 w-3" />}
              {listing.status}
            </span>
          </div>
          <div className="absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
            {listing.type}
          </div>
          <div className="absolute bottom-3 left-4">
            <p className="text-sm font-bold text-white drop-shadow">{listing.city}</p>
            <p className="text-xs text-white/85">{listing.neighborhood ?? "—"}</p>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-semibold leading-snug text-[#0f172a] transition-colors group-hover/card:text-[#e0511f]">{listing.title}</h3>
          {listing.category === "home" && listing.bedrooms != null && (
            <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-slate-500">
              <BedDouble className="h-3.5 w-3.5" /> {listing.bedrooms} beds · {listing.size}
            </p>
          )}
          {listing.category === "land" && (
            <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-slate-500">
              <MapPin className="h-3.5 w-3.5" /> {listing.size}
            </p>
          )}
          <div className="mt-auto flex items-center justify-between border-t border-slate-100/80 pt-4">
            <div className="text-xl font-extrabold tabular-nums text-[#0f172a] tracking-tight">{listing.price}</div>
            <span className="rounded-xl bg-slate-100/80 px-3 py-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider">{listing.size}</span>
          </div>
          {listing.aiValue && (
            <div className="mt-3 flex items-center gap-1.5 rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-3 py-2 text-xs">
              <TrendingUp className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <span className="font-semibold text-emerald-800">AI range: {listing.aiValue}</span>
            </div>
          )}
          {buildHint && (
            <div className="mt-2 rounded-lg border border-[#bf6a3c]/15 bg-[#eff6ff] px-3 py-2 text-[11px] leading-snug text-slate-700">
              <span className="font-semibold text-[#e0511f]">Indicative 220 sqm build: </span>
              {formatNgn(buildHint.low)} – {formatNgn(buildHint.high)} incl. land
            </div>
          )}
        </div>
      </Link>
      {onUseLandPrice && (
        <div className="border-t border-slate-100 px-5 pb-5 pt-3">
          <button
            type="button"
            onClick={onUseLandPrice}
            className="w-full rounded-xl border border-[#e0511f]/25 bg-white py-2.5 text-xs font-semibold text-[#e0511f] transition hover:bg-[#e0511f]/5"
          >
            Use this land price in estimator →
          </button>
        </div>
      )}
    </div>
  )
}

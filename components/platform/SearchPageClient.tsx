"use client"

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
  Sparkles,
  Trees,
  LayoutGrid,
  BedDouble,
  Loader2,
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

const cities = ["All Cities", "Lagos", "Abuja", "Port Harcourt", "Ibadan", "Enugu", "Kano"]

const statusStyles: Record<string, { bg: string; color: string }> = {
  verified: { bg: "rgba(16, 185, 129, 0.15)", color: "#34d399" },
  pending: { bg: "rgba(245, 158, 11, 0.12)", color: "#fbbf24" },
  unverified: { bg: "rgba(148, 163, 184, 0.12)", color: "#94a3b8" },
}

const modes: { id: BrowseMode; label: string; hint: string; icon: typeof Home }[] = [
  { id: "all", label: "All listings", hint: "Homes & land", icon: LayoutGrid },
  { id: "homes", label: "Full homes", hint: "Move-in ready", icon: Home },
  { id: "land", label: "Buy & build", hint: "Plots & land", icon: Trees },
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
  const [browseMode, setBrowseMode] = useState<BrowseMode>("all")
  const [cityFilter, setCityFilter] = useState<string>("All Cities")
  const [sort, setSort] = useState("relevant")
  const [query, setQuery] = useState("")
  const [allListings, setAllListings] = useState<PublicListingCard[]>([])
  const [loadState, setLoadState] = useState<"loading" | "ok" | "error">("loading")
  const [estimatorLandNgn, setEstimatorLandNgn] = useState(85_000_000)

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
      {/* Hero — dark, matches homepage */}
      <section className="relative overflow-hidden border-b border-white/[0.08] bg-[#030712]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_20%_-20%,rgba(0,51,161,0.45),transparent)]" aria-hidden />
        <motion.div
          className="pointer-events-none absolute -right-24 top-1/4 h-[min(60vw,420px)] w-[min(60vw,420px)] rounded-full bg-[#0072CE]/20 blur-[100px]"
          animate={reduceMotion ? undefined : { scale: [1, 1.06, 1], opacity: [0.35, 0.5, 0.35] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        />
        <div className="home-hero-grid pointer-events-none absolute inset-0 opacity-[0.08]" aria-hidden />

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: easeOut }}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200/90"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                Browse
              </motion.div>
              <motion.h1
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.55, ease: easeOut }}
                className="mt-4 text-3xl font-semibold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-[2.35rem]"
              >
                Verified homes &amp; land in Nigeria
              </motion.h1>
              <motion.p
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.55, ease: easeOut }}
                className="mt-4 max-w-xl text-balance text-sm leading-relaxed text-slate-400 sm:text-base"
              >
                Every property is{" "}
                <strong className="font-semibold text-white">listed and managed by EasyMoveZone</strong> — verified in-house
                before publish. No third-party feeds. For mortgages see{" "}
                <Link href="/mortgage" className="font-semibold text-cyan-300 underline decoration-cyan-500/40 underline-offset-2 hover:text-white">
                  NHF &amp; bank partners
                </Link>
                .
              </motion.p>

              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14, duration: 0.5, ease: easeOut }}
                className="mt-8"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">I want to</p>
                <div className="mt-3 flex flex-wrap gap-2 justify-center lg:justify-start">
                  {modes.map((m) => {
                    const Icon = m.icon
                    const active = browseMode === m.id
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setBrowseMode(m.id)}
                        className={clsx(
                          "inline-flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition duration-200",
                          active
                            ? "border-[#0072CE] bg-[#0072CE] text-white shadow-lg shadow-[#0033A1]/30"
                            : "border-white/15 bg-white/[0.06] text-slate-300 hover:border-white/25 hover:bg-white/[0.1]",
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0 opacity-90" />
                        <span>
                          {m.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>

              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.5, ease: easeOut }}
                className="mt-8 rounded-2xl border border-white/15 bg-white/[0.07] p-1.5 shadow-2xl backdrop-blur-xl sm:p-2"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-stretch md:gap-2">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-slate-500" />
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="City, neighbourhood, title, or type…"
                      className="w-full rounded-xl border-0 bg-white py-3.5 pl-12 pr-4 text-[15px] text-[#0f172a] shadow-none placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0072CE]/25 md:rounded-2xl"
                    />
                  </div>
                  <button
                    type="button"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.08] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-white/[0.12] md:rounded-2xl"
                    aria-label="Filters coming soon"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 justify-center lg:justify-start border-t border-white/10 pt-3">
                  {cities.map((city) => {
                    const active = cityFilter === city
                    return (
                      <button
                        key={city}
                        type="button"
                        onClick={() => setCityFilter(city)}
                        className={clsx(
                          "rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition",
                          active
                            ? "bg-[#0072CE] text-white shadow-md shadow-black/20"
                            : "border border-white/12 bg-black/20 text-slate-300 hover:border-cyan-400/30 hover:text-white",
                        )}
                      >
                        {city}
                      </button>
                    )
                  })}
                </div>
              </motion.div>

              <motion.p
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.28, duration: 0.45 }}
                className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs text-slate-500"
              >
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 font-semibold text-emerald-300">
                  <Home className="h-3.5 w-3.5" strokeWidth={2.5} />
                  Platform-managed
                </span>
                <span className="text-slate-500">Live database · AI estimates</span>
              </motion.p>
            </div>

            {/* Hero right — catalogue snapshot */}
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6, ease: easeOut }}
              className="relative lg:col-span-5"
            >
              <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-white/25 via-cyan-400/15 to-[#0072CE]/30 opacity-70 blur-[1px]" aria-hidden />
              <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.06] p-6 backdrop-blur-2xl sm:p-7">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-200/80">Catalogue</p>
                <p className="mt-2 text-4xl font-semibold tabular-nums tracking-tight text-white sm:text-5xl">
                  {loadState === "loading" ? (
                    <span className="inline-flex items-center gap-2 text-2xl text-slate-400">
                      <Loader2 className="h-7 w-7 animate-spin" />
                    </span>
                  ) : loadState === "error" ? (
                    <span className="text-lg text-amber-300">—</span>
                  ) : (
                    allListings.length
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-400">Published listings in this view</p>
                <div className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm text-slate-400">
                  <p className="leading-snug">
                    <strong className="text-slate-200">No syndication.</strong> We verify titles and details before anything
                    appears here.
                  </p>
                  <p className="text-xs leading-relaxed text-slate-500">
                    Use modes and cities above, then scroll for full cards — buy-and-build estimator stays pinned on desktop.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="relative bg-[#f4f4f4] py-10 md:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-10 xl:gap-12">
            <div className="min-w-0 lg:col-span-8">
              <div className="mb-8 flex flex-col gap-4 border-b border-slate-200/90 pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm text-slate-600">
                    {loadState === "loading" ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-[#0033A1]" /> Loading listings…
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
                    className="rounded-xl border border-slate-200/90 bg-white px-4 py-2.5 text-sm font-medium text-[#0f172a] shadow-sm focus:border-[#0033A1]/40 focus:outline-none focus:ring-2 focus:ring-[#0033A1]/10"
                  >
                    <option value="relevant">Most relevant</option>
                    <option value="price-asc">Price: low to high</option>
                    <option value="price-desc">Price: high to low</option>
                    <option value="size-desc">Land / size: largest first</option>
                  </select>
                </div>
              </div>

              <AnimatePresence mode="popLayout">
                <motion.div layout className="mx-auto grid max-w-xl gap-5 sm:max-w-none sm:grid-cols-2">
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
                  className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center shadow-sm"
                >
                  <p className="font-semibold text-[#0f172a]">No listings match</p>
                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                    Try another city or search term. New verified listings appear here as they are published.
                  </p>
                </motion.div>
              )}

              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: easeOut }}
                className="relative mt-12 overflow-hidden rounded-2xl border border-[#0072CE]/20 bg-[#030712] p-8 text-center shadow-xl md:p-10"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(0,114,206,0.25),transparent)]" aria-hidden />
                <p className="relative text-xl font-semibold text-white md:text-2xl">Not seeing a perfect match?</p>
                <p className="relative mx-auto mt-2 max-w-lg text-sm text-slate-400">
                  Tell us what you need — we prioritise new verified inventory on the platform.
                </p>
                <Link
                  href="/contact"
                  className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-[#0f172a] transition hover:bg-slate-100"
                >
                  Contact us <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </div>

            <aside className="mt-10 lg:sticky lg:top-24 lg:col-span-4 lg:mt-0">
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
              <p className="mt-3 text-center text-[11px] text-slate-500 lg:text-left">
                On a land card, use <span className="font-semibold text-slate-700">&quot;Use this land price&quot;</span> to load it here.
              </p>
            </aside>
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
    <div className="group/card flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[#0033A1]/20 hover:shadow-lg hover:shadow-[#0033A1]/[0.06] hover:ring-2 hover:ring-[#0033A1]/10">
      <Link href={`/properties/${listing.id}`} className="flex min-h-0 flex-1 flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0072CE]/35">
        <div className="relative h-40 overflow-hidden sm:h-52">
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
                  ? "bg-[#0033A1]/90 text-white ring-1 ring-white/20"
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
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <h3 className="font-semibold leading-snug text-[#0f172a] transition-colors group-hover/card:text-[#0033A1]">{listing.title}</h3>
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
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
            <div className="text-base font-bold tabular-nums text-[#0f172a] sm:text-lg">{listing.price}</div>
            <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{listing.size}</span>
          </div>
          {listing.aiValue && (
            <div className="mt-3 flex items-center gap-1.5 rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-3 py-2 text-xs">
              <TrendingUp className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <span className="font-semibold text-emerald-800">AI range: {listing.aiValue}</span>
            </div>
          )}
          {buildHint && (
            <div className="mt-2 rounded-lg border border-[#0072CE]/15 bg-[#eff6ff] px-3 py-2 text-[11px] leading-snug text-slate-700">
              <span className="font-semibold text-[#0033A1]">Indicative 220 sqm build: </span>
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
            className="w-full rounded-xl border border-[#0033A1]/25 bg-white py-2.5 text-xs font-semibold text-[#0033A1] transition hover:bg-[#0033A1]/5"
          >
            Use this land price in estimator →
          </button>
        </div>
      )}
    </div>
  )
}

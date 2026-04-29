"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  TrendingUp,
  ArrowRight,
  BadgeCheck,
  BedDouble,
  Loader2,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react"
import type { PropertyRow } from "@/lib/property/db-row"
import {
  listingHeroStyle,
  rowToPublicCard,
  type PublicListingCard,
} from "@/lib/property/map-public"
import { clsx } from "clsx"

const cities = ["All Cities", "Lagos", "Abuja", "Port Harcourt", "Ibadan", "Enugu", "Kano"]

const statusStyles: Record<string, { bg: string; dot: string; label: string }> = {
  verified:   { bg: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",  dot: "bg-emerald-500", label: "Verified"   },
  pending:    { bg: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",        dot: "bg-amber-400",   label: "Pending"    },
  unverified: { bg: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",       dot: "bg-slate-400",   label: "Unverified" },
}

const PRICE_MIN = 0
const PRICE_MAX = 500_000_000

function formatPrice(n: number) {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(0)}M`
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`
  return `₦${n}`
}

function sortListings(list: PublicListingCard[], sort: string) {
  const copy = [...list]
  if (sort === "price-asc")  copy.sort((a, b) => a.priceNgn - b.priceNgn)
  if (sort === "price-desc") copy.sort((a, b) => b.priceNgn - a.priceNgn)
  if (sort === "size-desc")  copy.sort((a, b) => b.sizeSqm - a.sizeSqm)
  return copy
}

export function PurchasePageClient() {
  const [cityFilter, setCityFilter] = useState("All Cities")
  const [sort, setSort] = useState("relevant")
  const [query, setQuery] = useState("")
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX])
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [allListings, setAllListings] = useState<PublicListingCard[]>([])
  const [loadState, setLoadState] = useState<"loading" | "ok" | "error">("loading")

  useEffect(() => {
    if (typeof window === "undefined") return
    const p = new URLSearchParams(window.location.search)
    const c = p.get("city")
    if (c) {
      const match = cities.find((x) => x.toLowerCase() === c.toLowerCase())
      if (match) setCityFilter(match)
    }
    const q = p.get("q")
    if (q) setQuery(q)
  }, [])

  const fetchListings = useCallback(async () => {
    setLoadState("loading")
    try {
      const res = await fetch("/api/properties?limit=200")
      if (!res.ok) throw new Error("bad")
      const data = (await res.json()) as { properties: PropertyRow[] }
      const cards = (data.properties ?? [])
        .map((r) => rowToPublicCard(r))
        .filter((c) => c.category === "home")
      setAllListings(cards)
      setLoadState("ok")
    } catch {
      setAllListings([])
      setLoadState("error")
    }
  }, [])

  useEffect(() => { void fetchListings() }, [fetchListings])

  // Derive actual price bounds from fetched data
  const { dataMin, dataMax } = useMemo(() => {
    if (!allListings.length) return { dataMin: PRICE_MIN, dataMax: PRICE_MAX }
    const prices = allListings.map((l) => l.priceNgn)
    return { dataMin: Math.min(...prices), dataMax: Math.max(...prices) }
  }, [allListings])

  const filtered = useMemo(() => {
    let list = allListings
    if (cityFilter !== "All Cities") list = list.filter((l) => l.city === cityFilter)
    list = list.filter((l) => l.priceNgn >= priceRange[0] && l.priceNgn <= priceRange[1])
    const q = query.trim().toLowerCase()
    if (q) list = list.filter((l) =>
      l.title.toLowerCase().includes(q) ||
      l.city.toLowerCase().includes(q) ||
      (l.neighborhood ?? "").toLowerCase().includes(q) ||
      l.type.toLowerCase().includes(q)
    )
    return sort !== "relevant" ? sortListings(list, sort) : list
  }, [allListings, cityFilter, query, sort, priceRange])

  const priceFiltered = priceRange[0] !== PRICE_MIN || priceRange[1] !== PRICE_MAX
  const activeFilters = (cityFilter !== "All Cities" ? 1 : 0) + (priceFiltered ? 1 : 0) + (query ? 1 : 0)

  function clearAll() {
    setCityFilter("All Cities")
    setPriceRange([PRICE_MIN, PRICE_MAX])
    setQuery("")
  }

  return (
    <>
      {/* Page header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 pt-8 pb-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-600 mb-1">
                Outright Purchase
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-[#0f172a] sm:text-3xl">
                Verified homes for sale
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Every listing is title-checked. Transparent pricing, no hidden fees.
              </p>
            </div>
            <Link
              href="/build"
              className="mt-4 sm:mt-0 inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-700 transition hover:bg-amber-100"
            >
              Want to build instead? →
            </Link>
          </div>

          {/* Search bar row */}
          <div className="mt-5 flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search city, neighbourhood, or type…"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-[#0f172a] placeholder:text-slate-400 shadow-sm focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/15"
              />
            </div>
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className={clsx(
                "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-sm transition",
                filtersOpen || activeFilters > 0
                  ? "border-[#0033A1] bg-[#0033A1] text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilters > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/30 text-[10px] font-bold">
                  {activeFilters}
                </span>
              )}
            </button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-[#0f172a] shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
            >
              <option value="relevant">Most relevant</option>
              <option value="price-asc">Price: low → high</option>
              <option value="price-desc">Price: high → low</option>
              <option value="size-desc">Largest first</option>
            </select>
          </div>

          {/* Expandable filter panel */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-5">
                  {/* City filter */}
                  <div>
                    <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">City</p>
                    <div className="flex flex-wrap gap-2">
                      {cities.map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => setCityFilter(city)}
                          className={clsx(
                            "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
                            cityFilter === city
                              ? "border-[#0033A1] bg-[#0033A1] text-white shadow-sm"
                              : "border-slate-200 bg-white text-slate-500 hover:border-[#0033A1]/40 hover:text-[#0033A1]"
                          )}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price range slider */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Price range</p>
                      <p className="text-xs font-semibold text-[#0033A1]">
                        {formatPrice(priceRange[0])} — {formatPrice(priceRange[1])}
                      </p>
                    </div>
                    <PriceRangeSlider
                      min={PRICE_MIN}
                      max={PRICE_MAX}
                      value={priceRange}
                      onChange={setPriceRange}
                    />
                    <div className="flex justify-between mt-1.5 text-[10px] text-slate-400">
                      <span>₦0</span>
                      <span>₦500M+</span>
                    </div>
                  </div>

                  {activeFilters > 0 && (
                    <button
                      type="button"
                      onClick={clearAll}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 transition"
                    >
                      <X className="h-3.5 w-3.5" /> Clear all filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result count */}
          {loadState === "ok" && (
            <p className="mt-3 text-xs text-slate-400">
              {filtered.length} {filtered.length === 1 ? "home" : "homes"} found
              {activeFilters > 0 && " · "}
              {activeFilters > 0 && (
                <button type="button" onClick={clearAll} className="text-[#0033A1] font-semibold hover:underline">
                  Clear filters
                </button>
              )}
            </p>
          )}
        </div>
      </section>

      {/* Listings */}
      <section className="bg-slate-50/60 py-10 md:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loadState === "loading" && (
            <div className="flex items-center justify-center gap-2 py-24 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading listings…</span>
            </div>
          )}
          {loadState === "error" && (
            <p className="py-16 text-center text-sm text-amber-700">
              Could not load listings — please refresh or check back soon.
            </p>
          )}
          {loadState === "ok" && filtered.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white py-24 text-center">
              <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-slate-300" />
              <p className="font-semibold text-[#0f172a]">No homes match your filters</p>
              <p className="mt-2 text-sm text-slate-500">Try adjusting the price range or clearing the city filter.</p>
              <button
                type="button"
                onClick={clearAll}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0033A1] px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-[#002880]"
              >
                Clear filters
              </button>
            </div>
          )}
          {loadState === "ok" && filtered.length > 0 && (
            <AnimatePresence mode="popLayout">
              <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((listing, i) => (
                  <motion.div
                    key={listing.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ delay: Math.min(i * 0.025, 0.15), duration: 0.38 }}
                  >
                    <ListingCard listing={listing} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {loadState === "ok" && (
            <div className="mt-16 rounded-3xl border border-[#0072CE]/20 bg-gradient-to-br from-[#030a1a] to-[#0a1428] p-10 text-center shadow-xl ring-1 ring-white/5">
              <p className="text-xl font-bold text-white sm:text-2xl">Don't see the right fit?</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
                Tell us what you need and we'll source a verified match from our off-market inventory.
              </p>
              <Link
                href="/contact"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0072CE] px-7 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#005fad]"
              >
                Contact us <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

// ── Price range dual-handle slider ──────────────────────────────────────────
function PriceRangeSlider({
  min, max, value, onChange,
}: {
  min: number
  max: number
  value: [number, number]
  onChange: (v: [number, number]) => void
}) {
  const [low, high] = value
  const pct = (v: number) => ((v - min) / (max - min)) * 100

  function clamp(v: number) { return Math.max(min, Math.min(max, v)) }

  function handleLow(e: React.ChangeEvent<HTMLInputElement>) {
    const next = clamp(Number(e.target.value))
    if (next <= high) onChange([next, high])
  }
  function handleHigh(e: React.ChangeEvent<HTMLInputElement>) {
    const next = clamp(Number(e.target.value))
    if (next >= low) onChange([low, next])
  }

  const step = 5_000_000

  return (
    <div className="relative h-8 flex items-center">
      {/* Track */}
      <div className="absolute inset-x-0 h-1.5 rounded-full bg-slate-200" />
      {/* Fill */}
      <div
        className="absolute h-1.5 rounded-full bg-[#0033A1]"
        style={{ left: `${pct(low)}%`, right: `${100 - pct(high)}%` }}
      />
      {/* Low thumb */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={low}
        onChange={handleLow}
        className="absolute inset-x-0 h-1.5 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-[#0033A1] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
        style={{ zIndex: low >= high - step ? 5 : 3 }}
      />
      {/* High thumb */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={high}
        onChange={handleHigh}
        className="absolute inset-x-0 h-1.5 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-[#0033A1] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
        style={{ zIndex: 4 }}
      />
    </div>
  )
}

function ListingCard({ listing }: { listing: PublicListingCard }) {
  const s = statusStyles[listing.status] ?? statusStyles.unverified

  return (
    <Link
      href={`/properties/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#0072CE]/30 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0072CE]/40"
    >
      <div className="relative h-52 overflow-hidden bg-slate-100">
        <div
          className="absolute inset-0 transition duration-500 group-hover:scale-[1.04]"
          style={listingHeroStyle(listing)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className={clsx(
          "absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold",
          s.bg
        )}>
          <span className={clsx("h-1.5 w-1.5 rounded-full", s.dot)} />
          {s.label}
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
          {listing.type}
        </div>
        <div className="absolute bottom-3 left-3">
          <p className="text-sm font-bold text-white drop-shadow-sm">{listing.city}</p>
          {listing.neighborhood && <p className="text-xs text-white/75">{listing.neighborhood}</p>}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-semibold leading-snug text-[#0f172a] transition-colors group-hover:text-[#0033A1]">
          {listing.title}
        </h3>
        {listing.bedrooms != null && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-500">
            <BedDouble className="h-3.5 w-3.5" />
            {listing.bedrooms} bed · {listing.size}
          </p>
        )}
        <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-3 mt-3">
          <p className="text-lg font-extrabold tabular-nums text-[#0f172a] tracking-tight">{listing.price}</p>
          {listing.status === "verified" && <BadgeCheck className="h-4 w-4 text-emerald-500 shrink-0" />}
        </div>
        {listing.aiValue && (
          <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-1.5 text-xs">
            <TrendingUp className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
            <span className="font-medium text-emerald-800">AI: {listing.aiValue}</span>
          </div>
        )}
      </div>
    </Link>
  )
}

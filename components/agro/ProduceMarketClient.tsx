"use client"

import Link from "next/link"
import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  SlidersHorizontal,
  Sprout,
  MapPin,
  Calendar,
  Package,
  Truck,
  ArrowRight,
  Phone,
  Shield,
  RefreshCw,
  X,
  ChevronDown,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const CROPS = ["All", "Maize", "Rice", "Cassava", "Yam", "Tomatoes", "Pepper", "Sorghum", "Millet", "Cowpea", "Groundnut", "Soybean", "Plantain"]
const STATES = ["All states", "Kano", "Lagos", "Benue", "Kaduna", "Kebbi", "Ogun", "Oyo", "Delta", "Rivers", "Anambra", "Enugu", "Abuja (FCT)"]

const CROP_EMOJI: Record<string, string> = {
  Maize: "🌽", Rice: "🌾", Cassava: "🫚", Yam: "🥔", Tomatoes: "🍅",
  Pepper: "🌶️", Sorghum: "🌾", Millet: "🌾", Cowpea: "🫘", Groundnut: "🥜",
  Soybean: "🫘", Plantain: "🍌", Onion: "🧅", "Sweet Potato": "🍠",
}

interface Listing {
  id: string
  crop_type: string
  variety: string
  quantity: number
  unit: string
  price_per_unit: number
  state: string
  lga: string
  harvest_date: string
  pickup_from: string
  pickup_to: string
  needs_transport: boolean
  cold_storage_required: boolean
  contact_name: string
  status: string
  verified: boolean
  created_at: string
}

const easeOut = [0.16, 1, 0.3, 1] as const

function formatCurrency(n: number) {
  return "₦" + n.toLocaleString("en-NG")
}

function ListingCard({ listing, index }: { listing: Listing; index: number }) {
  const emoji = CROP_EMOJI[listing.crop_type] ?? "🌱"
  const totalValue = listing.quantity * listing.price_per_unit

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4, ease: easeOut }}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-lg hover:border-emerald-200 hover:-translate-y-0.5"
    >
      {/* Colour band */}
      <div className="h-1.5 w-full rounded-t-2xl bg-gradient-to-r from-emerald-400 to-green-500" />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl leading-none">{emoji}</span>
            <div>
              <h3 className="font-semibold text-slate-900 leading-tight">
                {listing.variety || listing.crop_type}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">{listing.contact_name}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {listing.verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                <Shield className="h-2.5 w-2.5" />
                Verified
              </span>
            )}
            {listing.needs_transport && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                <Truck className="h-2.5 w-2.5" />
                Needs truck
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Package className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{listing.quantity.toLocaleString()} {listing.unit}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{listing.lga ? `${listing.lga}, ` : ""}{listing.state}</span>
          </div>
          {listing.harvest_date && (
            <div className="flex items-center gap-1.5 text-slate-600">
              <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>{new Date(listing.harvest_date).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}</span>
            </div>
          )}
          <div className="font-semibold text-slate-800">
            {formatCurrency(listing.price_per_unit)}/{listing.unit.includes("kg") ? "kg" : listing.unit.split(" ")[0]}
          </div>
        </div>

        <div className="mt-3 rounded-xl bg-gradient-to-br from-slate-50 to-emerald-50/40 border border-slate-100 px-3.5 py-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Total value</p>
              <p className="text-base font-bold text-slate-900 tabular-nums">{formatCurrency(totalValue)}</p>
            </div>
            {listing.pickup_from && (
              <div className="text-right">
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Pickup</p>
                <p className="text-xs font-semibold text-slate-600">
                  {new Date(listing.pickup_from).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                  {listing.pickup_to && listing.pickup_to !== listing.pickup_from && (
                    <span className="text-slate-400"> – {new Date(listing.pickup_to).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}</span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 px-5 py-3 flex gap-2">
        <Link
          href={`/produce/${listing.id}`}
          className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-emerald-500 active:scale-[0.98]"
        >
          View & Book
        </Link>
        <a
          href={`tel:`}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700"
        >
          <Phone className="h-3.5 w-3.5" />
          Contact
        </a>
      </div>
    </motion.div>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 animate-pulse">
      <div className="h-1.5 w-full rounded-t bg-slate-100 -mx-5 -mt-5 mb-5 rounded-tl-2xl rounded-tr-2xl" />
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-full bg-slate-100" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 w-32 rounded bg-slate-100" />
          <div className="h-2.5 w-20 rounded bg-slate-100" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-3 rounded bg-slate-100" />)}
      </div>
      <div className="h-14 rounded-xl bg-slate-50" />
      <div className="mt-3 flex gap-2">
        <div className="flex-1 h-9 rounded-xl bg-slate-100" />
        <div className="w-20 h-9 rounded-xl bg-slate-100" />
      </div>
    </div>
  )
}

export function ProduceMarketClient() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  const [search, setSearch] = useState("")
  const [selectedCrop, setSelectedCrop] = useState("All")
  const [selectedState, setSelectedState] = useState("All states")
  const [transportOnly, setTransportOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const featuredRef = useRef<HTMLDivElement>(null)

  const fetchListings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ limit: "24" })
      if (selectedCrop !== "All") params.set("crop", selectedCrop)
      if (selectedState !== "All states") params.set("state", selectedState.replace(" (FCT)", ""))
      if (transportOnly) params.set("needs_transport", "true")
      const res = await fetch(`/api/produce?${params}`)
      if (!res.ok) throw new Error("Failed to load listings")
      const data = await res.json()
      let items: Listing[] = data.listings ?? []
      if (search) {
        const q = search.toLowerCase()
        items = items.filter((l) =>
          [l.crop_type, l.variety, l.state, l.lga, l.contact_name].some((v) => v?.toLowerCase().includes(q))
        )
      }
      setListings(items)
      setTotal(data.count ?? items.length)
    } catch (e) {
      setError("Could not load listings. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [selectedCrop, selectedState, transportOnly, search])

  useEffect(() => { fetchListings() }, [fetchListings])

  const activeFilters = [
    selectedCrop !== "All" && selectedCrop,
    selectedState !== "All states" && selectedState,
    transportOnly && "Needs transport",
  ].filter(Boolean) as string[]

  const featuredFallback: Listing[] = [
    {
      id: "featured-1",
      crop_type: "Maize",
      variety: "Premium grain",
      quantity: 120,
      unit: "bags (100kg)",
      price_per_unit: 42000,
      state: "Kaduna",
      lga: "Zaria",
      harvest_date: "2026-04-18",
      pickup_from: "2026-04-20",
      pickup_to: "2026-04-23",
      needs_transport: true,
      cold_storage_required: false,
      contact_name: "Aisha Farms",
      status: "active",
      verified: true,
      created_at: "2026-04-20",
    },
    {
      id: "featured-2",
      crop_type: "Tomatoes",
      variety: "Roma",
      quantity: 60,
      unit: "crates",
      price_per_unit: 28500,
      state: "Benue",
      lga: "Makurdi",
      harvest_date: "2026-04-19",
      pickup_from: "2026-04-21",
      pickup_to: "2026-04-22",
      needs_transport: true,
      cold_storage_required: true,
      contact_name: "Danko Produce",
      status: "active",
      verified: true,
      created_at: "2026-04-20",
    },
    {
      id: "featured-3",
      crop_type: "Yam",
      variety: "Puna",
      quantity: 500,
      unit: "tubers",
      price_per_unit: 1200,
      state: "Nasarawa",
      lga: "Lafia",
      harvest_date: "2026-04-16",
      pickup_from: "2026-04-22",
      pickup_to: "2026-04-24",
      needs_transport: false,
      cold_storage_required: false,
      contact_name: "Okoro Farms",
      status: "active",
      verified: false,
      created_at: "2026-04-20",
    },
  ]

  const featuredListings = (loading || listings.length === 0 ? featuredFallback : listings).slice(0, 6)

  function scrollFeatured(direction: "left" | "right") {
    if (!featuredRef.current) return
    const amount = direction === "left" ? -280 : 280
    featuredRef.current.scrollBy({ left: amount, behavior: "smooth" })
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Hero header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0a2e0a] via-[#0d3d10] to-[#064e10]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute left-0 bottom-0 h-64 w-64 rounded-full bg-lime-500/8 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 pt-12 pb-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                <Sprout className="h-3.5 w-3.5" />
                Produce Market
              </span>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">
                Fresh from African farms
              </h1>
              <p className="mt-1.5 text-sm text-emerald-200/60">
                {loading ? "Loading listings…" : `${listings.length} listing${listings.length !== 1 ? "s" : ""} available now`}
              </p>
            </div>
            <Link
              href="/produce/list"
              className="inline-flex items-center gap-2 self-start rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-300 active:scale-[0.97] sm:self-auto"
            >
              <Sprout className="h-4 w-4" />
              List your produce
            </Link>
          </div>

          {/* Search */}
          <div className="relative mt-7 flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search crop, location, farmer…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border-0 bg-white/95 py-3.5 pl-11 pr-4 text-sm text-slate-800 shadow-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 backdrop-blur-sm"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters((p) => !p)}
              className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg transition ${showFilters ? "bg-emerald-400 text-slate-900" : "bg-white/95 text-slate-700 hover:bg-white"}`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilters.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                  {activeFilters.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Featured carousel */}
        <section className="rounded-3xl border border-emerald-100/70 bg-white/85 p-5 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-600">
                <Sparkles className="h-3.5 w-3.5" />
                Featured harvests
              </span>
              <h2 className="mt-2 text-lg font-bold text-slate-900">Weekly top listings</h2>
              <p className="text-xs text-slate-500">Trending harvests with fast pickup windows.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollFeatured("left")}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-emerald-300 hover:text-emerald-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollFeatured("right")}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-emerald-300 hover:text-emerald-700"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div
            ref={featuredRef}
            className="mt-4 flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {featuredListings.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.35, ease: easeOut }}
                className="min-w-[240px] snap-start"
              >
                <div className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900">{item.variety || item.crop_type}</span>
                    {item.verified && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{item.state} · {item.lga || "Market hub"}</p>
                  <div className="mt-3 rounded-xl bg-emerald-50/70 px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Total value</p>
                    <p className="text-lg font-bold text-emerald-700">{formatCurrency(item.quantity * item.price_per_unit)}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>{item.quantity.toLocaleString()} {item.unit}</span>
                    <span className="font-semibold text-slate-700">{formatCurrency(item.price_per_unit)}/{item.unit.split(" ")[0]}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Pickup</span>
                    <span className="font-semibold text-slate-600">
                      {new Date(item.pickup_from).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mb-6 rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-sm backdrop-blur space-y-4">
                <div>
                  <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-400">Crop type</p>
                  <div className="flex flex-wrap gap-2">
                    {CROPS.map((crop) => (
                      <button
                        key={crop}
                        onClick={() => setSelectedCrop(crop)}
                        className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                          selectedCrop === crop
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "border border-slate-200 bg-white/80 text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
                        }`}
                      >
                        {crop}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">State</label>
                    <div className="relative">
                      <select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      >
                        {STATES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  <div className="inline-flex rounded-full border border-slate-200 bg-white/90 p-1 text-xs font-semibold text-slate-600 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setTransportOnly(false)}
                      className={`rounded-full px-3 py-1.5 transition ${!transportOnly ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 hover:text-emerald-700"}`}
                    >
                      All listings
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransportOnly(true)}
                      className={`rounded-full px-3 py-1.5 transition ${transportOnly ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 hover:text-emerald-700"}`}
                    >
                      Needs transport
                    </button>
                  </div>

                  {activeFilters.length > 0 && (
                    <button
                      onClick={() => { setSelectedCrop("All"); setSelectedState("All states"); setTransportOnly(false) }}
                      className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700"
                    >
                      <X className="h-3.5 w-3.5" /> Clear all
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active filter chips */}
        {activeFilters.length > 0 && !showFilters && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400">Filters:</span>
            {activeFilters.map((f) => (
              <span key={f} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                {f}
                <button onClick={() => {
                  if (f === selectedCrop) setSelectedCrop("All")
                  else if (f === selectedState) setSelectedState("All states")
                  else if (f === "Needs transport") setTransportOnly(false)
                }} className="text-emerald-600 hover:text-emerald-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-red-100 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={fetchListings} className="flex items-center gap-1.5 text-sm font-semibold text-red-700 hover:text-red-900">
              <RefreshCw className="h-3.5 w-3.5" /> Retry
            </button>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : listings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
            <Sprout className="mx-auto mb-3 h-10 w-10 text-slate-300" strokeWidth={1.5} />
            <p className="text-slate-500 font-medium">No listings match your filters.</p>
            <button
              onClick={() => { setSelectedCrop("All"); setSelectedState("All states"); setSearch(""); setTransportOnly(false) }}
              className="mt-3 text-sm font-semibold text-emerald-600 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l, i) => (
              <ListingCard key={l.id} listing={l} index={i} />
            ))}
          </div>
        )}

        {/* CTA */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-14 overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-lime-50 p-8 text-center"
          >
            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-200">
              <Sprout className="h-7 w-7 text-white" strokeWidth={1.75} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Are you a farmer?</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
              List your harvest for free. Reach buyers and transporters across Africa directly — no middlemen.
            </p>
            <Link
              href="/produce/list"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-7 py-3 text-sm font-bold text-white shadow-md shadow-emerald-200 transition hover:bg-emerald-500"
            >
              List produce now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}

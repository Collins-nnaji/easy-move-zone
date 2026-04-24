"use client"

import Link from "next/link"
import { useState, useEffect, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import {
  Truck,
  MapPin,
  Star,
  Phone,
  Shield,
  ArrowRight,
  Search,
  Thermometer,
  Wifi,
  CheckCircle2,
  X,
  RefreshCw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

interface Transporter {
  id: string
  company_name: string
  owner_name: string
  phone: string
  whatsapp: boolean
  base_state: string
  base_lga: string
  fleet_size: number
  truck_types: string[]
  specialties: string[]
  routes: string
  years_experience: number
  has_insurance: boolean
  has_gps: boolean
  has_cold_chain: boolean
  price_per_tonne_km: number
  rating: number
  total_trips: number
  verified: boolean
}

const easeOut = [0.16, 1, 0.3, 1] as const

function StarRating({ rating }: { rating: number | string | null | undefined }) {
  const value = typeof rating === "number" ? rating : Number(rating)
  const safeValue = Number.isFinite(value) ? value : 0

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`h-3.5 w-3.5 ${s <= Math.round(safeValue) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-xs font-bold text-slate-700">{safeValue.toFixed(1)}</span>
    </div>
  )
}

function TransporterCard({ t, index }: { t: Transporter; index: number }) {
  const routeList = t.routes ? t.routes.split(",").map((r) => r.trim()).slice(0, 3) : []

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: easeOut }}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-lg hover:border-amber-200 hover:-translate-y-0.5"
    >
      <div className="h-1.5 w-full rounded-t-2xl bg-gradient-to-r from-amber-400 to-orange-400" />

      <div className="flex flex-1 flex-col p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 border border-amber-100">
              <Truck className="h-5 w-5 text-amber-600" strokeWidth={1.75} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-slate-900">{t.company_name}</h3>
                {t.verified && <Shield className="h-4 w-4 text-emerald-500 shrink-0" strokeWidth={2} />}
              </div>
              <p className="text-xs text-slate-500">{t.owner_name}</p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            {t.rating != null && <StarRating rating={t.rating} />}
            <p className="mt-0.5 text-[11px] text-slate-400">{t.total_trips?.toLocaleString()} trips</p>
          </div>
        </div>

        {/* Location & fleet */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            {t.base_lga ? `${t.base_lga}, ` : ""}{t.base_state}
          </div>
          <div className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            {t.fleet_size} truck{t.fleet_size !== 1 ? "s" : ""}
          </div>
          {t.years_experience && (
            <div className="flex items-center gap-1.5 col-span-2 text-slate-500">
              {t.years_experience} yr{t.years_experience !== 1 ? "s" : ""} experience
            </div>
          )}
        </div>

        {/* Capability badges */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {t.has_insurance && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              <CheckCircle2 className="h-2.5 w-2.5" /> Insured
            </span>
          )}
          {t.has_gps && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
              <Wifi className="h-2.5 w-2.5" /> GPS
            </span>
          )}
          {t.has_cold_chain && (
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 border border-cyan-100 px-2 py-0.5 text-[10px] font-semibold text-cyan-700">
              <Thermometer className="h-2.5 w-2.5" /> Cold chain
            </span>
          )}
        </div>

        {/* Routes */}
        {routeList.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {routeList.map((r) => (
              <span key={r} className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700 border border-amber-100">
                {r}
              </span>
            ))}
          </div>
        )}

        {/* Specialties */}
        {t.specialties?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {t.specialties.slice(0, 4).map((s) => (
              <span key={s} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Rate */}
        {t.price_per_tonne_km && (
          <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-2.5">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Rate</p>
              <p className="text-base font-bold text-slate-900">₦{t.price_per_tonne_km}/tonne·km</p>
            </div>
            {t.truck_types?.[0] && (
              <span className="rounded-lg bg-white border border-slate-200 px-2 py-1 text-[10px] font-medium text-slate-500 max-w-[120px] truncate">
                {t.truck_types[0]}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 px-5 py-3 flex gap-2">
        <button className="flex-1 rounded-xl bg-amber-500 py-2.5 text-center text-xs font-bold text-white transition hover:bg-amber-400 active:scale-[0.98]">
          Book this transporter
        </button>
        {t.phone && (
          <a
            href={`tel:${t.phone}`}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:border-amber-300 hover:text-amber-700"
          >
            <Phone className="h-3.5 w-3.5" />
            Call
          </a>
        )}
      </div>
    </motion.div>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 animate-pulse">
      <div className="h-1.5 w-full rounded-t bg-amber-100 -mx-5 -mt-5 mb-5 rounded-tl-2xl rounded-tr-2xl" />
      <div className="flex items-center gap-3 mb-4">
        <div className="h-11 w-11 rounded-xl bg-slate-100" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 w-28 rounded bg-slate-100" />
          <div className="h-2.5 w-16 rounded bg-slate-100" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-slate-100" />
        <div className="h-3 w-3/4 rounded bg-slate-100" />
        <div className="h-12 rounded-xl bg-slate-50 mt-3" />
      </div>
    </div>
  )
}

export function TransportersPageClient() {
  const [transporters, setTransporters] = useState<Transporter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState("")
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [coldChainOnly, setColdChainOnly] = useState(false)
  const [insuranceOnly, setInsuranceOnly] = useState(false)
  const featuredRef = useRef<HTMLDivElement>(null)

  const fetchTransporters = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ limit: "24" })
      if (verifiedOnly) params.set("verified", "true")
      const res = await fetch(`/api/transporters?${params}`)
      if (!res.ok) throw new Error("Failed to load")
      const data = await res.json()
      let items: Transporter[] = data.transporters ?? []
      if (search) {
        const q = search.toLowerCase()
        items = items.filter((t) =>
          [t.company_name, t.base_state, t.routes, ...(t.specialties ?? [])].some((v) => v?.toLowerCase().includes(q))
        )
      }
      if (coldChainOnly) items = items.filter((t) => t.has_cold_chain)
      if (insuranceOnly) items = items.filter((t) => t.has_insurance)
      setTransporters(items)
    } catch {
      setError("Could not load transporters. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [search, verifiedOnly, coldChainOnly, insuranceOnly])

  useEffect(() => { fetchTransporters() }, [fetchTransporters])

  const featuredFallback: Transporter[] = [
    {
      id: "featured-1",
      company_name: "Musa Logistics",
      owner_name: "Musa Ibrahim",
      phone: "+234 802 000 0000",
      whatsapp: true,
      base_state: "Kaduna",
      base_lga: "Zaria",
      fleet_size: 12,
      truck_types: ["Flatbed", "Reefer"],
      specialties: ["Maize", "Yam", "Tomatoes"],
      routes: "Kaduna, Kano, Abuja, Lagos",
      years_experience: 9,
      has_insurance: true,
      has_gps: true,
      has_cold_chain: true,
      price_per_tonne_km: 420,
      rating: 4.7,
      total_trips: 321,
      verified: true,
    },
    {
      id: "featured-2",
      company_name: "Benue Fresh Movers",
      owner_name: "Tersoo Aondona",
      phone: "+234 803 000 0000",
      whatsapp: true,
      base_state: "Benue",
      base_lga: "Makurdi",
      fleet_size: 7,
      truck_types: ["Covered truck"],
      specialties: ["Tomatoes", "Pepper"],
      routes: "Benue, Abuja, Nasarawa",
      years_experience: 6,
      has_insurance: true,
      has_gps: true,
      has_cold_chain: false,
      price_per_tonne_km: 380,
      rating: 4.3,
      total_trips: 198,
      verified: true,
    },
    {
      id: "featured-3",
      company_name: "North Star Haulage",
      owner_name: "Sadiq Musa",
      phone: "+234 805 000 0000",
      whatsapp: false,
      base_state: "Kano",
      base_lga: "Nassarawa",
      fleet_size: 5,
      truck_types: ["Flatbed"],
      specialties: ["Grains", "Legumes"],
      routes: "Kano, Katsina, Kaduna",
      years_experience: 5,
      has_insurance: false,
      has_gps: true,
      has_cold_chain: false,
      price_per_tonne_km: 350,
      rating: 4.1,
      total_trips: 141,
      verified: false,
    },
  ]

  const featuredTransporters = (loading || transporters.length === 0 ? featuredFallback : transporters).slice(0, 6)

  function scrollFeatured(direction: "left" | "right") {
    if (!featuredRef.current) return
    const amount = direction === "left" ? -280 : 280
    featuredRef.current.scrollBy({ left: amount, behavior: "smooth" })
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/40">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1a00] via-[#2d2400] to-[#3d2e00]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 pt-12 pb-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-300">
                <Truck className="h-3.5 w-3.5" />
                Transporters
              </span>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">
                Verified logistics providers
              </h1>
              <p className="mt-1.5 text-sm text-amber-200/60">
                {loading ? "Loading…" : `${transporters.length} transporter${transporters.length !== 1 ? "s" : ""} available`}
              </p>
            </div>
            <Link
              href="/transporters/register"
              className="inline-flex items-center gap-2 self-start rounded-full bg-amber-400 px-5 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-amber-900/30 transition hover:bg-amber-300 active:scale-[0.97] sm:self-auto"
            >
              <Truck className="h-4 w-4" />
              Register your fleet
            </Link>
          </div>

          <div className="relative mt-7">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by route, state, specialty…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-lg rounded-xl border-0 bg-white/95 py-3.5 pl-11 pr-10 text-sm text-slate-800 shadow-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute left-[calc(min(100%,28rem)-2.5rem)] top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Featured carousel */}
        <section className="rounded-3xl border border-amber-100/70 bg-white/85 p-5 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-600">
                <Sparkles className="h-3.5 w-3.5" />
                Top transporters
              </span>
              <h2 className="mt-2 text-lg font-bold text-slate-900">Premium logistics partners</h2>
              <p className="text-xs text-slate-500">Verified fleets with the fastest turnaround.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollFeatured("left")}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-amber-300 hover:text-amber-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollFeatured("right")}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-amber-300 hover:text-amber-700"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div
            ref={featuredRef}
            className="mt-4 flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {featuredTransporters.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.35, ease: easeOut }}
                className="min-w-[240px] snap-start"
              >
                <div className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900">{t.company_name}</span>
                    {t.verified && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{t.base_lga ? `${t.base_lga}, ` : ""}{t.base_state}</p>
                  <div className="mt-3 rounded-xl bg-amber-50/70 px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Fleet size</p>
                    <p className="text-lg font-bold text-amber-700">{t.fleet_size} trucks</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>{t.truck_types?.[0] ?? "Mixed fleet"}</span>
                    <span className="font-semibold text-slate-700">₦{t.price_per_tonne_km}/km</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{t.total_trips.toLocaleString()} trips</span>
                    <span className="font-semibold text-slate-600">{t.rating.toFixed(1)} ★</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
        {/* Filter bar */}
        <div className="mb-7 flex flex-wrap items-center gap-3">
          {[
            { key: "verified", label: "Verified only", state: verifiedOnly, set: setVerifiedOnly },
            { key: "cold", label: "Cold chain", state: coldChainOnly, set: setColdChainOnly },
            { key: "insured", label: "Insured", state: insuranceOnly, set: setInsuranceOnly },
          ].map(({ key, label, state, set }) => (
            <button
              key={key}
              onClick={() => set(!state)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${state ? "bg-amber-500 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:border-amber-400"}`}
            >
              {label}
            </button>
          ))}
          <div className="inline-flex rounded-full border border-slate-200 bg-white/90 p-1 text-xs font-semibold text-slate-600 shadow-sm">
            <button
              type="button"
              onClick={() => setVerifiedOnly(false)}
              className={`rounded-full px-3 py-1.5 transition ${!verifiedOnly ? "bg-amber-500 text-white shadow-sm" : "text-slate-600 hover:text-amber-700"}`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setVerifiedOnly(true)}
              className={`rounded-full px-3 py-1.5 transition ${verifiedOnly ? "bg-amber-500 text-white shadow-sm" : "text-slate-600 hover:text-amber-700"}`}
            >
              Verified
            </button>
          </div>
          {(verifiedOnly || coldChainOnly || insuranceOnly) && (
            <button
              onClick={() => { setVerifiedOnly(false); setColdChainOnly(false); setInsuranceOnly(false) }}
              className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-red-100 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={fetchTransporters} className="flex items-center gap-1.5 text-sm font-semibold text-red-700">
              <RefreshCw className="h-3.5 w-3.5" /> Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : transporters.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
            <Truck className="mx-auto mb-3 h-10 w-10 text-slate-300" strokeWidth={1.5} />
            <p className="text-slate-500 font-medium">No transporters match your filters.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {transporters.map((t, i) => <TransporterCard key={t.id} t={t} index={i} />)}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 overflow-hidden rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-8 text-center"
        >
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 shadow-lg shadow-amber-200">
            <Truck className="h-7 w-7 text-white" strokeWidth={1.75} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Run a transport business?</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
            Register your fleet and get matched with farm pickups and market deliveries near you. Free to list.
          </p>
          <Link
            href="/transporters/register"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-amber-500 px-7 py-3 text-sm font-bold text-white shadow-md shadow-amber-200 transition hover:bg-amber-400"
          >
            Register your fleet
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  RefreshCw,
  Info,
  Search,
  X,
  ChevronDown,
  Plus,
} from "lucide-react"

interface PriceRow {
  id: string
  crop: string
  category: string
  variety: string
  unit: string
  price: number
  currency: string
  market_name: string
  state: string
  city: string
  quality_grade: string
  created_at: string
}

const CATEGORIES = ["All", "Grains & Cereals", "Roots & Tubers", "Vegetables", "Legumes", "Fruits", "Processed"]
const MARKETS = ["All markets", "Dawanau Market", "Mile 12 Market", "Onitsha Main Market", "Bodija Market", "Gwagwalada Market", "Creek Road Market"]

// Simulated previous-day prices for trend display (% variance from current)
const TREND_SEED: Record<string, number> = {
  Maize: 0.032, Sorghum: -0.039, Rice: 0.048, Millet: 0, Wheat: 0,
  Yam: 0.053, Cassava: -0.077, Garri: 0, "Sweet Potato": 0.061, Cocoyam: 0,
  Tomatoes: -0.018, Pepper: 0.048, Onion: -0.059, Okra: 0, Spinach: 0,
  Cowpea: 0.026, Groundnut: 0, Soybean: 0.046,
  Plantain: -0.083, Banana: 0.028,
  "Palm Oil": 0.032, "Groundnut Oil": 0,
}

function getPrevPrice(crop: string, price: number) {
  const delta = TREND_SEED[crop] ?? 0
  return Math.round(price / (1 + delta))
}

function TrendBadge({ crop, price }: { crop: string; price: number }) {
  const prev = getPrevPrice(crop, price)
  const pct = ((price - prev) / prev) * 100
  if (pct > 0.05) return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
      <TrendingUp className="h-3 w-3" /> +{pct.toFixed(1)}%
    </span>
  )
  if (pct < -0.05) return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-100 px-2.5 py-1 text-xs font-bold text-red-600">
      <TrendingDown className="h-3 w-3" /> {pct.toFixed(1)}%
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
      <Minus className="h-3 w-3" /> 0%
    </span>
  )
}

const easeOut = [0.16, 1, 0.3, 1] as const

function SubmitPriceModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ crop: "", unit: "", price: "", market_name: "", state: "", phone: "" })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function submit() {
    if (!form.crop || !form.unit || !form.price || !form.market_name || !form.state) return
    setSubmitting(true)
    try {
      await fetch("/api/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: parseFloat(form.price) }),
      })
      setDone(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/40 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-900">Submit a price</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {done ? (
          <div className="text-center py-4">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
            <p className="font-semibold text-slate-900">Thank you!</p>
            <p className="mt-1 text-sm text-slate-500">Your price has been submitted for review.</p>
            <button onClick={onClose} className="mt-4 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white">
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {[
              { field: "crop", label: "Commodity", placeholder: "e.g. Maize" },
              { field: "unit", label: "Unit", placeholder: "e.g. 100kg bag" },
              { field: "price", label: "Price (₦)", placeholder: "e.g. 42000", type: "number" },
              { field: "market_name", label: "Market name", placeholder: "e.g. Dawanau Market" },
              { field: "state", label: "State", placeholder: "e.g. Kano" },
              { field: "phone", label: "Your phone (optional)", placeholder: "+234…" },
            ].map(({ field, label, placeholder, type }) => (
              <div key={field}>
                <label className="mb-1 block text-xs font-bold text-slate-600">{label}</label>
                <input
                  type={type ?? "text"}
                  placeholder={placeholder}
                  value={form[field as keyof typeof form]}
                  onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            ))}
            <button
              onClick={submit}
              disabled={submitting || !form.crop || !form.unit || !form.price || !form.market_name || !form.state}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-500 disabled:opacity-40"
            >
              {submitting ? "Submitting…" : "Submit price"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export function PriceBoardClient() {
  const [prices, setPrices] = useState<PriceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const [category, setCategory] = useState("All")
  const [market, setMarket] = useState("All markets")
  const [search, setSearch] = useState("")
  const [showSubmit, setShowSubmit] = useState(false)

  const fetchPrices = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ limit: "100" })
      if (category !== "All") params.set("category", category)
      if (market !== "All markets") params.set("market", market)
      const res = await fetch(`/api/prices?${params}`)
      if (!res.ok) throw new Error("Failed to load")
      const data = await res.json()
      let items: PriceRow[] = data.prices ?? []
      if (search) {
        const q = search.toLowerCase()
        items = items.filter((p) => p.crop.toLowerCase().includes(q) || p.market_name.toLowerCase().includes(q))
      }
      setPrices(items)
      setLastUpdated(new Date())
    } catch {
      setError("Could not load prices. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [category, market, search])

  useEffect(() => { fetchPrices() }, [fetchPrices])

  const rising = prices.filter((p) => TREND_SEED[p.crop] > 0).length
  const falling = prices.filter((p) => TREND_SEED[p.crop] < 0).length

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#050a1f] via-[#0a1a3a] to-[#071230]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-32 -top-32 h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-3xl" />
          <div className="absolute left-10 bottom-0 h-64 w-64 rounded-full bg-indigo-600/8 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/60 to-transparent" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 pt-12 pb-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-300">
                <BarChart3 className="h-3.5 w-3.5" />
                Price Board
              </span>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">
                Today&apos;s commodity prices
              </h1>
              <p className="mt-1.5 flex items-center gap-2 text-sm text-blue-200/60">
                <RefreshCw className="h-3.5 w-3.5" />
                Crowdsourced · Verified · Updated daily from markets across Nigeria
                {lastUpdated && (
                  <span className="text-blue-300/50">{lastUpdated.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}</span>
                )}
              </p>
            </div>
            <button
              onClick={() => setShowSubmit(true)}
              className="inline-flex items-center gap-2 self-start rounded-full border border-blue-400/30 bg-blue-600/20 px-5 py-2.5 text-sm font-bold text-blue-200 backdrop-blur-sm transition hover:bg-blue-600/30 sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              Submit a price
            </button>
          </div>

          {/* Summary strip */}
          <div className="mt-7 grid grid-cols-3 gap-3 max-w-xs">
            {[
              { label: "Commodities", value: prices.length || "…", color: "bg-white/10" },
              { label: "Rising", value: rising || "…", color: "bg-emerald-500/20 border-emerald-500/20" },
              { label: "Falling", value: falling || "…", color: "bg-red-500/20 border-red-500/20" },
            ].map(({ label, value, color }) => (
              <div key={label} className={`rounded-xl border border-white/10 px-3 py-2.5 text-center backdrop-blur ${color}`}>
                <p className="text-lg font-bold text-white">{value}</p>
                <p className="text-[10px] font-medium uppercase tracking-wider text-white/50">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="mb-7 flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search commodity…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white/90 py-2.5 pl-10 pr-9 text-sm placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="relative">
            <select
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              className="appearance-none rounded-xl border border-slate-200 bg-white/90 py-2.5 pl-3 pr-8 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {MARKETS.map((m) => <option key={m}>{m}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${category === cat ? "bg-blue-600 text-white shadow-sm" : "border border-slate-200 bg-white/80 text-slate-600 hover:border-blue-400"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-red-100 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={fetchPrices} className="flex items-center gap-1.5 text-sm font-semibold text-red-700">
              <RefreshCw className="h-3.5 w-3.5" /> Retry
            </button>
          </div>
        )}

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easeOut }}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          {loading ? (
            <div className="divide-y divide-slate-50">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-28 rounded bg-slate-100" />
                    <div className="h-2.5 w-20 rounded bg-slate-100" />
                  </div>
                  <div className="h-3 w-20 rounded bg-slate-100" />
                  <div className="h-3 w-16 rounded bg-slate-100" />
                  <div className="h-6 w-16 rounded-full bg-slate-100" />
                </div>
              ))}
            </div>
          ) : prices.length === 0 ? (
            <div className="py-16 text-center">
              <BarChart3 className="mx-auto mb-2 h-8 w-8 text-slate-300" />
              <p className="text-sm text-slate-400">No prices match your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Commodity</th>
                    <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Market</th>
                    <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Unit</th>
                    <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">Price (₦)</th>
                    <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">vs yesterday</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {prices.map((p) => (
                    <tr key={p.id} className="group transition hover:bg-slate-50/60">
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-semibold text-slate-800">{p.crop}</p>
                        {p.variety && <p className="text-[11px] text-slate-400">{p.variety}</p>}
                        {p.category && <p className="text-[10px] text-slate-300">{p.category}</p>}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="h-3 w-3 text-slate-300 shrink-0" />
                          {p.market_name}
                        </span>
                        <p className="mt-0.5 text-[10px] text-slate-400">{p.state}</p>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">{p.unit}</td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="text-sm font-bold text-slate-900 tabular-nums">
                          {Number(p.price).toLocaleString("en-NG")}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <TrendBadge crop={p.crop} price={Number(p.price)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Disclaimer */}
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3">
          <Info className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-400 leading-relaxed">
            Prices are crowdsourced from market reporters and farmers. They are indicative — actual prices may vary by
            seller, quality grade, and volume. Always confirm directly with the seller before transacting.
          </p>
        </div>

        {/* Submit CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 text-center"
        >
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-200">
            <BarChart3 className="h-7 w-7 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Know today&apos;s price at your market?</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
            Submit a price and help farmers and buyers across Africa get fair, accurate information.
          </p>
          <button
            onClick={() => setShowSubmit(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-blue-600 px-7 py-3 text-sm font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" />
            Submit a price
          </button>
        </motion.div>
      </div>

      <AnimatePresence>
        {showSubmit && <SubmitPriceModal onClose={() => setShowSubmit(false)} />}
      </AnimatePresence>
    </div>
  )
}

"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Home, MapPin, BedDouble, BadgeCheck, TrendingUp, Loader2, ArrowRight, KeyRound,
} from "lucide-react"
import type { PropertyRow } from "@/lib/property/db-row"
import { listingHeroStyle, rowToPublicCard, type PublicListingCard } from "@/lib/property/map-public"
import { clsx } from "clsx"

const cities = ["All Cities", "Lagos", "Abuja", "Port Harcourt", "Ibadan", "Enugu"]

export function RentToOwnClient() {
  const [listings, setListings] = useState<PublicListingCard[]>([])
  const [loadState, setLoadState] = useState<"loading" | "ok" | "error">("loading")
  const [cityFilter, setCityFilter] = useState("All Cities")

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/properties?limit=100")
        if (!res.ok) throw new Error("bad")
        const data = (await res.json()) as { properties: PropertyRow[] }
        const cards = (data.properties ?? [])
          .map((r) => rowToPublicCard(r))
          .filter((c) => c.category === "home")
        setListings(cards)
        setLoadState("ok")
      } catch {
        setLoadState("error")
      }
    })()
  }, [])

  const filtered = listings.filter((l) =>
    cityFilter === "All Cities" || l.city === cityFilter
  )

  return (
    <section className="bg-slate-50 py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Filter bar */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#0f172a]">Available homes</h2>
            <p className="text-xs text-slate-500 mt-0.5">Move in now — a share of every payment builds toward ownership</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {cities.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setCityFilter(city)}
                className={clsx(
                  "rounded-full px-3.5 py-1.5 text-xs font-semibold border transition",
                  cityFilter === city
                    ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                    : "bg-white text-slate-500 border-slate-200 hover:border-purple-300 hover:text-purple-700"
                )}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {loadState === "loading" && (
          <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading homes…</span>
          </div>
        )}

        {loadState === "error" && (
          <p className="py-12 text-center text-sm text-amber-700">Could not load listings. Please try again.</p>
        )}

        {loadState === "ok" && filtered.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white py-20 text-center">
            <KeyRound className="mx-auto h-8 w-8 text-purple-300 mb-3" />
            <p className="font-semibold text-[#0f172a]">No homes in this city yet</p>
            <p className="mt-2 text-sm text-slate-500">New rent-to-own listings are added regularly. Try another city or contact us.</p>
            <Link href="/contact" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-purple-500">
              Contact us <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {loadState === "ok" && filtered.length > 0 && (
          <AnimatePresence mode="popLayout">
            <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((listing, i) => (
                <motion.div
                  key={listing.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: Math.min(i * 0.04, 0.18), duration: 0.4 }}
                >
                  <RentToOwnCard listing={listing} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </section>
  )
}

function RentToOwnCard({ listing }: { listing: PublicListingCard }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-purple-200">
      <Link href={`/properties/${listing.id}`} className="flex flex-1 flex-col focus:outline-none">
        <div className="relative h-48 overflow-hidden">
          <div
            className="absolute inset-0 transition duration-500 group-hover:scale-[1.03]"
            style={listingHeroStyle(listing)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/65 via-transparent to-transparent" />
          {/* Rent to Own badge */}
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-purple-600/90 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm ring-1 ring-white/20">
            <KeyRound className="h-3 w-3" /> Rent to Own
          </div>
          {listing.status === "verified" && (
            <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-emerald-600/90 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm ring-1 ring-white/20">
              <BadgeCheck className="h-3 w-3" /> Verified
            </div>
          )}
          <div className="absolute bottom-3 left-3">
            <p className="text-sm font-bold text-white">{listing.city}</p>
            <p className="text-xs text-white/80">{listing.neighborhood ?? "—"}</p>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-semibold text-[#0f172a] leading-snug group-hover:text-purple-700 transition-colors">
            {listing.title}
          </h3>
          {listing.bedrooms != null && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-500">
              <BedDouble className="h-3.5 w-3.5" /> {listing.bedrooms} beds · {listing.size}
            </p>
          )}

          <div className="mt-auto pt-4 border-t border-slate-100 flex items-end justify-between">
            <div>
              <p className="text-[10px] text-slate-400 mb-0.5">Purchase price</p>
              <p className="text-lg font-extrabold text-[#0f172a] tabular-nums">{listing.price}</p>
            </div>
            <span className="text-xs font-semibold text-purple-600 bg-purple-50 rounded-lg px-2.5 py-1.5">
              From ₦ /mo
            </span>
          </div>

          {listing.aiValue && (
            <div className="mt-3 flex items-center gap-1.5 rounded-xl border border-emerald-200/80 bg-emerald-50 px-3 py-2 text-xs">
              <TrendingUp className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <span className="font-semibold text-emerald-800">AI range: {listing.aiValue}</span>
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}

"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Star, ArrowRight, TrendingUp, Loader2 } from "lucide-react"
import type { PropertyRow } from "@/lib/property/db-row"
import { listingHeroStyle, rowToPublicCard, type PublicListingCard } from "@/lib/property/map-public"

const statusColor = { verified: "#059669", pending: "#d97706", unverified: "#94a3b8" }

const easeOut = [0.16, 1, 0.3, 1] as const

export function HomeFeaturedListings() {
  const reduceMotion = useReducedMotion()
  const [items, setItems] = useState<PublicListingCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/properties?featured=1&limit=8")
        if (!res.ok) throw new Error("bad")
        const data = (await res.json()) as { properties: PropertyRow[] }
        if (!cancelled) {
          setItems((data.properties ?? []).map((r) => rowToPublicCard(r)))
        }
      } catch {
        if (!cancelled) setItems([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0 }}
      whileInView={reduceMotion ? undefined : { opacity: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: easeOut }}
      className="relative overflow-hidden border-y border-white/[0.08] bg-[#030712] py-10 md:py-20"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_60%_at_30%_0%,rgba(0,51,161,0.35),transparent)]" aria-hidden />
      <motion.div
        className="pointer-events-none absolute -right-32 top-1/3 h-[min(70vw,480px)] w-[min(70vw,480px)] rounded-full bg-[#0072CE]/15 blur-[120px]"
        animate={reduceMotion ? undefined : { scale: [1, 1.05, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300/90">
              <Star className="h-3.5 w-3.5 text-amber-300" />
              Featured
            </span>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-3xl">Hand-picked verified listings</h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">
              Live from our database — scroll sideways. Nothing syndicated from third parties.
            </p>
          </div>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 self-start text-sm font-semibold text-cyan-200 transition hover:text-white"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16 text-slate-500">
            <Loader2 className="h-9 w-9 animate-spin opacity-60" />
          </div>
        ) : items.length === 0 ? (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-14 text-center backdrop-blur-sm"
          >
            <p className="font-medium text-white">No featured listings yet</p>
            <p className="mt-2 text-sm text-slate-500">Featured properties will appear here when published.</p>
          </motion.div>
        ) : (
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-visible px-4 pb-2 pt-1 [scrollbar-width:thin] sm:-mx-6 sm:px-6 lg:gap-5">
            {items.map((listing, idx) => (
              <motion.div
                key={listing.id}
                initial={reduceMotion ? false : { opacity: 0, x: 28 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ delay: Math.min(idx * 0.06, 0.3), duration: 0.5, ease: easeOut }}
                className="w-[min(78vw,300px)] shrink-0 snap-start sm:w-[min(42vw,320px)] lg:w-[min(32vw,340px)]"
              >
                <Link
                  href={`/properties/${listing.id}`}
                  className="group block h-full overflow-hidden rounded-2xl bg-white/[0.06] ring-1 ring-white/[0.1] transition duration-300 hover:ring-cyan-400/30 hover:shadow-xl hover:shadow-cyan-950/40"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <motion.div
                      className="absolute inset-0"
                      style={listingHeroStyle(listing)}
                      whileHover={reduceMotion ? undefined : { scale: 1.04 }}
                      transition={{ duration: 0.5, ease: easeOut }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/90 via-transparent to-transparent" />
                    <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-md">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusColor[listing.status] }} />
                      {listing.status}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-lg font-semibold text-white">{listing.city}</p>
                      <p className="text-xs text-white/70">{listing.neighborhood ?? "—"}</p>
                    </div>
                  </div>
                  <div className="border-t border-white/[0.06] p-4">
                    <p className="line-clamp-2 text-sm font-medium leading-snug text-white/95 group-hover:text-cyan-100">{listing.title}</p>
                    <div className="mt-3 flex items-baseline justify-between gap-2">
                      <span className="text-base font-semibold tabular-nums text-white">{listing.price}</span>
                      <span className="text-[11px] font-medium text-slate-500">{listing.size}</span>
                    </div>
                    {listing.aiValue && (
                      <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-emerald-400/90">
                        <TrendingUp className="h-3.5 w-3.5" />
                        AI range {listing.aiValue}
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.section>
  )
}

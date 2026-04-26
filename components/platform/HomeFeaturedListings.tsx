"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState, useCallback } from "react"
import { motion, useReducedMotion } from "framer-motion"
import {
  Star, ArrowRight, TrendingUp, Loader2,
  BedDouble, Bath, Maximize2, ChevronLeft, ChevronRight, BadgeCheck,
} from "lucide-react"
import type { PropertyRow } from "@/lib/property/db-row"
import { rowToPublicCard, type PublicListingCard } from "@/lib/property/map-public"

const statusColor = {
  verified: { dot: "#059669", bg: "bg-emerald-500/20", text: "text-emerald-300" },
  pending: { dot: "#d97706", bg: "bg-amber-500/20", text: "text-amber-300" },
  unverified: { dot: "#94a3b8", bg: "bg-slate-500/15", text: "text-slate-400" },
}

const easeOut = [0.16, 1, 0.3, 1] as const

type ExtendedCard = PublicListingCard & {
  images: string[]
  bedrooms?: number
  bathrooms?: number
}

function getImages(row: PropertyRow): string[] {
  if (!row.images) return []
  if (Array.isArray(row.images)) return (row.images as unknown[]).filter((u): u is string => typeof u === "string")
  if (typeof row.images === "string") { try { return JSON.parse(row.images as string) } catch { return [] } }
  return []
}

function toExtended(row: PropertyRow): ExtendedCard {
  return {
    ...rowToPublicCard(row),
    images: getImages(row),
    bedrooms: row.bedrooms ?? undefined,
    bathrooms: row.bathrooms ?? undefined,
  }
}

// ── Per-card image carousel ──────────────────────────────────────────────────
function CardImageCarousel({ images, title }: { images: string[]; title: string }) {
  const [idx, setIdx] = useState(0)
  const prev = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    setIdx((i) => (i - 1 + images.length) % images.length)
  }, [images.length])
  const next = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    setIdx((i) => (i + 1) % images.length)
  }, [images.length])

  if (!images.length) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-[#0033A1]/40 via-[#0f172a]/60 to-[#020617]/80" />
    )
  }

  return (
    <>
      <Image
        src={images[idx]}
        alt={title}
        fill
        className="object-cover transition-opacity duration-500"
        sizes="(max-width: 640px) 78vw, (max-width: 1024px) 42vw, 340px"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/90 via-[#020617]/20 to-transparent" />

      {images.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition hover:bg-black/70 z-10">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition hover:bg-black/70 z-10">
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-[52px] left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIdx(i) }}
                className={`h-1 rounded-full transition-all duration-300 ${i === idx ? "w-4 bg-white" : "w-1 bg-white/40"}`}
              />
            ))}
          </div>
        </>
      )}
    </>
  )
}

// ── Single card ───────────────────────────────────────────────────────────────
function ListingCard({ listing, idx, reduceMotion }: { listing: ExtendedCard; idx: number; reduceMotion: boolean | null }) {
  const st = statusColor[listing.status] ?? statusColor.unverified

  return (
    <motion.div
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
        {/* Image area */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <CardImageCarousel images={listing.images} title={listing.title} />

          {/* Status badge */}
          <div className={`absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur-md ${st.bg} ${st.text}`}>
            {listing.status === "verified"
              ? <BadgeCheck className="h-3 w-3" />
              : <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: st.dot }} />}
            {listing.status}
          </div>

          {/* City + neighbourhood overlay */}
          <div className="absolute bottom-3 left-3 right-3 z-10">
            <p className="text-base font-semibold text-white leading-tight">{listing.city}</p>
            {listing.neighborhood && <p className="text-xs text-white/65 mt-0.5">{listing.neighborhood}</p>}
          </div>
        </div>

        {/* Card body */}
        <div className="border-t border-white/[0.06] p-4">
          <p className="line-clamp-2 text-sm font-medium leading-snug text-white/95 group-hover:text-cyan-100 transition-colors">
            {listing.title}
          </p>

          {/* Bed / bath / size badges */}
          {(listing.bedrooms || listing.bathrooms || listing.sizeSqm) && (
            <div className="mt-2.5 flex flex-wrap gap-2">
              {listing.bedrooms != null && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-[11px] font-medium text-slate-300">
                  <BedDouble className="h-3 w-3 text-slate-400" />
                  {listing.bedrooms} bed{listing.bedrooms !== 1 ? "s" : ""}
                </span>
              )}
              {listing.bathrooms != null && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-[11px] font-medium text-slate-300">
                  <Bath className="h-3 w-3 text-slate-400" />
                  {listing.bathrooms} bath{listing.bathrooms !== 1 ? "s" : ""}
                </span>
              )}
              {listing.sizeSqm > 0 && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-[11px] font-medium text-slate-300">
                  <Maximize2 className="h-3 w-3 text-slate-400" />
                  {listing.size}
                </span>
              )}
            </div>
          )}

          {/* Price row */}
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <span className="text-base font-bold tabular-nums text-white">{listing.price}</span>
            {!listing.bedrooms && !listing.bathrooms && (
              <span className="text-[11px] font-medium text-slate-500">{listing.size}</span>
            )}
          </div>

          {/* AI valuation */}
          {listing.aiValue && (
            <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-medium text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5 shrink-0" />
              AI estimate {listing.aiValue}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

// ── Section ───────────────────────────────────────────────────────────────────
export function HomeFeaturedListings() {
  const reduceMotion = useReducedMotion()
  const [items, setItems] = useState<ExtendedCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/properties?featured=1&limit=8")
        if (!res.ok) throw new Error()
        const data = (await res.json()) as { properties: PropertyRow[] }
        if (!cancelled) setItems((data.properties ?? []).map(toExtended))
      } catch {
        if (!cancelled) setItems([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0 }}
      whileInView={reduceMotion ? undefined : { opacity: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: easeOut }}
      className="relative overflow-hidden border-y border-white/[0.08] bg-[#030712] py-14 md:py-20"
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
              <Star className="h-3.5 w-3.5 text-amber-300" fill="currentColor" />
              Featured
            </span>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Hand-picked verified listings
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">
              Live from our database — scroll to browse. Nothing syndicated from third parties.
            </p>
          </div>
          <Link href="/search" className="inline-flex items-center gap-2 self-start text-sm font-semibold text-cyan-200 transition hover:text-white">
            View all <ArrowRight className="h-4 w-4" />
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
            <p className="mt-2 text-sm text-slate-500">Featured properties will appear here once published.</p>
          </motion.div>
        ) : (
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-visible px-4 pb-3 pt-1 [scrollbar-width:thin] sm:-mx-6 sm:px-6 lg:gap-5">
            {items.map((listing, idx) => (
              <ListingCard key={listing.id} listing={listing} idx={idx} reduceMotion={reduceMotion} />
            ))}
          </div>
        )}
      </div>
    </motion.section>
  )
}

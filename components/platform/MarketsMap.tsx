"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import type { CityMarket, PropertyListing } from "@/lib/property/types"

function projectPoint(latitude: number, longitude: number) {
  // Rough projection for simple SVG-less panel map
  const x = ((longitude + 180) / 360) * 100
  const y = ((90 - latitude) / 180) * 100
  return { x, y }
}

export function MarketsMap({
  markets,
  listings,
}: {
  markets: CityMarket[]
  listings: PropertyListing[]
}) {
  const [activeMarketId, setActiveMarketId] = useState(markets[0]?.id ?? "")

  const activeMarket = markets.find((market) => market.id === activeMarketId) ?? markets[0]
  const relatedListings = useMemo(
    () => listings.filter((listing) => listing.citySlug === activeMarket?.slug),
    [listings, activeMarket?.slug]
  )

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="relative h-[460px] overflow-hidden rounded-2xl border border-black/10 bg-[#0d0d0d] shadow-[0_24px_54px_-34px_rgba(13,13,13,0.8)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(201,168,76,0.18),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(245,240,232,0.14),transparent_42%)]" />
        <div className="absolute inset-0">
          {markets.map((market) => {
            const point = projectPoint(market.latitude, market.longitude)
            const statusColor =
              market.status === "active" ? "bg-emerald-400" : market.status === "coming_soon" ? "bg-amber-300" : "bg-slate-400"
            return (
              <button
                key={market.id}
                type="button"
                onClick={() => setActiveMarketId(market.id)}
                className="group absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${point.x}%`, top: `${point.y}%` }}
              >
                <span className={`block h-3 w-3 rounded-full ring-2 ring-white/80 ${statusColor}`} />
                <span className="pointer-events-none absolute left-1/2 top-4 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-2 py-1 text-[11px] text-[#0d0d0d] shadow group-hover:block">
                  {market.flagEmoji} {market.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {activeMarket ? (
        <aside className="emz-gloss-card rounded-2xl bg-white p-5">
          <h3 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0d0d0d]">{activeMarket.flagEmoji} {activeMarket.name}</h3>
          <p className="mt-1 text-xs uppercase tracking-wider text-[#6b6560]">{activeMarket.status.replace("_", " ")}</p>

          <div className="mt-4 space-y-2 text-sm text-[#6b6560]">
            <p><strong className="text-[#0d0d0d]">Average rent:</strong> ${activeMarket.avgRentUsd.toLocaleString()}</p>
            <p><strong className="text-[#0d0d0d]">Average buy:</strong> ${activeMarket.avgBuyUsd.toLocaleString()}</p>
            <p><strong className="text-[#0d0d0d]">Security score:</strong> {activeMarket.securityScore}/100</p>
            <p><strong className="text-[#0d0d0d]">Commute score:</strong> {activeMarket.commuteScore}/100</p>
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#c9a84c]">Top sectors</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {activeMarket.topSectors.map((sector) => (
                <span key={sector} className="rounded-full bg-[#ede8de] px-2 py-1 text-[11px] text-[#6b6560]">{sector}</span>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#c9a84c]">Available listings</p>
            <ul className="mt-2 space-y-1 text-sm text-[#6b6560]">
              {relatedListings.slice(0, 4).map((listing) => (
                <li key={listing.id}>
                  {listing.title} · {listing.neighborhood}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#c9a84c]">Neighbourhood fit signals</p>
            <ul className="mt-2 space-y-1 text-sm text-[#6b6560]">
              <li>{relatedListings.filter((item) => item.moveInReady).length} move-in ready listings</li>
              <li>{relatedListings.filter((item) => item.verified).length} fully verified listings</li>
              <li>Average lifestyle score: {activeMarket.lifestyleScore}/100</li>
            </ul>
          </div>

          <Link
            href={`/contact?market=${encodeURIComponent(activeMarket.name)}&direction=General%20inquiry`}
            className="emz-pill-cta mt-5 inline-block rounded-full bg-[#0d0d0d] px-4 py-2 text-sm text-[#f5f0e8]"
          >
            Ready to move into {activeMarket.name}? Let&apos;s talk.
          </Link>
        </aside>
      ) : null}
    </div>
  )
}

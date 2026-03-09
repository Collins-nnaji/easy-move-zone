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
      <div className="relative h-[460px] overflow-hidden rounded-2xl border border-[#dbe4f0] bg-[#0b1020] shadow-[0_24px_54px_-34px_rgba(13,13,13,0.8)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?auto=format&fit=crop&w=1800&q=80"
          alt="City coverage map backdrop"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(96,165,250,0.34),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(20,184,166,0.3),transparent_42%)]" />
        <div className="absolute inset-0">
          {markets.map((market) => {
            const point = projectPoint(market.latitude, market.longitude)
            const statusColor =
              market.status === "active" ? "bg-emerald-300" : market.status === "coming_soon" ? "bg-amber-300" : "bg-slate-300"
            return (
              <button
                key={market.id}
                type="button"
                onClick={() => setActiveMarketId(market.id)}
                className="group absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${point.x}%`, top: `${point.y}%` }}
              >
                <span className={`block h-3.5 w-3.5 rounded-full ring-4 ring-white/20 ${statusColor}`} />
                <span className="pointer-events-none absolute left-1/2 top-5 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-[#0f172a] shadow group-hover:block">
                  {market.flagEmoji} {market.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {activeMarket ? (
        <aside className="emz-gloss-card rounded-2xl bg-white p-5">
          <h3 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a]">{activeMarket.flagEmoji} {activeMarket.name}</h3>
          <p className="mt-1 text-xs uppercase tracking-wider text-[#64748b]">{activeMarket.status.replace("_", " ")}</p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[#dbe4f0] bg-[#f8fbff] p-3 text-sm">
              <p className="text-xs text-[#64748b]">Avg rent</p>
              <p className="mt-1 font-semibold text-[#0f172a]">${activeMarket.avgRentUsd.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-[#dbe4f0] bg-[#f8fbff] p-3 text-sm">
              <p className="text-xs text-[#64748b]">Avg buy</p>
              <p className="mt-1 font-semibold text-[#0f172a]">${activeMarket.avgBuyUsd.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-[#dbe4f0] bg-[#f8fbff] p-3 text-sm">
              <p className="text-xs text-[#64748b]">Security</p>
              <p className="mt-1 font-semibold text-[#0f172a]">{activeMarket.securityScore}/100</p>
            </div>
            <div className="rounded-xl border border-[#dbe4f0] bg-[#f8fbff] p-3 text-sm">
              <p className="text-xs text-[#64748b]">Commute</p>
              <p className="mt-1 font-semibold text-[#0f172a]">{activeMarket.commuteScore}/100</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#155eef]">Top sectors</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {activeMarket.topSectors.map((sector) => (
                <span key={sector} className="rounded-full bg-[#eef4ff] px-2 py-1 text-[11px] text-[#155eef]">{sector}</span>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#155eef]">Available listings</p>
            <ul className="mt-2 space-y-1 text-sm text-[#64748b]">
              {relatedListings.slice(0, 4).map((listing) => (
                <li key={listing.id}>
                  {listing.title} · {listing.neighborhood}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#155eef]">Neighbourhood fit signals</p>
            <ul className="mt-2 space-y-1 text-sm text-[#64748b]">
              <li>{relatedListings.filter((item) => item.moveInReady).length} move-in ready listings</li>
              <li>{relatedListings.filter((item) => item.verified).length} fully verified listings</li>
              <li>Average lifestyle score: {activeMarket.lifestyleScore}/100</li>
            </ul>
          </div>

          <Link
            href={`/contact?market=${encodeURIComponent(activeMarket.name)}&direction=General%20inquiry`}
            className="emz-pill-cta mt-5 inline-block rounded-full px-4 py-2 text-sm font-semibold"
          >
            Ready to move into {activeMarket.name}? Let&apos;s talk.
          </Link>
        </aside>
      ) : null}
    </div>
  )
}

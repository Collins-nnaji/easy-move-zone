"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { getPrimaryListingImage } from "@/lib/property/media"
import type { CityMarket, PropertyListing } from "@/lib/property/types"

function projectPoint(latitude: number, longitude: number) {
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

  const relatedListings = useMemo(() => {
    if (!activeMarket) return []
    return listings
      .filter((listing) => listing.citySlug === activeMarket.slug)
      .sort((a, b) => {
        const scoreA = Number(a.verified) * 4 + Number(a.moveInReady) * 3 - a.priceUsd / 1000000
        const scoreB = Number(b.verified) * 4 + Number(b.moveInReady) * 3 - b.priceUsd / 1000000
        return scoreB - scoreA
      })
  }, [activeMarket, listings])

  const cityValueRows = useMemo(
    () =>
      markets
        .map((market) => {
          const cityListings = listings.filter((listing) => listing.citySlug === market.slug)
          const listingCount = cityListings.length
          const avgListingPrice = listingCount
            ? Math.round(cityListings.reduce((sum, listing) => sum + listing.priceUsd, 0) / listingCount)
            : market.avgBuyUsd
          const avgCommute = listingCount
            ? Math.round(cityListings.reduce((sum, listing) => sum + listing.commuteMinutes, 0) / listingCount)
            : market.commuteScore
          const readyToClose = cityListings.filter((listing) => listing.moveInReady).length
          const affordability = Math.max(0, 100 - market.avgBuyUsd / 3500)
          const valueScore = Math.round(
            market.securityScore * 0.28 +
              market.commuteScore * 0.22 +
              market.lifestyleScore * 0.25 +
              affordability * 0.25
          )

          return {
            market,
            listingCount,
            avgListingPrice,
            avgCommute,
            readyToClose,
            valueScore,
          }
        })
        .sort((a, b) => b.valueScore - a.valueScore),
    [listings, markets]
  )

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-5">
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
                market.status === "active"
                  ? "bg-emerald-300"
                  : market.status === "coming_soon"
                    ? "bg-amber-300"
                    : "bg-slate-300"
              const isActive = market.id === activeMarketId
              return (
                <button
                  key={market.id}
                  type="button"
                  onClick={() => setActiveMarketId(market.id)}
                  className="group absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${point.x}%`, top: `${point.y}%` }}
                >
                  <span
                    className={`block h-3.5 w-3.5 rounded-full ring-4 ${isActive ? "ring-white/50" : "ring-white/20"} ${statusColor}`}
                  />
                  <span className="pointer-events-none absolute left-1/2 top-5 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-[#0f172a] shadow group-hover:block">
                    {market.flagEmoji} {market.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <section className="emz-gloss-card rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a]">City value list</h3>
            <span className="rounded-full bg-[#0f172a] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
              Ranked
            </span>
          </div>
          <p className="mt-2 text-sm text-[#64748b]">
            Combined score for security, commute, lifestyle, and entry affordability.
          </p>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {cityValueRows.map((row, index) => {
              const isActive = row.market.id === activeMarketId
              return (
                <button
                  key={row.market.id}
                  type="button"
                  onClick={() => setActiveMarketId(row.market.id)}
                  className={`rounded-xl border p-3 text-left transition ${
                    isActive
                      ? "border-[#e0511f] bg-[#eaf1ff]"
                      : "border-[#dbe4f0] bg-white hover:border-[#bfd1f1] hover:bg-[#f8fbff]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#0f172a]">
                      #{index + 1} {row.market.flagEmoji} {row.market.name}
                    </p>
                    <span className="rounded-full bg-[#0f172a] px-2 py-0.5 text-[10px] font-semibold text-white">
                      {row.valueScore}/100
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#64748b]">
                    {row.listingCount} listings · avg ${row.avgListingPrice.toLocaleString()} · {row.avgCommute} mins
                  </p>
                  <p className="text-xs text-[#64748b]">{row.readyToClose} ready-to-close options</p>
                </button>
              )
            })}
          </div>
        </section>
      </div>

      {activeMarket ? (
        <aside className="emz-gloss-card rounded-2xl bg-white p-5">
          <h3 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a]">
            {activeMarket.flagEmoji} {activeMarket.name}
          </h3>
          <p className="mt-1 text-xs uppercase tracking-wider text-[#64748b]">
            {activeMarket.status.replace("_", " ")}
          </p>

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
            <p className="text-xs font-semibold uppercase tracking-wider text-[#e0511f]">Top sectors</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {activeMarket.topSectors.map((sector) => (
                <span key={sector} className="rounded-full bg-[#eef4ff] px-2 py-1 text-[11px] text-[#e0511f]">
                  {sector}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#e0511f]">High-fit opportunities</p>
            {relatedListings.length === 0 ? (
              <p className="mt-2 text-sm text-[#64748b]">No listing inventory currently available for this city.</p>
            ) : (
              <div className="mt-2 space-y-2">
                {relatedListings.slice(0, 4).map((listing) => (
                  <article key={listing.id} className="overflow-hidden rounded-xl border border-[#dbe4f0] bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getPrimaryListingImage(listing)}
                      alt={listing.title}
                      className="h-28 w-full object-cover"
                    />
                    <div className="p-2.5">
                      <h4 className="text-sm font-semibold text-[#0f172a]">{listing.title}</h4>
                      <p className="text-xs text-[#64748b]">{listing.neighborhood}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <span className="rounded-full bg-[#eaf1ff] px-2 py-0.5 text-[10px] text-[#e0511f]">
                          {listing.commuteMinutes} mins commute
                        </span>
                        <span className="rounded-full bg-[#e7f7f2] px-2 py-0.5 text-[10px] text-[#0f766e]">
                          {listing.schoolsNearby} schools
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between">
                        <p className="text-sm font-semibold text-[#0f172a]">${listing.priceUsd.toLocaleString()}</p>
                        <Link
                          href={`/contact?market=${listing.citySlug}&message=I%20need%20help%20with%20${encodeURIComponent(listing.title)}`}
                          className="text-xs font-semibold text-[#e0511f] hover:underline"
                        >
                          Get help
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#e0511f]">Neighbourhood fit signals</p>
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

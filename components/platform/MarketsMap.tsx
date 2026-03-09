"use client"

import type { CityMarket } from "@/lib/property/types"

function projectPoint(latitude: number, longitude: number) {
  // Rough projection for simple SVG-less panel map
  const x = ((longitude + 180) / 360) * 100
  const y = ((90 - latitude) / 180) * 100
  return { x, y }
}

export function MarketsMap({
  markets,
  activeMarketId,
  onSelectMarket,
}: {
  markets: CityMarket[]
  activeMarketId?: string
  onSelectMarket?: (marketId: string) => void
}) {
  const selectedId = activeMarketId ?? markets[0]?.id ?? ""

  return (
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
          const isActive = market.id === selectedId
          return (
            <button
              key={market.id}
              type="button"
              onClick={() => onSelectMarket?.(market.id)}
              className="group absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
            >
              <span className={`block h-3.5 w-3.5 rounded-full ring-4 ${isActive ? "ring-white/55" : "ring-white/20"} ${statusColor}`} />
              <span className="pointer-events-none absolute left-1/2 top-5 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-[#0f172a] shadow group-hover:block">
                {market.flagEmoji} {market.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

interface CatalogResponse {
  source: string
  destinations: Array<{ id: string; city: string; country: string; region: string }>
  inventory: {
    trips: Record<string, unknown[]>
    stays: Record<string, unknown[]>
    visaServices: Record<string, unknown[]>
  }
}

export function AdminCatalogClient() {
  const [data, setData] = useState<CatalogResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/admin/catalog")
      .then(async (res) => {
        if (!res.ok) throw new Error("forbidden")
        return res.json() as Promise<CatalogResponse>
      })
      .then(setData)
      .catch(() => setError("Unable to load catalog."))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading catalog…
      </div>
    )
  }
  if (error || !data) {
    return <div className="p-8 text-sm text-red-300">{error || "Failed to load."}</div>
  }

  const tripCount = Object.values(data.inventory.trips).flat().length
  const stayCount = Object.values(data.inventory.stays).flat().length
  const visaCount = Object.values(data.inventory.visaServices).flat().length

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-xl font-bold">Move catalog</h1>
      <p className="mt-1 text-sm text-white/50">
        Read-only view · source: <span className="font-semibold text-[#e0511f]">{data.source}</span>
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs text-white/40">Destinations</p>
          <p className="mt-1 text-2xl font-bold">{data.destinations.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs text-white/40">Trips + stays</p>
          <p className="mt-1 text-2xl font-bold">{tripCount + stayCount}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs text-white/40">Visa tiers</p>
          <p className="mt-1 text-2xl font-bold">{visaCount}</p>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {data.destinations.map((dest) => {
          const trips = data.inventory.trips[dest.id] ?? []
          const stays = data.inventory.stays[dest.id] ?? []
          return (
            <div key={dest.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-semibold">{dest.city}, {dest.country}</h2>
                <span className="text-xs text-white/40">{dest.id} · {dest.region}</span>
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-white/40">Trips ({trips.length})</p>
                  <ul className="mt-2 space-y-1 text-sm text-white/70">
                    {(trips as Array<{ provider?: string; route?: string; price?: string }>).slice(0, 5).map((t, i) => (
                      <li key={i}>{t.provider} — {t.route} ({t.price})</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-white/40">Stays ({stays.length})</p>
                  <ul className="mt-2 space-y-1 text-sm text-white/70">
                    {(stays as Array<{ name?: string; area?: string; price?: string }>).slice(0, 5).map((s, i) => (
                      <li key={i}>{s.name} · {s.area} ({s.price})</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

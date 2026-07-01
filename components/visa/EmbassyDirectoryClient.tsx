"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2, MapPin, Search } from "lucide-react"
import { fetchEmbassies } from "@/lib/visa/client"
import type { Embassy } from "@/lib/visa/types"

const MISSION_LABEL: Record<Embassy["missionType"], string> = {
  embassy: "Embassy",
  consulate: "Consulate",
  consulate_general: "Consulate General",
  visa_application_center: "Visa Application Center",
  trade_office: "Trade Office",
}

export function EmbassyDirectoryClient() {
  const [embassies, setEmbassies] = useState<Embassy[]>([])
  const [loading, setLoading] = useState(true)
  const [country, setCountry] = useState("")
  const [locatedIn, setLocatedIn] = useState("")

  function load(filters: { country?: string; locatedIn?: string }) {
    setLoading(true)
    fetchEmbassies(filters)
      .then(setEmbassies)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchEmbassies({}).then(setEmbassies).finally(() => setLoading(false))
  }, [])

  function onSearch(e: React.FormEvent) {
    e.preventDefault()
    load({ country: country || undefined, locatedIn: locatedIn || undefined })
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-[#e0511f]">Embassy directory</p>
        <h1 className="mt-2 text-2xl font-bold text-[#1b231e] sm:text-3xl">Find an embassy or consulate</h1>
        <p className="mt-2 text-sm text-[#4a5047]">
          Search by the country whose visa you need, and where you&apos;re currently based.
        </p>
      </div>

      <form onSubmit={onSearch} className="grid gap-3 rounded-2xl border border-[#e4dfd5] bg-white p-4 shadow-sm sm:grid-cols-[1fr_1fr_auto]">
        <input
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="Visa needed for (e.g. United Kingdom)"
          className="rounded-xl border border-[#e4dfd5] px-3 py-2 text-sm outline-none focus:border-[#e0511f]"
        />
        <input
          value={locatedIn}
          onChange={(e) => setLocatedIn(e.target.value)}
          placeholder="Located in (e.g. Nigeria)"
          className="rounded-xl border border-[#e4dfd5] px-3 py-2 text-sm outline-none focus:border-[#e0511f]"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e0511f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c8451a]"
        >
          <Search className="h-4 w-4" /> Search
        </button>
      </form>

      {loading ? (
        <div className="flex items-center gap-2 py-16 text-[#4a5047]">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading embassies…
        </div>
      ) : embassies.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#d8d2c6] p-8 text-center text-[#4a5047]">
          No embassies found for that search yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {embassies.map((e) => (
            <li key={e.id}>
              <Link
                href={`/embassies/${e.id}`}
                className="flex items-start gap-3 rounded-2xl border border-[#e4dfd5] bg-white p-5 shadow-sm hover:border-[#e0511f]"
              >
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#e0511f]" />
                <div>
                  <p className="font-semibold text-[#1b231e]">
                    {e.country} {MISSION_LABEL[e.missionType]} in {e.city}, {e.locatedInCountry}
                  </p>
                  {e.address ? <p className="text-sm text-[#4a5047]">{e.address}</p> : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

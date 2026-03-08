"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Building, Home, MapPin } from "lucide-react"
import { Button } from "@/components/ui/Button"

const EASE = [0.16, 1, 0.3, 1] as const

type City = "london" | "toronto" | "berlin" | "lisbon" | "manchester"

const LISTINGS = [
  { id: "h1", city: "london", neighborhood: "Croydon", type: "Studio", monthly: 1450, furnished: true, partnerVerified: true, nearTransit: true },
  { id: "h2", city: "toronto", neighborhood: "North York", type: "1 Bedroom", monthly: 2100, furnished: false, partnerVerified: true, nearTransit: true },
  { id: "h3", city: "berlin", neighborhood: "Neukolln", type: "Shared flat", monthly: 980, furnished: true, partnerVerified: false, nearTransit: true },
  { id: "h4", city: "lisbon", neighborhood: "Almada", type: "1 Bedroom", monthly: 1300, furnished: true, partnerVerified: true, nearTransit: false },
  { id: "h5", city: "manchester", neighborhood: "Salford", type: "Studio", monthly: 1100, furnished: false, partnerVerified: true, nearTransit: true },
]

function fmt(value: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(value)
}

export default function HousingSearchPage() {
  const [city, setCity] = React.useState<City | "all">("all")
  const [maxRent, setMaxRent] = React.useState(2200)
  const [furnishedOnly, setFurnishedOnly] = React.useState(false)

  const results = React.useMemo(() => {
    return LISTINGS
      .filter((x) => city === "all" || x.city === city)
      .filter((x) => x.monthly <= maxRent)
      .filter((x) => (furnishedOnly ? x.furnished : true))
      .sort((a, b) => a.monthly - b.monthly)
  }, [city, maxRent, furnishedOnly])

  return (
    <div className="min-h-screen pt-28 pb-24 px-6 bg-gradient-to-b from-white via-white to-black/[0.02]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-5">
          <Link href="/suite" className="inline-flex items-center gap-1.5 text-xs font-semibold text-black/70 hover:text-black transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Suite
          </Link>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="rounded-3xl border border-black/10 bg-white p-6 md:p-8 mb-6 shadow-[0_24px_56px_-34px_rgba(0,0,0,0.42)]"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.04] px-3 py-1.5 text-xs font-semibold text-black mb-3">
            <Home className="w-3.5 h-3.5" />
            Housing search + partner leads
          </div>
          <h1 className="display-title text-3xl md:text-5xl text-black mb-2">Find housing before you move</h1>
          <p className="text-black/70 max-w-3xl">
            Compare neighborhoods and shortlist partner-verified listings.
            This module generates real-estate lead opportunities for the platform.
          </p>
        </motion.section>

        <section className="grid lg:grid-cols-[0.85fr_1.15fr] gap-5 items-start">
          <aside className="rounded-2xl border border-black/10 bg-white p-5 lg:sticky lg:top-28">
            <h2 className="font-bold text-black mb-4">Search filters</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider font-semibold text-black/60 mb-2 block">City</label>
                <select value={city} onChange={(e) => setCity(e.target.value as City | "all")} className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm">
                  <option value="all">All cities</option>
                  <option value="london">London</option>
                  <option value="toronto">Toronto</option>
                  <option value="berlin">Berlin</option>
                  <option value="lisbon">Lisbon</option>
                  <option value="manchester">Manchester</option>
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs uppercase tracking-wider font-semibold text-black/60">Max monthly rent</label>
                  <span className="text-sm font-bold text-black">{fmt(maxRent)}</span>
                </div>
                <input type="range" min={700} max={3000} step={50} value={maxRent} onChange={(e) => setMaxRent(Number(e.target.value))} className="w-full accent-primary" />
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={furnishedOnly} onChange={(e) => setFurnishedOnly(e.target.checked)} />
                Furnished only
              </label>
            </div>
          </aside>

          <div className="space-y-3">
            {results.map((home, i) => (
              <motion.article
                key={home.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.26 }}
                className="rounded-2xl border border-black/10 bg-white p-5 shadow-[0_14px_30px_-24px_rgba(0,0,0,0.45)]"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="inline-flex items-center gap-1 text-xs text-black/60 mb-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {home.city.toUpperCase()} · {home.neighborhood}
                    </div>
                    <h3 className="font-bold text-black text-lg">{home.type}</h3>
                  </div>
                  <div className="text-lg font-bold text-black">{fmt(home.monthly)}/mo</div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs mb-4">
                  <span className="rounded-full bg-black/[0.05] border border-black/10 px-2.5 py-1">{home.furnished ? "Furnished" : "Unfurnished"}</span>
                  <span className="rounded-full bg-black/[0.05] border border-black/10 px-2.5 py-1">{home.nearTransit ? "Near transit" : "Transit medium"}</span>
                  <span className="rounded-full bg-black/[0.05] border border-black/10 px-2.5 py-1">{home.partnerVerified ? "Partner verified" : "Open market"}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button className="gap-2"><Building className="w-4 h-4" /> Send lead to partner</Button>
                  <Link href="/cost-of-living"><Button variant="outline" className="gap-2">Compare city costs</Button></Link>
                </div>
              </motion.article>
            ))}
            {results.length === 0 && (
              <div className="rounded-2xl border border-dashed border-black/20 bg-white p-8 text-center text-sm text-black/60">
                No homes match this filter right now.
              </div>
            )}
          </div>
        </section>

        <div className="mt-8 text-center">
          <Link href="/communities">
            <Button variant="outline" className="gap-2">Explore expat communities <ArrowRight className="w-4 h-4" /></Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

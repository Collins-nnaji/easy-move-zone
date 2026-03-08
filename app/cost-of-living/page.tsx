"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, BarChart3, Wallet } from "lucide-react"
import { Button } from "@/components/ui/Button"

const EASE = [0.16, 1, 0.3, 1] as const

const CITY_DATA = {
  lagos: { rent: 520, transport: 70, groceries: 220, utilities: 80, coworking: 110 },
  london: { rent: 1650, transport: 210, groceries: 380, utilities: 170, coworking: 240 },
  toronto: { rent: 1850, transport: 170, groceries: 360, utilities: 150, coworking: 220 },
  berlin: { rent: 1250, transport: 120, groceries: 300, utilities: 140, coworking: 190 },
  lisbon: { rent: 1150, transport: 95, groceries: 290, utilities: 130, coworking: 180 },
}

type CityKey = keyof typeof CITY_DATA
const CATEGORIES = ["rent", "transport", "groceries", "utilities", "coworking"] as const

function total(city: CityKey) {
  return CATEGORIES.reduce((sum, key) => sum + CITY_DATA[city][key], 0)
}

function fmtUSD(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value)
}

export default function CostOfLivingPage() {
  const [baseCity, setBaseCity] = React.useState<CityKey>("lagos")
  const [targetCity, setTargetCity] = React.useState<CityKey>("london")

  const baseTotal = total(baseCity)
  const targetTotal = total(targetCity)
  const delta = targetTotal - baseTotal
  const deltaPct = baseTotal ? Math.round((delta / baseTotal) * 100) : 0

  return (
    <div className="min-h-screen pt-28 pb-24 px-6 bg-gradient-to-b from-white via-white to-black/[0.02]">
      <div className="max-w-6xl mx-auto">
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
            <BarChart3 className="w-3.5 h-3.5" />
            Cost-of-living intelligence
          </div>
          <h1 className="display-title text-3xl md:text-5xl text-black mb-2">Compare city cost of living</h1>
          <p className="text-black/70 max-w-3xl">
            Contrast monthly living baskets to decide destination fit and prepare realistic relocation funding.
          </p>
        </motion.section>

        <section className="grid lg:grid-cols-[1fr_1fr] gap-5 mb-6">
          <article className="rounded-2xl border border-black/10 bg-white p-5">
            <div className="text-xs uppercase tracking-wider font-semibold text-black/55 mb-2">Base city</div>
            <select value={baseCity} onChange={(e) => setBaseCity(e.target.value as CityKey)} className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm mb-4">
              {Object.keys(CITY_DATA).map((city) => <option key={city} value={city}>{city.toUpperCase()}</option>)}
            </select>
            <div className="text-sm text-black/70">Monthly basket total</div>
            <div className="text-3xl font-bold text-black">{fmtUSD(baseTotal)}</div>
          </article>
          <article className="rounded-2xl border border-black/10 bg-black text-white p-5">
            <div className="text-xs uppercase tracking-wider font-semibold text-white/70 mb-2">Target city</div>
            <select value={targetCity} onChange={(e) => setTargetCity(e.target.value as CityKey)} className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm mb-4">
              {Object.keys(CITY_DATA).map((city) => <option key={city} value={city} className="text-black">{city.toUpperCase()}</option>)}
            </select>
            <div className="text-sm text-white/70">Monthly basket total</div>
            <div className="text-3xl font-bold text-white">{fmtUSD(targetTotal)}</div>
          </article>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-4 h-4 text-black" />
            <h2 className="font-bold text-black">Cost delta summary</h2>
          </div>
          <div className={`text-2xl font-bold ${delta >= 0 ? "text-black" : "text-secondary"}`}>
            {delta >= 0 ? "+" : ""}{fmtUSD(delta)} ({deltaPct >= 0 ? "+" : ""}{deltaPct}%)
          </div>
          <p className="text-sm text-black/65 mt-1">
            Estimated monthly difference moving from {baseCity.toUpperCase()} to {targetCity.toUpperCase()}.
          </p>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-5">
          <h2 className="font-bold text-black mb-4">Category breakdown</h2>
          <div className="space-y-3">
            {CATEGORIES.map((cat) => {
              const b = CITY_DATA[baseCity][cat]
              const t = CITY_DATA[targetCity][cat]
              const barWidth = Math.min(100, Math.round((Math.max(b, t) / 2200) * 100))
              return (
                <div key={cat} className="rounded-lg border border-black/10 bg-black/[0.02] p-3">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold uppercase tracking-wider text-black/60">{cat}</span>
                    <span className="text-black/70">{fmtUSD(b)} → {fmtUSD(t)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-black/10 overflow-hidden">
                    <div className="h-full bg-black" style={{ width: `${barWidth}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/calculator"><Button className="gap-2">Use in budget planner <ArrowRight className="w-4 h-4" /></Button></Link>
            <Link href="/housing-search"><Button variant="outline">Search housing</Button></Link>
          </div>
        </section>
      </div>
    </div>
  )
}

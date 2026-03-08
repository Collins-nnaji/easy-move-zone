"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Building2, ShieldCheck, Star, Truck } from "lucide-react"
import { Button } from "@/components/ui/Button"

const EASE = [0.16, 1, 0.3, 1] as const

type Region = "uk" | "canada" | "europe"
type MoveType = "student" | "family" | "digital-nomad" | "business"

interface Mover {
  id: string
  name: string
  regions: Region[]
  moveTypes: MoveType[]
  rating: number
  startsAtNaira: number
  insurance: "basic" | "standard" | "premium"
  storageDays: number
  visaSupport: boolean
}

const MOVERS: Mover[] = [
  { id: "m1", name: "Atlas Move Partners", regions: ["uk", "europe"], moveTypes: ["student", "family"], rating: 4.8, startsAtNaira: 850000, insurance: "premium", storageDays: 30, visaSupport: true },
  { id: "m2", name: "NomadShift Logistics", regions: ["uk", "canada"], moveTypes: ["digital-nomad", "business"], rating: 4.6, startsAtNaira: 690000, insurance: "standard", storageDays: 21, visaSupport: false },
  { id: "m3", name: "MapBridge Relocation", regions: ["canada", "europe"], moveTypes: ["student", "family", "business"], rating: 4.7, startsAtNaira: 980000, insurance: "premium", storageDays: 45, visaSupport: true },
  { id: "m4", name: "CityLane Movers", regions: ["uk", "canada", "europe"], moveTypes: ["student", "digital-nomad"], rating: 4.4, startsAtNaira: 540000, insurance: "basic", storageDays: 14, visaSupport: false },
]

function fmtN(value: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value)
}

export default function MovingCompaniesPage() {
  const [region, setRegion] = React.useState<Region>("uk")
  const [moveType, setMoveType] = React.useState<MoveType>("student")
  const [budgetCap, setBudgetCap] = React.useState<number>(1500000)

  const rows = React.useMemo(() => {
    return MOVERS
      .filter((m) => m.regions.includes(region))
      .filter((m) => m.moveTypes.includes(moveType))
      .filter((m) => m.startsAtNaira <= budgetCap)
      .sort((a, b) => b.rating - a.rating)
  }, [region, moveType, budgetCap])

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
            <Building2 className="w-3.5 h-3.5" />
            Moving company marketplace
          </div>
          <h1 className="display-title text-3xl md:text-5xl text-black mb-2">Compare moving companies</h1>
          <p className="text-black/70 max-w-3xl">
            Filter partner movers by route, move type, and budget to find the best relocation fit.
            This module powers affiliate and partner quote workflows.
          </p>
        </motion.section>

        <section className="grid lg:grid-cols-[0.85fr_1.15fr] gap-5 items-start">
          <div className="rounded-2xl border border-black/10 bg-white p-5 lg:sticky lg:top-28">
            <h2 className="font-bold text-black mb-4">Filter movers</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-black/60 uppercase tracking-wider mb-2 block">Destination</label>
                <div className="flex flex-wrap gap-2">
                  {(["uk", "canada", "europe"] as const).map((value) => (
                    <button key={value} onClick={() => setRegion(value)} className={`px-3 py-2 rounded-lg border text-xs font-semibold ${region === value ? "bg-black text-white border-black" : "border-black/15 text-black/70"}`}>
                      {value.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-black/60 uppercase tracking-wider mb-2 block">Move type</label>
                <div className="flex flex-wrap gap-2">
                  {(["student", "family", "digital-nomad", "business"] as const).map((value) => (
                    <button key={value} onClick={() => setMoveType(value)} className={`px-3 py-2 rounded-lg border text-xs font-semibold ${moveType === value ? "bg-black text-white border-black" : "border-black/15 text-black/70"}`}>
                      {value}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-black/60 uppercase tracking-wider">Budget cap</label>
                  <span className="text-sm font-bold text-black">{fmtN(budgetCap)}</span>
                </div>
                <input type="range" min={400000} max={2500000} step={50000} value={budgetCap} onChange={(e) => setBudgetCap(Number(e.target.value))} className="w-full accent-primary" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {rows.map((m, i) => (
              <motion.article
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.26 }}
                className="rounded-2xl border border-black/10 bg-white p-5 shadow-[0_14px_30px_-24px_rgba(0,0,0,0.45)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <h3 className="font-bold text-black text-lg">{m.name}</h3>
                  <div className="inline-flex items-center gap-1 text-xs font-semibold text-black/75">
                    <Star className="w-3.5 h-3.5 fill-black text-black" />
                    {m.rating}
                  </div>
                </div>
                <div className="grid sm:grid-cols-4 gap-2 text-xs mb-4">
                  <div className="rounded-lg border border-black/10 bg-black/[0.02] p-2">Starts at <span className="font-bold">{fmtN(m.startsAtNaira)}</span></div>
                  <div className="rounded-lg border border-black/10 bg-black/[0.02] p-2">Insurance <span className="font-bold">{m.insurance}</span></div>
                  <div className="rounded-lg border border-black/10 bg-black/[0.02] p-2">Storage <span className="font-bold">{m.storageDays} days</span></div>
                  <div className="rounded-lg border border-black/10 bg-black/[0.02] p-2">{m.visaSupport ? "Visa support included" : "No visa support"}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button className="gap-2"><Truck className="w-4 h-4" /> Request partner quote</Button>
                  <Link href="/calculator"><Button variant="outline" className="gap-2">Estimate total move cost</Button></Link>
                  <Button variant="outline" className="gap-2"><ShieldCheck className="w-4 h-4" /> View SLA</Button>
                </div>
              </motion.article>
            ))}
            {rows.length === 0 && (
              <div className="rounded-2xl border border-dashed border-black/20 bg-white p-8 text-center text-sm text-black/60">
                No movers match this filter set. Increase budget or change route/move type.
              </div>
            )}
          </div>
        </section>

        <div className="mt-8 text-center">
          <Link href="/housing-search">
            <Button variant="outline" className="gap-2">Continue to housing search <ArrowRight className="w-4 h-4" /></Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

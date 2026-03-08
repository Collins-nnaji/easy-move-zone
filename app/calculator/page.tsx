"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Calculator,
  Info,
  WalletCards,
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { fmtN } from "@/lib/mortgage"

const EASE = [0.16, 1, 0.3, 1] as const

const DESTINATION_PRESETS: Record<string, { visa: number; flight: number; shipping: number; firstMonth: number }> = {
  uk: { visa: 1_500_000, flight: 800_000, shipping: 400_000, firstMonth: 1_200_000 },
  canada: { visa: 2_200_000, flight: 1_100_000, shipping: 500_000, firstMonth: 1_500_000 },
  us: { visa: 1_800_000, flight: 900_000, shipping: 450_000, firstMonth: 1_800_000 },
  uae: { visa: 600_000, flight: 500_000, shipping: 350_000, firstMonth: 1_000_000 },
}

export default function CalculatorPage() {
  const [destination, setDestination] = React.useState<string>("")
  const [visaFee, setVisaFee] = React.useState(1_500_000)
  const [flight, setFlight] = React.useState(800_000)
  const [shipping, setShipping] = React.useState(400_000)
  const [firstMonth, setFirstMonth] = React.useState(1_200_000)
  const [misc, setMisc] = React.useState(200_000)

  React.useEffect(() => {
    if (destination && DESTINATION_PRESETS[destination]) {
      const p = DESTINATION_PRESETS[destination]
      setVisaFee(p.visa)
      setFlight(p.flight)
      setShipping(p.shipping)
      setFirstMonth(p.firstMonth)
    }
  }, [destination])

  const total = visaFee + flight + shipping + firstMonth + misc
  const breakdown = [
    { label: "Visa / application", value: visaFee },
    { label: "Flights", value: flight },
    { label: "Shipping / luggage", value: shipping },
    { label: "First month setup", value: firstMonth },
    { label: "Miscellaneous", value: misc },
  ]
  const largest = breakdown.reduce((max, item) => item.value > max.value ? item : max, breakdown[0])

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
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
                <Calculator className="w-3.5 h-3.5" /> Funding planner
              </div>
              <h1 className="display-title text-3xl md:text-5xl text-black mb-2">
                Relocation budget workspace
              </h1>
              <p className="text-black/70 text-sm md:text-base max-w-2xl">
                Platform-style cost modeling for travel and relocation. Tune assumptions and instantly view impact across core cost lanes.
              </p>
            </div>
            <div className="rounded-2xl border border-black/10 bg-black text-white p-5">
              <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-white/70 mb-2">
                <Activity className="w-3.5 h-3.5" />
                Budget status
              </div>
              <div className="text-3xl font-bold mb-1">{fmtN(total)}</div>
              <p className="text-xs text-white/70 mb-3">Current modeled relocation envelope.</p>
              <div className="rounded-lg border border-white/15 bg-white/[0.06] p-2.5 text-xs">
                Largest cost lane: <span className="font-semibold">{largest.label}</span>
              </div>
            </div>
          </div>
        </motion.section>

        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-5 items-start">
          <section className="space-y-5 rounded-2xl border border-black/10 bg-white p-5 md:p-6 shadow-[0_20px_46px_-35px_rgba(0,0,0,0.45)]">
            <div>
              <label className="text-sm font-bold mb-2 block">Destination preset (optional)</label>
              <div className="flex flex-wrap gap-2">
                {["", "uk", "canada", "us", "uae"].map((d) => (
                  <button
                    key={d || "none"}
                    onClick={() => setDestination(d)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${destination === d ? "bg-primary text-black border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
                  >
                    {d === "" ? "Custom" : d.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-black/10 bg-white p-5 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold">Visa / application fees</label>
                  <span className="text-sm font-bold text-primary">{fmtN(visaFee)}</span>
                </div>
                <input type="range" min={0} max={5_000_000} step={100_000} value={visaFee} onChange={(e) => setVisaFee(Number(e.target.value))} className="w-full accent-primary" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold">Flights</label>
                  <span className="text-sm font-bold text-primary">{fmtN(flight)}</span>
                </div>
                <input type="range" min={0} max={3_000_000} step={50_000} value={flight} onChange={(e) => setFlight(Number(e.target.value))} className="w-full accent-primary" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold">Shipping / luggage</label>
                  <span className="text-sm font-bold text-primary">{fmtN(shipping)}</span>
                </div>
                <input type="range" min={0} max={2_000_000} step={50_000} value={shipping} onChange={(e) => setShipping(Number(e.target.value))} className="w-full accent-primary" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold">First month (rent + deposit)</label>
                  <span className="text-sm font-bold text-primary">{fmtN(firstMonth)}</span>
                </div>
                <input type="range" min={0} max={5_000_000} step={100_000} value={firstMonth} onChange={(e) => setFirstMonth(Number(e.target.value))} className="w-full accent-primary" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold">Misc (health, setup, etc.)</label>
                  <span className="text-sm font-bold text-primary">{fmtN(misc)}</span>
                </div>
                <input type="range" min={0} max={1_000_000} step={50_000} value={misc} onChange={(e) => setMisc(Number(e.target.value))} className="w-full accent-primary" />
              </div>
            </div>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-28">
            <section className="rounded-2xl border border-black/10 bg-black text-white p-5">
              <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-white/70 mb-2">
                <WalletCards className="w-3.5 h-3.5" />
                Total envelope
              </div>
              <div className="text-4xl font-bold tabular-nums mb-2">{fmtN(total)}</div>
              <p className="text-xs text-white/70">Dynamic estimate based on your current assumptions.</p>
            </section>

            <section className="rounded-2xl border border-black/10 bg-white p-5">
              <h3 className="font-bold text-black mb-3">Cost breakdown</h3>
              <div className="space-y-2">
                {breakdown.map((item) => {
                  const pct = total ? Math.round((item.value / total) * 100) : 0
                  return (
                    <div key={item.label} className="rounded-lg border border-black/10 bg-black/[0.02] p-2.5">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-black/70">{item.label}</span>
                        <span className="font-semibold text-black">{pct}%</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-black/55">Amount</span>
                        <span className="font-semibold text-black">{fmtN(item.value)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-black/10 bg-white p-5">
              <h3 className="font-bold text-black mb-2">Quick actions</h3>
              <div className="space-y-2">
                <Link href="/qualify" className="flex items-center justify-between rounded-lg border border-black/12 bg-white px-3 py-2 text-sm text-black/80 hover:bg-black/[0.03]">
                  Run assessment <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/document-support" className="flex items-center justify-between rounded-lg border border-black/12 bg-white px-3 py-2 text-sm text-black/80 hover:bg-black/[0.03]">
                  Document support <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/suite" className="flex items-center justify-between rounded-lg border border-black/12 bg-white px-3 py-2 text-sm text-black/80 hover:bg-black/[0.03]">
                  Suite dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </section>
          </aside>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 items-center justify-center text-xs text-muted-foreground">
          <Info className="w-3.5 h-3.5" />
          We don&apos;t book flights, ship goods, or process visas. This is a planning tool only.
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-4">
          <Link href="/qualify">
            <Button className="gap-2">
              Check destination fit <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/suite">
            <Button variant="outline" className="gap-2">
              Open suite workspace
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

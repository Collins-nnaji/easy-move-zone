"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Calculator, ArrowRight, ArrowLeft, Info } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { fmtN } from "@/lib/mortgage"

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

  return (
    <div className="min-h-screen pt-28 pb-24 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-5">
          <Link href="/suite" className="inline-flex items-center gap-1.5 text-xs font-semibold text-black/70 hover:text-black transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Suite
          </Link>
        </div>
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4">
            <Calculator className="w-3.5 h-3.5" /> Cost of moving
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            Relocation <span className="gradient-text">budget</span> calculator
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Rough estimate for visa, flight, shipping, and first month. Adjust to your situation — we don&apos;t book or process anything.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="fintech-card p-5">
            <label className="text-sm font-bold mb-2 block">Destination preset (optional)</label>
            <div className="flex flex-wrap gap-2">
              {["", "uk", "canada", "us", "uae"].map((d) => (
                <button
                  key={d || "none"}
                  onClick={() => setDestination(d)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    destination === d ? "bg-primary text-black border-primary" : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {d === "" ? "Custom" : d.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="fintech-card p-5 space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold">Visa / application fees</label>
                <span className="text-sm font-bold text-primary">{fmtN(visaFee)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={5_000_000}
                step={100_000}
                value={visaFee}
                onChange={(e) => setVisaFee(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold">Flights</label>
                <span className="text-sm font-bold text-primary">{fmtN(flight)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={3_000_000}
                step={50_000}
                value={flight}
                onChange={(e) => setFlight(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold">Shipping / luggage</label>
                <span className="text-sm font-bold text-primary">{fmtN(shipping)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={2_000_000}
                step={50_000}
                value={shipping}
                onChange={(e) => setShipping(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold">First month (rent + deposit)</label>
                <span className="text-sm font-bold text-primary">{fmtN(firstMonth)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={5_000_000}
                step={100_000}
                value={firstMonth}
                onChange={(e) => setFirstMonth(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold">Misc (health, setup, etc.)</label>
                <span className="text-sm font-bold text-primary">{fmtN(misc)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={1_000_000}
                step={50_000}
                value={misc}
                onChange={(e) => setMisc(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </div>

          <div className="fintech-card p-6 border-primary/30 text-center">
            <div className="text-xs text-muted-foreground mb-1">Estimated total (₦)</div>
            <div className="text-4xl font-bold tabular-nums gradient-text">{fmtN(total)}</div>
            <p className="text-xs text-muted-foreground mt-2">Rough only — use official sources for real costs.</p>
          </div>

          <div className="flex flex-wrap gap-2 items-center justify-center text-xs text-muted-foreground">
            <Info className="w-3.5 h-3.5" />
            We don&apos;t book flights, ship goods, or process visas. This is a planning tool only.
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
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
        </motion.div>
      </div>
    </div>
  )
}

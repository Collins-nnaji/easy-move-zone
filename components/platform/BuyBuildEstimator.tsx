"use client"

import { useMemo, useState } from "react"
import {
  FINISH_TIERS,
  type FinishTierId,
  estimateBuildCost,
  formatNgn,
} from "@/lib/search/buy-build-estimate"
import { Hammer, Info, Landmark } from "lucide-react"

type Props = {
  /** Land / plot cost in NGN (basis for comparison) */
  landPriceNgn: number
  onLandPriceChange: (value: number) => void
  cityLabel?: string
  /** Lowest verified home in same city for rough comparison */
  comparableHome?: { priceNgn: number; title: string }
}

export function BuyBuildEstimator({
  landPriceNgn,
  onLandPriceChange,
  cityLabel,
  comparableHome,
}: Props) {
  const [builtSqm, setBuiltSqm] = useState(220)
  const [tier, setTier] = useState<FinishTierId>("standard")

  const build = useMemo(() => estimateBuildCost(builtSqm, tier), [builtSqm, tier])
  const totalLow = landPriceNgn + build.low
  const totalHigh = landPriceNgn + build.high

  const comparison =
    comparableHome && comparableHome.priceNgn > 0
      ? {
          cheaper:
            totalHigh < comparableHome.priceNgn
              ? ("project" as const)
              : totalLow > comparableHome.priceNgn
                ? ("ready" as const)
                : ("overlap" as const),
        }
      : null

  return (
    <div className="rounded-2xl border border-[#0072CE]/25 bg-gradient-to-br from-[#030712] via-[#0f172a] to-[#020617] p-5 text-white shadow-xl shadow-[#0033A1]/20 ring-1 ring-white/10">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0072CE]/20 text-cyan-200">
          <Hammer className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold leading-tight">Buy &amp; build — cost outlook</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            Indicative totals: land plus construction. Not a quote — use for direction only; actual costs depend on design,
            soil, and contractor.
          </p>
        </div>
      </div>

      {cityLabel && (
        <p className="mt-4 flex items-center gap-1.5 text-xs font-medium text-[#93c5fd]">
          <Landmark className="h-3.5 w-3.5" />
          {cityLabel}
        </p>
      )}

      <div className="mt-4 space-y-3">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Land cost (₦)</label>
        <input
          type="number"
          min={0}
          step={500_000}
          value={Number.isFinite(landPriceNgn) ? landPriceNgn : 0}
          onChange={(e) => onLandPriceChange(Number(e.target.value) || 0)}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm font-semibold text-white placeholder:text-slate-500 focus:border-[#0072CE]/50 focus:outline-none focus:ring-2 focus:ring-[#0072CE]/20"
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Planned built area (sqm)</label>
          <input
            type="number"
            min={50}
            max={2000}
            step={10}
            value={builtSqm}
            onChange={(e) => setBuiltSqm(Math.max(50, Number(e.target.value) || 50))}
            className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm font-semibold text-white focus:border-[#0072CE]/50 focus:outline-none focus:ring-2 focus:ring-[#0072CE]/20"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Construction finish</label>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value as FinishTierId)}
            className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm font-semibold text-white focus:border-[#0072CE]/50 focus:outline-none focus:ring-2 focus:ring-[#0072CE]/20"
          >
            {(Object.keys(FINISH_TIERS) as FinishTierId[]).map((id) => (
              <option key={id} value={id} className="bg-[#0f172a] text-white">
                {FINISH_TIERS[id].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-2 text-[11px] text-slate-500">{FINISH_TIERS[tier].description}</p>

      <div className="mt-5 space-y-2 rounded-xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Construction (indicative)</span>
          <span className="font-semibold text-slate-200">
            {formatNgn(build.low)} – {formatNgn(build.high)}
          </span>
        </div>
        <div className="flex justify-between border-t border-white/10 pt-2 text-sm">
          <span className="font-semibold text-slate-300">Total project range</span>
          <span className="text-lg font-bold tabular-nums text-emerald-300">
            {formatNgn(totalLow)} – {formatNgn(totalHigh)}
          </span>
        </div>
      </div>

      {comparableHome && comparison && (
        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2.5 text-xs leading-relaxed text-amber-100/95">
          <p className="font-semibold text-amber-200">vs ready-built in {cityLabel ?? "this city"}</p>
          <p className="mt-1 text-amber-100/85">
            From catalogue: <span className="font-semibold">{comparableHome.title}</span> at{" "}
            <span className="font-semibold">{formatNgn(comparableHome.priceNgn)}</span>
          </p>
          {comparison.cheaper === "project" && (
            <p className="mt-1.5 text-[11px]">Your buy-and-build range may sit below that ready-built price at the high finish — run real quotes.</p>
          )}
          {comparison.cheaper === "ready" && (
            <p className="mt-1.5 text-[11px]">A similar ready-built home may cost less than your full project range — compare timelines and taste.</p>
          )}
          {comparison.cheaper === "overlap" && (
            <p className="mt-1.5 text-[11px]">Roughly in the same band as entry homes in this city — weigh customization vs speed.</p>
          )}
        </div>
      )}

      <p className="mt-4 flex items-start gap-2 text-[11px] text-slate-500">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
        Rates assume typical urban residential; Lagos/Abuja-style markets. Get structural drawings and BOQs before you commit.
      </p>
    </div>
  )
}

import type { Metadata } from "next"
import { PublicShell } from "@/components/platform/PublicShell"
import { LogisticsForm } from "@/components/platform/LogisticsForm"
import { Truck, ShieldCheck, Compass, PackageCheck } from "lucide-react"

export const metadata: Metadata = {
  title: "Logistics Booking Engine | EasyMoveZone",
  description: "Coordinate bulk residential, commercial, and industrial relocations securely.",
}

export default function LogisticsPage() {
  return (
    <PublicShell>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#020617] py-24 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(244,63,94,0.12),transparent)]" aria-hidden />
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-rose-500/25 bg-rose-500/10 px-4 py-1.5">
              <Truck className="h-4 w-4 text-rose-400" />
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-rose-300">LOGISTICS ENGINE</span>
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Move to your house{" "}
              <span className="bg-gradient-to-r from-rose-300 to-pink-300 bg-clip-text text-transparent">
                the cheapest way.
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-300">
              We help you relocate without the stress or the rip-off costs. Enjoy 100% transparent pricing, verified moving quality, and the most affordable rates in the market.
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="bg-slate-950 pb-24 pt-4">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <LogisticsForm />
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-t border-white/5 bg-[#020617] py-20 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Full Asset Tracking</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Continuous GPS relays mapping active truck locations across route milestones.</p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Goods In Transit</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Comprehensive insurance coverage tailored to declared inventory aggregates.</p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400">
                <PackageCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Verified Loaders</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Pre-vetted moving staff equipped with protective packaging supplies.</p>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  )
}

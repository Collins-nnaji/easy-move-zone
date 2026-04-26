import type { Metadata } from "next"
import Link from "next/link"
import { PublicShell } from "@/components/platform/PublicShell"
import {
  Zap, Sun, Lock, Droplets, ArrowRight, CheckCircle2, Wifi, ShieldCheck,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Solar & Smart Home Fit-outs | EasyMoveZone",
  description:
    "Move into a fully functional home from Day 1. Off-grid solar power, smart locks, and clean water — installed before you arrive.",
}

const packages = [
  {
    name: "Essential",
    icon: Sun,
    color: "from-yellow-400 to-orange-400",
    glow: "bg-yellow-400/15",
    price: "From ₦1.8M",
    features: [
      "3kW solar panel array",
      "5kWh lithium battery storage",
      "3-bed home coverage",
      "Basic smart inverter",
      "12-month warranty",
    ],
  },
  {
    name: "Premium",
    icon: Zap,
    color: "from-yellow-300 to-amber-500",
    glow: "bg-amber-400/20",
    price: "From ₦3.5M",
    features: [
      "6kW solar panel array",
      "10kWh lithium battery storage",
      "4–5 bed home + air conditioning",
      "Smart energy monitoring app",
      "Smart lock entry system",
      "24-month warranty",
    ],
    featured: true,
  },
  {
    name: "Full Smart Home",
    icon: Wifi,
    color: "from-amber-400 to-orange-600",
    glow: "bg-orange-500/15",
    price: "From ₦6M",
    features: [
      "10kW+ solar system",
      "20kWh battery bank",
      "Whole-home smart control",
      "CCTV + smart gate",
      "Water treatment unit",
      "Fibre broadband pre-wired",
      "36-month warranty",
    ],
  },
]

const addons = [
  { icon: Droplets, title: "Water Treatment", desc: "Borehole filtration and UV purification — clean, safe water independent of PHCN or tanker supply." },
  { icon: Lock, title: "Smart Security", desc: "Biometric smart locks, CCTV cameras, and perimeter alarm systems — all controllable from your phone." },
  { icon: ShieldCheck, title: "Backup Generator Integration", desc: "We integrate and auto-switch between solar, battery, and generator so your power is never interrupted." },
]

export default function UpgradePage() {
  return (
    <PublicShell>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0a0f1e] py-24 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_60%_0%,rgba(234,179,8,0.15),transparent)]" aria-hidden />
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-yellow-400/25 bg-yellow-400/10 px-4 py-1.5">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-300">UPGRADE</span>
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Move in on{" "}
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Day 1. Fully powered.
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-300 max-w-2xl">
              Don't inherit Nigeria's infrastructure problems. We install off-grid solar, smart security, and clean water systems before you arrive — so your new home works from the moment you unlock the door.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-8 py-4 text-base font-bold text-[#0a0f1e] shadow-xl shadow-yellow-900/30 transition hover:bg-yellow-300">
                Get a free assessment <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/search"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10">
                Browse upgrade-ready homes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="bg-[#f8fafc] py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-600">Solar packages</span>
            <h2 className="mt-3 text-3xl font-bold text-[#0f172a] sm:text-4xl">Power for every home size.</h2>
            <p className="mt-3 text-slate-500 text-base">All packages installed by NABCEP-certified technicians and include monitoring hardware.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {packages.map((pkg) => (
              <div key={pkg.name}
                className={`relative rounded-3xl border bg-white p-8 shadow-sm transition hover:shadow-lg ${pkg.featured ? "border-yellow-400 ring-2 ring-yellow-400/40" : "border-slate-100"}`}>
                {pkg.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-yellow-400 px-4 py-1 text-[11px] font-black uppercase tracking-wide text-[#0a0f1e]">
                    Most popular
                  </div>
                )}
                <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${pkg.color} text-white shadow-lg`}>
                  <pkg.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-[#0f172a]">{pkg.name}</h3>
                <p className="mt-1 text-2xl font-black text-[#0033A1]">{pkg.price}</p>
                <ul className="mt-5 space-y-2.5">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-yellow-500 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/contact"
                  className={`mt-8 block w-full rounded-xl py-3 text-center text-sm font-bold transition ${pkg.featured ? "bg-yellow-400 text-[#0a0f1e] hover:bg-yellow-300" : "border border-slate-200 text-[#0033A1] hover:border-[#0033A1]/40 hover:bg-slate-50"}`}>
                  Get this package
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="bg-[#0a0f1e] py-20 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-400">Add-ons</span>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Complete the picture.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {addons.map((a) => (
              <div key={a.title} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-7 hover:bg-white/[0.06] transition">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400/15 text-yellow-400">
                  <a.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{a.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#f8fafc] py-16">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-2xl font-bold text-[#0f172a] sm:text-3xl">Ready to upgrade your home?</h2>
          <p className="mt-3 text-slate-500">We'll assess your property and recommend the right package. Free consultation, no obligation.</p>
          <Link href="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-yellow-400 px-8 py-4 text-base font-bold text-[#0a0f1e] shadow-lg transition hover:bg-yellow-300">
            Book free assessment <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </PublicShell>
  )
}

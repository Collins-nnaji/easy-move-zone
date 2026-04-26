import type { Metadata } from "next"
import Link from "next/link"
import { PublicShell } from "@/components/platform/PublicShell"
import {
  ArrowLeftRight, ArrowRight, BadgeCheck, MapPin,
  Home, Handshake, TrendingUp, Users, PackageOpen,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Swap & Relocate | EasyMoveZone",
  description:
    "Changing city? We sell your current home, match you to an equivalent verified property in your new location, and manage the full relocation — one team, one process.",
}

const steps = [
  {
    icon: Home,
    title: "List your current home",
    desc: "We value and list your property on the EasyMoveZone platform. Title verification, photography, and pricing are handled in-house.",
  },
  {
    icon: MapPin,
    title: "Tell us where you're going",
    desc: "Share your destination city, budget, and property preferences. We search our verified inventory for the closest match.",
  },
  {
    icon: Handshake,
    title: "We coordinate both sides",
    desc: "Your dedicated relocation advisor manages the sale of your old home and the purchase or lease of your new one simultaneously — minimising the gap between moves.",
  },
  {
    icon: PackageOpen,
    title: "Move in, settled",
    desc: "We can arrange moving logistics, utility transfers, and an optional smart fit-out in your new home so you arrive to a fully functional property.",
  },
]

const faqs = [
  {
    q: "Do I have to buy outright in the new city?",
    a: "No. You can use the proceeds from your sale toward an outright purchase, or apply them to a mortgage, rent-to-own scheme, or build project in your new location.",
  },
  {
    q: "What if my current home sells faster than I find a new one?",
    a: "We stagger the timelines so you're never left without a property. In cases where a gap is unavoidable, we can arrange short-term bridging accommodation through our network.",
  },
  {
    q: "Is this available for Diaspora relocations back to Nigeria?",
    a: "Yes. We handle inbound relocations from the UK, US, and Canada. Payments and contracts can be managed remotely with full portal visibility.",
  },
  {
    q: "What cities do you cover?",
    a: "Lagos, Abuja, Port Harcourt, Ibadan, and Enugu are fully covered. Other cities are handled on request — contact us to check availability.",
  },
  {
    q: "What does the service cost?",
    a: "Our fee is a percentage of the sale price of your current home, agreed upfront. There are no hidden charges for the relocation matching or advisory service.",
  },
]

const whyUs = [
  { icon: BadgeCheck, text: "Single advisor manages both transactions — no handoff between agents" },
  { icon: TrendingUp, text: "In-house valuation so you price correctly from day one" },
  { icon: Users, text: "Diaspora-ready — remote signing, FX handling, overseas advisory calls" },
  { icon: MapPin, text: "Verified inventory in 5 cities means we can match fast" },
]

export default function SwapPage() {
  return (
    <PublicShell>
      {/* Hero */}
      <section className="bg-[#0a0f1e] py-24 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-rose-500/25 bg-rose-500/10 px-4 py-1.5">
                <ArrowLeftRight className="h-4 w-4 text-rose-400" />
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-rose-300">SWAP &amp; RELOCATE</span>
              </div>
              <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                Changing city?{" "}
                <span className="bg-gradient-to-r from-rose-300 to-pink-300 bg-clip-text text-transparent">
                  We handle both ends.
                </span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-slate-300">
                Sell your current home, get matched to an equivalent verified property in your new city, and move — all managed by one dedicated advisor. No juggling two agents across different markets.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-8 py-4 text-base font-bold text-white shadow-xl shadow-rose-900/30 transition hover:bg-rose-400"
                >
                  Start your relocation <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/search"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10"
                >
                  Browse destination homes
                </Link>
              </div>
            </div>

            {/* Stats panel */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
              <h3 className="mb-6 text-lg font-bold text-white">What's included</h3>
              <div className="space-y-4">
                {[
                  { label: "Sale of current home", value: "Full service", sub: "listing, valuation & title" },
                  { label: "Property matching", value: "Verified only", sub: "in your destination city" },
                  { label: "Advisory", value: "1 dedicated", sub: "advisor for both transactions" },
                  { label: "Relocation support", value: "Move-in ready", sub: "logistics & fit-out options" },
                ].map((s) => (
                  <div key={s.label} className="flex items-start justify-between gap-4 rounded-xl bg-white/[0.04] px-4 py-3">
                    <div>
                      <p className="text-xs text-slate-500">{s.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
                    </div>
                    <p className="shrink-0 text-base font-bold text-rose-300">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#f8fafc] py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-rose-600">How it works</span>
            <h2 className="mt-3 text-3xl font-bold text-[#0f172a] sm:text-4xl">Four steps to your new city.</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.title} className="relative rounded-2xl border border-slate-100 bg-white p-7 shadow-sm">
                <div className="absolute top-5 right-5 text-4xl font-black text-slate-50 select-none">0{i + 1}</div>
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                  <step.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-base font-bold text-[#0f172a]">{step.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why EMZ */}
      <section className="bg-[#0a0f1e] py-20 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-rose-400">Why EasyMoveZone</span>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">One team. Both cities.</h2>
              <p className="mt-4 text-base leading-relaxed text-slate-400">
                Most people relocating have to sell through one agent in their current city and buy through a completely different one in the new city. Different timelines, different incentives, no coordination. We fix that.
              </p>
            </div>
            <ul className="space-y-3">
              {whyUs.map((item) => (
                <li key={item.text} className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-5 py-4">
                  <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
                  <span className="text-sm text-slate-300">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#f8fafc] py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-[#0f172a]">Common questions.</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h3 className="mb-2 text-base font-bold text-[#0f172a]">{faq.q}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0a0f1e] py-16 text-white">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Ready to make the move?</h2>
          <p className="mt-3 text-slate-400">
            Tell us where you are and where you want to be — we'll take it from there.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-8 py-4 text-base font-bold text-white shadow-lg transition hover:bg-rose-400"
            >
              Talk to a relocation advisor <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10"
            >
              Browse destination homes
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  )
}

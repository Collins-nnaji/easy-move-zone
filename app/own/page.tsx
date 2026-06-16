import type { Metadata } from "next"
import Link from "next/link"
import { PublicShell } from "@/components/platform/PublicShell"
import { RentToOwnClient } from "@/components/platform/RentToOwnClient"
import {
  KeyRound, ArrowRight, CheckCircle2, TrendingUp,
  Home, Calendar, BadgeCheck, Users,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Rent to Own Homes | EasyMoveZone",
  description:
    "Move into a verified home as a tenant — a portion of every monthly payment builds toward your purchase price. Stop renting, start owning.",
}

const howItWorks = [
  {
    icon: BadgeCheck,
    title: "Choose a verified home",
    desc: "Browse our rent-to-own inventory — every property has passed full title verification and is ready to occupy.",
  },
  {
    icon: Calendar,
    title: "Move in as a tenant",
    desc: "Sign a lease-purchase agreement. Your monthly payment is split: market rent + equity contribution.",
  },
  {
    icon: TrendingUp,
    title: "Build equity every month",
    desc: "A fixed portion of each payment is credited to your purchase account. Watch your ownership stake grow in your portal.",
  },
  {
    icon: KeyRound,
    title: "Complete the purchase",
    desc: "After your agreed term (typically 3–7 years), exercise your option to buy at the locked-in price.",
  },
]

const faqs = [
  {
    q: "Is the purchase price locked at the start?",
    a: "Yes. The purchase price is agreed upfront in the lease-purchase contract and cannot change, regardless of how the market moves.",
  },
  {
    q: "What happens if I can't continue payments?",
    a: "We work with you first. If you need to exit, your accrued equity credits are returned after deducting any outstanding obligations.",
  },
  {
    q: "Do I need a mortgage to start?",
    a: "No. Rent-to-Own is specifically designed for people who don't yet qualify for a mortgage.",
  },
  {
    q: "Is this available to Diaspora buyers?",
    a: "Yes. Payments can be made in USD/GBP and converted at agreed rates. Your portal gives you full transparency from abroad.",
  },
]

export default function OwnPage() {
  return (
    <PublicShell>
      {/* Compact header — no photo */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 sm:py-10">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-md">
              <KeyRound className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-orange-600 mb-0.5">Rent to Own</p>
              <h1 className="text-2xl font-bold tracking-tight text-[#0f172a] sm:text-3xl">
                Stop renting. Start owning.
              </h1>
              <p className="mt-1.5 text-sm text-slate-500 max-w-xl">
                A portion of every monthly payment builds toward your purchase price. Move in now, own it later — no mortgage needed to start.
              </p>
            </div>
          </div>

          {/* Quick stats row */}
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              { label: "15–25%", sub: "of rent builds equity" },
              { label: "Locked price", sub: "agreed upfront" },
              { label: "3–7 years", sub: "flexible term" },
              { label: "No mortgage", sub: "to get started" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
                <p className="text-sm font-bold text-orange-700">{s.label}</p>
                <p className="text-[11px] text-slate-500">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Listings grid */}
      <RentToOwnClient />

      {/* How it works */}
      <section className="bg-[#f8fafc] py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">How it works</span>
            <h2 className="mt-3 text-2xl font-bold text-[#0f172a] sm:text-3xl">Four steps to ownership.</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((step, i) => (
              <div key={step.title} className="relative rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="absolute top-4 right-4 text-3xl font-black text-slate-50 select-none">0{i + 1}</div>
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                  <step.icon className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-sm font-bold text-[#0f172a] mb-1.5">{step.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="bg-[#0a0f1e] py-16 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">Who it's for</span>
              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Built for the mass market.</h2>
              <p className="mt-4 text-slate-400 text-sm leading-relaxed">
                Designed for people who earn steadily but haven't accumulated a mortgage deposit yet. Also ideal for Diaspora returnees who want to start building roots before they move back.
              </p>
            </div>
            <ul className="space-y-2.5">
              {[
                { icon: Users, text: "Young professionals — build ownership while paying what you'd pay in rent" },
                { icon: Home, text: "Families in rented accommodation — stop funding your landlord's asset" },
                { icon: TrendingUp, text: "Diaspora returnees — lock in today's price before you move back" },
                { icon: CheckCircle2, text: "People who don't qualify for a mortgage yet — build your credit profile while living in the property" },
              ].map((item) => (
                <li key={item.text} className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5">
                  <item.icon className="h-4 w-4 shrink-0 text-orange-400 mt-0.5" />
                  <span className="text-sm text-slate-300">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#f8fafc] py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-2xl font-bold text-[#0f172a]">Common questions.</h2>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-[#0f172a] mb-1.5">{faq.q}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0a0f1e] py-14 text-white">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Your next home is waiting.</h2>
          <p className="mt-3 text-sm text-slate-400">Browse verified homes on our Rent-to-Own programme or speak to an advisor.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/contact"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">
              Talk to an advisor
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  )
}

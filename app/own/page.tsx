import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { PublicShell } from "@/components/platform/PublicShell"
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
    desc: "After your agreed term (typically 3–7 years), exercise your option to buy at the locked-in price. Your equity credits reduce the final balance.",
  },
]

const faqs = [
  {
    q: "Is the purchase price locked at the start?",
    a: "Yes. The purchase price is agreed upfront in the lease-purchase contract and cannot change, regardless of how the market moves. You benefit from any appreciation.",
  },
  {
    q: "What happens if I can't continue payments?",
    a: "We work with you first. If you need to exit, your accrued equity credits are returned after deducting any outstanding obligations — you don't lose everything.",
  },
  {
    q: "Do I need a mortgage to start?",
    a: "No. Rent-to-Own is specifically designed for people who don't yet qualify for a mortgage. At the end of the term, you may need one for the final purchase — we help you prepare for that.",
  },
  {
    q: "Can I make improvements to the property?",
    a: "With written consent, yes. Any improvements add to the property value — which benefits you as the future owner.",
  },
  {
    q: "Is this available to Diaspora buyers?",
    a: "Yes. Payments can be made in USD/GBP and converted at agreed rates. Your portal gives you full transparency from abroad.",
  },
]

export default function OwnPage() {
  return (
    <PublicShell>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0a0f1e] py-24 text-white min-h-[560px]">
        {/* Real photo background */}
        <Image
          src="/emzheropic.png"
          alt="EMZ family outside their new home with moving truck"
          fill
          priority
          className="object-cover"
          style={{ objectPosition: "60% center" }}
          sizes="100vw"
        />
        {/* Dark overlay — heavier on left so text is readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f1e]/95 via-[#0a0f1e]/80 to-[#0a0f1e]/40" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0f1e]/60" aria-hidden />
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-purple-500/25 bg-purple-500/10 px-4 py-1.5">
                <KeyRound className="h-4 w-4 text-purple-400" />
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-purple-300">RENT TO OWN</span>
              </div>
              <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                Stop renting.{" "}
                <span className="bg-gradient-to-r from-purple-300 to-indigo-300 bg-clip-text text-transparent">
                  Start owning.
                </span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-slate-300">
                Traditional rent is money that disappears forever. With our Rent-to-Own programme, a portion of every monthly payment builds toward the purchase price. You live in the home now and own it later — no mortgage required to start.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/search?filter=rent-to-own"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-500 px-8 py-4 text-base font-bold text-white shadow-xl shadow-purple-900/30 transition hover:bg-purple-400">
                  Browse rent-to-own homes <ArrowRight className="h-5 w-5" />
                </Link>
                <Link href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10">
                  Talk to an advisor
                </Link>
              </div>
            </div>

            {/* Stats card */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
              <h3 className="text-lg font-bold text-white mb-6">Why Rent-to-Own beats regular renting</h3>
              <div className="space-y-4">
                {[
                  { label: "Monthly equity built", value: "15–25%", sub: "of your payment goes toward ownership" },
                  { label: "Purchase price", value: "Locked in", sub: "agreed upfront, never changes" },
                  { label: "Term length", value: "3–7 years", sub: "flexible to your financial timeline" },
                  { label: "Entry requirement", value: "No mortgage", sub: "needed to start the programme" },
                ].map((s) => (
                  <div key={s.label} className="flex items-start justify-between gap-4 rounded-xl bg-white/[0.04] px-4 py-3">
                    <div>
                      <p className="text-xs text-slate-500">{s.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
                    </div>
                    <p className="text-base font-bold text-purple-300 shrink-0">{s.value}</p>
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
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600">How it works</span>
            <h2 className="mt-3 text-3xl font-bold text-[#0f172a] sm:text-4xl">Four steps to ownership.</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((step, i) => (
              <div key={step.title} className="relative rounded-2xl border border-slate-100 bg-white p-7 shadow-sm">
                <div className="absolute top-5 right-5 text-4xl font-black text-slate-50 select-none">0{i + 1}</div>
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-500">
                  <step.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-[#0f172a] mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="bg-[#0a0f1e] py-20 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-purple-400">Who it's for</span>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Built for the mass market.</h2>
              <p className="mt-4 text-slate-400 text-base leading-relaxed">
                Rent-to-Own is designed for people who earn steadily but haven't accumulated a mortgage deposit yet, or who don't yet qualify for a bank loan. It's also ideal for Diaspora returnees who want to start building roots before they move back.
              </p>
            </div>
            <ul className="space-y-3">
              {[
                { icon: Users, text: "Young professionals — build ownership while paying what you'd pay in rent" },
                { icon: Home, text: "Families in rented accommodation — stop funding your landlord's asset" },
                { icon: TrendingUp, text: "Diaspora returnees — lock in today's price before you move back" },
                { icon: CheckCircle2, text: "People who don't qualify for a mortgage yet — build your credit profile while living in the property" },
              ].map((item) => (
                <li key={item.text} className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-5 py-4">
                  <item.icon className="h-5 w-5 shrink-0 text-purple-400 mt-0.5" />
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
                <h3 className="text-base font-bold text-[#0f172a] mb-2">{faq.q}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0a0f1e] py-16 text-white">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Your next home is waiting.</h2>
          <p className="mt-3 text-slate-400">Browse verified homes available on our Rent-to-Own programme — or speak to an advisor to understand your options.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/search?filter=rent-to-own"
              className="inline-flex items-center gap-2 rounded-2xl bg-purple-500 px-8 py-4 text-base font-bold text-white shadow-lg transition hover:bg-purple-400">
              Browse homes <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/contact"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10">
              Talk to an advisor
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  )
}

import type { Metadata } from "next"
import Link from "next/link"
import { PublicShell } from "@/components/platform/PublicShell"
import {
  Banknote, ArrowRight, CheckCircle2, Building2,
  Globe, Calculator, ShieldCheck, Clock,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Mortgage & NHF Financing | EasyMoveZone",
  description:
    "Access Bank, Stanbic IBTC, and Diaspora NHF loans brokered for you. Move in now, pay over 10–30 years at competitive rates.",
}

const partners = [
  { name: "Access Bank", type: "Commercial Mortgage", rate: "From 18% p.a.", term: "Up to 20 years", highlight: false },
  { name: "Stanbic IBTC", type: "Home Loan", rate: "From 17.5% p.a.", term: "Up to 20 years", highlight: true },
  { name: "First Bank", type: "FirstHome Loan", rate: "From 18% p.a.", term: "Up to 15 years", highlight: false },
  { name: "FMBN (NHF)", type: "National Housing Fund", rate: "6% p.a.", term: "Up to 30 years", highlight: false },
]

const steps = [
  { icon: Calculator, title: "Affordability check", desc: "We run a quick assessment of your income, liabilities, and credit profile to understand what you can comfortably borrow." },
  { icon: Building2, title: "Lender matching", desc: "We match your profile to the right lender — whether that's a commercial bank or the NHF — and present you with real offers." },
  { icon: ShieldCheck, title: "Application support", desc: "We prepare and submit your full application, chasing the bank on your behalf so nothing stalls in bureaucracy." },
  { icon: Clock, title: "Approval & drawdown", desc: "Once approved, we coordinate with your solicitor and the property seller for a smooth, fast completion." },
]

const diasporaPoints = [
  "UK, US, Canada, and EU income accepted",
  "Applications processed in GBP, USD, EUR",
  "No requirement to be in Nigeria during application",
  "Dedicated diaspora advisor assigned to your case",
  "NHF contributions accepted from abroad via FMBN portals",
  "Power of Attorney handled by our in-house legal team",
]

export default function FinancePage() {
  return (
    <PublicShell>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0a0f1e] py-24 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_60%_0%,rgba(16,185,129,0.15),transparent)]" aria-hidden />
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-1.5">
              <Banknote className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">FINANCE</span>
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Move in now.{" "}
              <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                Pay over 30 years.
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-300 max-w-2xl">
              Most Nigerians can't pay 100% cash for a home — that's why financing exists. We act as your mortgage broker, matching your profile to the best lender and handling the entire application so you can focus on picking your home.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/mortgage"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-8 py-4 text-base font-bold text-white shadow-xl shadow-emerald-900/30 transition hover:bg-emerald-400">
                Use the mortgage calculator <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10">
                Speak to a broker
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Partner lenders */}
      <section className="bg-[#f8fafc] py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Our lending partners</span>
            <h2 className="mt-3 text-3xl font-bold text-[#0f172a] sm:text-4xl">Tier-1 banks. Real rates.</h2>
            <p className="mt-3 text-slate-500">We have active relationships with Nigeria's leading mortgage lenders and the Federal Mortgage Bank of Nigeria.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {partners.map((p) => (
              <div key={p.name}
                className={`rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md ${p.highlight ? "border-emerald-400 ring-2 ring-emerald-400/30" : "border-slate-100"}`}>
                {p.highlight && (
                  <span className="mb-3 inline-block rounded-full bg-emerald-50 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">Top pick</span>
                )}
                <h3 className="text-lg font-bold text-[#0f172a]">{p.name}</h3>
                <p className="mt-1 text-xs text-slate-500">{p.type}</p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Interest rate</span>
                    <span className="font-bold text-[#0033A1]">{p.rate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Max term</span>
                    <span className="font-semibold text-[#0f172a]">{p.term}</span>
                  </div>
                </div>
                <Link href="/contact"
                  className="mt-5 block w-full rounded-xl border border-slate-200 py-2.5 text-center text-sm font-semibold text-[#0033A1] transition hover:border-[#0033A1]/30 hover:bg-slate-50">
                  Apply via us
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-slate-400">Rates shown are indicative. Actual rates depend on your profile and the lender's current offers. NHF rate of 6% requires prior contribution.</p>
        </div>
      </section>

      {/* Process */}
      <section className="bg-[#0a0f1e] py-20 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Our process</span>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">We do the hard work.</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.title} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 hover:bg-white/[0.06] transition">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Step {i + 1}</span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diaspora section */}
      <section className="bg-[#f8fafc] py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#0033A1]/20 bg-[#0033A1]/5 px-4 py-1.5 mb-5">
                <Globe className="h-4 w-4 text-[#0033A1]" />
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#0033A1]">Diaspora buyers</span>
              </div>
              <h2 className="text-3xl font-bold text-[#0f172a] sm:text-4xl">Buy from the UK, US, or Canada.</h2>
              <p className="mt-4 text-slate-500 text-base leading-relaxed">
                We specialise in helping Nigerians abroad finance a home back home. Your foreign income is accepted, and our diaspora team will handle every interaction with the bank, solicitor, and land registry so you never have to fly back just to sign a form.
              </p>
              <Link href="/contact"
                className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-[#0033A1] px-7 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#002880]">
                Talk to diaspora team <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ul className="space-y-3">
              {diasporaPoints.map((p) => (
                <li key={p} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
                  <span className="text-sm text-slate-600">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Calculator CTA */}
      <section className="bg-[#0a0f1e] py-16 text-white">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Know your numbers first.</h2>
          <p className="mt-3 text-slate-400">Use our mortgage calculator to see exactly what your monthly repayments would look like at different loan sizes and tenors.</p>
          <Link href="/mortgage"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-8 py-4 text-base font-bold text-white shadow-lg transition hover:bg-emerald-400">
            Open mortgage calculator <Calculator className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </PublicShell>
  )
}

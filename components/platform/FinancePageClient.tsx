"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import {
  Banknote, ArrowRight, CheckCircle2, Building2, Globe,
  Calculator, ShieldCheck, Clock, Sparkles, Landmark,
  Percent, Timer, TrendingUp, Users, FileStack, Shield,
  ChevronDown, ChevronUp,
} from "lucide-react"
import { useMemo, useState } from "react"
import { clsx } from "clsx"

const ease = [0.16, 1, 0.3, 1] as const

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" },
    transition: { duration: 0.55, delay, ease },
  } as const
}

/* ─── data ─────────────────────────────────────────────────── */
const partners = [
  {
    name: "Access Bank",
    type: "Commercial Mortgage",
    rate: "From 18% p.a.",
    term: "Up to 20 years",
    note: "Diaspora & commercial programmes",
    highlight: false,
    color: "from-orange-500/20 to-orange-600/5",
  },
  {
    name: "Stanbic IBTC",
    type: "Home Loan",
    rate: "From 17.5% p.a.",
    term: "Up to 20 years",
    note: "RSA-backed & home loans",
    highlight: true,
    color: "from-[#e0511f]/20 to-[#bf6a3c]/5",
  },
  {
    name: "First Bank",
    type: "FirstHome Loan",
    rate: "From 18% p.a.",
    term: "Up to 15 years",
    note: "HomeLoan Plus nationwide",
    highlight: false,
    color: "from-emerald-500/20 to-emerald-600/5",
  },
  {
    name: "FMBN (NHF)",
    type: "National Housing Fund",
    rate: "6% p.a.",
    term: "Up to 30 years",
    note: "Government-backed, lowest rate",
    highlight: false,
    color: "from-orange-500/20 to-orange-600/5",
  },
]

const steps = [
  {
    icon: Calculator,
    title: "Affordability check",
    desc: "We run a quick assessment of your income, liabilities, and credit profile to understand what you can comfortably borrow — including FX income for diaspora buyers.",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: Building2,
    title: "Lender matching",
    desc: "We match your profile to the right lender — NHF, commercial bank, or diaspora programme — and present you with real offers, not guesses.",
    color: "bg-orange-100 text-[#e0511f]",
  },
  {
    icon: ShieldCheck,
    title: "Application support",
    desc: "We prepare and submit your full application, following up with the bank so nothing stalls in bureaucracy. You just respond to our updates.",
    color: "bg-orange-100 text-orange-700",
  },
  {
    icon: Clock,
    title: "Approval & drawdown",
    desc: "Once approved, we coordinate with your solicitor and the property seller for a smooth, fast completion. For diaspora buyers, Power of Attorney is handled in-house.",
    color: "bg-orange-100 text-orange-600",
  },
]

const stats = [
  { icon: Percent,    value: "6%",       label: "NHF rate",        sub: "Lowest government pathway"      },
  { icon: Timer,      value: "30 yrs",   label: "Max tenor",       sub: "NHF / FMBN programmes"          },
  { icon: TrendingUp, value: "~70%",     label: "LTV available",   sub: "Typical NHF loan-to-value"      },
  { icon: Landmark,   value: "4 banks",  label: "Active partners", sub: "Commercial + government lenders" },
]

const diasporaPoints = [
  "UK, US, Canada, and EU income accepted",
  "Applications processed in GBP, USD, EUR",
  "No requirement to be in Nigeria during the process",
  "Dedicated diaspora advisor assigned to your case",
  "NHF contributions accepted from abroad via FMBN portals",
  "Power of Attorney handled by our in-house legal team",
]

/* ─── Mortgage calculator ───────────────────────────────────── */
function fmt(n: number) {
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(2)}M`
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n)
}

function MortgageCalculator() {
  const [price, setPrice]         = useState(50_000_000)
  const [downPct, setDownPct]     = useState(30)
  const [rate, setRate]           = useState(18)
  const [years, setYears]         = useState(20)

  const { monthly, principal, totalPaid, totalInterest } = useMemo(() => {
    const principal = price * (1 - downPct / 100)
    const r = rate / 100 / 12
    const n = years * 12
    const monthly = r === 0 ? principal / n : (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    return { monthly, principal, totalPaid: monthly * n, totalInterest: monthly * n - principal }
  }, [price, downPct, rate, years])

  const sliderCls = "w-full h-1.5 rounded-full appearance-none cursor-pointer bg-slate-200 accent-emerald-500 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:shadow-lg"
  const labelCls = "block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5"

  return (
    <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-lg shadow-slate-100">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 bg-emerald-50 px-6 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15">
          <Calculator className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">Mortgage Calculator</p>
          <p className="text-[11px] text-slate-500">Adjust the sliders to estimate your repayments</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
        {/* Inputs */}
        <div className="p-6 space-y-6">
          {/* Property price */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className={labelCls} style={{ marginBottom: 0 }}>Property price</label>
              <span className="text-sm font-bold text-emerald-600">{fmt(price)}</span>
            </div>
            <input type="range" min={5_000_000} max={500_000_000} step={5_000_000}
              value={price} onChange={e => setPrice(Number(e.target.value))} className={sliderCls} />
            <div className="flex justify-between mt-1 text-[10px] text-slate-400">
              <span>₦5M</span><span>₦500M</span>
            </div>
          </div>

          {/* Down payment */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className={labelCls} style={{ marginBottom: 0 }}>Down payment</label>
              <span className="text-sm font-bold text-slate-700">{downPct}% · {fmt(price * downPct / 100)}</span>
            </div>
            <input type="range" min={10} max={60} step={5}
              value={downPct} onChange={e => setDownPct(Number(e.target.value))} className={sliderCls} />
            <div className="flex justify-between mt-1 text-[10px] text-slate-400">
              <span>10%</span><span>60%</span>
            </div>
          </div>

          {/* Interest rate */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className={labelCls} style={{ marginBottom: 0 }}>Interest rate</label>
              <span className="text-sm font-bold text-slate-700">{rate}% p.a.</span>
            </div>
            <input type="range" min={6} max={30} step={0.5}
              value={rate} onChange={e => setRate(Number(e.target.value))} className={sliderCls} />
            <div className="flex justify-between mt-1 text-[10px] text-slate-400">
              <span>6% (NHF)</span><span>30%</span>
            </div>
          </div>

          {/* Loan term */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className={labelCls} style={{ marginBottom: 0 }}>Loan term</label>
              <span className="text-sm font-bold text-slate-700">{years} years</span>
            </div>
            <input type="range" min={5} max={30} step={1}
              value={years} onChange={e => setYears(Number(e.target.value))} className={sliderCls} />
            <div className="flex justify-between mt-1 text-[10px] text-slate-400">
              <span>5 yrs</span><span>30 yrs</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-slate-50 p-6 flex flex-col justify-between gap-6">
          {/* Monthly */}
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-200 p-6 text-center">
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 mb-2">Monthly repayment</p>
            <p className="text-4xl font-extrabold text-slate-900 tabular-nums">{fmt(monthly)}</p>
            <p className="mt-2 text-xs text-slate-500">per month for {years} years</p>
          </div>

          {/* Breakdown */}
          <div className="space-y-3">
            {[
              { label: "Loan amount",     value: fmt(principal),    color: "text-slate-800"   },
              { label: "Total repaid",    value: fmt(totalPaid),    color: "text-slate-700"   },
              { label: "Total interest",  value: fmt(totalInterest), color: "text-amber-600"  },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-slate-200 last:border-0">
                <span className="text-sm text-slate-500">{label}</span>
                <span className={clsx("text-sm font-bold tabular-nums", color)}>{value}</span>
              </div>
            ))}
          </div>

          {/* Visual bar */}
          <div>
            <div className="flex justify-between text-[10px] text-slate-500 mb-1.5">
              <span>Principal</span><span>Interest</span>
            </div>
            <div className="h-2 rounded-full bg-slate-200 overflow-hidden flex">
              <div className="bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${(principal / totalPaid) * 100}%` }} />
              <div className="bg-amber-400 flex-1" />
            </div>
          </div>

          <Link href="/contact"
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-100">
            Get a real quote <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ─── Main page ─────────────────────────────────────────────── */
export function FinancePageClient() {
  const rm = useReducedMotion()
  const [diasporaOpen, setDiasporaOpen] = useState(false)

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_60%_-10%,rgba(16,185,129,0.07),transparent)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_0%_80%,rgba(224,81,31,0.05),transparent)]" />
        <motion.div
          className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[100px]"
          animate={rm ? undefined : { scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <motion.div
                initial={rm ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease }}
                className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-1.5"
              >
                <Banknote className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Mortgage & NHF Financing</span>
              </motion.div>

              <motion.h1
                initial={rm ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.06, ease }}
                className="text-4xl font-bold leading-tight tracking-tight text-[#0f172a] sm:text-5xl"
              >
                Move in now.{" "}
                <span className="bg-gradient-to-r from-emerald-600 via-emerald-600 to-orange-600 bg-clip-text text-transparent">
                  Pay over time.
                </span>
              </motion.h1>

              <motion.p
                initial={rm ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.12, ease }}
                className="mt-5 text-base leading-relaxed text-slate-600 max-w-lg"
              >
                Most Nigerians prefer not to tie up 100% cash in a property. We broker mortgage applications through Tier-1 banks and the National Housing Fund — finding the right structure for your income, whether you&apos;re local or in the diaspora.
              </motion.p>

              <motion.div
                initial={rm ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.18, ease }}
                className="mt-8 flex flex-wrap gap-3"
              >
                <a href="#calculator"
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-7 py-3.5 text-sm font-bold text-slate-900 shadow-xl shadow-emerald-900/40 transition hover:bg-emerald-400">
                  <Calculator className="h-4 w-4" />
                  Calculate repayments
                </a>
                <Link href="/contact"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                  Speak to a broker
                </Link>
              </motion.div>
            </div>

            {/* Stats grid */}
            <motion.div
              initial={rm ? false : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.14, ease }}
              className="grid grid-cols-2 gap-4"
            >
              {stats.map(({ icon: Icon, value, label, sub }, i) => (
                <motion.div
                  key={label}
                  initial={rm ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.07, ease }}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 mb-3">
                    <Icon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-extrabold text-[#0f172a] tabular-nums">{value}</p>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">{label}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{sub}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Partner banks ─────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-50 border-y border-slate-200 py-20">
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp()} className="mb-12 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Lending partners</span>
            <h2 className="mt-3 text-3xl font-bold text-[#0f172a] sm:text-4xl">Tier-1 banks & NHF network</h2>
            <p className="mt-3 text-sm text-slate-500 max-w-lg mx-auto">
              We broker active applications. Rates are indicative — final terms depend on your profile and the lender&apos;s current offer.
            </p>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {partners.map((p, i) => (
              <motion.div
                key={p.name}
                {...fadeUp(i * 0.07)}
                className={clsx(
                  "relative group rounded-3xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
                  p.highlight
                    ? "border-emerald-300 bg-white shadow-lg shadow-emerald-100"
                    : "border-slate-200 bg-white hover:border-emerald-200"
                )}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-5 rounded-full bg-emerald-500 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-950 shadow">
                    Top pick
                  </span>
                )}
                <div className={clsx("mb-4 h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center", p.color)}>
                  <Landmark className="h-5 w-5 text-white/80" />
                </div>
                <h3 className="text-lg font-bold text-[#0f172a]">{p.name}</h3>
                <p className="mt-0.5 text-xs text-slate-500">{p.note}</p>

                <div className="mt-5 space-y-2.5 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Rate</span>
                    <span className="text-sm font-bold text-emerald-600">{p.rate}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-100 pt-2">
                    <span className="text-xs text-slate-500">Tenor</span>
                    <span className="text-sm font-semibold text-slate-700">{p.term}</span>
                  </div>
                </div>

                <Link href="/contact"
                  className={clsx(
                    "mt-5 flex items-center justify-center gap-2 w-full rounded-2xl py-3 text-sm font-bold transition-all",
                    p.highlight
                      ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-200"
                      : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                  )}>
                  Apply now <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </motion.div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-slate-600">
            Variable rate updates apply. Final criteria based on aggregate debt-to-income evaluations.
          </p>
        </div>
      </section>

      {/* ── Embedded calculator ───────────────────────────────── */}
      <section id="calculator" className="bg-white py-20 scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp()} className="mb-10 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Mortgage calculator</span>
            <h2 className="mt-3 text-3xl font-bold text-[#0f172a] sm:text-4xl">Know your numbers first</h2>
            <p className="mt-3 text-sm text-slate-500 max-w-md mx-auto">
              Adjust the sliders to see your estimated monthly repayment. Use the NHF rate (6%) for the government pathway.
            </p>
          </motion.div>
          <motion.div {...fadeUp(0.1)}>
            <MortgageCalculator />
          </motion.div>
        </div>
      </section>

      {/* ── How we work ──────────────────────────────────────── */}
      <section className="bg-slate-50 border-y border-slate-200 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp()} className="mb-12 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Our process</span>
            <h2 className="mt-3 text-3xl font-bold text-[#0f172a] sm:text-4xl">We do the hard work</h2>
            <p className="mt-3 text-sm text-slate-500 max-w-md mx-auto">
              From affordability check to keys in hand — we handle every step so you don&apos;t have to navigate Nigerian banking bureaucracy alone.
            </p>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                {...fadeUp(i * 0.08)}
                className="group relative rounded-2xl border border-slate-200 bg-white p-6 hover:border-emerald-200 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className={clsx("flex h-11 w-11 items-center justify-center rounded-xl", step.color)}>
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="text-3xl font-black text-slate-100 select-none tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#0f172a] mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>

                {/* connector */}
                {i < steps.length - 1 && (
                  <div className="absolute -right-3 top-1/2 hidden lg:block">
                    <ArrowRight className="h-5 w-5 text-slate-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Diaspora section ─────────────────────────────────── */}
      <section className="bg-[#f8fafc] py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-xl">
            <div className="grid lg:grid-cols-2">
              {/* Left — dark panel */}
              <div className="relative overflow-hidden bg-[#030b18] p-10 text-white">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_0%_0%,rgba(224,81,31,0.4),transparent)]" />
                <div className="relative">
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#bf6a3c]/30 bg-[#bf6a3c]/10 px-4 py-1.5">
                    <Globe className="h-4 w-4 text-orange-400" />
                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-orange-300">Diaspora buyers</span>
                  </div>
                  <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
                    Buy from the UK,<br />US, or Canada.
                  </h2>
                  <p className="mt-4 text-base text-slate-300 leading-relaxed max-w-md">
                    We specialise in helping Nigerians abroad finance a home back home. Your foreign income is accepted, and our diaspora team handles every interaction with the bank, solicitor, and land registry — so you never have to fly back just to sign a form.
                  </p>

                  {/* Quick bullets */}
                  <div className="mt-8 space-y-3">
                    {[
                      { icon: Users,       text: "Dedicated diaspora advisor assigned to your file" },
                      { icon: Sparkles,    text: "GBP, USD, EUR income all accepted" },
                      { icon: ShieldCheck, text: "Power of Attorney managed in-house" },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500/20">
                          <Icon className="h-3.5 w-3.5 text-orange-400" />
                        </div>
                        <p className="text-sm text-slate-300">{text}</p>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setDiasporaOpen(o => !o)}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-orange-300 hover:text-white transition lg:hidden"
                  >
                    {diasporaOpen ? "Show less" : "See all benefits"}
                    {diasporaOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>

                  <div className="mt-8">
                    <Link href="/contact"
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#bf6a3c] px-7 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#c8451a]">
                      Talk to diaspora team <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right — light panel */}
              <div className="bg-white p-10">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-6">What we handle for you</p>
                <ul className="space-y-3">
                  {diasporaPoints.map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
                      <span className="text-sm text-slate-700 leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <div className="flex gap-3">
                    <FileStack className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-900">Official NHF forms</p>
                      <p className="mt-1 text-xs text-amber-700 leading-relaxed">
                        Download the latest diaspora NHF pack from FMBN / NiDCOM when you&apos;re ready to apply.
                      </p>
                      <a href="https://fmbn.gov.ng" target="_blank" rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-900 transition">
                        FMBN website <ArrowRight className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA banner ───────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white border-t border-slate-200 py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,rgba(16,185,129,0.05),transparent)]" />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <motion.div {...fadeUp()}>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">
              <Sparkles className="h-6 w-6 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-[#0f172a] sm:text-4xl">Ready to get started?</h2>
            <p className="mt-4 text-slate-500 text-base max-w-lg mx-auto leading-relaxed">
              Use the calculator above to run your numbers, then speak to a broker who will match you to the right lender — bank or NHF.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <a href="#calculator"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-600">
                <Calculator className="h-5 w-5" /> Try the calculator
              </a>
              <Link href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                Speak to a broker <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </motion.div>

          <motion.div {...fadeUp(0.1)} className="mt-10 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-left">
            <Shield className="h-5 w-5 shrink-0 text-slate-400" />
            <p className="text-xs text-slate-500 leading-relaxed">
              EasyMoveZone introduces you to lenders and aligns paperwork — we are not FMBN or a bank. Always confirm final terms with your Primary Mortgage Bank before committing.
            </p>
          </motion.div>
        </div>
      </section>
    </>
  )
}

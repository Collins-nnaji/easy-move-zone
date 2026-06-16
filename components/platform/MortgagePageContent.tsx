"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import {
  ArrowRight,
  Banknote,
  Building2,
  Calculator,
  CheckCircle2,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  FileStack,
  Landmark,
  Layers,
  Link2,
  MessageSquare,
  Percent,
  Plug,
  Shield,
  Sparkles,
  Timer,
  Users,
  Wallet,
} from "lucide-react"
import { clsx } from "clsx"
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { MortgageFinder } from "@/components/platform/MortgageFinder"

const easeOut = [0.16, 1, 0.3, 1] as const

/** Matches `top-14` under PlatformNav */
const NAV_TOP_PX = 56
const FOOTER_GAP_PX = 10
const FULL_CHAT_HEIGHT_CSS = "calc(100dvh - 3.5rem)"

function computeMortgageChatHeightPx(): string {
  const footer = document.getElementById("contact")
  if (!footer) return FULL_CHAT_HEIGHT_CSS

  const vh = window.innerHeight
  const r = footer.getBoundingClientRect()

  if (r.top >= vh || r.bottom <= 0) {
    return FULL_CHAT_HEIGHT_CSS
  }

  const maxH = vh - NAV_TOP_PX - FOOTER_GAP_PX
  const raw = r.top - NAV_TOP_PX - FOOTER_GAP_PX
  const h = Math.min(Math.max(0, raw), maxH)
  if (h < 1) return FULL_CHAT_HEIGHT_CSS
  return `${h}px`
}

const partners = [
  {
    name: "Access Bank",
    note: "Diaspora & commercial programmes",
    href: "https://www.accessbankplc.com",
  },
  {
    name: "Stanbic IBTC",
    note: "RSA-backed & home loans",
    href: "https://www.stanbicibtcbank.com",
  },
  {
    name: "First Bank",
    note: "HomeLoan Plus nationwide",
    href: "https://www.firstbanknigeria.com",
  },
] as const

const quickFacts = [
  {
    icon: Percent,
    title: "Equity split",
    value: "~30% / ~70%",
    hint: "Common FMBN pathway — verify with your PMB",
  },
  {
    icon: Timer,
    title: "Contributions",
    value: "12 months",
    hint: "Often needed before drawdown; apply path may open ~9 months",
  },
  {
    icon: Landmark,
    title: "Who runs NHF",
    value: "FMBN + PMB",
    hint: "Registered diaspora route includes NiDCOM checks",
  },
  {
    icon: Shield,
    title: "With your deal",
    value: "Verified listing",
    hint: "We align docs with properties on EasyMoveZone",
  },
] as const

const nhfHighlights = [
  {
    icon: Users,
    title: "Built for diaspora",
    line: "Structured NHF contributions toward owning a home in Nigeria.",
  },
  {
    icon: Building2,
    title: "Works with licensed PMBs",
    line: "Application and disbursement through approved primary mortgage banks.",
  },
  {
    icon: CheckCircle2,
    title: "Credible pathway",
    line: "Public programme layer — not a private “shortcut” product.",
  },
] as const

const nhfRegistrationSteps = [
  { step: "01", title: "Apply", icon: FileStack, body: "Form in; processing can take a few working days." },
  { step: "02", title: "Verify", icon: Shield, body: "FMBN / NiDCOM validate your details." },
  { step: "03", title: "ID number", icon: ClipboardCheck, body: "Accepted contributors receive an ID." },
  { step: "04", title: "Pay in", icon: Wallet, body: "Monthly contributions start; track the 12-month clock." },
  { step: "05", title: "Retirement rules", icon: Banknote, body: "Withdrawal rules follow FMBN policy after employment ends." },
] as const

const mortgageApplicationSteps = [
  { step: "01", title: "Pick & apply", icon: Building2, body: "Eligible homes + paperwork to your PMB." },
  { step: "02", title: "Credit check", icon: Shield, body: "PMB verifies income and credibility." },
  { step: "03", title: "Offer", icon: Sparkles, body: "Review terms; respond within the window they set." },
  { step: "04", title: "Disburse", icon: Percent, body: "Typical ~30% equity / ~70% loan — confirm live numbers." },
  { step: "05", title: "Title", icon: Landmark, body: "Ownership follows programme and loan closure rules." },
] as const

const assessmentComingSoon = [
  {
    icon: Calculator,
    title: "Affordability & stress tests",
    desc: "Payment scenarios, rate shocks, and FX context in one view.",
  },
  {
    icon: ClipboardCheck,
    title: "Document readiness",
    desc: "Checklist scored against what PMBs usually ask for.",
  },
  {
    icon: Layers,
    title: "Scenario compare",
    desc: "Side-by-side NHF vs commercial vs diaspora bank paths.",
  },
] as const

const integrationsComingSoon = [
  {
    icon: Plug,
    title: "Lender & bank APIs",
    desc: "Pre-qual hints and status sync where partners expose APIs.",
  },
  {
    icon: Link2,
    title: "Payroll & income",
    desc: "Verified employment hooks when you opt in.",
  },
  {
    icon: Shield,
    title: "Bureau & fraud signals",
    desc: "Responsible checks with clear consent and audit trail.",
  },
] as const

function viewFade(reduce: boolean, delay = 0) {
  return {
    initial: reduce ? false : { opacity: 0, y: 22 },
    whileInView: reduce ? undefined : { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.5, delay, ease: easeOut },
  } as const
}

export function MortgagePageContent() {
  const reduceMotion = useReducedMotion()
  const [chatOpen, setChatOpen] = useState(false)
  const [chatHeight, setChatHeight] = useState<string>(FULL_CHAT_HEIGHT_CSS)
  const heightRaf = useRef<number | null>(null)

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [])

  useLayoutEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)")
    if (mq.matches) setChatOpen(true)
  }, [])

  useEffect(() => {
    const openFromHash = () => {
      if (window.location.hash === "#mortgage-finder") setChatOpen(true)
    }
    openFromHash()
    window.addEventListener("hashchange", openFromHash)
    return () => window.removeEventListener("hashchange", openFromHash)
  }, [])

  const scheduleChatHeight = useCallback(() => {
    if (heightRaf.current != null) return
    heightRaf.current = window.requestAnimationFrame(() => {
      heightRaf.current = null
      setChatHeight(computeMortgageChatHeightPx())
    })
  }, [])

  useEffect(() => {
    scheduleChatHeight()
    window.addEventListener("scroll", scheduleChatHeight, { passive: true })
    window.addEventListener("resize", scheduleChatHeight)
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(scheduleChatHeight) : null
    const footer = document.getElementById("contact")
    if (footer && ro) ro.observe(footer)
    return () => {
      window.removeEventListener("scroll", scheduleChatHeight)
      window.removeEventListener("resize", scheduleChatHeight)
      ro?.disconnect()
      if (heightRaf.current != null) {
        cancelAnimationFrame(heightRaf.current)
        heightRaf.current = null
      }
    }
  }, [scheduleChatHeight])

  const openChat = useCallback(() => setChatOpen(true), [])
  const toggleChat = useCallback(() => setChatOpen((o) => !o), [])

  return (
    <div
      className={clsx(
        "min-w-0 transition-[padding] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        chatOpen ? "lg:pr-[min(420px,calc(100vw-0.5rem))]" : "lg:pr-14",
      )}
    >
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/[0.08] bg-[#030712]">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_20%_-20%,rgba(224,81,31,0.45),transparent)]"
          aria-hidden
        />
        <motion.div
          className="pointer-events-none absolute -right-24 top-1/3 h-[min(50vw,420px)] w-[min(50vw,420px)] rounded-full bg-[#bf6a3c]/20 blur-[90px]"
          animate={
            reduceMotion
              ? undefined
              : {
                  scale: [1, 1.06, 1],
                  opacity: [0.25, 0.42, 0.25],
                }
          }
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        />
        <div className="home-hero-grid pointer-events-none absolute inset-0 opacity-[0.08]" aria-hidden />

        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:flex lg:items-stretch lg:gap-12 lg:px-8 lg:py-20">
          <div className="flex-1">
            <motion.p
              {...(reduceMotion ? {} : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } })}
              transition={{ duration: 0.45, ease: easeOut }}
              className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-300/90"
            >
              Nigeria · Mortgages &amp; NHF
            </motion.p>
            <motion.h1
              {...(reduceMotion ? {} : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 } })}
              transition={{ duration: 0.5, delay: 0.05, ease: easeOut }}
              className="mt-3 max-w-xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.35rem]"
            >
              Finance a verified home with{" "}
              <span className="bg-gradient-to-r from-white via-orange-100 to-emerald-200/90 bg-clip-text text-transparent">
                clarity, not clutter.
              </span>
            </motion.h1>
            <motion.p
              {...(reduceMotion ? {} : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 } })}
              transition={{ duration: 0.5, delay: 0.1, ease: easeOut }}
              className="mt-4 max-w-lg text-sm leading-relaxed text-slate-300 sm:text-base"
            >
              Diaspora NHF, FMBN rules, and bank partners — distilled into what matters. Use the AI matcher now; deeper
              assessments and integrations are on the way.
            </motion.p>
            <motion.div
              {...(reduceMotion ? {} : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 } })}
              transition={{ duration: 0.5, delay: 0.14, ease: easeOut }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <a
                href="#mortgage-finder"
                className="inline-flex items-center gap-2 rounded-full bg-[#bf6a3c] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#bf6a3c]/25 transition hover:brightness-110"
                onClick={(e) => {
                  e.preventDefault()
                  openChat()
                  window.history.replaceState(null, "", "#mortgage-finder")
                }}
              >
                <Sparkles className="h-4 w-4" />
                Open AI matcher
              </a>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                Browse listings
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>

          <motion.div
            {...(reduceMotion ? {} : { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 } })}
            transition={{ duration: 0.55, delay: 0.12, ease: easeOut }}
            className="mt-10 w-full max-w-md shrink-0 lg:mt-0 lg:max-w-sm"
          >
            <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-orange-200/80">On this page</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-200">
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  Key numbers &amp; partner banks
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  AI matcher on the right — collapse anytime
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  NHF steps + what&apos;s shipping next
                </li>
              </ul>
              <div className="mt-6 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-xs leading-relaxed text-slate-400">
                EasyMoveZone introduces and aligns paperwork — we are not FMBN or a bank. Always confirm terms with your PMB.
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick facts */}
      <section className="border-b border-[#e2e8f0] bg-[#f4f4f4] py-10 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#0f172a] sm:text-xl">At a glance</h2>
              <p className="mt-1 text-sm text-[#64748b]">Numbers people ask first — still subject to FMBN / bank rules.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickFacts.map((f, i) => (
              <motion.div
                key={f.title}
                {...viewFade(!!reduceMotion, i * 0.05)}
                className="group rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm transition hover:border-[#bf6a3c]/35 hover:shadow-md"
              >
                <f.icon className="h-8 w-8 text-[#e0511f] transition group-hover:text-[#bf6a3c]" />
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">{f.title}</p>
                <p className="mt-1 text-xl font-semibold tabular-nums text-[#0f172a]">{f.value}</p>
                <p className="mt-2 text-xs leading-relaxed text-[#64748b]">{f.hint}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div {...viewFade(!!reduceMotion)} className="mb-8 max-w-xl">
            <h2 className="text-2xl font-semibold text-[#0f172a] sm:text-3xl">Partner banks (Nigeria)</h2>
            <p className="mt-2 text-sm text-[#64748b]">Introductions and document alignment — approval is always the lender&apos;s call.</p>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-3">
            {partners.map((p, i) => (
              <motion.a
                key={p.name}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                {...viewFade(!!reduceMotion, i * 0.06)}
                className="group relative overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#bf6a3c]/40 hover:shadow-lg"
              >
                <Building2 className="h-9 w-9 text-[#e0511f] transition group-hover:text-[#bf6a3c]" />
                <h3 className="mt-4 text-lg font-semibold text-[#0f172a] group-hover:text-[#e0511f]">{p.name}</h3>
                <p className="mt-1 text-sm text-[#64748b]">{p.note}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#bf6a3c]">
                  Website <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* NHF highlights — compact */}
      <section className="border-y border-[#e2e8f0] bg-[#f8fafc] py-12 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div {...viewFade(!!reduceMotion)} className="mb-8 flex items-center gap-3">
            <Landmark className="h-8 w-8 text-[#e0511f]" />
            <div>
              <h2 className="text-xl font-semibold text-[#0f172a] sm:text-2xl">Diaspora NHF in three lines</h2>
              <p className="text-sm text-[#64748b]">Programme detail lives with FMBN / NiDCOM — we help you navigate alongside a purchase.</p>
            </div>
          </motion.div>
          <div className="grid gap-4 md:grid-cols-3">
            {nhfHighlights.map((h, i) => (
              <motion.div
                key={h.title}
                {...viewFade(!!reduceMotion, i * 0.07)}
                className="flex gap-4 rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e0511f]/8 text-[#e0511f]">
                  <h.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-[#0f172a]">{h.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[#64748b]">{h.line}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timelines */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-6xl space-y-14 px-4 sm:px-6 lg:px-8">
          <div>
            <motion.div {...viewFade(!!reduceMotion)} className="mb-6">
              <h2 className="text-xl font-semibold text-[#0f172a] sm:text-2xl">NHF registration</h2>
              <p className="mt-1 text-sm text-[#64748b]">From application to contributing member.</p>
            </motion.div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {nhfRegistrationSteps.map((s, i) => (
                <motion.div
                  key={s.step}
                  {...viewFade(!!reduceMotion, i * 0.04)}
                  className="relative rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-sm"
                >
                  <span className="text-[10px] font-bold text-[#bf6a3c]">{s.step}</span>
                  <div className="mt-2 flex h-9 w-9 items-center justify-center rounded-lg bg-[#bf6a3c]/10 text-[#e0511f]">
                    <s.icon className="h-4 w-4" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-[#0f172a]">{s.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[#64748b]">{s.body}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <motion.div {...viewFade(!!reduceMotion)} className="mb-6">
              <h2 className="text-xl font-semibold text-[#0f172a] sm:text-2xl">Mortgage application</h2>
              <p className="mt-1 text-sm text-[#64748b]">After you meet contributor eligibility.</p>
            </motion.div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {mortgageApplicationSteps.map((s, i) => (
                <motion.div
                  key={s.step}
                  {...viewFade(!!reduceMotion, i * 0.04)}
                  className="relative rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-sm"
                >
                  <span className="text-[10px] font-bold text-emerald-600">{s.step}</span>
                  <div className="mt-2 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700">
                    <s.icon className="h-4 w-4" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-[#0f172a]">{s.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[#64748b]">{s.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Coming soon — assessments */}
      <section className="border-t border-[#e2e8f0] bg-[#030712] py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div {...viewFade(!!reduceMotion)} className="mb-8 max-w-2xl">
            <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-orange-200/90">
              Coming soon
            </span>
            <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">Assessment workspace</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400 sm:text-base">
              Structured calculators and readiness scores — same brand experience as listings, built for serious buyers.
            </p>
          </motion.div>
          <div className="grid gap-4 md:grid-cols-3">
            {assessmentComingSoon.map((item, i) => (
              <motion.div
                key={item.title}
                {...viewFade(!!reduceMotion, i * 0.06)}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_0%_0%,rgba(191,106,60,0.2),transparent)]" aria-hidden />
                <item.icon className="relative h-8 w-8 text-orange-300" />
                <p className="relative mt-4 text-sm font-semibold text-white">{item.title}</p>
                <p className="relative mt-1 text-xs leading-relaxed text-slate-400">{item.desc}</p>
                <p className="relative mt-4 text-[10px] font-semibold uppercase tracking-wider text-slate-500">In development</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming soon — integrations */}
      <section className="border-t border-white/[0.06] bg-[#020617] py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div {...viewFade(!!reduceMotion)} className="mb-8 max-w-2xl">
            <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-orange-200/90">
              Coming soon
            </span>
            <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">Integrations</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400 sm:text-base">
              Plugs into lenders, payroll, and bureau data where partners and regulation allow — always with explicit consent.
            </p>
          </motion.div>
          <div className="grid gap-4 md:grid-cols-3">
            {integrationsComingSoon.map((item, i) => (
              <motion.div
                key={item.title}
                {...viewFade(!!reduceMotion, i * 0.06)}
                className="rounded-2xl border border-[#bf6a3c]/20 bg-[#0f172a]/80 p-5"
              >
                <item.icon className="h-8 w-8 text-[#bf6a3c]" />
                <p className="mt-4 text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources + disclaimer */}
      <section className="border-t border-[#e2e8f0] bg-[#f4f4f4] py-12">
        <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
          <motion.div
            {...viewFade(!!reduceMotion)}
            className="flex flex-col gap-4 rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <FileStack className="h-6 w-6 shrink-0 text-[#e0511f]" />
              <div>
                <p className="font-semibold text-[#0f172a]">Official forms &amp; sources</p>
                <p className="mt-1 text-sm text-[#64748b]">Download the latest diaspora NHF pack from FMBN / NiDCOM when you&apos;re ready to apply.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://fmbn.gov.ng"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#e0511f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c8451a]"
              >
                FMBN site
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-full border border-[#e2e8f0] bg-white px-5 py-2.5 text-sm font-semibold text-[#0f172a] transition hover:bg-[#f8fafc]"
              >
                Verified homes
              </Link>
            </div>
          </motion.div>

          <motion.div
            {...viewFade(!!reduceMotion, 0.05)}
            className="flex gap-3 rounded-2xl border border-[#e2e8f0] bg-white p-5 text-sm leading-relaxed text-[#64748b]"
          >
            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-[#94a3b8]" />
            <p>
              Summaries are educational and may drift from current policy.{" "}
              <strong className="text-[#0f172a]">EasyMoveZone is not FMBN or a bank.</strong> Confirm every term with FMBN,
              NiDCOM, and your Primary Mortgage Bank before you commit.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Fixed right: AI matcher (collapsible) */}
      <aside
        id="mortgage-finder"
        aria-label="AI mortgage matcher"
        style={{ height: chatHeight }}
        className={clsx(
          "fixed right-0 top-14 z-40 flex flex-col border-l border-[#c8451a]/25 bg-white shadow-[-12px_0_40px_rgba(0,0,0,0.07)] transition-[width,height] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
          chatOpen ? "w-[min(420px,calc(100vw-0.5rem))]" : "w-14 overflow-hidden",
        )}
      >
        {!chatOpen ? (
          <button
            type="button"
            onClick={toggleChat}
            className="flex h-full w-full flex-col items-center gap-3 bg-[#e0511f] py-5 text-white transition hover:bg-[#c8451a]"
            aria-expanded={false}
            aria-controls="mortgage-finder-panel"
          >
            <MessageSquare className="h-5 w-5 shrink-0 text-orange-200" aria-hidden />
            <span
              className="select-none text-[10px] font-bold uppercase tracking-[0.18em] text-white/90"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              Matcher
            </span>
            <ChevronLeft className="h-4 w-4 shrink-0 text-white/80" aria-hidden />
          </button>
        ) : (
          <>
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#e8edf6] bg-gradient-to-r from-[#f8fbff] to-white px-3 py-2.5 sm:px-4">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e0511f]/10 text-[#e0511f]">
                  <Sparkles className="h-4 w-4 text-[#bf6a3c]" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#0f172a]">AI lender matcher</p>
                  <p className="truncate text-[10px] text-[#64748b]">Indicative matches — not a credit decision</p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleChat}
                className="shrink-0 rounded-lg p-2 text-[#64748b] transition hover:bg-[#eef4ff] hover:text-[#e0511f]"
                aria-expanded
                aria-label="Collapse matcher panel"
              >
                <ChevronRight className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div className="shrink-0 border-b border-[#e8edf6] px-3 py-2 sm:px-4">
              <p className="text-[11px] leading-snug text-[#64748b]">
                Mention diaspora status or NHF so the model weights government programmes.
              </p>
            </div>
            <div id="mortgage-finder-panel" className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              <MortgageFinder />
            </div>
          </>
        )}
      </aside>
    </div>
  )
}

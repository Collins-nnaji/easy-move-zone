"use client"

import Link from "next/link"
import Image from "next/image"
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"
import Marquee from "@/components/ui/Marquee"
import {
  Wheat,
  Truck,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  MapPin,
  ShieldCheck,
  Sprout,
  Package,
  BarChart3,
  Users,
  Clock,
  Zap,
  Search,
  ChevronRight,
  Minus,
  Sparkles,
} from "lucide-react"
import { useRef } from "react"

const heroBg =
  "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=2400&q=80"

const easeOut = [0.16, 1, 0.3, 1] as const

const fadeUp = (delay = 0, y = 20) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: easeOut },
})

const viewFade = (reduce: boolean, delay = 0) => ({
  initial: reduce ? false : { opacity: 0, y: 24 },
  whileInView: reduce ? undefined : { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, delay, ease: easeOut },
})

const hubs = [
  { name: "Lagos", state: "South West", color: "from-emerald-500/20 to-emerald-600/10" },
  { name: "Kano", state: "North West", color: "from-amber-500/20 to-amber-600/10" },
  { name: "Kaduna", state: "North West", color: "from-lime-500/20 to-lime-600/10" },
  { name: "Onitsha", state: "South East", color: "from-blue-500/20 to-blue-600/10" },
  { name: "Ibadan", state: "South West", color: "from-emerald-500/20 to-emerald-600/10" },
  { name: "Abuja", state: "FCT", color: "from-purple-500/20 to-purple-600/10" },
]

const trustStats = [
  { value: "8,000+", label: "Farmer listings", icon: Sprout },
  { value: "1,200+", label: "Verified trucks", icon: Truck },
  { value: "₦12B+", label: "Produce moved", icon: Package },
  { value: "32 States", label: "Coverage", icon: MapPin },
]

const howItWorks = [
  {
    step: "01",
    role: "Farmers",
    title: "List your harvest",
    body: "Post your crop type, quantity, location, and pickup window. Buyers and transporters find you instantly.",
    icon: Sprout,
    gradient: "from-emerald-500 to-green-600",
    glow: "shadow-emerald-500/25",
    accent: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    href: "/produce/list",
    cta: "List produce",
  },
  {
    step: "02",
    role: "Transporters",
    title: "Register your fleet",
    body: "Add your trucks, routes, and capacity. Get matched with farm pickups and market deliveries near you.",
    icon: Truck,
    gradient: "from-amber-500 to-orange-500",
    glow: "shadow-amber-500/25",
    accent: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
    href: "/transporters/register",
    cta: "Register fleet",
  },
  {
    step: "03",
    role: "Buyers",
    title: "Source verified produce",
    body: "Browse fresh listings by crop, location, and price. Book shipments and track delivery in real time.",
    icon: Package,
    gradient: "from-blue-500 to-cyan-500",
    glow: "shadow-blue-500/25",
    accent: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
    href: "/produce",
    cta: "Browse market",
  },
]

const commodityPrices = [
  { crop: "Maize (white)", unit: "100kg bag", price: "₦42,000", trend: "up", change: "+3.2%" },
  { crop: "Tomatoes", unit: "50kg crate", price: "₦28,500", trend: "down", change: "-1.8%" },
  { crop: "Yam", unit: "per tuber (lg)", price: "₦1,200", trend: "up", change: "+5.1%" },
  { crop: "Cassava flour", unit: "50kg bag", price: "₦19,000", trend: "stable", change: "0.0%" },
]

const trustedPartners = [
  "Dawanau Market",
  "Mile 12 Hub",
  "Onitsha Main",
  "Bodija Market",
  "Gwagwalada Hub",
  "Creek Road",
  "Kaduna City",
  "Benue Fresh",
]

const quickActions = [
  { label: "List produce", href: "/produce/list", icon: Sprout },
  { label: "Find transporters", href: "/transporters", icon: Truck },
  { label: "View price board", href: "/price-board", icon: BarChart3 },
  { label: "Track shipments", href: "/shipments", icon: Package },
]

const heroStories = [
  {
    title: "6,000+ tonnes moved",
    body: "Verified fleets are shipping fresh harvests from farms to markets in under 24 hours.",
    accent: "from-emerald-500 to-lime-500",
  },
  {
    title: "₦12B in fair pricing",
    body: "Live price reporting keeps farmers and buyers trading at transparent rates.",
    accent: "from-amber-500 to-orange-500",
  },
  {
    title: "1,200 verified trucks",
    body: "Cold chain + GPS fleets reduce spoilage and ensure secure delivery.",
    accent: "from-blue-500 to-cyan-500",
  },
]

export function HomePageClient() {
  const reduceMotion = useReducedMotion()
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })
  const heroParallax = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, 80])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.4])

  return (
    <>
      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-[92vh] overflow-hidden md:min-h-[94vh]">
        <motion.div className="pointer-events-none absolute inset-0" style={{ y: heroParallax, opacity: heroOpacity }}>
          <Image
            src={heroBg}
            alt=""
            fill
            priority
            className="object-cover object-center scale-[1.06]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#061408]/95 via-[#0a2410]/85 to-[#0e3a12]/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          {/* ambient orbs */}
          <motion.div
            className="absolute -right-24 top-1/3 h-[600px] w-[600px] rounded-full bg-emerald-500/15 blur-[120px]"
            animate={reduceMotion ? undefined : { scale: [1, 1.1, 1], opacity: [0.2, 0.35, 0.2] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          />
          <motion.div
            className="absolute -left-24 bottom-1/4 h-[400px] w-[400px] rounded-full bg-lime-500/10 blur-[100px]"
            animate={reduceMotion ? undefined : { scale: [1, 1.12, 1], opacity: [0.15, 0.28, 0.15] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 3 }}
            aria-hidden
          />
        </motion.div>

        <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center px-4 pb-16 pt-24 sm:px-6 md:min-h-[94vh] lg:px-8 lg:pb-24 lg:pt-32">
          <div className="grid w-full items-center gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Left copy */}
            <div className="mx-auto max-w-3xl text-center lg:col-span-7 lg:mx-0 lg:max-w-none lg:text-left">
              <motion.div
                {...fadeUp(0, 14)}
                className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-medium tracking-wide text-white/85 backdrop-blur-md"
              >
                <motion.span
                  animate={reduceMotion ? undefined : { rotate: [0, 14, -14, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Wheat className="h-3.5 w-3.5 text-emerald-300" />
                </motion.span>
                Farm-to-market · Verified transporters · Live prices
              </motion.div>

              <motion.h1
                {...fadeUp(reduceMotion ? 0 : 0.07, 24)}
                className="text-[1.65rem] font-bold leading-[1.1] tracking-tight text-white sm:text-5xl sm:leading-[1.04] lg:text-[3.4rem]"
              >
                Move your harvest
                <br />
                <span className="bg-gradient-to-r from-emerald-200 via-lime-200 to-emerald-300 bg-clip-text text-transparent">
                  across Africa, simply.
                </span>
              </motion.h1>

              <motion.p
                {...fadeUp(reduceMotion ? 0 : 0.13, 18)}
                className="mx-auto mt-6 max-w-xl text-pretty text-base leading-[1.7] text-slate-300/90 lg:mx-0"
              >
                EasyMoveZone connects African farmers with verified transporters and buyers —
                eliminating middlemen, reducing post-harvest loss, and putting fair prices in
                everyone&apos;s hands.
              </motion.p>

              <motion.div
                {...fadeUp(reduceMotion ? 0 : 0.19, 18)}
                className="mt-10 flex flex-col gap-3.5 px-4 sm:flex-row sm:px-0 lg:justify-start"
              >
                <Link
                  href="/produce/list"
                  className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-emerald-500 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-900/40 transition-all hover:bg-emerald-400 hover:shadow-emerald-900/50 active:scale-[0.97] sm:w-auto"
                >
                  <Sprout className="h-4 w-4 transition-transform group-hover:scale-110" />
                  List your produce
                </Link>
                <Link
                  href="/produce"
                  className="inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/[0.16] hover:border-white/30 sm:w-auto"
                >
                  <Search className="h-4 w-4" />
                  Browse the market
                </Link>
              </motion.div>

              <motion.div
                {...fadeUp(reduceMotion ? 0 : 0.23, 18)}
                className="mt-6 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap lg:justify-start"
              >
                <Link href="/transporters/register" className="group flex items-center justify-center gap-1.5 rounded-lg bg-white/5 py-2 text-sm font-medium text-emerald-300/90 transition hover:text-white sm:bg-transparent sm:py-0 sm:justify-start">
                  Register
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link href="/price-board" className="group flex items-center justify-center gap-1.5 rounded-lg bg-white/5 py-2 text-sm font-medium text-emerald-300/90 transition hover:text-white sm:bg-transparent sm:py-0 sm:justify-start">
                  Today&apos;s prices
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </motion.div>
            </div>

            {/* Right — glass card + hero carousel */}
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.97 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.24, duration: 0.7, ease: easeOut }}
              className="relative mx-auto w-full max-w-md lg:col-span-5 lg:mx-0 lg:max-w-none"
            >
              {/* glow border */}
              <div className="absolute -inset-px rounded-[1.4rem] bg-gradient-to-br from-white/30 via-emerald-400/20 to-green-700/25 opacity-70 blur-[1.5px]" aria-hidden />

              <div className="relative overflow-hidden rounded-[1.3rem] border border-white/15 bg-white/[0.08] p-6 shadow-[0_32px_96px_-24px_rgba(0,0,0,0.7)] backdrop-blur-3xl sm:p-7">
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-400/15 blur-3xl" aria-hidden />

                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-200/80">
                      <MapPin className="h-3.5 w-3.5" />
                      Market Hubs
                    </span>
                    <h2 className="mt-1.5 text-[1.15rem] font-bold tracking-tight text-white">Trade by location</h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-400/90">
                      Produce and transporters across Nigeria&apos;s major agro corridors.
                    </p>
                  </div>
                  <Link
                    href="/produce"
                    className="shrink-0 rounded-full border border-white/15 bg-white/8 px-3.5 py-1.5 text-xs font-semibold text-white/80 transition hover:border-emerald-300/35 hover:bg-white/14 hover:text-white"
                  >
                    All hubs
                  </Link>
                </div>

                <div className="relative mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {hubs.map((hub, i) => (
                    <motion.div
                      key={hub.name}
                      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                      transition={{ delay: 0.34 + i * 0.045, duration: 0.42, ease: easeOut }}
                    >
                      <Link
                        href={`/produce?hub=${hub.name.toLowerCase()}`}
                        className={`group flex items-center justify-between rounded-xl border border-white/8 bg-gradient-to-br ${hub.color} px-4 py-3 transition hover:border-emerald-400/30 hover:bg-white/[0.1] sm:flex-col sm:items-start sm:py-2.5`}
                      >
                        <div className="flex flex-col">
                          <span className="text-[14px] font-bold text-white group-hover:text-emerald-100 transition sm:text-[13px] sm:font-semibold">
                            {hub.name}
                          </span>
                          <span className="mt-0.5 text-[11px] font-medium text-slate-400 sm:text-[10px] sm:text-slate-500">
                            {hub.state}
                          </span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-white/30 transition-transform group-hover:translate-x-0.5 sm:hidden" />
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Live price strip */}
                <div className="mt-4 overflow-hidden rounded-xl border border-white/8 bg-black/30">
                  <div className="flex items-center justify-between px-3.5 py-2 border-b border-white/6">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300/80">
                      <TrendingUp className="h-3 w-3" />
                      Live prices
                    </span>
                    <Link href="/price-board" className="text-[10px] font-semibold text-emerald-400 hover:text-white transition">
                      Full board →
                    </Link>
                  </div>
                  <div className="divide-y divide-white/[0.04] px-3.5 pb-1">
                    {commodityPrices.slice(0, 3).map((c) => (
                      <div key={c.crop} className="flex items-center justify-between py-2">
                        <span className="text-xs text-slate-300/90">{c.crop}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white tabular-nums">{c.price}</span>
                          <span className={`text-[10px] font-semibold ${c.trend === "up" ? "text-emerald-400" : c.trend === "down" ? "text-red-400" : "text-slate-500"}`}>
                            {c.change}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hero carousel */}
                <div className="mt-5 overflow-hidden rounded-xl border border-white/8 bg-white/5 p-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-emerald-300/80">
                    <Sparkles className="h-3 w-3" />
                    Highlights
                  </div>
                  <div className="relative mt-3">
                    <motion.div
                      className="flex"
                      animate={reduceMotion ? undefined : { x: ["0%", "-200%"] }}
                      transition={reduceMotion ? undefined : { duration: 18, repeat: Infinity, ease: "linear" }}
                    >
                      {[...heroStories, ...heroStories].map((story, index) => (
                        <div key={`${story.title}-${index}`} className="min-w-full pr-3">
                          <div className="rounded-xl border border-white/10 bg-white/8 p-4">
                            <div className={`mb-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${story.accent} px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white`}>
                              {story.title}
                            </div>
                            <p className="text-[11px] leading-relaxed text-slate-300/90 sm:text-xs">{story.body}</p>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Trust stats */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 30 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.65, ease: easeOut }}
            className="mt-16 w-full border-t border-white/[0.08] pt-10 lg:mt-24"
          >
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {trustStats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.5, ease: easeOut }}
                  className="text-center sm:text-left"
                >
                  <s.icon className="mx-auto mb-2 h-4 w-4 text-emerald-300/70 sm:mx-0" strokeWidth={1.75} />
                  <div className="text-[1.65rem] font-bold tabular-nums tracking-tight text-white">{s.value}</div>
                  <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TRUSTED BY STRIP ── */}
      <motion.section {...viewFade(!!reduceMotion)} className="border-y border-slate-100 bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
                <Sparkles className="h-3.5 w-3.5" />
                Trusted by market hubs
              </span>
              <p className="mt-1 text-sm text-slate-500">Partnerships across Nigeria&apos;s top agro corridors.</p>
            </div>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1 text-xs font-semibold text-slate-600">
              <button className="rounded-full bg-emerald-600 px-3 py-1.5 text-white shadow-sm">Farmers</button>
              <button className="rounded-full px-3 py-1.5 transition hover:text-emerald-700">Transporters</button>
              <button className="rounded-full px-3 py-1.5 transition hover:text-emerald-700">Buyers</button>
            </div>
          </div>
          <Marquee pauseOnHover className="mt-4">
            {trustedPartners.map((partner) => (
              <span
                key={partner}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/60 px-4 py-2 text-xs font-semibold text-emerald-700"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {partner}
              </span>
            ))}
          </Marquee>
        </div>
      </motion.section>

      {/* ── HOW IT WORKS ── */}
      <motion.section {...viewFade(!!reduceMotion)} className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
              <span className="h-px w-5 bg-emerald-400" />
              How it works
              <span className="h-px w-5 bg-emerald-400" />
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              One platform.{" "}
              <span className="text-emerald-600">Three roles.</span>{" "}
              Zero middlemen.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-500">
              Whether you grow it, move it, or buy it — EasyMoveZone makes every step transparent, fast, and fair.
            </p>
          </div>

          <div className="mx-auto grid max-w-xl gap-6 md:max-w-none md:grid-cols-3">
            {howItWorks.map((step, idx) => (
              <motion.div
                key={step.step}
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: idx * 0.09, duration: 0.55, ease: easeOut }}
                className={`relative rounded-2xl border ${step.border} ${step.bg} p-7 overflow-hidden`}
              >
                <div className="absolute right-5 top-5 text-[11px] font-black text-slate-200 tracking-widest">{step.step}</div>

                <div className={`inline-flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br ${step.gradient} shadow-xl ${step.glow}`}>
                  <step.icon className="h-6 w-6 text-white" strokeWidth={1.75} />
                </div>

                <p className={`mt-5 text-[10px] font-bold uppercase tracking-[0.18em] ${step.accent}`}>{step.role}</p>
                <h3 className="mt-1.5 text-xl font-bold text-slate-900">{step.title}</h3>
                <p className="mt-2.5 text-sm leading-[1.7] text-slate-500">{step.body}</p>

                <Link
                  href={step.href}
                  className={`mt-5 inline-flex items-center gap-1.5 text-sm font-bold ${step.accent} transition hover:opacity-80`}
                >
                  {step.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/auth?mode=signup"
              className="inline-flex items-center gap-2.5 rounded-full bg-emerald-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-500 active:scale-[0.97]"
            >
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </motion.section>

      {/* ── COMMODITY PRICE BOARD PREVIEW ── */}
      <motion.section {...viewFade(!!reduceMotion)} className="border-t border-slate-100 bg-slate-50/60 py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-10">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
                <BarChart3 className="h-4 w-4" />
                Price Board
              </span>
              <h2 className="mt-2.5 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                Today&apos;s commodity prices
              </h2>
              <p className="mt-1.5 text-xs text-slate-500 sm:text-sm">Crowdsourced from major markets across Nigeria. Updated daily.</p>
            </div>
            <Link
              href="/price-board"
              className="group inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 transition hover:text-emerald-700"
            >
              Full board + history
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:display-none">
            <div className="min-w-[500px]">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Commodity</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Unit</th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">Price</th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {commodityPrices.map((c, i) => (
                    <tr
                      key={c.crop}
                      className={`transition hover:bg-slate-50/80 ${i < commodityPrices.length - 1 ? "border-b border-slate-50" : ""}`}
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-slate-800">{c.crop}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{c.unit}</td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-slate-900 tabular-nums">{c.price}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                          c.trend === "up"
                            ? "bg-emerald-50 text-emerald-700"
                            : c.trend === "down"
                            ? "bg-red-50 text-red-600"
                            : "bg-slate-100 text-slate-500"
                        }`}>
                          {c.trend === "up" ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : c.trend === "down" ? (
                            <TrendingDown className="h-3 w-3" />
                          ) : (
                            <Minus className="h-3 w-3" />
                          )}
                          {c.change}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── WHY EASYMOVEZONE ── */}
      <motion.section {...viewFade(!!reduceMotion)} className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
                <ShieldCheck className="h-4 w-4" />
                Why EasyMoveZone
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Fixing Africa&apos;s{" "}
                <span className="text-emerald-600">post-harvest loss</span>{" "}
                problem
              </h2>
              <p className="mt-4 text-base leading-[1.75] text-slate-500">
                Africa loses 30–40% of harvests to spoilage and broken supply chains. We built the
                infrastructure to connect the right truck, to the right farm, at the right time —
                for every crop, every season.
              </p>

              <ul className="mt-8 space-y-3.5">
                {[
                  "Farm-gate to market-gate shipment tracking",
                  "Verified transporter profiles with insurance checks",
                  "Live commodity price board — no information asymmetry",
                  "Cold storage and warehouse partner network",
                  "SMS alerts for farmers without smartphones",
                  "Built-in dispute resolution and escrow payments",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm text-slate-700">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { label: "Post-harvest loss prevented", value: "₦2.4B", icon: Zap, gradient: "from-emerald-500 to-green-500", bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-800" },
                { label: "Average delivery time", value: "18 hrs", icon: Clock, gradient: "from-amber-500 to-orange-500", bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-800" },
                { label: "Active transporters", value: "1,200+", icon: Truck, gradient: "from-blue-500 to-cyan-500", bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-800" },
                { label: "Farmers onboarded", value: "8,400+", icon: Users, gradient: "from-lime-500 to-green-500", bg: "bg-lime-50", border: "border-lime-100", text: "text-lime-800" },
              ].map((stat) => (
                <div key={stat.label} className={`relative overflow-hidden rounded-2xl border ${stat.border} ${stat.bg} p-6`}>
                  <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                    <stat.icon className="h-5 w-5 text-white" strokeWidth={1.75} />
                  </div>
                  <div className={`text-3xl font-bold tabular-nums ${stat.text}`}>{stat.value}</div>
                  <div className={`mt-1.5 text-xs font-medium leading-snug ${stat.text} opacity-70`}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── CTA BANNER ── */}
      <motion.section {...viewFade(!!reduceMotion)} className="relative overflow-hidden bg-[#071a08] py-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 top-0 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[100px]" />
          <div className="absolute -left-24 bottom-0 h-[400px] w-[400px] rounded-full bg-lime-500/8 blur-[80px]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-400/25">
            <Wheat className="h-7 w-7 text-emerald-300" strokeWidth={1.75} />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Ready to move your harvest?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-emerald-200/70 max-w-lg mx-auto">
            Join thousands of farmers, transporters, and buyers already trading on EasyMoveZone.
            Free to get started — no capital required.
          </p>
          <div className="mt-10 flex flex-wrap gap-3.5 justify-center">
            <Link
              href="/auth?mode=signup&role=farmer"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-6 py-3.5 text-sm font-bold text-slate-900 shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-300 active:scale-[0.97]"
            >
              <Sprout className="h-4 w-4" />
              I&apos;m a farmer
            </Link>
            <Link
              href="/auth?mode=signup&role=transporter"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/[0.18] hover:border-white/30"
            >
              <Truck className="h-4 w-4" />
              I move cargo
            </Link>
            <Link
              href="/auth?mode=signup&role=buyer"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/[0.18] hover:border-white/30"
            >
              <Package className="h-4 w-4" />
              I&apos;m a buyer
            </Link>
          </div>
        </div>
      </motion.section>

      {/* ── QUICK ACTIONS ── */}
      <motion.section {...viewFade(!!reduceMotion)} className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
                <Sparkles className="h-3.5 w-3.5" />
                Quick actions
              </span>
              <h2 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">Jump to what you need</h2>
              <p className="mt-2 text-sm text-slate-500">Fast access to key workflows, optimized for mobile.</p>
            </div>
          </div>

          <div className="mx-auto mt-8 grid max-w-xl gap-4 sm:grid-cols-2 md:max-w-none lg:grid-cols-4">
            {quickActions.map((action, i) => (
              <motion.div
                key={action.label}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.45, ease: easeOut }}
              >
                <Link
                  href={action.href}
                  className="group flex h-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg"
                >
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <action.icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{action.label}</h3>
                    <p className="mt-1 text-xs text-slate-500">Get started in seconds.</p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 group-hover:text-emerald-700">
                    Open → 
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </>
  )
}

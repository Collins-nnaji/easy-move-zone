"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import {
  Home,
  Search,
  ArrowRight,
  Sparkles,
  Banknote,
  Check,
  HardHat,
  ShieldCheck,
  ArrowUpRight,
  Play,
  ChevronLeft,
  ChevronRight,
  Zap,
  KeyRound,
  ArrowLeftRight,
} from "lucide-react"
import { HomeFeaturedListings } from "@/components/platform/HomeFeaturedListings"
import { useRef, useState, useCallback } from "react"

const heroVideos = [
  "/emz construction.mp4",
  "/emz construction 2.mp4",
  "/emz construction 3.mp4",
  "/emz construction 4.mp4",
  "/emzbuilding one.mp4",
]

const services = [
  {
    label: "OUTRIGHT PURCHASE",
    title: "Buy a Verified Property",
    description: "Own it outright from day one. Every listing passes a full title check against state registries and family histories — no Omonile disputes, no government acquisition surprises.",
    icon: ShieldCheck,
    href: "/search",
    cta: "Browse verified homes",
    gradient: "from-cyan-500 to-blue-500",
    glow: "bg-cyan-500/20",
    accent: "text-cyan-400",
    border: "border-cyan-500/20",
    photo: "/emzheropic.png",
    photoPosition: "60% center",
  },
  {
    label: "BUILD",
    title: "Managed Build-to-Suit",
    description: "You own the land — we handle everything else. Architectural design, government building permits, and quality-controlled construction with digital milestone updates.",
    icon: HardHat,
    href: "/build",
    cta: "Start your build",
    gradient: "from-amber-500 to-orange-500",
    glow: "bg-amber-500/20",
    accent: "text-amber-400",
    border: "border-amber-500/20",
    photo: null,
    photoPosition: "",
  },
  {
    label: "FINANCE",
    title: "Mortgage & NHF Pathways",
    description: "Move in now, pay over 10–30 years. We broker applications through Access Bank, Stanbic IBTC, and the National Housing Fund for Diaspora and local buyers.",
    icon: Banknote,
    href: "/finance",
    cta: "Explore financing",
    gradient: "from-emerald-500 to-teal-500",
    glow: "bg-emerald-500/20",
    accent: "text-emerald-400",
    border: "border-emerald-500/20",
    photo: null,
    photoPosition: "",
  },
  {
    label: "UPGRADE",
    title: "Smart Move-In Fit-out",
    description: "Don't wait for the national grid. We install off-grid solar power, smart security locks, and water treatment systems before you move in — fully functional from Day 1.",
    icon: Zap,
    href: "/upgrade",
    cta: "See upgrade packages",
    gradient: "from-yellow-400 to-orange-400",
    glow: "bg-yellow-500/20",
    accent: "text-yellow-400",
    border: "border-yellow-500/20",
    photo: null,
    photoPosition: "",
  },
  {
    label: "RENT TO OWN",
    title: "Lease-Purchase Pathway",
    description: "Stop wasting money on traditional rent. Move into a verified home as a tenant — a portion of every monthly payment builds toward your purchase price.",
    icon: KeyRound,
    href: "/own",
    cta: "View rent-to-own homes",
    gradient: "from-purple-500 to-indigo-500",
    glow: "bg-purple-500/20",
    accent: "text-purple-400",
    border: "border-purple-500/20",
    photo: "/homepage pic 2.png",
    photoPosition: "center",
  },
  {
    label: "SWAP & RELOCATE",
    title: "Sell, Match & Move",
    description: "Changing city? We sell your current home, find you an equivalent verified property in your new location, and coordinate the full relocation — one team, one process.",
    icon: ArrowLeftRight,
    href: "/swap",
    cta: "Start your relocation",
    gradient: "from-rose-500 to-pink-500",
    glow: "bg-rose-500/20",
    accent: "text-rose-400",
    border: "border-rose-500/20",
    photo: null,
    photoPosition: "",
  },
] as const

const cities = [
  { name: "Lagos", state: "Lagos", count: "120+ Properties" },
  { name: "Abuja", state: "FCT", count: "85+ Properties" },
  { name: "Port Harcourt", state: "Rivers", count: "40+ Properties" },
  { name: "Ibadan", state: "Oyo", count: "35+ Properties" },
  { name: "Enugu", state: "Enugu", count: "25+ Properties" },
]

const easeOut = [0.16, 1, 0.3, 1] as const

const fadeUp = (delay = 0, y = 20) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: easeOut },
})

export function HomePageClient() {
  const reduceMotion = useReducedMotion()
  const heroRef = useRef<HTMLElement>(null)
  const [activeVideo, setActiveVideo] = useState(0)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })
  const heroParallax = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, 80])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.35])

  const prevVideo = useCallback(() => setActiveVideo((v) => (v - 1 + heroVideos.length) % heroVideos.length), [])
  const nextVideo = useCallback(() => setActiveVideo((v) => (v + 1) % heroVideos.length), [])

  return (
    <>
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[90vh] overflow-hidden flex items-center bg-[#020617]">
        <motion.div className="pointer-events-none absolute inset-0" style={{ y: heroParallax, opacity: heroOpacity }}>
          <Image
            src="/homepage pic.png"
            alt="EMZ easymovezone — verified Nigerian property with moving truck"
            fill
            priority
            className="object-cover scale-105"
            style={{ objectPosition: "30% center" }}
            sizes="100vw"
          />
          <div
            className="absolute inset-0 bg-gradient-to-br from-[#020617]/92 via-[#0f172a]/78 to-[#002880]/55"
            aria-hidden
          />
          <div className="absolute -right-40 top-1/4 h-[600px] w-[600px] rounded-full bg-[#0072CE]/20 blur-[120px]" aria-hidden />
          <div className="absolute -left-40 bottom-1/4 h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[120px]" aria-hidden />
        </motion.div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8 flex flex-col justify-center">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7 text-center lg:text-left">
              <motion.div
                {...fadeUp(0, 14)}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-cyan-200 backdrop-blur-md"
              >
                <Sparkles className="h-3.5 w-3.5" />
                The Complete Homeownership Ecosystem
              </motion.div>

              <motion.h1
                {...fadeUp(0.06, 22)}
                className="display-title text-5xl text-white sm:text-6xl lg:text-[4rem]"
              >
                Your path to owning
                <span className="block bg-gradient-to-r from-cyan-200 via-indigo-200 to-emerald-200 bg-clip-text text-transparent mt-2">
                  property in Africa.
                </span>
              </motion.h1>

              <motion.p
                {...fadeUp(0.12, 18)}
                className="mt-6 text-base leading-relaxed text-slate-300 max-w-xl mx-auto lg:mx-0"
              >
                We solve the trust and affordability gap. Secure verified land, access shared ownership schemes, track your build, and broker your mortgage — all in one place.
              </motion.p>

              <motion.div {...fadeUp(0.18, 18)} className="mt-10 max-w-xl mx-auto lg:mx-0">
                <form
                  action="/search"
                  method="get"
                  className="group relative rounded-2xl border border-white/20 bg-white/[0.08] p-2 shadow-2xl shadow-black/40 backdrop-blur-xl transition-all duration-300 focus-within:border-white/40 focus-within:bg-white/[0.12]"
                >
                  <Search className="pointer-events-none absolute left-6 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-cyan-400" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Search verified locations or schemes…"
                    className="w-full rounded-xl border-0 bg-white py-4 pl-14 pr-36 text-[15px] text-[#0f172a] shadow-none placeholder:text-slate-500 focus:outline-none focus:ring-0"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center gap-1.5 rounded-lg bg-[#0033A1] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#002880]"
                  >
                    Explore
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              </motion.div>
            </div>

            {/* Right-side — transparent stats overlay */}
            <motion.div
              {...fadeUp(0.24, 20)}
              className="lg:col-span-5 hidden lg:flex flex-col justify-center gap-6"
            >
              {/* Eyebrow label */}
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-400/80">
                Why EasyMoveZone
              </p>

              {/* Feature rows — no card background, text floats over photo */}
              <div className="space-y-5">
                {[
                  { label: "100% Title & Deed Verification", sub: "Every plot checked against state registries" },
                  { label: "Flexible Shared Equity", sub: "Start with what you have, buy out over time" },
                  { label: "End-to-End Build Oversight", sub: "Digital milestone tracking from your portal" },
                  { label: "Diaspora-Optimised Financing", sub: "NHF & tier-1 mortgage brokering" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-400/20 ring-1 ring-cyan-400/30">
                      <Check className="h-3 w-3 text-cyan-300" />
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-white leading-snug">{item.label}</p>
                      <p className="text-[12px] text-slate-400 mt-0.5">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA row */}
              <div className="flex items-center gap-4 pt-2 border-t border-white/10">
                <Link href="/search" className="inline-flex items-center gap-2 text-sm font-bold text-cyan-300 hover:text-white transition">
                  Browse verified homes <ArrowUpRight className="h-4 w-4" />
                </Link>
                <span className="text-white/20">·</span>
                <Link href="/own" className="text-sm font-semibold text-white/50 hover:text-white transition">
                  Rent-to-Own
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Construction Video Showcase */}
      <section className="bg-[#020617] py-20 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Active Developments</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Built with care.<br />
                <span className="text-slate-400">Watch it happen.</span>
              </h2>
              <p className="mt-4 text-slate-400 text-base max-w-md">
                Every property on EasyMoveZone comes with live construction visibility. Tour active sites, review milestones, and invest with confidence.
              </p>
              <div className="mt-8 flex flex-col gap-4">
                {[
                  { label: "5 Active Sites", sub: "Currently under construction" },
                  { label: "Real-time Updates", sub: "Video & photo milestone logs" },
                  { label: "Verified Contractors", sub: "All vetted through our registry" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-cyan-400 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link
                  href="/search?filter=build"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0033A1] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#002880]"
                >
                  <HardHat className="h-4 w-4" />
                  Browse Build Projects
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Video carousel */}
            <div className="relative rounded-3xl overflow-hidden bg-black shadow-2xl shadow-black/60 aspect-video">
              <AnimatePresence mode="wait">
                <motion.video
                  key={activeVideo}
                  src={heroVideos[activeVideo]}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Prev / Next controls */}
              <button
                onClick={prevVideo}
                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
                aria-label="Previous video"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextVideo}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
                aria-label="Next video"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Dot indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {heroVideos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveVideo(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === activeVideo ? "w-6 bg-white" : "w-1.5 bg-white/40"}`}
                    aria-label={`Go to video ${i + 1}`}
                  />
                ))}
              </div>

              {/* Label */}
              <div className="absolute bottom-10 left-4 flex items-center gap-2 text-xs font-semibold text-white/80">
                <Play className="h-3.5 w-3.5 fill-white text-white" />
                Site {activeVideo + 1} of {heroVideos.length}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Everything You Need — uniform 5-card grid */}
      <section className="py-24 bg-[#07090f] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(0,51,161,0.22),transparent)]" aria-hidden />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_80%_80%,rgba(139,92,246,0.08),transparent)]" aria-hidden />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-16 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                <Sparkles className="h-3 w-3" />
                Everything you need
              </div>
              <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
                Six ways we get
                <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent"> you home.</span>
              </h2>
            </div>
            <p className="max-w-sm text-[15px] leading-relaxed text-slate-400 lg:text-right">
              From finding the land to moving in fully powered — we own every step of your property journey.
            </p>
          </div>

          {/* Uniform 5-card grid: 2 top, 3 bottom — all equal height */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, idx) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: idx * 0.07, duration: 0.6, ease: easeOut }}
                className={`group relative min-h-[320px] overflow-hidden rounded-3xl border ${s.border} transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50 ${!s.photo ? "bg-white/[0.03] hover:bg-white/[0.055]" : ""}`}
              >
                {/* Photo background (BUY + RENT TO OWN) */}
                {s.photo && (
                  <>
                    <Image
                      src={s.photo}
                      alt={s.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      style={{ objectPosition: s.photoPosition }}
                      sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07090f]/97 via-[#07090f]/60 to-[#07090f]/20" />
                  </>
                )}

                {/* Glow blob for plain cards */}
                {!s.photo && (
                  <div className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full ${s.glow} blur-[70px]`} aria-hidden />
                )}

                {/* Card content */}
                <div className="relative z-10 flex h-full min-h-[320px] flex-col p-7">
                  <div className="flex items-center gap-3">
                    <div className={`inline-flex rounded-xl bg-gradient-to-br p-2.5 ${s.gradient} text-white shadow-lg`}>
                      <s.icon className="h-5 w-5" />
                    </div>
                    <span className={`text-[11px] font-black uppercase tracking-[0.22em] ${s.accent}`}>{s.label}</span>
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-white">{s.title}</h3>
                  <p className={`mt-2 text-sm leading-relaxed ${s.photo ? "text-slate-300" : "text-slate-400"}`}>
                    {s.description}
                  </p>

                  <div className="mt-auto pt-6">
                    <Link
                      href={s.href}
                      className={`inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r ${s.gradient} px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:opacity-90`}
                    >
                      {s.cta} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Markets / Cities */}
      <section className="py-20 bg-[#f8fafc]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#0033A1]">Locations</span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl">Explore Verified Markets</h2>
            </div>
            <Link href="/search" className="mt-4 md:mt-0 inline-flex items-center gap-2 text-sm font-semibold text-[#0033A1] hover:underline">
              View all locations <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {cities.map((city, idx) => (
              <motion.div
                key={city.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
              >
                <Link
                  href={`/search?city=${city.name.toLowerCase()}`}
                  className="group block rounded-2xl border border-slate-200 bg-white p-6 hover:border-[#0033A1]/30 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-[#0f172a] text-lg group-hover:text-[#0033A1] transition-colors">{city.name}</h3>
                      <p className="text-xs text-slate-500 mt-1">{city.state}</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">{city.count}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <HomeFeaturedListings />
    </>
  )
}

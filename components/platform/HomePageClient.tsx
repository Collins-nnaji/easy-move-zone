"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import {
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
  KeyRound,
} from "lucide-react"
import { HomeFeaturedListings } from "@/components/platform/HomeFeaturedListings"
import { useRef, useState, useCallback, useEffect } from "react"
import { clsx } from "clsx"

const heroVideos = [
  "/emz construction.mp4",
  "/emz construction 2.mp4",
  "/emz construction 3.mp4",
  "/emz construction 4.mp4",
  "/emzbuilding one.mp4",
]

const heroImages = [
  { src: "/homepage pic.png", position: "30% center" },
  { src: "/emzheropic.png", position: "60% center" },
]

const services = [
  {
    label: "OUTRIGHT PURCHASE",
    title: "Buy a Verified Property",
    description: "Own it outright from day one. Every listing passes a full title check against state registries and family histories — no Omonile disputes, no government acquisition surprises.",
    icon: ShieldCheck,
    href: "/purchase",
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
] as const

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
  const [activeHeroImg, setActiveHeroImg] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveVideo((v) => (v + 1) % heroVideos.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [activeVideo])

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHeroImg((v) => (v + 1) % heroImages.length)
    }, 2000)
    return () => clearInterval(timer)
  }, [])
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
          <AnimatePresence mode="sync">
            <motion.div
              key={activeHeroImg}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={heroImages[activeHeroImg].src}
                alt="EMZ easymovezone — verified Nigerian property"
                fill
                priority={activeHeroImg === 0}
                className="object-cover scale-105"
                style={{ objectPosition: heroImages[activeHeroImg].position }}
                sizes="100vw"
              />
            </motion.div>
          </AnimatePresence>
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
                Affordable Homes & Moving Solutions
              </motion.div>

              <motion.h1
                {...fadeUp(0.06, 22)}
                className="display-title text-5xl text-white sm:text-6xl lg:text-[4rem]"
              >
                Own & move to your home
                <span className="block bg-gradient-to-r from-cyan-200 via-indigo-200 to-emerald-200 bg-clip-text text-transparent mt-2">
                  the cheapest way.
                </span>
              </motion.h1>

              <motion.p
                {...fadeUp(0.12, 18)}
                className="mt-6 text-base leading-relaxed text-slate-300 max-w-xl mx-auto lg:mx-0"
              >
                We help you own and move to your house the cheapest way possible. No rip-offs, no hidden fees — just 100% transparent pricing and unmatched quality across every service.
              </motion.p>

              <motion.div {...fadeUp(0.18, 18)} className="mt-10 max-w-xl mx-auto lg:mx-0">
                <form
                  action="/purchase"
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
                  { label: "100% Transparent Pricing", sub: "Zero hidden fees, zero rip-offs" },
                  { label: "Cheapest Pathway to Ownership", sub: "Optimized moving & buying strategies" },
                  { label: "Guaranteed Quality Homes", sub: "Strict vetting and material standards" },
                  { label: "100% Title Verification", sub: "Every plot checked against state registries" },
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
                <Link href="/purchase" className="inline-flex items-center gap-2 text-sm font-bold text-cyan-300 hover:text-white transition">
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
                  href="/build"
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

      {/* Everything You Need — interactive carousel */}
      <section className="py-24 bg-slate-50 text-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(0,51,161,0.05),transparent)]" aria-hidden />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_80%_80%,rgba(139,92,246,0.03),transparent)]" aria-hidden />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-16 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-800">
                <Sparkles className="h-3 w-3 text-cyan-600" />
                Everything you need
              </div>
              <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl text-slate-900">
                The cheapest way to
                <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent"> own & move.</span>
              </h2>
            </div>
            <p className="max-w-sm text-[15px] leading-relaxed text-slate-600 lg:text-right">
              We provide affordable homes with fully transparent pricing. No rip-off costs, just verified quality from start to finish.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((s) => {
              const Icon = s.icon
              // Map service href to listing_type key
              return (
                <div
                  key={s.label}
                  className={clsx(
                    "w-full flex flex-col justify-between rounded-2xl bg-white border border-slate-200/60 shadow-lg shadow-slate-200/50 p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-slate-200/60 relative overflow-hidden",
                  )}
                >
                  <div className={clsx(
                    "absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-10 blur-[50px] pointer-events-none transition-all duration-700",
                    s.glow
                  )} />

                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-4">
                          <div className={clsx(
                            "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-md text-white shrink-0",
                            s.gradient
                          )}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <span className={clsx("text-[9px] font-bold uppercase tracking-[0.2em]", s.accent)}>
                              {s.label}
                            </span>
                            <h3 className="text-base font-bold text-slate-900 mt-0.5 leading-tight">
                              {s.title}
                            </h3>
                          </div>
                        </div>
                      </div>

                      <p className="mt-4 text-sm leading-relaxed text-slate-600">
                        {s.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100">
                      <Link
                        href={s.href}
                        className={clsx(
                          "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:opacity-90 hover:shadow-lg w-full sm:w-auto",
                          s.gradient
                        )}
                      >
                        {s.cta} <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <HomeFeaturedListings />
    </>
  )
}

"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  Sparkles,
  Check,
  ArrowUpRight,
  Play,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Home,
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

const hubs = [
  {
    label: "MOVE",
    title: "Your relocation, sorted",
    description: "Two weeks or two years — tell us how long you're staying and get a tailored plan: visa routes, logistics, settling in, and a checklist that actually fits your move.",
    icon: MapPin,
    href: "/move",
    cta: "Start your move",
    gradient: "from-[#e0511f] to-amber-500",
    glow: "bg-orange-500/20",
    accent: "text-orange-500",
    border: "border-orange-500/20",
    photo: "/homepage pic 2.png",
    photoPosition: "center",
  },
  {
    label: "PROPERTIES",
    title: "Homes you can trust",
    description: "Search verified listings across Nigeria — buy outright, rent month-to-month, or sign a lease. Every property is title-checked, with transparent pricing and no hidden fees.",
    icon: Home,
    href: "/purchase",
    cta: "Browse properties",
    gradient: "from-cyan-500 to-blue-500",
    glow: "bg-cyan-500/20",
    accent: "text-cyan-600",
    border: "border-cyan-500/20",
    photo: "/emzheropic.png",
    photoPosition: "60% center",
  },
] as const

const heroHighlights = [
  { label: "Plans that adapt to you", sub: "Short stay, long stay, or permanent — your checklist changes with you" },
  { label: "Built for mobile", sub: "Answer a few questions, track your progress, stay organised on the go" },
  { label: "Verified homes only", sub: "Title-checked listings — buy, rent, or lease with confidence" },
  { label: "Made for movers", sub: "Diaspora, returnees, and anyone starting fresh in Nigeria" },
] as const

const howItWorks = [
  { step: "01", label: "Tell us about your move", sub: "How long you're staying, where you're headed, what matters to you" },
  { step: "02", label: "Get your personalised plan", sub: "Visa guidance, logistics, settling-in tasks — all in one checklist" },
  { step: "03", label: "Find your next home", sub: "Browse verified properties to buy, rent, or lease when you're ready" },
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
                alt="EasyMoveZone — plan your move and find verified homes in Nigeria"
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
                Move & property, one place
              </motion.div>

              <motion.h1
                {...fadeUp(0.06, 22)}
                className="display-title text-5xl text-white sm:text-6xl lg:text-[4rem]"
              >
                Plan your move.
                <span className="block bg-gradient-to-r from-orange-300 via-cyan-200 to-blue-200 bg-clip-text text-transparent mt-2">
                  Find your home.
                </span>
              </motion.h1>

              <motion.p
                {...fadeUp(0.12, 18)}
                className="mt-6 text-base leading-relaxed text-slate-300 max-w-xl mx-auto lg:mx-0"
              >
                Whether you&apos;re relocating for a few weeks or putting down roots, EasyMoveZone guides you through every step — then connects you to verified homes you can buy, rent, or lease across Nigeria.
              </motion.p>

              <motion.div {...fadeUp(0.18, 18)} className="mt-10 flex flex-col sm:flex-row gap-3 max-w-xl mx-auto lg:mx-0">
                <Link
                  href="/move"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e0511f] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#c9451a]"
                >
                  <MapPin className="h-4 w-4" />
                  Plan your move
                </Link>
                <Link
                  href="/purchase"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
                >
                  Browse properties
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </div>

            {/* Right-side — transparent stats overlay */}
            <motion.div
              {...fadeUp(0.24, 20)}
              className="lg:col-span-5 hidden lg:flex flex-col justify-center gap-6"
            >
              {/* Eyebrow label */}
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-400/80">
                Why people choose us
              </p>

              <div className="space-y-5">
                {heroHighlights.map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
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
                <Link href="/move" className="inline-flex items-center gap-2 text-sm font-bold text-orange-300 hover:text-white transition">
                  Start your move <ArrowUpRight className="h-4 w-4" />
                </Link>
                <span className="text-white/20">·</span>
                <Link href="/purchase" className="text-sm font-semibold text-white/50 hover:text-white transition">
                  Buy, rent & lease
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#020617] py-20 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">How it works</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                From departure<br />
                <span className="text-slate-400">to doorstep.</span>
              </h2>
              <p className="mt-4 text-slate-400 text-base max-w-md">
                No spreadsheets, no guesswork. Open the move app, answer a few questions, and we build a plan around your timeline — then point you to homes when you&apos;re ready.
              </p>
              <div className="mt-8 flex flex-col gap-5">
                {howItWorks.map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <span className="mt-0.5 font-mono text-xs font-bold text-orange-400/80">{item.step}</span>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link
                  href="/move"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#e0511f] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#c9451a]"
                >
                  <MapPin className="h-4 w-4" />
                  Try the move app
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
                Life in Nigeria
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
                Two ways in
              </div>
              <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl text-slate-900">
                Start with your move
                <span className="bg-gradient-to-r from-orange-500 via-cyan-600 to-blue-600 bg-clip-text text-transparent"> or your next home.</span>
              </h2>
            </div>
            <p className="max-w-sm text-[15px] leading-relaxed text-slate-600 lg:text-right">
              Two hubs, one platform. Plan your relocation in a guided mobile flow, or jump straight to verified properties — buy, rent, or lease.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {hubs.map((s) => {
              const Icon = s.icon
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

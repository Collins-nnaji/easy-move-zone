"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Sparkles,
  MapPin,
  Home,
  Users,
  Bot,
  Building2,
  Briefcase,
  Check,
  ChevronRight,
  Star,
  Shield,
  Zap,
  Clock,
  Globe,
} from "lucide-react"
import { useState } from "react"

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: "easeOut" as const },
})

const popularCities = ["Manchester", "Berlin", "Lisbon", "Toronto", "Dubai", "London", "Amsterdam"]

const journeySteps = [
  { step: "01", label: "Explore",   desc: "Discover areas that match your budget & lifestyle" },
  { step: "02", label: "Housing",   desc: "AI-curated listings, viewings & references" },
  { step: "03", label: "Documents", desc: "Visa, bank, SIM card — guided checklist" },
  { step: "04", label: "Arrival",   desc: "Move logistics, transport, first week setup" },
  { step: "05", label: "Settled",   desc: "Local community, services, and life sorted" },
]

const userTypes = [
  {
    icon: Home,
    label: "Mover",
    desc: "Personal relocation dashboard, housing matches, AI concierge",
    href: "/onboarding",
    cta: "Start your journey",
    accent: "#E85C2D",
    bg: "rgba(232,92,45,0.06)",
  },
  {
    icon: Building2,
    label: "Landlord",
    desc: "List properties, manage inquiries & tenant pipeline",
    href: "/landlord",
    cta: "List a property",
    accent: "#0033A1",
    bg: "rgba(0,51,161,0.06)",
  },
  {
    icon: Briefcase,
    label: "Partner",
    desc: "Take relocation cases, earn commission, grow your reputation",
    href: "/partner",
    cta: "Join as partner",
    accent: "#4A7C59",
    bg: "rgba(74,124,89,0.06)",
  },
]

const stats = [
  { value: "42k+", label: "movers onboarded" },
  { value: "180+", label: "cities mapped" },
  { value: "4.8★",  label: "avg. rating" },
  { value: "94%",  label: "settled within target" },
]

const features = [
  {
    icon: MapPin,
    title: "City Explorer",
    desc: "Compare areas by rent, commute, safety, and vibe. Map-first or grid comparison.",
    link: "/explore",
    color: "#E85C2D",
  },
  {
    icon: Home,
    title: "Housing Matches",
    desc: "AI-curated listings filtered to your exact budget, timeline, and preferences. Updated daily.",
    link: "/explore",
    color: "#0033A1",
  },
  {
    icon: Bot,
    title: "AI Concierge",
    desc: "Ask anything about your move. Get area recommendations, cost breakdowns, and landlord messages drafted.",
    link: "/ai",
    color: "#4A7C59",
  },
  {
    icon: Check,
    title: "Settlement Checklist",
    desc: "28 tasks from passport to SIM card — auto-prioritised for your move date.",
    link: "/dashboard",
    color: "#E85C2D",
  },
  {
    icon: Users,
    title: "Community",
    desc: "Connect with people moving to the same city. Share tips, find flatmates, get insider advice.",
    link: "/community",
    color: "#0033A1",
  },
  {
    icon: Star,
    title: "Cost Tracker",
    desc: "See your projected vs actual relocation spend. Deposit, movers, setup — all in one view.",
    link: "/dashboard",
    color: "#4A7C59",
  },
]

const reviews = [
  {
    quote: "Found my flat in Chorlton in 3 days. The AI concierge drafted all my landlord messages — I just clicked send.",
    name: "Amira K.",
    move: "London → Manchester",
    rating: 5,
    initial: "A",
    color: "#E85C2D",
  },
  {
    quote: "The area comparison grid saved me weeks of research. I knew Didsbury wasn't right before I even visited.",
    name: "Tom L.",
    move: "Berlin → Amsterdam",
    rating: 5,
    initial: "T",
    color: "#0033A1",
  },
  {
    quote: "My relocation partner used this for my corporate move. The case management made it seamless.",
    name: "Priya R.",
    move: "Bangalore → Berlin",
    rating: 5,
    initial: "P",
    color: "#4A7C59",
  },
]

const trustBadges = [
  { icon: Shield, text: "Bank-grade security" },
  { icon: Zap,    text: "AI-powered matching" },
  { icon: Clock,  text: "90-second setup" },
  { icon: Globe,  text: "180+ cities mapped" },
]

interface HomePageClientProps {
  cityCounts?: Record<string, number>
}

export function HomePageClient({ cityCounts = {} }: HomePageClientProps) {
  const [destination, setDestination] = useState("")

  return (
    <div className="bg-[#F7F5F0] min-h-screen">

      {/* ── Hero ─────────────────────────────────── */}
      <section className="relative overflow-hidden pt-16 pb-14 lg:pt-24 lg:pb-20">
        {/* Background gradients */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-0 left-1/4 w-[700px] h-[500px] bg-[radial-gradient(ellipse,rgba(232,92,45,0.09)_0%,transparent_65%)] -translate-x-1/2 blur-3xl" />
          <div className="absolute top-20 right-0 w-[500px] h-[400px] bg-[radial-gradient(ellipse,rgba(0,51,161,0.06)_0%,transparent_60%)] blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-[radial-gradient(ellipse,rgba(74,124,89,0.05)_0%,transparent_60%)] blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">

            {/* Left: copy */}
            <div>
              <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 relo-chip relo-chip-accent mb-6">
                <Sparkles className="h-3.5 w-3.5" />
                The Relocation OS
              </motion.div>

              <motion.h1 {...fadeUp(0.06)} className="font-display text-[2.6rem] sm:text-6xl lg:text-[4rem] font-bold tracking-tight text-[#1A1612] leading-[1.04]">
                Where are you<br />
                <span className="text-[#E85C2D]">moving to?</span>
              </motion.h1>

              <motion.p {...fadeUp(0.12)} className="mt-5 text-lg text-[#6B6460] leading-relaxed max-w-lg">
                Tell us where you're going. We'll build your personal relocation
                dashboard — areas, housing, paperwork, settling in.
              </motion.p>

              {/* Search input */}
              <motion.div {...fadeUp(0.18)} className="mt-9">
                <form action="/onboarding" method="get" className="flex max-w-xl flex-col gap-2.5 sm:flex-row">
                  <div className="flex flex-1 items-center gap-3 rounded-xl border border-[#E4DFDA] bg-white px-4 py-3.5 shadow-sm transition-all focus-within:border-[#E85C2D] focus-within:ring-2 focus-within:ring-[rgba(232,92,45,0.12)]">
                    <MapPin className="h-4 w-4 shrink-0 text-[#E85C2D]" />
                    <input
                      type="text"
                      name="destination"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="e.g. Manchester, UK"
                      className="min-w-0 flex-1 bg-transparent text-[15px] text-[#1A1612] placeholder:text-[#A8A4A0] outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="relo-btn-primary shrink-0 rounded-xl px-6 py-3.5 text-sm w-full sm:w-auto"
                  >
                    Begin <ArrowRight className="h-4 w-4" />
                  </button>
                </form>

                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-[#A8A4A0] font-medium">Popular:</span>
                  {popularCities.map((city) => (
                    <button
                      type="button"
                      key={city}
                      onClick={() => setDestination(city)}
                      className="relo-chip text-xs hover:bg-[rgba(232,92,45,0.1)] hover:text-[#C44520] transition-colors cursor-pointer"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div {...fadeUp(0.24)} className="mt-11 flex items-center gap-8 flex-wrap">
                {stats.map((s, i) => (
                  <div key={i}>
                    <div className="text-2xl font-bold font-display text-[#1A1612] tracking-tight">{s.value}</div>
                    <div className="text-xs text-[#6B6460] font-medium mt-0.5">{s.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: dashboard preview */}
            <motion.div {...fadeUp(0.08)} className="relative hidden lg:block h-[500px]">
              {/* Main dashboard card */}
              <div className="absolute top-0 right-0 w-[350px] relo-card p-5 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-[10px] text-[#A8A4A0] font-bold tracking-wide uppercase">Your dashboard</div>
                    <div className="text-lg font-bold text-[#1A1612] mt-0.5">Hi Amira ✦</div>
                    <div className="text-xs text-[#6B6460]">London → Manchester · May 28</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#E85C2D] flex items-center justify-center text-white text-sm font-bold shadow-sm">A</div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[["Housing", "23"], ["Budget", "£1.2k"], ["Tasks", "3/8"]].map(([k, v]) => (
                    <div key={k} className="bg-[#F7F5F0] rounded-xl p-2.5">
                      <div className="text-[9px] text-[#A8A4A0] font-bold tracking-wide uppercase">{k}</div>
                      <div className="text-base font-bold text-[#1A1612] mt-0.5">{v}</div>
                    </div>
                  ))}
                </div>

                {/* Journey */}
                <div className="text-[9px] text-[#A8A4A0] font-bold uppercase mb-2">Journey · Step 2 of 5</div>
                <div className="flex gap-1 mb-1">
                  {["Explore", "Housing", "Docs", "Arrive", "Settled"].map((s, i) => (
                    <div key={s} className="flex-1">
                      <div className={`h-1.5 rounded-full ${i <= 1 ? "bg-[#E85C2D]" : "bg-[#E4DFDA]"}`} />
                      <div className={`text-[7px] mt-1 font-semibold ${i <= 1 ? "text-[#E85C2D]" : "text-[#C8C3BE]"}`}>{s}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Concierge card */}
              <div className="absolute top-[200px] left-0 w-[300px] relo-ai-card shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#E85C2D] to-[#C84420] flex items-center justify-center">
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#E85C2D]">AI Concierge</div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#4A7C59] animate-pulse" />
                      <span className="text-[9px] text-[#4A7C59] font-semibold">Online</span>
                    </div>
                  </div>
                </div>
                <div className="bg-[#F7F5F0] rounded-lg p-2.5 mb-2">
                  <p className="text-xs text-[#6B6460]">"£1,200/mo, no car — where in Manchester?"</p>
                </div>
                <div className="bg-white border border-[#E4DFDA] rounded-lg p-2.5">
                  <p className="text-xs text-[#1A1612]">3 areas match — <span className="font-semibold text-[#E85C2D]">Chorlton tops</span> on transit + cafés. Levenshulme is cheaper.</p>
                </div>
              </div>

              {/* Area match card */}
              <div className="absolute bottom-0 right-8 w-[260px] relo-card p-4 shadow-lg">
                <div className="text-[9px] text-[#A8A4A0] font-bold uppercase mb-2">Top area match</div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E85C2D]/20 to-[#E85C2D]/5 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-[#E85C2D]" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#1A1612]">Chorlton</div>
                    <div className="text-xs text-[#6B6460]">£950–1,200/mo · 18min</div>
                    <div className="mt-1.5 inline-flex items-center gap-1 bg-[rgba(232,92,45,0.1)] text-[#C44520] text-[10px] font-bold px-2 py-0.5 rounded-full">
                      92/100 match
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Trust badges ─────────────────────────── */}
      <section className="border-y border-[#E4DFDA] bg-white py-5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
            {trustBadges.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm text-[#6B6460] font-medium">
                <Icon className="h-4 w-4 text-[#E85C2D] shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── User type cards ───────────────────────── */}
      <section className="py-20 bg-white border-b border-[#E4DFDA]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="text-[10px] font-bold tracking-widest text-[#E85C2D] uppercase mb-3">Who is this for?</div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1A1612] tracking-tight">
              One platform, three dashboards
            </h2>
            <p className="mt-3 text-[#6B6460] max-w-xl mx-auto">Whether you're moving, renting out, or managing relocations — we have a dashboard built for you.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {userTypes.map((type) => {
              const Icon = type.icon
              return (
                <Link
                  key={type.label}
                  href={type.href}
                  className="group relo-card p-7 block hover:no-underline"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                    style={{ background: type.bg }}
                  >
                    <Icon className="h-6 w-6" style={{ color: type.accent }} />
                  </div>
                  <div className="text-xl font-bold text-[#1A1612] mb-2">{type.label}</div>
                  <p className="text-sm text-[#6B6460] leading-relaxed mb-6">{type.desc}</p>
                  <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: type.accent }}>
                    {type.cta}
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-[10px] font-bold tracking-widest text-[#E85C2D] uppercase mb-3">Your relocation journey</div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1A1612] tracking-tight mb-4">
                From "thinking about it"<br />to fully settled.
              </h2>
              <p className="text-[#6B6460] leading-relaxed mb-8">
                Every step of your move is guided, tracked, and AI-assisted. Your dashboard shows exactly where you are and what to do next.
              </p>
              <Link href="/onboarding" className="relo-btn-primary inline-flex rounded-xl px-6 py-3.5">
                Build my dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="relative">
              {/* Connector line */}
              <div className="absolute left-5 top-5 bottom-5 w-px bg-gradient-to-b from-[#E85C2D] via-[#E4DFDA] to-[#E4DFDA] hidden sm:block" aria-hidden />

              <div className="flex flex-col gap-5">
                {journeySteps.map((step, i) => (
                  <div key={step.step} className="flex items-start gap-4 relative">
                    <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      i === 0
                        ? "bg-[#E85C2D] text-white shadow-[0_4px_14px_rgba(232,92,45,0.35)]"
                        : "bg-white border-2 border-[#E4DFDA] text-[#6B6460]"
                    }`}>
                      {i === 0 ? <Check className="h-4 w-4" /> : step.step}
                    </div>
                    <div className="flex-1 pt-1.5">
                      <div className={`font-semibold text-[15px] ${i === 0 ? "text-[#E85C2D]" : "text-[#1A1612]"}`}>
                        {step.label}
                      </div>
                      <div className="text-sm text-[#6B6460] mt-0.5">{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────── */}
      <section className="py-20 bg-white border-y border-[#E4DFDA]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="text-[10px] font-bold tracking-widest text-[#E85C2D] uppercase mb-3">Platform features</div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1A1612] tracking-tight">
              Everything built into one OS
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Link key={feature.title} href={feature.link} className="group relo-card p-6 block hover:no-underline">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                    style={{ background: `${feature.color}12` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: feature.color }} />
                  </div>
                  <div className="font-semibold text-[#1A1612] mb-2">{feature.title}</div>
                  <p className="text-sm text-[#6B6460] leading-relaxed">{feature.desc}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold" style={{ color: feature.color }}>
                    Learn more <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="text-[10px] font-bold tracking-widest text-[#E85C2D] uppercase mb-3">Movers trust us</div>
            <h2 className="font-display text-3xl font-bold text-[#1A1612] tracking-tight">Stories from the OS</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {reviews.map((review, i) => (
              <div key={i} className="relo-card p-6 flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: review.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-[#E85C2D] text-[#E85C2D]" />
                  ))}
                </div>
                <p className="text-[#1A1612] text-sm leading-relaxed flex-1 mb-5">"{review.quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-[#E4DFDA]">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ background: review.color }}
                  >
                    {review.initial}
                  </div>
                  <div>
                    <div className="font-semibold text-[#1A1612] text-sm">{review.name}</div>
                    <div className="text-xs text-[#6B6460] mt-0.5">{review.move}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA band ─────────────────────────────── */}
      <section className="py-20 bg-[#1A1612] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse,rgba(232,92,45,0.15)_0%,transparent_60%)] blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 relo-chip mb-6" style={{ background: "rgba(232,92,45,0.15)", color: "#F07A52", border: "1px solid rgba(232,92,45,0.2)" }}>
            <Sparkles className="h-3.5 w-3.5" />
            Get started in 90 seconds
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight mb-5">
            Ready to start your<br />
            <span className="text-[#E85C2D]">relocation journey?</span>
          </h2>
          <p className="text-[#9A9490] text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Answer 6 quick questions. We'll build your personalised relocation dashboard with housing matches, tasks, and AI concierge — all ready to go.
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 bg-[#E85C2D] text-white font-bold text-base px-8 py-4 rounded-xl hover:bg-[#D44E22] transition-all shadow-lg shadow-[rgba(232,92,45,0.35)] hover:shadow-[rgba(232,92,45,0.5)] hover:-translate-y-0.5"
          >
            Build my relocation dashboard
            <ArrowRight className="h-5 w-5" />
          </Link>
          <div className="mt-7 flex items-center justify-center gap-6 text-sm text-[#6B6460]">
            <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#4A7C59]" /> Free to start</span>
            <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#4A7C59]" /> No credit card</span>
            <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#4A7C59]" /> 90 seconds</span>
          </div>
        </div>
      </section>
    </div>
  )
}

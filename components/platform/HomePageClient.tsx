"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"
import {
  Home,
  Search,
  ArrowRight,
  Handshake,
  Building2,
  BadgeCheck,
  Sparkles,
  Scale,
  Banknote,
  Landmark,
  Users,
  Check,
  MapPin,
} from "lucide-react"
import { HomeFeaturedListings } from "@/components/platform/HomeFeaturedListings"
import { useRef } from "react"

const heroBg =
  "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=2400&q=80"

const partnersSectionBg =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2400&q=80"

const partnerPillars = [
  {
    title: "Government & agencies",
    description:
      "Verification aligned with land registries, cadastral data, and planning authorities — listings that map to public records.",
    icon: Landmark,
  },
  {
    title: "Developers & estates",
    description:
      "Title-backed inventory from licensed developers and master-plan communities — surfaced to local and diaspora buyers.",
    icon: Building2,
  },
  {
    title: "Legal & professionals",
    description:
      "Surveyors, conveyancing, and compliance partners integrated from document intake to buyer-ready diligence.",
    icon: Scale,
  },
] as const

const cities = [
  { name: "Lagos", state: "Lagos" },
  { name: "Abuja", state: "FCT" },
  { name: "Port Harcourt", state: "Rivers" },
  { name: "Ibadan", state: "Oyo" },
  { name: "Enugu", state: "Enugu" },
  { name: "Kano", state: "Kano" },
]

const trustStats = [
  { value: "2,400+", label: "Verified listings", icon: BadgeCheck },
  { value: "98.7%", label: "Fraud signals caught", icon: Home },
  { value: "₦45B+", label: "Value guided", icon: Sparkles },
  { value: "12,000+", label: "Buyers supported", icon: Users },
]

const mortgageWriteups = [
  {
    title: "Nigeria-first home finance",
    body: "EasyMoveZone focuses on Nigerian buyers and the diaspora: we help you understand what documentation lenders expect alongside a verified purchase, so you are not guessing in isolation.",
  },
  {
    title: "Major bank pathways",
    body: "We facilitate introductions and coordination with trusted partners including Access Bank, Stanbic IBTC, and First Bank — aligned to how each institution underwrites verified property deals.",
  },
  {
    title: "Diaspora NHF & public schemes",
    body: "Where you qualify, we support navigation of Diaspora NHF and related FMBN / NiDCOM pathways, so offshore contributors can connect structured savings and contributions to an eligible home purchase.",
  },
  {
    title: "Tied to your verified deal",
    body: "Financing conversations run in parallel with title verification and your transaction timeline — not as a generic product pitch disconnected from the actual file you are buying.",
  },
] as const

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

export function HomePageClient() {
  const reduceMotion = useReducedMotion()
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })
  const heroParallax = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, 80])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.35])

  return (
    <>
      {/* Hero */}
      <section ref={heroRef} className="relative min-h-[88vh] overflow-hidden md:min-h-[90vh]">
        <motion.div className="pointer-events-none absolute inset-0" style={{ y: heroParallax, opacity: heroOpacity }}>
          <Image
            src={heroBg}
            alt=""
            fill
            priority
            className="object-cover object-center scale-105"
            sizes="100vw"
          />
          <div
            className="absolute inset-0 bg-gradient-to-br from-[#020617]/92 via-[#0f172a]/78 to-[#0033A1]/55"
            aria-hidden
          />
          <motion.div
            className="absolute -right-20 top-1/4 h-[min(55vw,520px)] w-[min(55vw,520px)] rounded-full bg-[#0072CE]/25 blur-[100px]"
            animate={
              reduceMotion
                ? undefined
                : {
                    scale: [1, 1.08, 1],
                    opacity: [0.35, 0.5, 0.35],
                  }
            }
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          />
          <div className="home-hero-grid absolute inset-0 opacity-[0.12]" aria-hidden />
        </motion.div>

        <div className="relative z-10 mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-center px-4 pb-16 pt-24 sm:px-6 md:min-h-[90vh] lg:px-8 lg:pb-20 lg:pt-28">
          <div className="grid w-full items-start gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="mx-auto max-w-3xl text-center lg:col-span-7 lg:mx-0 lg:max-w-none lg:text-left">
              <motion.div
                {...fadeUp(0, 14)}
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide text-white/90 backdrop-blur-md"
              >
                <motion.span
                  animate={reduceMotion ? undefined : { rotate: [0, 12, -12, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="h-3.5 w-3.5 text-cyan-200" />
                </motion.span>
                In-house verified · No syndicated feeds
              </motion.div>

              <motion.h1
                {...fadeUp(reduceMotion ? 0 : 0.06, 22)}
                className="text-[2rem] font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl sm:leading-[1.05] lg:text-[3.25rem]"
              >
                Property in Nigeria,
                <br />
                <span className="bg-gradient-to-r from-white via-cyan-100 to-emerald-200/90 bg-clip-text text-transparent">
                  cleared before you commit.
                </span>
              </motion.h1>

              <motion.p
                {...fadeUp(reduceMotion ? 0 : 0.12, 18)}
                className="mx-auto mt-5 max-w-lg text-pretty text-sm leading-relaxed text-slate-300 sm:text-base lg:mx-0"
              >
                We list and manage every property ourselves — verified in-house, with transparent checks and guided support
                for diaspora and local buyers.
              </motion.p>

              <motion.div {...fadeUp(reduceMotion ? 0 : 0.18, 18)} className="mx-auto mt-8 max-w-xl lg:mx-0">
                <form
                  action="/search"
                  method="get"
                  className="group relative rounded-2xl border border-white/20 bg-white/[0.12] p-1.5 shadow-2xl shadow-black/20 backdrop-blur-xl transition-[box-shadow,transform] duration-300 focus-within:border-white/35 focus-within:shadow-[0_0_0_1px_rgba(255,255,255,0.12)] sm:rounded-3xl sm:p-2"
                >
                  <Search className="pointer-events-none absolute left-5 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#0072CE] sm:left-6" />
                  <input
                    type="text"
                    name="q"
                    placeholder="City, neighbourhood, or budget…"
                    className="w-full rounded-2xl border-0 bg-white py-4 pl-12 pr-[6.5rem] text-[15px] text-[#0f172a] shadow-none placeholder:text-slate-400 focus:outline-none focus:ring-0 sm:rounded-[1.35rem] sm:pl-14 sm:pr-36"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-1.5 rounded-xl bg-[#0072CE] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 active:scale-[0.98] sm:right-2 sm:px-6"
                  >
                    Search
                    <ArrowRight className="h-4 w-4 opacity-90" />
                  </button>
                </form>
              </motion.div>
            </div>

            {/* Markets — hero right */}
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.98 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.22, duration: 0.65, ease: easeOut }}
              className="relative mx-auto w-full max-w-md lg:col-span-5 lg:mx-0 lg:max-w-none lg:pt-4"
            >
              <div className="absolute -inset-px rounded-[1.35rem] bg-gradient-to-br from-white/35 via-cyan-300/20 to-[#0072CE]/30 opacity-80 blur-[1px]" aria-hidden />
              <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/[0.09] p-6 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.65)] backdrop-blur-2xl sm:p-7">
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#0072CE]/20 blur-3xl" aria-hidden />
                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200/90">
                      <MapPin className="h-3.5 w-3.5" />
                      Markets
                    </span>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">Explore by city</h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                      Filter verified inventory by hub — then scroll featured listings below.
                    </p>
                  </div>
                  <Link
                    href="/search"
                    className="shrink-0 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white transition hover:border-cyan-300/40 hover:bg-white/15"
                  >
                    All listings
                  </Link>
                </div>
                <div className="relative mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5">
                  {cities.map((city, i) => (
                    <motion.div
                      key={city.name}
                      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                      transition={{ delay: 0.32 + i * 0.04, duration: 0.4, ease: easeOut }}
                    >
                      <Link
                        href={`/search?city=${city.name.toLowerCase()}`}
                        className="flex flex-col rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-left transition hover:border-cyan-400/35 hover:bg-white/[0.08]"
                      >
                        <span className="text-sm font-semibold text-white">{city.name}</span>
                        {city.name.toLowerCase() !== city.state.toLowerCase() && (
                          <span className="mt-0.5 text-[11px] font-medium text-slate-500">{city.state}</span>
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Trust strip — no cards */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.65, ease: easeOut }}
            className="mt-14 w-full border-t border-white/10 pt-10 lg:mt-20"
          >
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-4">
              {trustStats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.45, ease: easeOut }}
                  className="text-center sm:text-left"
                >
                  <s.icon className="mx-auto mb-2 h-4 w-4 text-cyan-300/80 sm:mx-0" strokeWidth={1.75} />
                  <div className="text-2xl font-semibold tabular-nums tracking-tight text-white sm:text-[1.65rem]">{s.value}</div>
                  <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 md:block"
          animate={reduceMotion ? undefined : { y: [0, 6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        >
          <div className="h-9 w-5 rounded-full border-2 border-white/25">
            <motion.div
              className="mx-auto mt-2 h-1.5 w-0.5 rounded-full bg-white/50"
              animate={reduceMotion ? undefined : { y: [0, 8, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </section>

      {/* Ecosystem + trust — two columns on large screens */}
      <motion.section {...viewFade(!!reduceMotion)} className="relative overflow-hidden py-12 md:py-16">
        <div className="pointer-events-none absolute inset-0">
          <Image src={partnersSectionBg} alt="" fill className="object-cover object-center opacity-[0.18]" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#f8fafc] via-white to-[#f1f5f9]" aria-hidden />
        </div>
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12 lg:items-start">
            {/* Left — ecosystem */}
            <div className="lg:col-span-7">
              <motion.p
                {...viewFade(!!reduceMotion, 0)}
                className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#0033A1]/80"
              >
                <Handshake className="h-4 w-4 opacity-70" />
                Ecosystem
              </motion.p>
              <motion.h2
                {...viewFade(!!reduceMotion, 0.03)}
                className="mt-3 text-balance text-2xl font-semibold tracking-tight text-[#0f172a] md:text-3xl"
              >
                One pipeline from registry data to buyer-ready listings
              </motion.h2>
              <motion.p
                {...viewFade(!!reduceMotion, 0.06)}
                className="mt-3 text-sm leading-relaxed text-slate-600 md:text-[15px]"
              >
                We sit between official land context, professional verification, and curated inventory — not a scraped marketplace.
              </motion.p>

              <div className="mt-8 space-y-8">
                {partnerPillars.map((pillar, idx) => (
                  <motion.div
                    key={pillar.title}
                    initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                    whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ delay: idx * 0.06, duration: 0.45, ease: easeOut }}
                    className="relative pl-5 md:pl-6"
                  >
                    <span className="absolute left-0 top-1 bottom-0 w-px bg-gradient-to-b from-[#0033A1] via-[#0072CE]/50 to-transparent" />
                    <pillar.icon className="mb-2 h-4 w-4 text-[#0033A1]" strokeWidth={1.5} />
                    <h3 className="text-base font-semibold text-[#0f172a]">{pillar.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{pillar.description}</p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={reduceMotion ? false : { opacity: 0 }}
                whileInView={reduceMotion ? undefined : { opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.45 }}
                className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-xs"
              >
                {["Registry-aligned", "Developer partners", "In-house publishing"].map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5 text-slate-600">
                    <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" strokeWidth={2.5} />
                    {t}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Right — built for trust */}
            <div className="border-t border-slate-200/80 pt-10 lg:col-span-5 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
              <div className="flex items-start gap-3">
                <Home className="mt-0.5 h-7 w-7 shrink-0 text-emerald-600/90" strokeWidth={2} />
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-[#0f172a] md:text-2xl">Built for trust, not volume</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Every listing is reviewed by us before publish — diligence, not feeds.
                  </p>
                </div>
              </div>
              <motion.ul
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-40px" }}
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: reduceMotion ? 0 : 0.05 } },
                }}
                className="mt-6 flex flex-col gap-3"
              >
                {[
                  "Title and registry cross-checks before go-live",
                  "Fraud and mismatch signals in the review pipeline",
                  "Transparent AI-assisted valuation ranges",
                  "Mortgage paths coordinated with your purchase",
                  "Offer-to-close guidance with escrow options",
                ].map((line) => (
                  <motion.li
                    key={line}
                    variants={{
                      hidden: { opacity: 0, x: -6 },
                      show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: easeOut } },
                    }}
                    className="flex gap-2.5 text-left text-sm leading-snug text-slate-700"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-[#0033A1] to-[#0072CE]" />
                    {line}
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Mortgage — four write-ups under ecosystem */}
      <motion.section {...viewFade(!!reduceMotion)} className="border-t border-slate-200/80 bg-[#f8fafc] py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0033A1]">
              <Banknote className="h-4 w-4" />
              Financing
            </span>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#0f172a] md:text-3xl">
              Mortgages &amp; Diaspora NHF, coordinated with your deal
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
              How we think about home finance alongside verified property — in four short reads.
            </p>
          </div>
          <div className="grid gap-10 sm:grid-cols-2 lg:gap-12">
            {mortgageWriteups.map((block, idx) => (
              <motion.article
                key={block.title}
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: idx * 0.06, duration: 0.5, ease: easeOut }}
                className="border-l-2 border-[#0033A1]/25 pl-5 md:pl-6"
              >
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#0072CE]">0{idx + 1}</p>
                <h3 className="mt-2 text-lg font-semibold text-[#0f172a]">{block.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 md:text-[15px]">{block.body}</p>
              </motion.article>
            ))}
          </div>
          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            whileInView={reduceMotion ? undefined : { opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 flex flex-wrap items-center gap-4 border-t border-slate-200/90 pt-10"
          >
            <Link
              href="/mortgage"
              className="inline-flex items-center gap-2 rounded-full bg-[#0033A1] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#002880]"
            >
              Full mortgage guide
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/search" className="text-sm font-semibold text-[#0033A1] hover:underline">
              Browse listings →
            </Link>
          </motion.div>
        </div>
      </motion.section>

      <HomeFeaturedListings />
    </>
  )
}

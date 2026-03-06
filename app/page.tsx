"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  Shield, CheckCircle2, ArrowRight, Star,
  BadgeCheck, Globe, MapPin, Plane,
  ListOrdered, Banknote, Sparkles, FileText, GraduationCap, Home,
  Map, Send, Heart, Quote, Clock3, ScanSearch,
} from "lucide-react"
import { Button } from "@/components/ui/Button"

const EASE = [0.16, 1, 0.3, 1] as const
const STAGGER = 0.07

/* ── Hero ─────────────────────────────────────────────── */
function HeroSection() {
  return (
    <section className="relative hero-premium section-orb-bg min-h-[88vh] flex flex-col justify-center pt-28 pb-16 px-6 overflow-hidden">
      <div className="flow-orb flow-orb-1" aria-hidden />
      <div className="flow-orb flow-orb-2" aria-hidden />
      <div className="flow-orb flow-orb-3" aria-hidden />
      <div className="section-inner mx-auto w-full max-w-6xl">
        <div className="grid lg:grid-cols-12 lg:gap-12 items-center">
          <div className="lg:col-span-7 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide mb-6"
            >
              <BadgeCheck className="w-3.5 h-3.5" />
              Immigration strategy · Relocation planning · Nigeria
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.06, ease: EASE }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-foreground mb-5 leading-[1.08]"
            >
              Move across borders
              <br />
              <span className="gradient-text">with confidence.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12, ease: EASE }}
              className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-7 leading-relaxed"
            >
              EasyMoveZone helps Nigerian professionals, students, and families choose the right route to the UK, Canada, or Europe with structured assessments, visa planning, and settlement support.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.16, ease: EASE }}
              className="grid sm:grid-cols-2 gap-2.5 mb-8 text-sm"
            >
              {[
                "Country-fit scoring before you commit",
                "Document strategy and interview preparation",
                "Transparent service fees in Naira",
                "Support from first assessment to landing",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-xl bg-background/70 px-3 py-2 border border-border/50 backdrop-blur-sm">
                  <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                  <span className="text-foreground/90">{item}</span>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2, ease: EASE }}
              className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-3"
            >
              <Link href="/qualify">
                <Button size="xl" className="w-full sm:w-auto gap-2 text-base px-8 rounded-xl">
                  Get assessed <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 rounded-xl border-2">
                  <ListOrdered className="w-4 h-4" /> Our process
                </Button>
              </Link>
              <Link href="/fees">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 rounded-xl border-2">
                  <Banknote className="w-4 h-4" /> Fees
                </Button>
              </Link>
            </motion.div>
          </div>

          <div className="lg:col-span-5 mt-12 lg:mt-0 flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
              className="w-full max-w-[430px] relative"
            >
              <div className="relative rounded-3xl overflow-hidden border border-white/40 shadow-2xl">
                <div className="aspect-[4/5] relative">
                  <Image
                    src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80"
                    alt="Traveler planning international relocation journey"
                    fill
                    sizes="(min-width: 1024px) 420px, 90vw"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-[11px] font-bold text-white/80 uppercase tracking-widest mb-2">
                    Migration readiness
                  </p>
                  <h3 className="text-white text-lg font-bold mb-3 leading-tight">
                    Build a route that fits your profile, timeline, and budget.
                  </h3>
                  <Link href="/qualify" className="block">
                    <Button className="w-full gap-2 bg-white text-primary hover:bg-white/90">
                      Start assessment <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="absolute -left-6 top-6 hidden sm:flex items-center gap-3 rounded-xl glass-card px-3 py-2 shadow-xl float-card">
                <ScanSearch className="w-4 h-4 text-primary" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Assessment</div>
                  <div className="text-xs font-semibold">Profile-fit scoring</div>
                </div>
              </div>
              <div className="absolute -right-6 bottom-8 hidden sm:flex items-center gap-3 rounded-xl glass-card px-3 py-2 shadow-xl float-card float-card-delay">
                <Clock3 className="w-4 h-4 text-secondary" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Planning</div>
                  <div className="text-xs font-semibold">Step-by-step roadmap</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Trust strip ──────────────────────────────────────── */
const TRUST = [
  { label: "UK", sub: "Skilled Worker" },
  { label: "Canada", sub: "Express Entry" },
  { label: "Europe", sub: "Blue Card · D7" },
]

function TrustStrip() {
  return (
    <section className="py-6 border-y border-border/60 bg-gradient-to-r from-background/80 via-primary/[0.03] to-background/80">
      <div className="section-inner flex flex-wrap justify-center gap-x-10 gap-y-4">
        {TRUST.map(({ label, sub }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.35 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-bold text-foreground block leading-tight">{label}</span>
              <span className="text-[10px] text-muted-foreground">{sub}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

/* ── Our services ────────────────────────────────────── */
const SERVICES_HOME = [
  { icon: Sparkles, title: "Migration Intelligence", desc: "Assess eligibility, destination fit, and cost implications before starting a visa pathway.", href: "/qualify", color: "primary" as const },
  { icon: FileText, title: "Visa Planning & Application", desc: "Document checklists, profile positioning, and practical interview preparation support.", href: "/qualify", color: "secondary" as const },
  { icon: GraduationCap, title: "School & University Placement", desc: "Institution shortlist, tuition comparison, admission guidance, and scholarship advisory.", href: "/qualify", color: "primary" as const },
  { icon: Home, title: "Accommodation & Settlement", desc: "City and housing support, plus practical setup guidance after arrival.", href: "/qualify", color: "secondary" as const },
  { icon: Banknote, title: "Funding & Financial Planning", desc: "Budget planning, proof-of-funds guidance, and calculator support in Naira.", href: "/calculator", color: "primary" as const },
]

function ServicesSection() {
  return (
    <section className="py-20 md:py-24 section-flow-bg relative">
      <div className="section-inner">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Our services</span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mt-2 mb-3">
            Everything you need to relocate
          </h2>
          <p className="text-muted-foreground text-lg">
            Five connected service pillars covering every stage from first assessment to post-arrival setup.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES_HOME.map(({ icon: Icon, title, desc, href, color }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * STAGGER, duration: 0.45, ease: EASE }}
              whileHover={{ y: -6 }}
            >
              <Link
                href={href}
                className={`group block rounded-2xl border border-border/60 bg-card/95 p-6 h-full transition-all duration-300 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary/40 ${color === "secondary" ? "border-l-4 border-l-secondary/40" : "border-l-4 border-l-primary/40"}`}
              >
                <div className={`w-11 h-11 rounded-xl ${color === "secondary" ? "bg-secondary/10" : "bg-primary/10"} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${color === "secondary" ? "text-secondary" : "text-primary"}`} />
                </div>
                <h3 className="text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/services">
            <Button variant="outline" className="gap-2">All services <ArrowRight className="w-4 h-4" /></Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ── Destinations grid ─────────────────────────────────── */
const DESTINATIONS = [
  {
    icon: MapPin,
    title: "United Kingdom",
    tag: "Work · Study",
    desc: "Skilled Worker, Student, Health and Care Worker, Global Talent, and founder pathways.",
    href: "/destinations?country=uk",
    color: "from-secondary/20 to-secondary/5 border-secondary/20",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1400&q=80",
  },
  {
    icon: MapPin,
    title: "Canada",
    tag: "Express Entry",
    desc: "Express Entry, PNP, study options, and family pathways based on profile fit.",
    href: "/destinations?country=canada",
    color: "from-primary/20 to-primary/5 border-primary/20",
    image: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1400&q=80",
  },
  {
    icon: Globe,
    title: "Europe",
    tag: "Blue Card · D7 · HSM",
    desc: "Route planning for Germany, Portugal, Netherlands, and Ireland migration programs.",
    href: "/destinations?country=europe",
    color: "from-muted to-muted/50 border-border",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1400&q=80",
  },
]

function DestinationsSection() {
  const flags: Record<string, string> = { "United Kingdom": "🇬🇧", "Canada": "🇨🇦", "Europe": "🇪🇺" }
  return (
    <section className="py-20 md:py-24 section-flow-bg relative">
      <div className="section-inner">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
            Focus markets
          </h2>
          <p className="text-muted-foreground text-lg">
            We specialise in three high-demand migration corridors for Nigerian professionals, students, and families.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DESTINATIONS.map(({ icon: Icon, title, tag, desc, href, color, image }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * STAGGER, duration: 0.45, ease: EASE }}
              whileHover={{ y: -6 }}
            >
              <Link
                href={href}
                className={`group block rounded-2xl overflow-hidden border bg-gradient-to-br ${color} h-full transition-all duration-300 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-primary/40`}
              >
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={image}
                    alt={`${title} skyline for migration destination guidance`}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 95vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
                  <div className="absolute left-4 bottom-4 w-12 h-12 rounded-2xl bg-background/90 flex items-center justify-center shadow-sm text-2xl">
                    {flags[title] ?? "🌍"}
                  </div>
                  <div className="absolute right-4 bottom-4 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                    <ArrowRight className="w-4 h-4 text-primary" />
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{tag}</span>
                    <Icon className="w-3.5 h-3.5 text-primary/70" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mt-1 mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{desc}</p>
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary">
                    Explore routes <Plane className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Our process ──────────────────────────────────────── */
const PROCESS_STEPS = [
  { step: "01", title: "Migration assessment", desc: "Profile scoring across UK, Canada, and Europe routes to identify your strongest options.", icon: Sparkles, accent: "primary" },
  { step: "02", title: "Strategy & planning", desc: "Personalised roadmap, timeline, required documents, and route-specific preparation.", icon: Map, accent: "secondary" },
  { step: "03", title: "Application & placement", desc: "Application packaging, school placement support, and funding planning where relevant.", icon: Send, accent: "primary" },
  { step: "04", title: "Settlement support", desc: "Accommodation and practical setup guidance so your transition is smoother on arrival.", icon: Heart, accent: "secondary" },
]

function ProcessSection() {
  return (
    <section className="py-20 md:py-24 bg-muted/20 section-orb-bg relative">
      <div className="flow-orb flow-orb-1" aria-hidden />
      <div className="section-inner">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Our process</span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mt-2 mb-3">
            From decision to settlement
          </h2>
          <p className="text-muted-foreground text-lg">
            A structured, four-stage process — from initial assessment through to your new life abroad.
          </p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PROCESS_STEPS.map(({ step, title, desc, icon: Icon, accent }, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * STAGGER }}
              whileHover={{ y: -4 }}
              className="relative rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className={`h-1 ${accent === "secondary" ? "bg-secondary" : "bg-primary"}`} />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl ${accent === "secondary" ? "bg-secondary/10" : "bg-primary/10"} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${accent === "secondary" ? "text-secondary" : "text-primary"}`} />
                  </div>
                  <span className={`text-2xl font-bold ${accent === "secondary" ? "text-secondary/20" : "text-primary/20"}`}>{step}</span>
                </div>
                <h3 className="font-bold text-sm mb-2">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/how-it-works">
            <Button variant="outline" className="gap-2">Full process & fees <ArrowRight className="w-4 h-4" /></Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ── EMZ suite showcase ───────────────────────────────── */
const SUITE_MODULES = [
  {
    title: "Eligibility Review & Application Checklist",
    stage: "1. Intelligence + Visa",
    desc: "Profile-fit scoring, route probability, and document checklist in one workflow so clients know exactly what to prepare.",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1400&q=80",
    icon: ScanSearch,
    points: ["Eligibility scoring", "Checklist tracking", "Route recommendation"],
  },
  {
    title: "Funding & Financial Planner",
    stage: "2. Budget + Proof of Funds",
    desc: "Plan tuition, relocation costs, and proof-of-funds requirements with a clear currency view and transparent assumptions.",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1400&q=80",
    icon: Banknote,
    points: ["Budget simulator", "Funding plan", "Cost visibility"],
  },
  {
    title: "Migration Portfolio & Global Intelligence",
    stage: "3. Country Comparison",
    desc: "Visual route comparison across UK, Canada, and Europe with profile matching and practical pathway insights.",
    image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1400&q=80",
    icon: Globe,
    points: ["Route comparison", "Country matching", "Strategic insights"],
  },
  {
    title: "End-to-End Journey Suite",
    stage: "4. From decision to settlement",
    desc: "One coordinated flow for Intelligence, Visa, School, Accommodation, and Funding until clients settle successfully.",
    image: "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1400&q=80",
    icon: Home,
    points: ["Intelligence", "Visa + School", "Accommodation + Funding"],
  },
]

function SuiteSection() {
  return (
    <section className="py-20 md:py-24 section-flow-bg relative">
      <div className="section-inner">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">EMZ suite</span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mt-2 mb-3">
            Built around the core migration workflow
          </h2>
          <p className="text-muted-foreground text-lg">
            Intelligence, visa planning, school placement, accommodation, and funding presented as one integrated client journey.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {SUITE_MODULES.map(({ title, stage, desc, image, icon: Icon, points }, i) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * STAGGER, duration: 0.45, ease: EASE }}
              whileHover={{ y: -6 }}
              className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={image}
                  alt={title}
                  fill
                  sizes="(min-width: 768px) 45vw, 95vw"
                  className="object-cover transition-transform duration-700 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
                <div className="absolute left-4 bottom-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">{stage}</span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{desc}</p>
                <div className="flex flex-wrap gap-2">
                  {points.map((point) => (
                    <span key={point} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                      {point}
                    </span>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/suite">
            <Button className="gap-2">Open full EMZ Suite <ArrowRight className="w-4 h-4" /></Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ── Our fees (teaser) ─────────────────────────────────── */
function FeesSection() {
  const TIERS = [
    { label: "Assessment Portal", price: "₦25,000 – ₦75,000", note: "AI route simulation and downloadable report", icon: Sparkles, recommended: false },
    { label: "Migration Strategy", price: "₦800K – ₦2.5M", note: "Roadmap, document review, and application preparation", icon: Map, recommended: true },
    { label: "Full Concierge", price: "₦4M – ₦15M+", note: "End-to-end migration, education, housing, and landing support", icon: Shield, recommended: false },
    { label: "Education Placement", price: "Commission-based", note: "Commission earned from partner institutions", icon: GraduationCap, recommended: false },
    { label: "Forex & Loan Partnerships", price: "Commission-based", note: "Commission earned from vetted finance partners", icon: Banknote, recommended: false },
  ]

  return (
    <section className="py-20 md:py-24 relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.03] to-background pointer-events-none" />
      <div className="section-inner relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Transparent fees</span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mt-2 mb-3">
            Clear pricing
          </h2>
          <p className="text-muted-foreground text-lg">
            Five service tiers — no hidden costs.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto"
        >
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -5 }}
              className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${tier.recommended
                  ? "bg-gradient-to-br from-primary to-primary/80 text-white shadow-xl shadow-primary/20 ring-2 ring-primary/30"
                  : "bg-card border border-border/60 shadow-sm hover:shadow-md"
                }`}
            >
              {tier.recommended && (
                <div className="absolute top-0 right-0 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-wider">
                  Recommended
                </div>
              )}
              <div className="p-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${tier.recommended ? "bg-white/15" : "bg-primary/10"}`}>
                  <tier.icon className={`w-5 h-5 ${tier.recommended ? "text-white" : "text-primary"}`} />
                </div>
                <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${tier.recommended ? "text-white/80" : "text-muted-foreground"}`}>{tier.label}</div>
                <div className={`text-2xl font-bold tabular-nums mb-2 ${tier.recommended ? "text-white" : "text-foreground"}`}>{tier.price}</div>
                <p className={`text-sm leading-relaxed ${tier.recommended ? "text-white/80" : "text-muted-foreground"}`}>{tier.note}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
        <div className="text-center mt-10">
          <Link href="/fees">
            <Button className="gap-2">See full fees <ArrowRight className="w-4 h-4" /></Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ── Stats ─────────────────────────────────────────────── */
const STATS = [
  { value: "AI", label: "Eligibility scoring", icon: Sparkles },
  { value: "3", label: "Focus markets", icon: Globe },
  { value: "5", label: "Service pillars", icon: Shield },
  { value: "24/7", label: "Digital access", icon: Clock3 },
]

function StatsSection() {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-r from-primary via-primary/95 to-primary">
      <div className="section-inner">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ value, label, icon: Icon }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="text-center relative"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-3">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white tracking-tight">{value}</div>
              <div className="text-sm text-white/70 mt-1 font-medium">{label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Testimonials ──────────────────────────────────────── */
const TESTIMONIALS = [
  { quote: "The assessment explained exactly which route I should prioritize and what documents mattered most for my UK application.", name: "Emeka O.", location: "Lagos → UK", amount: "Strategy package", initials: "EO" },
  { quote: "I appreciated the fee clarity and the timeline planning. Every stage was explained before we moved forward.", name: "Fatima A.", location: "Abuja → Canada", amount: "Assessment + support", initials: "FA" },
  { quote: "From school shortlist to visa preparation and settling guidance, the process felt coordinated and realistic.", name: "Adaeze N.", location: "Port Harcourt → Europe", amount: "Education route", initials: "AN" },
]

function TestimonialsSection() {
  return (
    <section className="py-20 md:py-24 section-flow-bg relative">
      <div className="section-inner">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
            Clients we&apos;ve guided
          </h2>
          <p className="text-muted-foreground text-lg">
            Nigerians who went through our assessment and start-to-finish guidance.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ quote, name, location, amount, initials }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * STAGGER, duration: 0.45, ease: EASE }}
              whileHover={{ y: -6 }}
              className="relative rounded-2xl border border-border/60 bg-card p-7 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              {/* Large quote accent */}
              <Quote className="w-8 h-8 text-primary/10 mb-4" />

              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-foreground leading-relaxed mb-5 text-sm">&ldquo;{quote}&rdquo;</p>

              {/* Tag badge */}
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider mb-4">
                <CheckCircle2 className="w-3 h-3" /> {amount}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold text-white shadow-sm">{initials}</div>
                <div>
                  <div className="font-bold text-sm text-foreground">{name}</div>
                  <div className="text-xs text-muted-foreground">{location}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <TrustStrip />
      <ServicesSection />
      <ProcessSection />
      <SuiteSection />
      <FeesSection />
      <DestinationsSection />
      <StatsSection />
      <TestimonialsSection />
    </div>
  )
}

"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  Shield, CheckCircle2, ArrowRight, Star,
  BadgeCheck, Globe, MapPin,
  ListOrdered, Banknote, Sparkles, FileText, GraduationCap, Home,
  Map, Send, Heart, Quote, Clock3, ScanSearch, ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/Button"

const EASE = [0.16, 1, 0.3, 1] as const
const STAGGER = 0.07

/* ── Hero ─────────────────────────────────────────────── */
function HeroSection() {
  return (
    <section className="relative pt-32 pb-12 px-6">
      <div className="section-inner mx-auto w-full max-w-6xl">
        <div className="relative rounded-[2rem] overflow-hidden border border-black/10 shadow-[0_35px_70px_-35px_rgba(0,0,0,0.35)] min-h-[510px]">
          <Image
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1800&q=80"
            alt="Airplane crossing over sea during migration journey"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-transparent" />
          <div className="relative z-10 p-8 md:p-10 lg:p-12 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 text-black text-xs font-semibold tracking-wide mb-6 border border-black/10"
            >
              <BadgeCheck className="w-3.5 h-3.5" />
              Migration intelligence · Relocation planning · Nigeria
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.06, ease: EASE }}
              className="bg-white/92 backdrop-blur-sm rounded-2xl p-6 md:p-7 border border-black/12"
            >
              <h1 className="display-title text-4xl sm:text-5xl md:text-6xl font-bold text-black mb-3">
                Flexible options for
                <br />
                <span className="gradient-text">cross-border migration.</span>
              </h1>
              <p className="text-base md:text-lg text-black/70 mb-5 leading-relaxed">
                Clear route matching, practical document strategy, and transparent execution — from first assessment to settlement.
              </p>
              <div className="flex flex-wrap gap-2.5 mb-5 text-sm">
                {["Country-fit scoring", "Visa strategy", "Funding planning", "Settlement support"].map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-full bg-black/[0.05] px-3 py-1.5 border border-black/8">
                    <CheckCircle2 className="w-4 h-4 text-black" />
                    <span className="text-black/85">{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/qualify">
                  <Button size="lg" className="gap-2">
                    Start assessment <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/suite">
                  <Button size="lg" variant="outline" className="gap-2">
                    <ListOrdered className="w-4 h-4" /> Open suite
                  </Button>
                </Link>
                <Link href="/document-support">
                  <Button size="lg" variant="outline" className="gap-2">
                    <FileText className="w-4 h-4" /> Document workspace
                  </Button>
                </Link>
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
    <section className="py-8 border-y border-black/10 bg-white">
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
            <div className="w-8 h-8 rounded-lg bg-black/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-black" />
            </div>
            <div>
              <span className="text-sm font-bold text-black block leading-tight">{label}</span>
              <span className="text-[10px] text-black/60">{sub}</span>
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
          <h2 className="display-title text-4xl md:text-5xl font-bold text-foreground mt-2 mb-3">
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
          <Link href="/suite">
            <Button variant="outline" className="gap-2">Open full suite <ArrowRight className="w-4 h-4" /></Button>
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
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1400&q=80",
    strategies: [
      "Priority routes: Skilled Worker, Health & Care Worker, Student.",
      "Best for professionals with clear role alignment and English readiness.",
      "Strong outcomes when documentation quality and sponsor strategy are prepared early.",
    ],
  },
  {
    icon: MapPin,
    title: "Canada",
    tag: "Express Entry",
    desc: "Express Entry, PNP, study options, and family pathways based on profile fit.",
    image: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1400&q=80",
    strategies: [
      "Priority routes: Express Entry, PNP, Study Permit, Family pathways.",
      "Best for candidates with high score potential and adaptable timelines.",
      "Strategy focuses on CRS optimization, provincial fit, and proof-of-funds clarity.",
    ],
  },
  {
    icon: Globe,
    title: "Europe",
    tag: "Blue Card · D7 · HSM",
    desc: "Route planning for Germany, Portugal, Netherlands, and Ireland migration programs.",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1400&q=80",
    strategies: [
      "Priority routes: Blue Card, D7, Highly Skilled Migrant, Critical Skills.",
      "Best for professionals and families targeting high-quality settlement ecosystems.",
      "Route selection depends on role type, salary thresholds, and country compliance rules.",
    ],
  },
]

function DestinationsSection() {
  const [openTitle, setOpenTitle] = React.useState<string>("United Kingdom")
  const flags: Record<string, string> = { "United Kingdom": "🇬🇧", "Canada": "🇨🇦", "Europe": "🇪🇺" }
  return (
    <section id="routes" className="py-20 md:py-24 section-flow-bg relative">
      <div className="section-inner">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <h2 className="display-title text-4xl md:text-5xl font-bold text-foreground mb-3">
            Focus markets
          </h2>
          <p className="text-muted-foreground text-lg">
            We specialise in three high-demand migration corridors for Nigerian professionals, students, and families.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DESTINATIONS.map(({ icon: Icon, title, tag, desc, image, strategies }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * STAGGER, duration: 0.45, ease: EASE }}
              whileHover={{ y: -4 }}
            >
              <article className="group rounded-2xl overflow-hidden border border-border/70 bg-card h-full transition-all duration-300 hover:shadow-xl">
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
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{tag}</span>
                    <Icon className="w-3.5 h-3.5 text-primary/70" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mt-1 mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{desc}</p>
                  <button
                    type="button"
                    onClick={() => setOpenTitle((prev) => (prev === title ? "" : title))}
                    className="w-full inline-flex items-center justify-between rounded-xl border border-black/10 bg-black/[0.03] px-3 py-2 text-xs font-semibold text-black/75 hover:bg-black/[0.05] transition-colors"
                    aria-expanded={openTitle === title}
                  >
                    Migration strategy details
                    <ChevronDown className={`w-4 h-4 transition-transform ${openTitle === title ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence initial={false}>
                    {openTitle === title && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 space-y-2 border-t border-black/10 pt-3">
                          {strategies.map((item) => (
                            <div key={item} className="flex items-start gap-2 text-sm text-black/70">
                              <CheckCircle2 className="w-4 h-4 mt-0.5 text-black shrink-0" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </article>
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
          <h2 className="display-title text-4xl md:text-5xl font-bold text-foreground mt-2 mb-3">
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
          <Link href="/suite">
            <Button variant="outline" className="gap-2">See complete suite flow <ArrowRight className="w-4 h-4" /></Button>
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
          <h2 className="display-title text-4xl md:text-5xl font-bold text-foreground mt-2 mb-3">
            Tools + document support in one operating flow
          </h2>
          <p className="text-muted-foreground text-lg">
            Start with eligibility, organize documents, map route strategy, and validate costs without leaving the same workflow.
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
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/suite">
              <Button className="gap-2">Open full EMZ Suite <ArrowRight className="w-4 h-4" /></Button>
            </Link>
            <Link href="/document-support">
              <Button variant="outline" className="gap-2">Open document workspace</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Our fees (teaser) ─────────────────────────────────── */
function FeesSection() {
  const [openIndex, setOpenIndex] = React.useState<number>(1)
  const TIERS = [
    {
      label: "Assessment Portal",
      price: "₦25,000 – ₦75,000",
      summary: "AI route simulation and downloadable report.",
      icon: Sparkles,
      recommended: false,
      details: [
        "AI migration simulation across UK, Canada, and Europe routes.",
        "Structured profile review and suitability scoring.",
        "Downloadable report with route recommendations and next actions.",
      ],
    },
    {
      label: "Migration Strategy",
      price: "₦800K – ₦2.5M",
      summary: "Roadmap, document review, and application preparation.",
      icon: Map,
      recommended: true,
      details: [
        "Personalised strategy call and migration roadmap.",
        "Documentation audit and quality improvement guidance.",
        "Application packaging support and interview preparation.",
      ],
    },
    {
      label: "Full Concierge",
      price: "₦4M – ₦15M+",
      summary: "End-to-end migration, education, housing, and landing support.",
      icon: Shield,
      recommended: false,
      details: [
        "Hands-on support from eligibility through settlement.",
        "School placement, accommodation coordination, and onboarding support.",
        "Integrated execution for clients with complex cross-border needs.",
      ],
    },
    {
      label: "Education Placement",
      price: "Commission-based",
      summary: "Commission earned from partner institutions.",
      icon: GraduationCap,
      recommended: false,
      details: [
        "Institution matching and admission support for eligible candidates.",
        "We are paid by partner institutions where applicable.",
        "No hidden processing fees outside agreed service scope.",
      ],
    },
    {
      label: "Forex & Loan Partnerships",
      price: "Commission-based",
      summary: "Commission earned from vetted finance partners.",
      icon: Banknote,
      recommended: false,
      details: [
        "Referrals to education loan, FX, and selected insurance partners.",
        "Funding pathways aligned with destination and profile constraints.",
        "Partner compensation is commission-based and disclosed.",
      ],
    },
  ]

  return (
    <section id="fees" className="py-20 md:py-24 relative overflow-hidden">
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
          <h2 className="display-title text-4xl md:text-5xl font-bold text-foreground mt-2 mb-3">
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
          className="max-w-5xl mx-auto space-y-3"
        >
          {TIERS.map((tier, i) => {
            const isOpen = openIndex === i
            return (
              <motion.div
                key={tier.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className={`relative rounded-2xl overflow-hidden border transition-all duration-300 ${tier.recommended
                  ? "border-black/20 shadow-lg shadow-black/10 bg-card"
                  : "border-border/70 bg-card hover:border-black/20"
                  }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : i)}
                  className="w-full text-left p-5 md:p-6"
                  aria-expanded={isOpen}
                >
                  {tier.recommended && (
                    <span className="absolute top-0 right-0 bg-black text-white px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-wider">
                      Recommended
                    </span>
                  )}
                  <div className="flex items-center justify-between gap-4 pr-10">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-black/[0.06] flex items-center justify-center shrink-0">
                        <tier.icon className="w-5 h-5 text-black" />
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-black/55 mb-1">{tier.label}</div>
                        <div className="text-2xl font-bold tabular-nums text-black mb-1">{tier.price}</div>
                        <p className="text-sm text-black/65">{tier.summary}</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-black/60 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: EASE }}
                      className="overflow-hidden border-t border-black/10"
                    >
                      <div className="p-5 md:p-6 pt-4 space-y-2">
                        {tier.details.map((item) => (
                          <div key={item} className="flex items-start gap-2 text-sm text-black/70">
                            <CheckCircle2 className="w-4 h-4 mt-0.5 text-black shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </motion.div>
        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground">
            Government visa fees and third-party costs (e.g. flights) are separate and explained before execution.
          </p>
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
    <section className="py-16 md:py-20 bg-white border-y border-black/10">
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
              <div className="w-12 h-12 rounded-2xl bg-black/[0.08] flex items-center justify-center mx-auto mb-3">
                <Icon className="w-5 h-5 text-black" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-black tracking-tight">{value}</div>
              <div className="text-sm text-black/65 mt-1 font-medium">{label}</div>
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
          <h2 className="display-title text-4xl md:text-5xl font-bold text-foreground mb-3">
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
                {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-black text-black/80" />)}
              </div>
              <p className="text-foreground leading-relaxed mb-5 text-sm">&ldquo;{quote}&rdquo;</p>

              {/* Tag badge */}
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider mb-4">
                <CheckCircle2 className="w-3 h-3" /> {amount}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                <div className="w-10 h-10 rounded-full bg-white border border-black/20 flex items-center justify-center text-sm font-bold text-black shadow-sm">{initials}</div>
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

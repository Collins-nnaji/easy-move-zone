"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Shield, CheckCircle2, ArrowRight, Star,
  Users, BadgeCheck, Calculator, Globe, MapPin,
  ListOrdered, Banknote, Sparkles, FileText, GraduationCap, Home,
} from "lucide-react"
import { Button } from "@/components/ui/Button"

const EASE = [0.16, 1, 0.3, 1] as const

/* ── Hero ─────────────────────────────────────────────── */
function HeroSection() {
  return (
    <section className="relative hero-premium section-orb-bg min-h-[90vh] flex flex-col justify-center pt-32 pb-24 px-6 overflow-hidden">
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
              Migration intelligence · Relocation strategy · Nigeria
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.06, ease: EASE }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-foreground mb-5 leading-[1.08]"
            >
              Your smart migration
              <br />
              <span className="gradient-text">&amp; relocation partner.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12, ease: EASE }}
              className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed"
            >
              Data-driven migration intelligence and end-to-end relocation strategy for Nigerian professionals, students, healthcare workers, and families moving to UK, Canada, or Europe.
            </motion.p>

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
              className="w-full max-w-[380px] glass-card rounded-3xl p-6 lg:p-7 shadow-2xl"
            >
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Migration assessment
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Get your personalised migration score, visa match, and cost estimate — powered by AI.
              </p>
              <Link href="/qualify" className="block">
                <Button className="w-full gap-2">
                  Get assessed <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <div className="mt-4 pt-4 border-t border-border flex justify-between text-xs text-muted-foreground">
                <span>Data-driven</span>
                <span>Structured process</span>
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
    <section className="py-8 border-y border-border/60 bg-background/50">
      <div className="section-inner flex flex-wrap justify-center gap-x-10 gap-y-4">
        {TRUST.map(({ label, sub }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.35 }}
            className="flex items-center gap-2"
          >
            <Shield className="w-4 h-4 text-primary/80" />
            <span className="text-sm font-semibold text-foreground">{label}</span>
            <span className="text-xs text-muted-foreground">{sub}</span>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

/* ── Our services ────────────────────────────────────── */
const SERVICES_HOME = [
  { icon: Sparkles, title: "Migration Intelligence", desc: "AI-powered assessment, country match scoring, visa eligibility, and cost simulation in ₦.", href: "/qualify", color: "primary" as const },
  { icon: FileText, title: "Visa Planning & Application", desc: "Documentation checklist, eligibility review, strategy positioning, and interview prep.", href: "/qualify", color: "secondary" as const },
  { icon: GraduationCap, title: "School & University Placement", desc: "School comparison, tuition breakdown, admission support, and scholarship advisory.", href: "/qualify", color: "primary" as const },
  { icon: Home, title: "Accommodation & Settlement", desc: "Housing sourcing, city selection, cost of living, bank & healthcare setup.", href: "/qualify", color: "secondary" as const },
  { icon: Banknote, title: "Funding & Financial Planning", desc: "Tuition financing, education loans, proof of funds, budget planning, cost calculator.", href: "/calculator", color: "primary" as const },
]

function ServicesSection() {
  return (
    <section className="py-24 md:py-32 section-flow-bg relative">
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
            Five core offerings that cover every stage — from your first assessment to settling into your new home.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES_HOME.map(({ icon: Icon, title, desc, href, color }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.06, duration: 0.45, ease: EASE }}
            >
              <Link
                href={href}
                className="block fintech-card p-6 h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
              >
                <div className={`w-11 h-11 rounded-xl ${color === "secondary" ? "bg-secondary/10" : "bg-primary/10"} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${color === "secondary" ? "text-secondary" : "text-primary"}`} />
                </div>
                <h3 className="text-base font-bold text-foreground mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
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
  { icon: MapPin, title: "United Kingdom", tag: "Work · Study", desc: "Skilled Worker, Student, Health & Care Worker, Global Talent, Innovator Founder.", href: "/destinations?country=uk", color: "from-secondary/20 to-secondary/5 border-secondary/20" },
  { icon: MapPin, title: "Canada", tag: "Express Entry", desc: "Express Entry, PNP, Study Permit, Spousal Sponsorship.", href: "/destinations?country=canada", color: "from-primary/20 to-primary/5 border-primary/20" },
  { icon: Globe, title: "Europe", tag: "Blue Card · D7 · HSM", desc: "Germany, Portugal, Netherlands, Ireland — skilled migration routes.", href: "/destinations?country=europe", color: "from-muted to-muted/50 border-border" },
]

function DestinationsSection() {
  return (
    <section className="py-24 md:py-32 section-flow-bg relative">
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DESTINATIONS.map(({ icon: Icon, title, tag, desc, href, color }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.06, duration: 0.45, ease: EASE }}
            >
              <Link
                href={href}
                className={`block rounded-2xl border bg-gradient-to-br ${color} p-6 h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2`}
              >
                <div className="w-11 h-11 rounded-xl bg-background/80 flex items-center justify-center mb-4 shadow-sm">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{tag}</span>
                <h3 className="text-lg font-bold text-foreground mt-1 mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
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
  { step: "01", title: "Migration assessment", desc: "AI-powered scoring across UK, Canada, and Europe. Know your best-fit visa and route." },
  { step: "02", title: "Strategy & planning", desc: "Personalised roadmap, document review, and visa application strategy." },
  { step: "03", title: "Application & placement", desc: "Visa application support, school placement, and financial planning." },
  { step: "04", title: "Settlement support", desc: "Accommodation, bank setup, healthcare registration — we settle you in." },
]

function ProcessSection() {
  return (
    <section className="py-24 md:py-32 bg-muted/20 section-orb-bg relative">
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PROCESS_STEPS.map(({ step, title, desc }, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="fintech-card p-6"
            >
              <div className="text-3xl font-bold text-primary/20 mb-3">{step}</div>
              <h3 className="font-bold text-sm mb-2">{title}</h3>
              <p className="text-xs text-muted-foreground">{desc}</p>
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

/* ── Our fees (teaser) ─────────────────────────────────── */
function FeesSection() {
  const TIERS = [
    { label: "Assessment Portal", price: "₦25,000 – ₦75,000", note: "AI migration simulation + downloadable report", color: "primary" },
    { label: "Migration Strategy", price: "₦800K – ₦2.5M", note: "Strategy call, visa roadmap, documentation review, application prep", color: "secondary" },
    { label: "Full Concierge", price: "₦4M – ₦15M+", note: "Visa strategy, school placement, accommodation, settlement support", color: "primary" },
    { label: "Education Placement", price: "Commission-based", note: "Referral commission from UK, Canadian & European institutions", color: "secondary" },
    { label: "Forex & Loan Partnerships", price: "Commission-based", note: "Referral commission from loan providers, FX & insurance partners", color: "primary" },
  ]

  return (
    <section className="py-24 md:py-32 section-flow-bg relative">
      <div className="section-inner">
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
            <div key={tier.label} className={`fintech-card p-6 border-${tier.color}/20`}>
              <div className={`text-xs font-bold text-${tier.color} uppercase tracking-wider mb-2`}>{tier.label}</div>
              <div className="text-xl font-bold tabular-nums mb-1">{tier.price}</div>
              <p className="text-sm text-muted-foreground">{tier.note}</p>
            </div>
          ))}
        </motion.div>
        <div className="text-center mt-8">
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
  { value: "AI", label: "Powered scoring" },
  { value: "3", label: "Focus markets" },
  { value: "5", label: "Service pillars" },
  { value: "₦", label: "Naira pricing" },
]

function StatsSection() {
  return (
    <section className="py-20 bg-primary">
      <div className="section-inner">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(({ value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-white tracking-tight">{value}</div>
              <div className="text-sm text-white/80 mt-1">{label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Testimonials ──────────────────────────────────────── */
const TESTIMONIALS = [
  { quote: "They assessed my profile and guided me step by step. From document prep to landing in the UK — no guesswork.", name: "Emeka O.", location: "Lagos → UK", amount: "Full guidance", initials: "EO" },
  { quote: "Clear process and clear fees. I knew what I was paying and what to expect at every stage.", name: "Fatima A.", location: "Abuja → Canada", amount: "Assessment + package", initials: "FA" },
  { quote: "EasyMoveZone assessed me, recommended the right route, and supported me from start to finish.", name: "Adaeze N.", location: "Lagos → UK", amount: "Consultancy client", initials: "AN" },
]

function TestimonialsSection() {
  return (
    <section className="py-24 md:py-32 section-flow-bg relative">
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
              transition={{ delay: i * 0.08, duration: 0.45, ease: EASE }}
              className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-foreground leading-relaxed mb-5">&ldquo;{quote}&rdquo;</p>
              <div className="text-xs font-semibold text-primary mb-2">{amount}</div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{initials}</div>
                <div>
                  <div className="font-semibold text-foreground">{name}</div>
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
      <FeesSection />
      <DestinationsSection />
      <StatsSection />
      <TestimonialsSection />
    </div>
  )
}

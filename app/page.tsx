"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Shield, CheckCircle2, ArrowRight, Star,
  Users, BadgeCheck, Calculator, Globe, MapPin, Plane,
  ListOrdered, Banknote,
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
              Relocation consultancy · Transparent process & fees
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.06, ease: EASE }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-foreground mb-5 leading-[1.08]"
            >
              We guide you
              <br />
              <span className="gradient-text">from start to finish.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12, ease: EASE }}
              className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed"
            >
              We assess candidates and support your move to UK, Canada, US, or UAE. Clear process, clear fees — no surprises.
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
                Start your journey
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Submit your profile. We assess your fit and guide you from start to finish.
              </p>
              <Link href="/qualify" className="block">
                <Button className="w-full gap-2">
                  Get assessed <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <div className="mt-4 pt-4 border-t border-border flex justify-between text-xs text-muted-foreground">
                <span>Clear process</span>
                <span>Transparent fees</span>
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
  { label: "USA", sub: "Work / Study" },
  { label: "UAE", sub: "Residency" },
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

/* ── Destinations grid ─────────────────────────────────── */
const DESTINATIONS = [
  { icon: MapPin, title: "United Kingdom", tag: "Work · Study", desc: "Skilled Worker, Student, and family routes.", href: "/destinations?country=uk", color: "from-secondary/20 to-secondary/5 border-secondary/20" },
  { icon: MapPin, title: "Canada", tag: "Express Entry", desc: "Federal and provincial programs.", href: "/destinations?country=canada", color: "from-primary/20 to-primary/5 border-primary/20" },
  { icon: Plane, title: "United States", tag: "Work · H1B · Study", desc: "Employment and student visa overview.", href: "/destinations?country=us", color: "from-muted to-muted/50 border-border" },
  { icon: Globe, title: "UAE", tag: "Residency · Work", desc: "Dubai, Abu Dhabi — visas and costs.", href: "/destinations?country=uae", color: "from-primary/20 to-primary/5 border-primary/20" },
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
            We help you relocate to
          </h2>
          <p className="text-muted-foreground text-lg">
            UK, Canada, US, UAE — we assess your profile and guide you through the process from start to finish.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
  { step: "01", title: "Apply & get assessed", desc: "Submit your profile. We assess your fit for UK, Canada, US, UAE." },
  { step: "02", title: "Strategy call", desc: "We discuss your goals and recommend the best route." },
  { step: "03", title: "We guide you", desc: "Document prep, application support, and step-by-step guidance." },
  { step: "04", title: "Support to finish", desc: "We stay with you until you relocate." },
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
            From start to finish
          </h2>
          <p className="text-muted-foreground text-lg">
            Clear steps. We assess candidates and guide you through every stage.
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
            Assessment fee and full-service package — no hidden costs.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto"
        >
          <div className="fintech-card p-6 border-primary/20">
            <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Assessment</div>
            <div className="text-2xl font-bold tabular-nums mb-1">From ₦50,000</div>
            <p className="text-sm text-muted-foreground">One-time. We assess your profile and recommend routes.</p>
          </div>
          <div className="fintech-card p-6 border-secondary/20">
            <div className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Full guidance</div>
            <div className="text-2xl font-bold tabular-nums mb-1">Package on request</div>
            <p className="text-sm text-muted-foreground">Start-to-finish support. Fee depends on destination and route.</p>
          </div>
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
  { value: "Assessed", label: "Candidates" },
  { value: "4", label: "Destinations" },
  { value: "Start", label: "To finish" },
  { value: "Clear", label: "Fees" },
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
      <ProcessSection />
      <FeesSection />
      <DestinationsSection />
      <StatsSection />
      <TestimonialsSection />
    </div>
  )
}

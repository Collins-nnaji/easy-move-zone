"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  CheckCircle2, ArrowRight, Shield, Zap, BadgeCheck,
  ChevronDown, Star, FileText, TrendingUp, Sparkles,
  GraduationCap, Banknote, Map,
} from "lucide-react"
import { Button } from "@/components/ui/Button"

/* ── Our service pillars ────────────────────────────── */
const PILLARS = [
  {
    icon: Star,
    title: "Migration intelligence",
    desc: "AI-powered assessment scores your profile across UK, Canada, and Europe. Data-driven clarity before you commit.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Zap,
    title: "Structured strategy",
    desc: "Personalised visa roadmap, document review, and application positioning — no guesswork.",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: FileText,
    title: "End-to-end support",
    desc: "From initial assessment through visa application, school placement, and settlement — we cover every stage.",
    color: "bg-accent/10 text-accent-foreground",
  },
  {
    icon: Shield,
    title: "Transparent fees",
    desc: "Five clear tiers from Assessment Portal to Full Concierge Relocation. All costs confirmed before you commit.",
    color: "bg-secondary/10 text-secondary",
  },
]

/* ── Process: start to finish ───────────────────────── */
const PROCESS = [
  { step: "01", title: "Migration assessment", desc: "AI-powered scoring across UK, Canada, and Europe. Know your best-fit visa.", href: "/qualify" },
  { step: "02", title: "Strategy & planning", desc: "Personalised roadmap, document review, and visa application strategy.", href: "/qualify" },
  { step: "03", title: "Application & placement", desc: "Visa application support, school placement, and financial planning.", href: "/how-it-works" },
  { step: "04", title: "Settlement support", desc: "Accommodation, bank setup, healthcare registration — we settle you in.", href: "/fees" },
]

/* ── FAQs ───────────────────────────────────────────── */
const FAQS = [
  {
    q: "How does assessment work?",
    a: "You submit your profile via our form. Our AI scores your background, goals, and finances across UK, Canada, and Europe visa pathways. We then contact you with a personalised recommendation and next steps. An assessment fee applies — see our Fees page.",
  },
  {
    q: "What does full guidance include?",
    a: "End-to-end support: strategy call, personalised visa roadmap, document preparation, application review, school placement, and settlement support. The package fee depends on destination and route — we confirm it before you commit.",
  },
  {
    q: "What are the fees?",
    a: "Assessment Portal: ₦25,000–₦75,000. Migration Strategy Package: ₦800,000–₦2,500,000. Full Concierge Relocation: ₦4,000,000–₦15,000,000+ depending on route. Education Placement and Forex & Loan Partnerships are commission-based. All fees are transparent and confirmed before you pay. See the Fees page for details.",
  },
  {
    q: "Which destinations do you support?",
    a: "We assess and guide candidates for the United Kingdom, Canada, and Europe (Germany, Portugal, Netherlands, Ireland). We recommend the best route based on your profile.",
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="border-b border-border last:border-0">
      <button onClick={() => setOpen((v) => !v)} className="flex items-center justify-between w-full py-4 text-left text-sm font-bold hover:text-primary transition-colors">
        {q}
        <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="text-sm text-muted-foreground pb-4 leading-relaxed">{a}</p>}
    </div>
  )
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen pt-28 pb-24 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4">
            <BadgeCheck className="w-3.5 h-3.5" /> Process & fees
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            How we work — <span className="gradient-text">decision to settlement</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            A structured, data-driven process. From your first migration assessment to settling into your new home.
          </p>
        </div>

        {/* Service pillars */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">What sets us apart</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PILLARS.map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="fintech-card p-6"
              >
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-4`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm mb-2">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Process */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Our process</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {PROCESS.map(({ step, title, desc, href }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center relative"
              >
                <Link href={href} className="block fintech-card p-6 hover:-translate-y-1 transition-transform duration-300 h-full">
                  <div className="text-4xl font-bold text-primary/15 mb-3">{step}</div>
                  <h3 className="font-bold text-sm mb-2">{title}</h3>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </Link>
                {i < PROCESS.length - 1 && (
                  <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="fintech-card p-6">
            {FAQS.map(({ q, a }) => <FAQItem key={q} q={q} a={a} />)}
          </div>
        </section>

        {/* Fees teaser */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-6">Fees</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { label: "Assessment Portal", price: "₦25K – ₦75K", icon: Sparkles, highlighted: false },
              { label: "Migration Strategy", price: "₦800K – ₦2.5M", icon: Map, highlighted: true },
              { label: "Full Concierge", price: "₦4M – ₦15M+", icon: Shield, highlighted: false },
              { label: "Education Placement", price: "Commission", icon: GraduationCap, highlighted: false },
              { label: "Forex & Loans", price: "Commission", icon: Banknote, highlighted: false },
            ].map(({ label, price, icon: TierIcon, highlighted }) => (
              <div
                key={label}
                className={`relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 ${highlighted
                    ? "bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/20 ring-1 ring-primary/30 sm:col-span-2 lg:col-span-1"
                    : "bg-card border border-border/60 shadow-sm hover:shadow-md"
                  }`}
              >
                {highlighted && (
                  <div className="absolute top-0 right-0 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-bl-xl text-[9px] font-bold uppercase tracking-wider">
                    <Star className="w-2.5 h-2.5 inline -mt-0.5 mr-0.5 fill-white" /> Recommended
                  </div>
                )}
                {!highlighted && <div className="h-0.5 bg-primary/30" />}
                <div className="p-5">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${highlighted ? "bg-white/15" : "bg-primary/10"}`}>
                    <TierIcon className={`w-4 h-4 ${highlighted ? "text-white" : "text-primary"}`} />
                  </div>
                  <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${highlighted ? "text-white/70" : "text-muted-foreground"}`}>{label}</div>
                  <div className={`text-lg font-bold tabular-nums ${highlighted ? "text-white" : "text-foreground"}`}>{price}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/fees">
              <Button variant="outline" className="gap-2">See full fees <ArrowRight className="w-4 h-4" /></Button>
            </Link>
          </div>
        </section>

        {/* CTA */}
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-10 text-center">
          <TrendingUp className="w-10 h-10 text-white mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-3">Start your migration assessment</h3>
          <p className="text-white/80 text-sm mb-6">Get your personalised migration score, visa match, and cost estimate — powered by AI.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/qualify">
              <Button className="bg-white text-primary hover:bg-white/90 gap-2 font-bold">
                Get assessed <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/fees">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2">
                See fees
              </Button>
            </Link>
          </div>
        </div>

        {/* Compliance disclaimer */}
        <div className="mt-10 border-t border-border/40 pt-6">
          <p className="text-[11px] leading-relaxed text-muted-foreground/70">
            <strong className="text-muted-foreground">Disclaimer:</strong> EasyMoveZone provides migration advisory, strategic planning, and relocation support services. We do not provide regulated immigration legal advice or act as direct visa representatives. For UK immigration matters regulated by the OISC, and Canadian applications requiring a licensed RCIC, we refer clients to our licensed partner professionals. All visa and immigration decisions are made solely by the relevant government immigration authorities.
          </p>
        </div>
      </div>
    </div>
  )
}

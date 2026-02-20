"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  CheckCircle2, ArrowRight, Shield, Zap, BadgeCheck,
  ChevronDown, Star, FileText, TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/Button"

/* ── Our service pillars ────────────────────────────── */
const PILLARS = [
  {
    icon: Star,
    title: "We assess candidates",
    desc: "You submit your profile. We assess your fit for UK, Canada, US, and UAE and recommend the best route.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Zap,
    title: "We guide you",
    desc: "From document prep to application support — we guide you step by step. No guesswork.",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: FileText,
    title: "Start to finish",
    desc: "We stay with you until you relocate. Clear process and transparent fees at every stage.",
    color: "bg-accent/10 text-accent-foreground",
  },
  {
    icon: Shield,
    title: "Transparent fees",
    desc: "Assessment fee and full-guidance package. We confirm all costs before you commit.",
    color: "bg-secondary/10 text-secondary",
  },
]

/* ── Process: start to finish ───────────────────────── */
const PROCESS = [
  { step: "01", title: "Apply & get assessed", desc: "Submit your profile. We assess your fit and recommend routes.", href: "/qualify" },
  { step: "02", title: "Strategy call", desc: "We discuss your goals and confirm next steps and fees.", href: "/qualify" },
  { step: "03", title: "We guide you", desc: "Document prep, application support, step-by-step guidance.", href: "/how-it-works" },
  { step: "04", title: "Support to finish", desc: "We stay with you until you relocate.", href: "/fees" },
]

/* ── FAQs ───────────────────────────────────────────── */
const FAQS = [
  {
    q: "How does assessment work?",
    a: "You submit your profile via our form. We review your background, goals, and finances and assess your fit for UK, Canada, US, and UAE. We then contact you with our recommendation and next steps. An assessment fee applies — see our Fees page.",
  },
  {
    q: "What does full guidance include?",
    a: "Start-to-finish support: strategy call, document preparation, application guidance, and ongoing support until you relocate. The package fee depends on destination and route — we confirm it before you commit.",
  },
  {
    q: "What are the fees?",
    a: "Assessment: from ₦50,000 (one-time). Full guidance: package on request, depending on destination and route. All fees are transparent and confirmed before you pay. See the Fees page for details.",
  },
  {
    q: "Which destinations do you support?",
    a: "We assess and guide candidates for the United Kingdom, Canada, United States, and UAE. We recommend the best route based on your profile.",
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
            How we work — <span className="gradient-text">start to finish</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            We assess candidates and guide you through every step. Clear process, transparent fees.
          </p>
        </div>

        {/* Service pillars */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Our service</h2>
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
          <div className="fintech-card p-6 max-w-2xl mx-auto text-center">
            <p className="text-sm text-muted-foreground mb-4">
              <strong className="text-foreground">Assessment:</strong> from ₦50,000 · <strong className="text-foreground">Full guidance:</strong> package on request
            </p>
            <Link href="/fees">
              <Button variant="outline" className="gap-2">See full fees</Button>
            </Link>
          </div>
        </section>

        {/* CTA */}
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-10 text-center">
          <TrendingUp className="w-10 h-10 text-white mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-3">Get assessed</h3>
          <p className="text-white/80 text-sm mb-6">Submit your profile. We assess your fit and guide you from start to finish.</p>
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
      </div>
    </div>
  )
}

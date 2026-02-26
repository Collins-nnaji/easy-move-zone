"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Banknote, CheckCircle2, ArrowRight, Shield, GraduationCap, Handshake } from "lucide-react"
import { Button } from "@/components/ui/Button"

const FEE_ITEMS = [
  {
    title: "Assessment Portal",
    amount: "₦25,000 – ₦75,000",
    desc: "AI migration simulation and downloadable report. You submit your profile; we assess your fit for UK, Canada, and Europe with a comprehensive AI-powered analysis.",
    features: ["AI migration simulation", "Downloadable report", "Route recommendation", "Profile review"],
    accent: "primary",
  },
  {
    title: "Migration Strategy Package",
    amount: "₦800,000 – ₦2,500,000",
    desc: "End-to-end strategy support including a personalised strategy call, visa roadmap, documentation review, application preparation, and school shortlisting.",
    features: ["Strategy call", "Visa roadmap", "Documentation review", "Application prep", "School shortlisting"],
    accent: "secondary",
  },
  {
    title: "Full Concierge Relocation",
    amount: "₦4,000,000 – ₦15,000,000+",
    desc: "Complete hands-on relocation depending on route. Includes visa strategy, school placement, accommodation sourcing, airport pickup coordination, settlement checklist, bank and healthcare guidance.",
    features: ["Visa strategy", "School placement", "Accommodation sourcing", "Airport pickup coordination", "Settlement checklist", "Bank & healthcare guidance"],
    accent: "primary",
  },
  {
    title: "Education Placement",
    amount: "Commission-based",
    desc: "We earn referral commission from UK, Canadian, and European institutions. No direct cost to you — we are paid by the institutions we partner with.",
    features: ["UK institutions", "Canadian institutions", "European institutions", "No direct cost to you"],
    accent: "secondary",
  },
  {
    title: "Forex & Loan Partnerships",
    amount: "Commission-based",
    desc: "We earn referral commission from education loan providers, FX companies, and insurance partners. Access competitive rates through our vetted network.",
    features: ["Education loan providers", "FX companies", "Insurance partners", "Competitive rates"],
    accent: "primary",
  },
]

export default function FeesPage() {
  return (
    <div className="min-h-screen pt-28 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4">
            <Banknote className="w-3.5 h-3.5" /> Transparent fees
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            Our <span className="gradient-text">fees</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Structured, transparent pricing across five service tiers. Every cost confirmed before you commit.
          </p>
        </div>

        <div className="space-y-6 mb-10">
          {FEE_ITEMS.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="fintech-card p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  {item.accent === "primary" ? (
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      {i === 0 && <Banknote className="w-5 h-5 text-primary" />}
                      {i === 2 && <Shield className="w-5 h-5 text-primary" />}
                      {i === 4 && <Handshake className="w-5 h-5 text-primary" />}
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                      {i === 1 && <ArrowRight className="w-5 h-5 text-secondary" />}
                      {i === 3 && <GraduationCap className="w-5 h-5 text-secondary" />}
                    </div>
                  )}
                  <h2 className="font-bold text-lg">{item.title}</h2>
                </div>
                <span className={`text-xl font-bold tabular-nums ${item.accent === "primary" ? "text-primary" : "text-secondary"}`}>
                  {item.amount}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{item.desc}</p>
              <ul className="flex flex-wrap gap-2">
                {item.features.map((f) => (
                  <li key={f} className="flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-secondary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="fintech-surface p-5 rounded-xl flex items-start gap-3"
        >
          <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm mb-1">No hidden costs</div>
            <p className="text-xs text-muted-foreground">
              We will confirm your fee before you commit. Government visa fees and third-party costs (e.g. flights) are separate and we will outline them when relevant.
            </p>
          </div>
        </motion.div>

        <div className="mt-10 text-center">
          <Link href="/qualify">
            <Button className="gap-2">
              Get assessed <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
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

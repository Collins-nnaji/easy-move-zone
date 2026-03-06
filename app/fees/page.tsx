"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Banknote, CheckCircle2, ArrowRight, Shield, GraduationCap,
  Handshake, Sparkles, Map, Star,
} from "lucide-react"
import { Button } from "@/components/ui/Button"

const EASE = [0.16, 1, 0.3, 1] as const

const FEE_ITEMS = [
  {
    title: "Assessment Portal",
    amount: "₦25,000 – ₦75,000",
    desc: "AI migration simulation and downloadable report. You submit your profile; we assess your fit for UK, Canada, and Europe with a comprehensive AI-powered analysis.",
    features: ["AI migration simulation", "Downloadable report", "Route recommendation", "Profile review"],
    icon: Sparkles,
    accent: "primary" as const,
    recommended: false,
  },
  {
    title: "Migration Strategy Package",
    amount: "₦800,000 – ₦2,500,000",
    desc: "End-to-end strategy support including a personalised strategy call, visa roadmap, documentation review, application preparation, and school shortlisting.",
    features: ["Strategy call", "Visa roadmap", "Documentation review", "Application prep", "School shortlisting"],
    icon: Map,
    accent: "secondary" as const,
    recommended: true,
  },
  {
    title: "Full Concierge Relocation",
    amount: "₦4,000,000 – ₦15,000,000+",
    desc: "Complete hands-on relocation depending on route. Includes visa strategy, school placement, accommodation sourcing, airport pickup coordination, settlement checklist, bank and healthcare guidance.",
    features: ["Visa strategy", "School placement", "Accommodation sourcing", "Airport pickup coordination", "Settlement checklist", "Bank & healthcare guidance"],
    icon: Shield,
    accent: "primary" as const,
    recommended: false,
  },
  {
    title: "Education Placement",
    amount: "Commission-based",
    desc: "We earn referral commission from UK, Canadian, and European institutions. No direct cost to you — we are paid by the institutions we partner with.",
    features: ["UK institutions", "Canadian institutions", "European institutions", "No direct cost to you"],
    icon: GraduationCap,
    accent: "secondary" as const,
    recommended: false,
  },
  {
    title: "Forex & Loan Partnerships",
    amount: "Commission-based",
    desc: "We earn referral commission from education loan providers, FX companies, and insurance partners. Access competitive rates through our vetted network.",
    features: ["Education loan providers", "FX companies", "Insurance partners", "Competitive rates"],
    icon: Handshake,
    accent: "primary" as const,
    recommended: false,
  },
]

export default function FeesPage() {
  return (
    <div className="min-h-screen pt-28 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4"
          >
            <Banknote className="w-3.5 h-3.5" /> Transparent fees
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05, ease: EASE }}
            className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
          >
            Our <span className="gradient-text">fees</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-sm max-w-md mx-auto"
          >
            Structured, transparent pricing across five service tiers. Every cost confirmed before you commit.
          </motion.p>
        </div>

        <div className="space-y-6 mb-10">
          {FEE_ITEMS.map((item, i) => {
            const Icon = item.icon
            const isRecommended = item.recommended

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, ease: EASE }}
                className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${isRecommended
                    ? "bg-card border border-black/15 text-foreground shadow-xl shadow-black/15 ring-1 ring-black/10"
                    : "bg-card border border-border/60 shadow-sm hover:shadow-md"
                  }`}
              >
                {/* Recommended badge */}
                {isRecommended && (
                  <div className="absolute top-0 right-0 bg-white border-l border-b border-black/15 px-4 py-1.5 rounded-bl-2xl flex items-center gap-1.5">
                    <Star className="w-3 h-3 fill-black text-black" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-black">Recommended</span>
                  </div>
                )}

                {/* Top accent for non-recommended */}
                {!isRecommended && (
                  <div className={`h-1 ${item.accent === "secondary" ? "bg-secondary" : "bg-primary"}`} />
                )}

                <div className="p-6 md:p-7">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isRecommended ? "bg-black/10" : item.accent === "secondary" ? "bg-secondary/10" : "bg-primary/10"
                        }`}>
                        <Icon className={`w-6 h-6 ${isRecommended ? "text-black" : item.accent === "secondary" ? "text-secondary" : "text-primary"
                          }`} />
                      </div>
                      <div>
                        <h2 className={`font-bold text-lg ${isRecommended ? "text-black" : "text-foreground"}`}>{item.title}</h2>
                        <span className={`text-2xl font-bold tabular-nums ${isRecommended ? "text-black" : item.accent === "secondary" ? "text-secondary" : "text-primary"
                          }`}>
                          {item.amount}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className={`text-sm mb-5 leading-relaxed ${isRecommended ? "text-black/75" : "text-muted-foreground"}`}>
                    {item.desc}
                  </p>

                  <div className={`grid grid-cols-2 gap-2 ${isRecommended ? "" : ""}`}>
                    {item.features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isRecommended ? "text-black/65" : "text-secondary"
                          }`} />
                        <span className={isRecommended ? "text-black/90 font-medium" : "text-foreground font-medium"}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl bg-muted/40 border border-border/40 p-5 flex items-start gap-3"
        >
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Shield className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <div className="font-bold text-sm mb-1">No hidden costs</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
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

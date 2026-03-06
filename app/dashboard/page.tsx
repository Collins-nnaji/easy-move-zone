"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  CheckCircle2, Calculator, FileText, ArrowRight, BadgeCheck, Globe,
} from "lucide-react"
import { Button } from "@/components/ui/Button"

/* ── Tool links ─────────────────────────────────────── */
const TOOL_LINKS = [
  { href: "/qualify", label: "Get assessed", desc: "Submit your profile for assessment", icon: CheckCircle2, color: "bg-primary/10 text-primary" },
  { href: "/suite", label: "EMZ Suite", desc: "Services + process in one place", icon: FileText, color: "bg-secondary/10 text-secondary" },
  { href: "/#fees", label: "Fees", desc: "Transparent pricing", icon: Calculator, color: "bg-accent/10 text-accent-foreground" },
  { href: "/destinations", label: "Destinations", desc: "UK, Canada, Europe", icon: Globe, color: "bg-muted" },
]

export default function DashboardPage() {
  return (
    <div className="min-h-screen pt-28 pb-24 px-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4">
            <BadgeCheck className="w-3.5 h-3.5" /> Your toolkit
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Your <span className="gradient-text">journey</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Your assessment status and next steps will appear here. Use the tools below to access our migration intelligence platform.
          </p>
        </div>

        {/* Placeholder: no persisted data yet */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="fintech-card p-6 mb-8 text-center"
        >
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="font-bold text-sm mb-1">Your assessment & progress</h3>
          <p className="text-xs text-muted-foreground">
            After you get assessed, your status and next steps will show here.
          </p>
        </motion.div>

        {/* Quick links to tools */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Use our tools</h2>
          <div className="space-y-3">
            {TOOL_LINKS.map(({ href, label, desc, icon: Icon, color }, i) => (
              <motion.div
                key={href}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={href}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200 group"
                >
                  <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="font-bold text-sm">{label}</div>
                    <div className="text-xs text-muted-foreground">{desc}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link href="/qualify">
            <Button className="gap-2">
              Get assessed <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

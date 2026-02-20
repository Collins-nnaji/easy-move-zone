"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Banknote, CheckCircle2, ArrowRight, Shield } from "lucide-react"
import { Button } from "@/components/ui/Button"

const FEE_ITEMS = [
  {
    title: "Assessment fee",
    amount: "From ₦50,000",
    desc: "One-time. You submit your profile; we assess your fit for UK, Canada, US, and UAE. You receive a written assessment and recommended route(s).",
    features: ["Profile review", "Destination fit", "Route recommendation"],
  },
  {
    title: "Full guidance package",
    amount: "On request",
    desc: "Start-to-finish support: document preparation, application guidance, and support until you relocate. Fee depends on destination and visa route.",
    features: ["Strategy call", "Document prep", "Application support", "Ongoing guidance"],
  },
]

export default function FeesPage() {
  return (
    <div className="min-h-screen pt-28 pb-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4">
            <Banknote className="w-3.5 h-3.5" /> Transparent fees
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            Our <span className="gradient-text">fees</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Clear pricing. No hidden costs. Assessment fee and full-service package.
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
                <h2 className="font-bold text-lg">{item.title}</h2>
                <span className="text-xl font-bold text-primary tabular-nums">{item.amount}</span>
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
          transition={{ delay: 0.3 }}
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
      </div>
    </div>
  )
}

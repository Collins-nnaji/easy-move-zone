"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { motion } from "framer-motion"
import { MapPin, ArrowRight, CheckCircle2, Shield } from "lucide-react"
import { Button } from "@/components/ui/Button"

const DESTINATIONS = [
  { id: "uk", name: "United Kingdom", tag: "Work · Study · Health & Care", visaTypes: "Skilled Worker, Student, Health & Care Worker, Global Talent, Innovator Founder", costRange: "₦2M–₦15M+", href: "/destinations?country=uk" },
  { id: "canada", name: "Canada", tag: "Express Entry · PNP", visaTypes: "Express Entry, Provincial Nominee Program (PNP), Study Permit, Spousal Sponsorship", costRange: "CAD 3K–15K+", href: "/destinations?country=canada" },
  { id: "europe", name: "Europe", tag: "Blue Card · D7 · HSM", visaTypes: "Germany Blue Card, Portugal D7 Visa, Netherlands HSM, Ireland Critical Skills", costRange: "€3K–€15K+", href: "/destinations?country=europe" },
]

function DestinationCard({ dest }: { dest: (typeof DESTINATIONS)[0] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="fintech-card p-6"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{dest.tag}</span>
          <h3 className="font-bold text-lg">{dest.name}</h3>
        </div>
        <MapPin className="w-5 h-5 text-primary shrink-0" />
      </div>
      <div className="space-y-2 text-sm text-muted-foreground mb-4">
        <div><span className="font-medium text-foreground">Common routes:</span> {dest.visaTypes}</div>
        <div><span className="font-medium text-foreground">Typical cost range:</span> {dest.costRange}</div>
      </div>
      <div className="flex gap-2 pt-2 border-t border-border">
        <Link href="/qualify" className="flex-1">
          <Button size="sm" variant="outline" className="w-full">Check fit</Button>
        </Link>
        <Link href="/calculator" className="flex-1">
          <Button size="sm" className="w-full gap-1">Cost calculator <ArrowRight className="w-3 h-3" /></Button>
        </Link>
      </div>
    </motion.div>
  )
}

function DestinationsContent() {
  const searchParams = useSearchParams()
  const country = searchParams.get("country") ?? null

  return (
    <div className="min-h-screen pt-28 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4">
            <Shield className="w-3.5 h-3.5" /> Destination guides
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            Global relocation from <span className="gradient-text">Nigeria</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            We specialise in three high-demand migration corridors. Explore visa pathways, costs, and timelines for each market.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {DESTINATIONS.map((dest) => (
            <DestinationCard key={dest.id} dest={dest} />
          ))}
        </div>

        <div className="mt-12 fintech-surface p-5 text-center">
          <p className="text-xs text-muted-foreground">
            We guide you through the process from start to finish. <Link href="/qualify" className="text-primary font-medium hover:underline">Get assessed</Link> to begin.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function DestinationsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-28 pb-24 px-6 flex items-center justify-center"><p className="text-muted-foreground">Loading…</p></div>}>
      <DestinationsContent />
    </Suspense>
  )
}

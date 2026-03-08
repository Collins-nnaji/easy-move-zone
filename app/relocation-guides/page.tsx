"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ArrowRight, BookOpenText, CheckCircle2, ChevronDown, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/Button"

const EASE = [0.16, 1, 0.3, 1] as const

type Route = "uk" | "canada" | "europe"
type GuideType = "visa" | "relocation" | "student" | "digital-nomad"

const GUIDES: Array<{
  id: string
  title: string
  route: Route
  type: GuideType
  summary: string
  steps: string[]
  premium: boolean
}> = [
  {
    id: "g1",
    title: "UK Skilled Worker Visa Guide",
    route: "uk",
    type: "visa",
    summary: "End-to-end sponsorship, documentation, and timeline strategy for UK work relocation.",
    steps: ["Check job eligibility and sponsor license", "Prepare role, salary, and evidence package", "Sequence biometrics and post-decision actions"],
    premium: false,
  },
  {
    id: "g2",
    title: "Canada Student Relocation Playbook",
    route: "canada",
    type: "student",
    summary: "Admission-to-arrival workflow for students moving to Canada with cost planning.",
    steps: ["Align school offer and admission docs", "Prepare proof-of-funds and statement package", "Map arrival housing and first 90-day setup"],
    premium: true,
  },
  {
    id: "g3",
    title: "Europe Digital Nomad Route Blueprint",
    route: "europe",
    type: "digital-nomad",
    summary: "Country fit, income proof, and location strategy for nomad relocation in Europe.",
    steps: ["Select country by policy and income threshold", "Prepare remote work and tax evidence", "Plan housing + local registration process"],
    premium: true,
  },
  {
    id: "g4",
    title: "Family Relocation Readiness Guide",
    route: "uk",
    type: "relocation",
    summary: "Family-focused documentation, housing, and settlement planning framework.",
    steps: ["Map dependent document checklist", "Plan schooling and housing sequence", "Build family budget and emergency buffer"],
    premium: false,
  },
]

export default function RelocationGuidesPage() {
  const [route, setRoute] = React.useState<Route>("uk")
  const [type, setType] = React.useState<GuideType>("visa")
  const [open, setOpen] = React.useState<string>("g1")

  const guides = GUIDES.filter((g) => g.route === route).filter((g) => g.type === type)

  return (
    <div className="min-h-screen pt-28 pb-24 px-6 bg-gradient-to-b from-white via-white to-black/[0.02]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-5">
          <Link href="/suite" className="inline-flex items-center gap-1.5 text-xs font-semibold text-black/70 hover:text-black transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Suite
          </Link>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="rounded-3xl border border-black/10 bg-white p-6 md:p-8 mb-6 shadow-[0_24px_56px_-34px_rgba(0,0,0,0.42)]"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.04] px-3 py-1.5 text-xs font-semibold text-black mb-3">
            <BookOpenText className="w-3.5 h-3.5" />
            Relocation guide hub
          </div>
          <h1 className="display-title text-3xl md:text-5xl text-black mb-2">Visa and relocation guides</h1>
          <p className="text-black/70 max-w-3xl">
            Playbook-style guidance users can follow inside the platform.
            Free guides build trust; premium guides drive monetization.
          </p>
        </motion.section>

        <section className="rounded-2xl border border-black/10 bg-white p-4 mb-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider font-semibold text-black/55 mb-2">Route</div>
              <div className="flex flex-wrap gap-2">
                {(["uk", "canada", "europe"] as const).map((r) => (
                  <button key={r} onClick={() => setRoute(r)} className={`px-3 py-2 rounded-lg border text-xs font-semibold ${route === r ? "bg-black text-white border-black" : "border-black/15 text-black/70"}`}>
                    {r.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider font-semibold text-black/55 mb-2">Guide type</div>
              <div className="flex flex-wrap gap-2">
                {(["visa", "relocation", "student", "digital-nomad"] as const).map((t) => (
                  <button key={t} onClick={() => setType(t)} className={`px-3 py-2 rounded-lg border text-xs font-semibold ${type === t ? "bg-black text-white border-black" : "border-black/15 text-black/70"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          {guides.map((guide) => {
            const isOpen = open === guide.id
            return (
              <article key={guide.id} className="rounded-2xl border border-black/10 bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? "" : guide.id)}
                  className="w-full text-left p-5 flex items-start justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {guide.premium ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-black text-white text-[10px] px-2 py-0.5 uppercase tracking-wider font-bold">
                          <Sparkles className="w-3 h-3" /> Premium
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-black/[0.06] text-black text-[10px] px-2 py-0.5 uppercase tracking-wider font-bold">
                          Free
                        </span>
                      )}
                    </div>
                    <h2 className="font-bold text-black text-lg">{guide.title}</h2>
                    <p className="text-sm text-black/65 mt-1">{guide.summary}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-black/60 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.24, ease: EASE }}
                      className="overflow-hidden border-t border-black/10"
                    >
                      <div className="p-5 space-y-2">
                        {guide.steps.map((s) => (
                          <div key={s} className="flex items-start gap-2 text-sm text-black/75">
                            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                            {s}
                          </div>
                        ))}
                        <div className="pt-3 flex flex-wrap gap-2">
                          <Link href="/document-support"><Button className="gap-2">Apply this guide in docs <ArrowRight className="w-4 h-4" /></Button></Link>
                          <Link href="/relocation-assistant"><Button variant="outline">Ask AI about this guide</Button></Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </article>
            )
          })}
          {guides.length === 0 && (
            <div className="rounded-2xl border border-dashed border-black/20 bg-white p-8 text-center text-sm text-black/60">
              No guides for this filter yet. Try another route/type.
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

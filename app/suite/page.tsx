"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowRight,
  BadgeCheck,
  Calculator,
  CheckCircle2,
  Compass,
  FileCheck2,
  GraduationCap,
  Home,
  MapPinned,
  ScanSearch,
} from "lucide-react"
import { Button } from "@/components/ui/Button"

const EASE = [0.16, 1, 0.3, 1] as const

const TOOL_CARDS = [
  {
    title: "Document support workspace",
    desc: "Organize required documents, upload files, and track readiness by route and purpose.",
    href: "/document-support",
    icon: FileCheck2,
    cta: "Open document support",
  },
  {
    title: "Assessment tool",
    desc: "Match your profile to routes across UK, Canada, and Europe.",
    href: "/qualify",
    icon: ScanSearch,
    cta: "Open assessment",
  },
  {
    title: "Cost calculator",
    desc: "Estimate migration costs and plan budget ranges clearly.",
    href: "/calculator",
    icon: Calculator,
    cta: "Open calculator",
  },
  {
    title: "Route strategies",
    desc: "Review migration strategies for UK, Canada, and Europe routes on homepage.",
    href: "/#routes",
    icon: MapPinned,
    cta: "View route strategies",
  },
]

const JOURNEY = [
  { title: "Intelligence", detail: "Eligibility scoring and route-fit confidence.", icon: ScanSearch },
  { title: "Visa", detail: "Checklist control and application preparation.", icon: FileCheck2 },
  { title: "School", detail: "Study placement planning and tuition mapping.", icon: GraduationCap },
  { title: "Accommodation", detail: "City selection and landing housing strategy.", icon: Home },
  { title: "Funding", detail: "Budget structure and proof-of-funds planning.", icon: Compass },
]

const USE_CASE_PATHWAYS = [
  {
    title: "For work relocation",
    summary: "Screen route fit, align sponsor/employer evidence, and sequence timeline-critical documents first.",
    steps: ["Run assessment", "Open document support", "Validate total costs"],
    href: "/qualify",
    cta: "Start work route check",
  },
  {
    title: "For study relocation",
    summary: "Track admission evidence, tuition/funding readiness, and study-route supporting documents in one space.",
    steps: ["Check eligibility", "Plan funds", "Prepare study dossier"],
    href: "/document-support",
    cta: "Start study document prep",
  },
  {
    title: "For business mobility",
    summary: "Coordinate business profile evidence, compliance records, and destination-specific investment documents.",
    steps: ["Match business pathway", "Structure documents", "Review route strategy"],
    href: "/#routes",
    cta: "See business route strategies",
  },
]

export default function SuitePage() {
  return (
    <div className="min-h-screen pt-28 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="rounded-3xl border border-black/10 bg-white p-7 md:p-10 mb-10 shadow-[0_26px_60px_-36px_rgba(0,0,0,0.45)]"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/[0.04] border border-black/10 text-xs font-semibold text-black mb-4">
            <BadgeCheck className="w-3.5 h-3.5" />
            EMZ Suite Command Center
          </div>
          <h1 className="display-title text-4xl md:text-6xl font-bold text-black mb-3">
            Global travel & relocation
            <br />
            tool + document support suite.
          </h1>
          <p className="text-black/70 text-base md:text-lg max-w-3xl">
            Positioning EMZ Suite as a practical platform for anybody planning international travel or relocation for work, study, or business.
            Use tools, document support, and strategy guidance in one flow.
          </p>
          <div className="mt-6 grid sm:grid-cols-3 gap-3">
            {[
              { label: "Core tools", value: "4" },
              { label: "Journey stages covered", value: "5" },
              { label: "Use cases", value: "Work · Study · Business" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-black/10 bg-white p-3">
                <div className="text-[11px] uppercase tracking-wider text-black/55 font-semibold">{item.label}</div>
                <div className="text-sm font-bold text-black mt-0.5">{item.value}</div>
              </div>
            ))}
          </div>
        </motion.section>

        <section className="mb-14">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
            <h2 className="display-title text-3xl md:text-5xl text-black">Core tools</h2>
            <span className="text-xs font-semibold text-black/60 rounded-full border border-black/12 bg-black/[0.03] px-3 py-1.5">
              Start with assessment, then calculate costs
            </span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {TOOL_CARDS.map(({ title, desc, href, icon: Icon, cta }, index) => (
              <motion.article
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.07, duration: 0.4, ease: EASE }}
                whileHover={{ y: -7 }}
                className="rounded-2xl border border-black/12 bg-white p-5 shadow-[0_16px_38px_-28px_rgba(0,0,0,0.45)]"
              >
                <div className="w-11 h-11 rounded-xl bg-black/[0.06] text-black flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-black mb-2">{title}</h3>
                <p className="text-sm text-black/65 leading-relaxed mb-4">{desc}</p>
                <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-black hover:text-black/80">
                  {cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="mb-12 rounded-3xl border border-black/10 bg-white p-6 md:p-8 shadow-[0_24px_54px_-38px_rgba(0,0,0,0.45)]">
          <h2 className="display-title text-3xl md:text-5xl text-black mb-3">Suite process map</h2>
          <p className="text-black/70 mb-6">A clear stage-by-stage operating flow for every client journey.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {JOURNEY.map(({ title, detail, icon: Icon }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.35 }}
                className="rounded-xl border border-black/10 bg-white p-4"
              >
                <div className="w-9 h-9 rounded-lg bg-black/[0.06] text-black flex items-center justify-center mb-3">
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="font-bold text-black text-sm mb-1">{title}</div>
                <p className="text-xs text-black/60">{detail}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mb-12 rounded-3xl border border-black/10 bg-white p-6 md:p-8 shadow-[0_24px_54px_-38px_rgba(0,0,0,0.45)]">
          <h2 className="display-title text-3xl md:text-5xl text-black mb-3">Use-case pathways</h2>
          <p className="text-black/70 mb-6">
            Choose a pathway by intent and follow a structured sequence instead of navigating tools randomly.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {USE_CASE_PATHWAYS.map(({ title, summary, steps, href, cta }) => (
              <article key={title} className="rounded-2xl border border-black/10 bg-white p-5">
                <h3 className="text-lg font-bold text-black mb-2">{title}</h3>
                <p className="text-sm text-black/65 leading-relaxed mb-4">{summary}</p>
                <ul className="space-y-1.5 mb-4">
                  {steps.map((step) => (
                    <li key={step} className="text-xs text-black/70 inline-flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-black/70" />
                      {step}
                    </li>
                  ))}
                </ul>
                <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-black hover:text-black/80">
                  {cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-6 text-center">
          <h3 className="display-title text-3xl md:text-4xl text-black mb-2">Need a quick start?</h3>
          <p className="text-black/65 mb-5">Start with assessment, organise documents, then validate your budget.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/qualify">
              <Button className="gap-2">Start assessment <ArrowRight className="w-4 h-4" /></Button>
            </Link>
            <Link href="/document-support">
              <Button variant="outline" className="gap-2">Open document support</Button>
            </Link>
            <Link href="/calculator">
              <Button variant="outline" className="gap-2">Run calculator</Button>
            </Link>
          </div>
          <div className="mt-4 inline-flex items-center gap-1 text-xs text-black/55">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Tools organised here to keep navigation clean.
          </div>
        </section>
      </div>
    </div>
  )
}

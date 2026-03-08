"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  Calculator,
  CheckCircle2,
  Clock3,
  Compass,
  FileCheck2,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  MapPinned,
  ScanSearch,
} from "lucide-react"
import { Button } from "@/components/ui/Button"

const EASE = [0.16, 1, 0.3, 1] as const

const QUICK_LINKS = [
  { label: "Dashboard", href: "#dashboard" },
  { label: "Tools", href: "#tools" },
  { label: "Flow board", href: "#flow" },
  { label: "Pathways", href: "#pathways" },
]

const DASHBOARD_STATS = [
  { label: "Workspace readiness", value: "74%", delta: "+8% this week" },
  { label: "Active tools", value: "4", delta: "Assessment + Docs + Cost + Route" },
  { label: "Open document items", value: "12", delta: "4 marked high-priority" },
  { label: "Next deadline window", value: "6 days", delta: "Based on selected route timeline" },
]

const ACTIVITY_FEED = [
  "Assessment score refreshed for UK and Canada routes.",
  "Document workspace synced with latest required checklist.",
  "Cost planning baseline updated using current travel assumptions.",
  "Pathway recommendation re-ranked after profile edits.",
]

const TOOL_CARDS = [
  {
    title: "Assessment workspace",
    desc: "Run AI profile scoring and compare likely routes before spending on full processing.",
    href: "/qualify",
    icon: ScanSearch,
    cta: "Open assessment",
    status: "Core",
  },
  {
    title: "Document support workspace",
    desc: "Track required documents, upload evidence, and monitor missing or high-risk items.",
    href: "/document-support",
    icon: FolderOpen,
    cta: "Open document support",
    status: "Core",
  },
  {
    title: "Budget calculator",
    desc: "Model relocation costs, proof-of-funds assumptions, and first-month settlement exposure.",
    href: "/calculator",
    icon: Calculator,
    cta: "Open calculator",
    status: "Planning",
  },
  {
    title: "Route intelligence",
    desc: "Use scored output to pressure-test work, study, and business movement strategies.",
    href: "/qualify",
    icon: MapPinned,
    cta: "Review route intelligence",
    status: "Analysis",
  },
]

const FLOW_COLUMNS = [
  {
    title: "Intelligence",
    icon: BrainCircuit,
    points: ["Collect profile signals", "Score route probability", "Rank best-fit pathways"],
  },
  {
    title: "Visa + documents",
    icon: FileCheck2,
    points: ["Generate checklist", "Track missing files", "Resolve quality flags"],
  },
  {
    title: "School / accommodation",
    icon: GraduationCap,
    points: ["Map school options", "Coordinate city decision", "Prepare landing setup"],
  },
  {
    title: "Funding + execution",
    icon: Compass,
    points: ["Model budget", "Validate proof-of-funds", "Execute timeline plan"],
  },
]

const USE_CASE_PATHWAYS = [
  {
    title: "Work relocation lane",
    summary: "For professionals optimizing sponsor alignment, role-fit evidence, and time-bound submissions.",
    bullets: ["Run skill and role-fit assessment", "Prioritize sponsor/offer documents", "Confirm funds and execution timeline"],
    href: "/qualify",
  },
  {
    title: "Study relocation lane",
    summary: "For applicants managing admission readiness, tuition exposure, and dependent document quality.",
    bullets: ["Assess study-route viability", "Prepare admission and academic files", "Model tuition plus settlement costs"],
    href: "/document-support",
  },
  {
    title: "Business mobility lane",
    summary: "For founders and operators aligning business evidence with route-specific compliance demands.",
    bullets: ["Score business pathway options", "Structure company and tax records", "Validate destination execution plan"],
    href: "/qualify",
  },
]

export default function SuitePage() {
  return (
    <div className="min-h-screen pt-28 pb-24 px-6 bg-gradient-to-b from-white via-white to-black/[0.02]">
      <div className="max-w-7xl mx-auto">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="rounded-3xl border border-black/10 bg-white p-7 md:p-10 mb-6 shadow-[0_26px_60px_-36px_rgba(0,0,0,0.45)]"
        >
          <div className="grid lg:grid-cols-[1.35fr_0.65fr] gap-6 items-start">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/[0.04] border border-black/10 text-xs font-semibold text-black mb-4">
                <BadgeCheck className="w-3.5 h-3.5" />
                EMZ Suite Platform
              </div>
              <h1 className="display-title text-4xl md:text-6xl font-bold text-black mb-3">
                Dashboard + tools + flow
                <br />
                in one platform workspace.
              </h1>
              <p className="text-black/70 text-base md:text-lg max-w-3xl">
                EasyMoveZone Suite is the main operating platform for AI-powered assessment, document processing support,
                and relocation execution planning.
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5 text-sm">
                {["Platform dashboard", "Animated workflow", "Route intelligence", "Document control"].map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-full bg-black/[0.05] px-3 py-1.5 border border-black/8">
                    <CheckCircle2 className="w-4 h-4 text-black" />
                    <span className="text-black/85">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-black/10 bg-black text-white p-5">
              <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-white/70 mb-2">
                <LayoutDashboard className="w-3.5 h-3.5" />
                Platform health
              </div>
              <div className="text-3xl font-bold mb-1">Operational</div>
              <p className="text-xs text-white/70 mb-4">
                Workspace modules are synced and ready for decision-making flow.
              </p>
              <div className="space-y-2.5">
                {[
                  { label: "Assessment engine", value: "Active" },
                  { label: "Document workspace", value: "Synced" },
                  { label: "Flow board", value: "Ready" },
                ].map((row) => (
                  <div key={row.label} className="rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2 flex items-center justify-between">
                    <span className="text-xs text-white/75">{row.label}</span>
                    <span className="text-xs font-semibold">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        <section className="mb-12 rounded-2xl border border-black/10 bg-white px-3 py-3 shadow-[0_20px_45px_-35px_rgba(0,0,0,0.45)]">
          <div className="flex flex-wrap gap-2">
            {QUICK_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="inline-flex items-center rounded-xl border border-black/15 bg-white px-3 py-2 text-xs font-semibold text-black/75 hover:text-black hover:bg-black/[0.03] transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        </section>

        <section id="dashboard" className="mb-12 grid lg:grid-cols-[1.1fr_0.9fr] gap-5">
          <div className="rounded-3xl border border-black/10 bg-white p-6 md:p-7 shadow-[0_24px_54px_-38px_rgba(0,0,0,0.45)]">
            <div className="flex items-center gap-2 mb-5">
              <LayoutDashboard className="w-4.5 h-4.5 text-black" />
              <h2 className="display-title text-2xl md:text-4xl text-black">Operations dashboard</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {DASHBOARD_STATS.map((item, index) => (
                <motion.article
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05, duration: 0.32, ease: EASE }}
                  className="rounded-xl border border-black/10 bg-black/[0.02] p-4"
                >
                  <div className="text-[11px] uppercase tracking-wider text-black/55 font-semibold">{item.label}</div>
                  <div className="text-2xl font-bold text-black mt-1">{item.value}</div>
                  <div className="text-xs text-black/60 mt-1">{item.delta}</div>
                </motion.article>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-black/10 bg-black text-white p-6 md:p-7 shadow-[0_24px_54px_-38px_rgba(0,0,0,0.45)]">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4.5 h-4.5" />
              <h3 className="text-xl md:text-2xl font-bold">Live activity feed</h3>
            </div>
            <div className="space-y-2.5 mb-5">
              {ACTIVITY_FEED.map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06, duration: 0.28 }}
                  className="rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2.5 text-sm text-white/85"
                >
                  {item}
                </motion.div>
              ))}
            </div>
            <div className="rounded-xl border border-white/15 bg-white/[0.04] p-4">
              <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-white/70 mb-2">
                <Clock3 className="w-3.5 h-3.5" />
                Recommended next
              </div>
              <p className="text-sm text-white/85 mb-3">
                Open Assessment first, then immediately continue into Document Support to reduce timeline slippage.
              </p>
              <Link href="/qualify" className="inline-flex items-center gap-1 text-sm font-semibold text-white hover:text-white/80">
                Start assessment <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        <section id="tools" className="mb-12 rounded-3xl border border-black/10 bg-white p-6 md:p-8 shadow-[0_24px_54px_-38px_rgba(0,0,0,0.45)]">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
            <h2 className="display-title text-3xl md:text-5xl text-black">Core tool workspace</h2>
            <span className="text-xs font-semibold text-black/60 rounded-full border border-black/12 bg-black/[0.03] px-3 py-1.5">
              Platform modules
            </span>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            {TOOL_CARDS.map(({ title, desc, href, icon: Icon, cta, status }, index) => (
              <motion.article
                key={title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.36, ease: EASE }}
                whileHover={{ y: -6 }}
                className="rounded-2xl border border-black/12 bg-white p-5 shadow-[0_16px_38px_-28px_rgba(0,0,0,0.45)]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-black/[0.06] text-black flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider rounded-full bg-black text-white px-2.5 py-1">
                    {status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-black mb-2">{title}</h3>
                <p className="text-sm text-black/65 leading-relaxed mb-4">{desc}</p>
                <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-black hover:text-black/80">
                  {cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="flow" className="mb-12 rounded-3xl border border-black/10 bg-black text-white p-6 md:p-8 shadow-[0_24px_54px_-38px_rgba(0,0,0,0.55)]">
          <h2 className="display-title text-3xl md:text-5xl text-white mb-2">Flow board</h2>
          <p className="text-white/70 mb-6">A stage-by-stage execution lane from profile intelligence to settlement action.</p>
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            {FLOW_COLUMNS.map(({ title, icon: Icon, points }, index) => (
              <motion.article
                key={title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.35 }}
                className="rounded-2xl border border-white/15 bg-white/[0.06] p-4"
              >
                <div className="w-9 h-9 rounded-lg bg-white/15 text-white flex items-center justify-center mb-3">
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <h3 className="font-bold text-white text-base mb-3">{title}</h3>
                <ul className="space-y-2">
                  {points.map((point) => (
                    <li key={point} className="text-sm text-white/80 inline-flex items-start gap-1.5">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="pathways" className="mb-12 rounded-3xl border border-black/10 bg-white p-6 md:p-8 shadow-[0_24px_54px_-38px_rgba(0,0,0,0.45)]">
          <h2 className="display-title text-3xl md:text-5xl text-black mb-3">Execution pathways</h2>
          <p className="text-black/70 mb-6">
            Select a movement intent and follow a defined lane inside the Suite for faster decision quality.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {USE_CASE_PATHWAYS.map(({ title, summary, bullets, href }, index) => (
              <motion.article
                key={title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.35 }}
                className="rounded-2xl border border-black/10 bg-black/[0.02] p-5"
              >
                <h3 className="text-lg font-bold text-black mb-2">{title}</h3>
                <p className="text-sm text-black/65 leading-relaxed mb-4">{summary}</p>
                <ul className="space-y-1.5 mb-4">
                  {bullets.map((item) => (
                    <li key={item} className="text-xs text-black/70 inline-flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-black/70" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-black hover:text-black/80">
                  Open pathway <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-6 text-center">
          <h3 className="display-title text-3xl md:text-4xl text-black mb-2">Start in platform mode</h3>
          <p className="text-black/65 mb-5">
            Run assessment, continue with document support, then finalize funding plan in one operating sequence.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/qualify">
              <Button className="gap-2">Launch assessment <ArrowRight className="w-4 h-4" /></Button>
            </Link>
            <Link href="/document-support">
              <Button variant="outline" className="gap-2">Open document support</Button>
            </Link>
            <Link href="/calculator">
              <Button variant="outline" className="gap-2">Open calculator</Button>
            </Link>
          </div>
          <div className="mt-4 inline-flex items-center gap-1 text-xs text-black/55">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Designed as a real operating workspace, not a brochure page.
          </div>
        </section>
      </div>
    </div>
  )
}

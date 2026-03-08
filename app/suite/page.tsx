"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BookOpenText,
  Bot,
  Building2,
  Calculator,
  CheckCircle2,
  Clock3,
  Compass,
  FileCheck2,
  FolderOpen,
  Home,
  LayoutDashboard,
  ScanSearch,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/Button"

const EASE = [0.16, 1, 0.3, 1] as const

const QUICK_LINKS = [
  { label: "Dashboard", href: "#dashboard" },
  { label: "Core tools", href: "#tools" },
  { label: "Marketplace", href: "#marketplace" },
  { label: "Flow board", href: "#flow" },
]

const DASHBOARD_STATS = [
  { label: "Platform modules", value: "10", delta: "Guides + Housing + Movers + AI + Core tools" },
  { label: "Countries covered", value: "30+", delta: "Route and housing intelligence coverage" },
  { label: "Partner channels", value: "42", delta: "Movers, housing leads, and service providers" },
  { label: "Assistant uptime", value: "99.9%", delta: "AI relocation assistant always available" },
]

const ACTIVITY_FEED = [
  "Moving company comparison refreshed with partner quote lanes.",
  "Housing inventory and city rent snapshots synchronized.",
  "Cost-of-living comparator recalculated for latest city baskets.",
  "AI relocation assistant generated a new action plan.",
]

const CORE_TOOLS = [
  {
    title: "AI assessment workspace",
    desc: "Score profile fit and route viability for work, study, business, or travel migration.",
    href: "/qualify",
    icon: ScanSearch,
    cta: "Open assessment",
    status: "Core",
  },
  {
    title: "Document processing workspace",
    desc: "Track required files, upload evidence, and resolve quality flags before submission.",
    href: "/document-support",
    icon: FolderOpen,
    cta: "Open documents",
    status: "Core",
  },
  {
    title: "Relocation budget planner",
    desc: "Model visa, flights, housing setup, and proof-of-funds exposure in one budget flow.",
    href: "/calculator",
    icon: Calculator,
    cta: "Open calculator",
    status: "Planning",
  },
  {
    title: "AI relocation assistant",
    desc: "Ask relocation questions and get actionable step plans linked to platform modules.",
    href: "/relocation-assistant",
    icon: Bot,
    cta: "Open assistant",
    status: "AI",
  },
]

const MARKETPLACE_MODULES = [
  {
    title: "Compare moving companies",
    desc: "Review movers by route, service quality, insurance, and partner quote potential.",
    href: "/moving-companies",
    icon: Building2,
    revenue: "Affiliate commissions",
  },
  {
    title: "Relocation guides",
    desc: "Structured visa and relocation playbooks with checklists and route-specific recommendations.",
    href: "/relocation-guides",
    icon: BookOpenText,
    revenue: "Premium guide packs",
  },
  {
    title: "Housing search",
    desc: "Partner-backed listings, city filters, and lead routing for relocation-ready homes.",
    href: "/housing-search",
    icon: Home,
    revenue: "Real estate lead fees",
  },
  {
    title: "Cost of living comparator",
    desc: "Compare monthly expense baskets between source and destination cities before moving.",
    href: "/cost-of-living",
    icon: Compass,
    revenue: "Premium analytics",
  },
  {
    title: "Expat communities",
    desc: "Join verified groups and events for students, families, and digital nomads abroad.",
    href: "/communities",
    icon: Users,
    revenue: "Community subscriptions",
  },
]

const FLOW_COLUMNS = [
  {
    title: "Assess",
    icon: ScanSearch,
    points: ["Capture profile signals", "Score route fit", "Prioritize strongest options"],
  },
  {
    title: "Prepare",
    icon: FileCheck2,
    points: ["Generate document checklist", "Resolve missing evidence", "Package submission-ready files"],
  },
  {
    title: "Plan move",
    icon: Building2,
    points: ["Compare movers", "Run cost-of-living checks", "Finalize relocation budget"],
  },
  {
    title: "Settle",
    icon: Users,
    points: ["Find housing", "Join expat communities", "Track first 90-day setup"],
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
                EasyMoveZone Relocation Platform
              </div>
              <h1 className="display-title text-4xl md:text-6xl font-bold text-black mb-3">
                Relocation super-app
                <br />
                for moving city to city, country to country.
              </h1>
              <p className="text-black/70 text-base md:text-lg max-w-3xl">
                One platform for assessment, visa guides, moving companies, housing search, cost-of-living intelligence,
                expat communities, and an AI relocation assistant.
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5 text-sm">
                {["Compare movers", "Housing leads", "Visa guides", "AI assistant"].map((item) => (
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
              <div className="text-3xl font-bold mb-1">Live</div>
              <p className="text-xs text-white/70 mb-4">
                Core platform modules connected for decision-to-settlement execution.
              </p>
              <div className="space-y-2.5">
                {[
                  { label: "Assessment + docs", value: "Active" },
                  { label: "Marketplace lanes", value: "Running" },
                  { label: "AI assistant", value: "Online" },
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
                Use the AI assistant to generate your move plan, then execute each lane inside platform modules.
              </p>
              <Link href="/relocation-assistant" className="inline-flex items-center gap-1 text-sm font-semibold text-white hover:text-white/80">
                Open assistant <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        <section id="tools" className="mb-12 rounded-3xl border border-black/10 bg-white p-6 md:p-8 shadow-[0_24px_54px_-38px_rgba(0,0,0,0.45)]">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
            <h2 className="display-title text-3xl md:text-5xl text-black">Core relocation tools</h2>
            <span className="text-xs font-semibold text-black/60 rounded-full border border-black/12 bg-black/[0.03] px-3 py-1.5">
              Mission-critical modules
            </span>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            {CORE_TOOLS.map(({ title, desc, href, icon: Icon, cta, status }, index) => (
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

        <section id="marketplace" className="mb-12 rounded-3xl border border-black/10 bg-black text-white p-6 md:p-8 shadow-[0_24px_54px_-38px_rgba(0,0,0,0.55)]">
          <h2 className="display-title text-3xl md:text-5xl text-white mb-2">Relocation marketplace</h2>
          <p className="text-white/70 mb-6">High-value modules for partner integrations, lead generation, and premium relocation intelligence.</p>
          <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4">
            {MARKETPLACE_MODULES.map(({ title, desc, href, icon: Icon, revenue }, index) => (
              <motion.article
                key={title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.35 }}
                className="rounded-2xl border border-white/15 bg-white/[0.06] p-4"
              >
                <div className="w-10 h-10 rounded-lg bg-white/15 text-white flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base mb-2">{title}</h3>
                <p className="text-xs text-white/75 mb-3 leading-relaxed">{desc}</p>
                <div className="text-[10px] uppercase tracking-wider text-white/60 mb-3">{revenue}</div>
                <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-white hover:text-white/80">
                  Open module <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="flow" className="mb-12 rounded-3xl border border-black/10 bg-white p-6 md:p-8 shadow-[0_24px_54px_-38px_rgba(0,0,0,0.45)]">
          <h2 className="display-title text-3xl md:text-5xl text-black mb-2">Execution flow board</h2>
          <p className="text-black/70 mb-6">A stage-by-stage path from assessment to settlement with operational modules at each step.</p>
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            {FLOW_COLUMNS.map(({ title, icon: Icon, points }, index) => (
              <motion.article
                key={title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.35 }}
                className="rounded-2xl border border-black/10 bg-black/[0.02] p-4"
              >
                <div className="w-9 h-9 rounded-lg bg-black/[0.08] text-black flex items-center justify-center mb-3">
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <h3 className="font-bold text-black text-base mb-3">{title}</h3>
                <ul className="space-y-2">
                  {points.map((point) => (
                    <li key={point} className="text-sm text-black/75 inline-flex items-start gap-1.5">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-6 text-center">
          <h3 className="display-title text-3xl md:text-4xl text-black mb-2">Launch your relocation plan</h3>
          <p className="text-black/65 mb-5">
            Start with AI assessment, then use marketplace modules to execute movers, housing, costs, and community support.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/relocation-assistant">
              <Button className="gap-2">Open AI assistant <ArrowRight className="w-4 h-4" /></Button>
            </Link>
            <Link href="/moving-companies">
              <Button variant="outline" className="gap-2">Compare movers</Button>
            </Link>
            <Link href="/housing-search">
              <Button variant="outline" className="gap-2">Search housing</Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

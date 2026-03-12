import Link from "next/link"
import { CheckCircle2, ClipboardCheck, Compass, FileSearch, Handshake, Home, Plane, Wallet } from "lucide-react"
import { PublicShell } from "@/components/platform/PublicShell"

const ROADMAP_STEPS = [
  {
    id: "01",
    title: "Plan your territory",
    description: "Choose your target city using cost, safety, growth, and lifestyle signals from Cities intelligence.",
    icon: Compass,
    cta: { label: "Scout cities", href: "/cities" },
  },
  {
    id: "02",
    title: "Secure your home",
    description: "Shortlist relocation-ready listings, compare options, and align your budget before committing.",
    icon: Home,
    cta: { label: "Browse listings", href: "/listings" },
  },
  {
    id: "03",
    title: "Lock financing",
    description: "Use Mortgage Finder to match lenders and get your next move funded with clarity.",
    icon: Wallet,
    cta: { label: "Find mortgage", href: "/mortgage" },
  },
  {
    id: "04",
    title: "Move and settle",
    description: "Follow visas, documentation, and local setup checklists until you are fully settled.",
    icon: CheckCircle2,
    cta: { label: "Update profile progress", href: "/profile" },
  },
]

const HUB_MODULES = [
  {
    title: "Visa + entry guides",
    detail: "Country-specific visa pathways, key documents, and timeline expectations.",
    icon: Plane,
  },
  {
    title: "Cost planner",
    detail: "Estimate relocation budget: flights, deposits, setup costs, and emergency buffers.",
    icon: Wallet,
  },
  {
    title: "Move checklist",
    detail: "Track pre-move, in-transit, and post-arrival tasks with a practical weekly checklist.",
    icon: ClipboardCheck,
  },
  {
    title: "Local contacts",
    detail: "Connect with relocation partners, agents, and local support providers in your destination.",
    icon: Handshake,
  },
]

export default function RelocatePage() {
  return (
    <PublicShell>
      <section className="relative overflow-hidden bg-[#0a1a2f] px-4 pb-12 pt-14 text-white sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(62,198,245,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(62,198,245,0.05)_1px,transparent_1px)] bg-[size:52px_52px]" />
        <div className="absolute -right-24 top-[-120px] h-[420px] w-[420px] rounded-full bg-[#1769d0]/30 blur-3xl" />
        <div className="absolute -left-20 bottom-[-100px] h-[320px] w-[320px] rounded-full bg-[#0f766e]/30 blur-3xl" />
        <div className="relative mx-auto w-full max-w-7xl">
          <p className="inline-flex items-center rounded-full border border-[#2d4e76] bg-[#102237] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7dd3fc]">
            Relocate Hub
          </p>
          <h1 className="mt-4 max-w-3xl font-[var(--font-playfair)] text-5xl font-semibold leading-[1.02] md:text-6xl">
            Move with a roadmap,
            <br />
            not guesswork.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
            EasyMoveZonne bridges scouting and settling. Use this hub to manage visas, budgeting, checklists, and local setup in one guided flow.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {["10,000+ families relocated", "50+ cities scouted", "End-to-end move support"].map((proof) => (
              <span key={proof} className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80">
                {proof}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1769d0]">Step-by-step</p>
          <h2 className="mt-2 font-[var(--font-playfair)] text-5xl font-semibold text-[#091520]">Relocation roadmap</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {ROADMAP_STEPS.map((step) => {
            const Icon = step.icon
            return (
              <article key={step.id} className="emz-gloss-card relative rounded-2xl p-6">
                <span className="absolute right-4 top-2 font-[var(--font-playfair)] text-6xl text-[#e8eef8]">
                  {step.id}
                </span>
                <div className="relative z-[1]">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#eaf1ff]">
                    <Icon className="h-5 w-5 text-[#155eef]" />
                  </div>
                  <h3 className="mt-3 font-[var(--font-playfair)] text-3xl font-semibold text-[#091520]">{step.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[#526070]">{step.description}</p>
                  <Link href={step.cta.href} className="mt-4 inline-block text-sm font-semibold text-[#1769d0]">
                    {step.cta.label} →
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="bg-[#f4f7fb] py-14">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-7">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1769d0]">Core tools</p>
            <h2 className="mt-2 font-[var(--font-playfair)] text-5xl font-semibold text-[#091520]">Everything to relocate confidently</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {HUB_MODULES.map((module) => {
              const Icon = module.icon
              return (
                <article key={module.title} className="rounded-2xl border border-[#dbe4f0] bg-white p-5 shadow-sm">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#eef4ff]">
                    <Icon className="h-5 w-5 text-[#155eef]" />
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-[#0f172a]">{module.title}</h3>
                  <p className="mt-1 text-sm text-[#64748b]">{module.detail}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#0f2235] px-6 py-10 text-white md:px-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7dd3fc]">
            <FileSearch className="h-3.5 w-3.5" />
            Need guided help?
          </p>
          <h2 className="mt-3 font-[var(--font-playfair)] text-4xl font-semibold leading-[1.06] md:text-5xl">
            Get a custom relocation plan
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
            Share your destination, move timeline, and household needs. We will suggest the fastest path from discovery to settled.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/contact?direction=Relocation%20planning%20support" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#155eef]">
              Request move planning
            </Link>
            <Link href="/profile" className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white">
              Open relocation progress
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  )
}

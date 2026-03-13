import Link from "next/link"
import { ClipboardCheck, FileSearch, Handshake, Plane, Wallet } from "lucide-react"
import { PublicShell } from "@/components/platform/PublicShell"
import { RelocateHubClient } from "@/components/relocate/RelocateHubClient"

const HUB_MODULES = [
  { title: "Visa + entry guides", detail: "Country-specific visa pathways and key documents.", icon: Plane },
  { title: "Cost planner", detail: "Estimate relocation budget: flights, deposits, setup.", icon: Wallet },
  { title: "Move checklist", detail: "Track pre-move, in-transit, and post-arrival tasks.", icon: ClipboardCheck },
  { title: "Local contacts", detail: "Relocation partners and local support in your destination.", icon: Handshake },
]

export default function RelocateHubPage() {
  return (
    <PublicShell>
      <section className="border-b border-[#e8edf6] bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link href="/relocate" className="text-sm font-medium text-[#64748b] hover:text-[#155eef]">
            ← Plan your move
          </Link>
          <h1 className="mt-2 font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a] sm:text-4xl">
            Relocate Hub
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#64748b]">
            Manage your relocation plan, checklist, budget, and local contacts in one place. Sign in to save progress.
          </p>
        </div>
      </section>

      <RelocateHubClient />

      <section className="bg-[#f4f7fb] py-12">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-[var(--font-playfair)] text-2xl font-semibold text-[#091520]">What’s in the hub</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {HUB_MODULES.map((module) => {
              const Icon = module.icon
              return (
                <article key={module.title} className="rounded-2xl border border-[#dbe4f0] bg-white p-4 shadow-sm">
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

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-[#0f2235] px-6 py-8 text-white md:px-10">
          <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7dd3fc]">
            <FileSearch className="h-3.5 w-3.5" />
            Need guided help?
          </div>
          <h2 className="mt-3 font-[var(--font-playfair)] text-2xl font-semibold sm:text-3xl">
            Get a custom relocation plan
          </h2>
          <p className="mt-2 max-w-xl text-sm text-white/70">
            Share your destination, timeline, and household needs. We’ll suggest the fastest path to settled.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/contact?direction=Relocation%20planning%20support" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#155eef]">
              Request move planning
            </Link>
            <Link href="/cities" className="rounded-full border border-white/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
              Back to city scouting
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  )
}

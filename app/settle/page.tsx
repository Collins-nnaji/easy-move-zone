import type { Metadata } from "next"
import { PublicShell } from "@/components/platform/PublicShell"
import { SettleClient } from "@/components/settle/SettleClient"

export const metadata: Metadata = {
  title: "Settle in — EasyMoveZone",
  description:
    "Land like you've been before. Expat- and nomad-written essentials for your destination: visas, documents, healthcare, banking, schooling and your first week.",
}

export default function SettlePage() {
  return (
    <PublicShell>
      <section className="relative overflow-hidden bg-[#1b231e] text-white">
        <div className="absolute inset-0 opacity-[0.18] bg-[radial-gradient(ellipse_60%_60%_at_15%_0%,#e0511f,transparent)]" aria-hidden />
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#f3aa79]/30 bg-[#e0511f]/15 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#f3aa79]">
            Settle
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">Land like you&apos;ve been before.</h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/70">
            Practical, local essentials for settling into a new country — documents, healthcare, banking, schooling and what to sort in your first week.
          </p>
        </div>
      </section>

      <div className="min-h-screen bg-[#efece4]">
        <SettleClient />
      </div>
    </PublicShell>
  )
}

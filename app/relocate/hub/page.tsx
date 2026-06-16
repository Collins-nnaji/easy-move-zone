import type { Metadata } from "next"
import { PublicShell } from "@/components/platform/PublicShell"
import { RelocateHubClient } from "@/components/relocate/RelocateHubClient"

export const metadata: Metadata = {
  title: "Relocation workspace — EasyMoveZone",
  description:
    "Plan your whole move: save your relocation plan, track visa and logistics tasks, manage your budget, settle into a new city, and find a verified home.",
}

export default function RelocateHubPage() {
  return (
    <PublicShell>
      {/* Warm, branded header to match the /move travel experience */}
      <section className="relative overflow-hidden bg-[#1b231e] text-white">
        <div className="absolute inset-0 opacity-[0.18] bg-[radial-gradient(ellipse_60%_60%_at_15%_0%,#e0511f,transparent)]" aria-hidden />
        <div className="absolute inset-0 opacity-[0.10] bg-[radial-gradient(ellipse_50%_50%_at_90%_100%,#f3aa79,transparent)]" aria-hidden />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#f3aa79]/30 bg-[#e0511f]/15 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#f3aa79]">
            Travel & Settlement
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">Your move, in one place.</h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/70">
            Plan, track and settle — your destination, visa route, checklist and budget, all adapting to how long you&apos;re staying.
          </p>
        </div>
      </section>

      <div className="min-h-screen bg-[#efece4] py-8">
        <RelocateHubClient />
      </div>
    </PublicShell>
  )
}

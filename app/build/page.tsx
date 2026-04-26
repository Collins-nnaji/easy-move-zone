import type { Metadata } from "next"
import Link from "next/link"
import { PublicShell } from "@/components/platform/PublicShell"
import {
  HardHat, CheckCircle2, ArrowRight, FileText,
  Ruler, ShieldCheck, ClipboardList, Camera,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Managed Build-to-Suit Construction | EasyMoveZone",
  description:
    "You own the land — we handle everything else. Architectural design, government permits, and quality-controlled construction with real-time digital updates.",
}

const steps = [
  { icon: Ruler, title: "Architectural Design", desc: "We pair you with certified architects to create plans that match your vision, budget, and local building codes." },
  { icon: FileText, title: "Government Permits", desc: "We file and chase all necessary building permits with LASG, FCTA, or relevant state authorities on your behalf." },
  { icon: HardHat, title: "Quality-Controlled Build", desc: "Our vetted contractor network builds to specification. Every stage is supervised by an independent site engineer." },
  { icon: Camera, title: "Digital Milestone Updates", desc: "Weekly photo and video updates pushed to your portal. You watch your home rise from anywhere in the world." },
  { icon: ClipboardList, title: "Snagging & Handover", desc: "We conduct a full snagging inspection before keys are handed over. No shortcuts, no surprises." },
  { icon: ShieldCheck, title: "Post-Build Warranty", desc: "12-month structural warranty covering major defects. Your investment is protected long after handover." },
]

const trustPoints = [
  "Pre-vetted contractors — background-checked and licensed",
  "Independent site engineer on every project",
  "Fixed-price contracts — no hidden cost escalation",
  "Real-time progress dashboard in your portal",
  "Diaspora-friendly — manage your build from abroad",
  "Works with any verified land, including plots purchased through us",
]

export default function BuildPage() {
  return (
    <PublicShell>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0a0f1e] py-24 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_60%_0%,rgba(245,158,11,0.15),transparent)]" aria-hidden />
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-4 py-1.5">
              <HardHat className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">BUILD</span>
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Your land.{" "}
              <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                Our expertise.
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-300 max-w-2xl">
              You've secured the land — now let us build the home. We manage architecture, permits, and construction end-to-end, with full digital transparency so you can oversee everything remotely.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-8 py-4 text-base font-bold text-white shadow-xl shadow-amber-900/30 transition hover:bg-amber-400">
                Get a free build quote <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/search"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10">
                Find land first
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#f8fafc] py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600">How it works</span>
            <h2 className="mt-3 text-3xl font-bold text-[#0f172a] sm:text-4xl">From blueprint to handover.</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.title} className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm hover:shadow-md transition">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Step {i + 1}</span>
                </div>
                <h3 className="text-base font-bold text-[#0f172a] mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section className="bg-[#0a0f1e] py-20 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">Our promise</span>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">No dishonest contractors. Ever.</h2>
              <p className="mt-4 text-slate-400 text-base leading-relaxed">
                The biggest fear in Nigerian construction is a contractor who disappears with your money or delivers substandard work. Our model eliminates this — we hold funds in escrow, release payments milestone-by-milestone, and have independent engineers sign off at every stage.
              </p>
              <Link href="/contact"
                className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-amber-400">
                Talk to a build consultant <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ul className="space-y-3">
              {trustPoints.map((p) => (
                <li key={p} className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-5 py-4">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
                  <span className="text-sm text-slate-300">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#f8fafc] py-16">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-2xl font-bold text-[#0f172a] sm:text-3xl">Ready to build?</h2>
          <p className="mt-3 text-slate-500">Send us your land documents and vision — we'll get back with a full project scope and cost estimate within 48 hours.</p>
          <Link href="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-[#0033A1] px-8 py-4 text-base font-bold text-white shadow-lg transition hover:bg-[#002880]">
            Start your build project <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </PublicShell>
  )
}

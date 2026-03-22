import Image from "next/image"
import { PublicShell } from "@/components/platform/PublicShell"
import Link from "next/link"
import {
  ShieldCheck,
  Search,
  Handshake,
  Eye,
  FileCheck,
  TrendingUp,
  Landmark,
  Globe,
  ArrowRight,
  BadgeCheck,
  Sparkles,
  Building2,
} from "lucide-react"

const aboutHeroBg =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80"

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Search & Discover",
    description: "Browse our catalogue of verified properties or use AI-powered natural language search. Tell us what you want in plain English.",
  },
  {
    number: "02",
    icon: ShieldCheck,
    title: "Title Verification",
    description: "Every listing undergoes multi-step verification: document upload, AI fraud scan, registry cross-reference, and human legal review.",
  },
  {
    number: "03",
    icon: Handshake,
    title: "Guided Transaction",
    description: "Connect with verified agents, make offers, and complete your purchase with end-to-end transaction support including escrow and legal review.",
  },
]

const trustFeatures = [
  { icon: FileCheck, title: "Title document scanning", description: "Every document is scanned for forgery, inconsistencies, and cross-referenced against land registry data." },
  { icon: Eye, title: "AI fraud detection", description: "Machine learning models trained on known fraud patterns flag suspicious listings before they go live." },
  { icon: TrendingUp, title: "AI property valuation", description: "Fair market value estimates on every listing using location, size, comparable sales, and market trend data." },
  { icon: Landmark, title: "End-to-end guidance", description: "From initial enquiry to title transfer — legal review, escrow management, and settlement support included." },
]

export default function AboutPage() {
  return (
    <PublicShell>
      {/* Hero */}
      <section className="relative overflow-hidden pt-14 pb-16 md:pt-20 md:pb-24">
        <div className="pointer-events-none absolute inset-0">
          <Image src={aboutHeroBg} alt="" fill className="object-cover object-center" priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/93 via-white/88 to-[#f8fafc]" aria-hidden />
        </div>
        <div className="home-glow-a opacity-30" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <span className="emz-section-eyebrow mx-auto border-[#155eef]/25 bg-white/90 shadow-sm backdrop-blur-sm">
            <BadgeCheck className="h-3.5 w-3.5 text-[#059669]" />
            How it works
          </span>
          <h1 className="mt-5 font-[var(--font-playfair)] text-[2.65rem] font-bold leading-[1.08] tracking-tight text-[#0f172a] md:text-6xl">
            Trust is everything
            <br />
            <span className="bg-gradient-to-r from-[#155eef] to-[#0f766e] bg-clip-text text-transparent">in African property.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#475569]">
            Buying land or property in Africa has always carried risk — forged titles, double-sold plots, and opaque processes. EasyMoveZone
            was built to change that. We verify every listing before it goes live and guide every transaction end to end.
          </p>
          <div className="mx-auto mt-10 grid max-w-lg grid-cols-3 gap-3 text-left sm:max-w-xl">
            {[
              { n: "2.4k+", l: "Listings" },
              { n: "98%", l: "Check pass" },
              { n: "12+", l: "Markets" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl border border-[#e2e8f0]/80 bg-white/80 px-3 py-4 text-center shadow-sm backdrop-blur-sm">
                <div className="font-[var(--font-playfair)] text-2xl font-bold text-[#155eef]">{s.n}</div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners strip */}
      <section className="border-b border-[#e2e8f0]/80 bg-gradient-to-r from-[#eff6ff] via-white to-[#ecfdf5] py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 text-center sm:px-6 lg:flex-row lg:justify-between lg:px-8 lg:text-left">
          <p className="max-w-xl text-sm font-semibold text-[#475569]">
            <span className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#155eef]/10 text-[#155eef] align-middle">
              <Building2 className="h-4 w-4" aria-hidden />
            </span>
            We collaborate with <strong className="text-[#0f172a]">government land agencies</strong>,{" "}
            <strong className="text-[#0f172a]">registered developers</strong>, and{" "}
            <strong className="text-[#0f172a]">accredited professionals</strong> — so verification reflects real registry and project
            reality.
          </p>
          <div className="flex flex-wrap justify-center gap-2 lg:justify-end">
            {["Agencies", "Developers", "Survey & legal"].map((t) => (
              <span
                key={t}
                className="rounded-full border border-[#155eef]/15 bg-white px-3 py-1.5 text-xs font-bold text-[#155eef] shadow-sm"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-flow-bg border-y border-[#e2e8f0]/80 bg-gradient-to-b from-white via-[#fafcfe] to-white py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <span className="emz-section-eyebrow">
              <Sparkles className="h-3.5 w-3.5" />
              Journey
            </span>
            <h2 className="mt-4 font-[var(--font-playfair)] text-4xl font-bold text-[#0f172a] md:text-[2.75rem]">Three steps to ownership</h2>
            <p className="mt-3 text-lg text-[#475569]">From first search to keys — with verification at the centre.</p>
          </div>
          <div className="relative grid gap-8 md:grid-cols-3">
            <div className="pointer-events-none absolute left-[18%] right-[18%] top-14 hidden h-0.5 bg-gradient-to-r from-[#155eef]/0 via-[#155eef]/20 to-[#155eef]/0 md:block" />
            {steps.map((step) => (
              <div
                key={step.number}
                className="emz-rich-card relative overflow-hidden p-8 text-left before:absolute before:left-0 before:top-0 before:h-1 before:w-full before:bg-gradient-to-r before:from-[#0f766e] before:to-[#155eef]"
              >
                <span className="font-[var(--font-playfair)] text-5xl font-bold text-[#155eef]/[0.12]">{step.number}</span>
                <div className="mt-2 mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#155eef]/12 to-[#0f766e]/10 text-[#155eef] ring-1 ring-[#155eef]/10">
                  <step.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-[#0f172a]">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#475569]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Features */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <span className="emz-section-eyebrow">
              <ShieldCheck className="h-3.5 w-3.5" />
              Technology
            </span>
            <h2 className="mt-4 font-[var(--font-playfair)] text-4xl font-bold text-[#0f172a] md:text-[2.75rem]">Built on trust technology</h2>
            <p className="mt-3 text-lg text-[#475569]">Human legal review, amplified by automation — not replaced by it.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {trustFeatures.map((f) => (
              <div
                key={f.title}
                className="group relative overflow-hidden rounded-2xl border border-[#e2e8f0]/90 bg-white p-8 shadow-sm transition hover:-translate-y-0.5 hover:border-[#155eef]/20 hover:shadow-lg"
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#155eef]/[0.05] transition group-hover:scale-125" />
                <div className="relative mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#059669]/12 to-[#155eef]/8 text-[#059669] ring-1 ring-[#059669]/15">
                  <f.icon className="h-7 w-7" />
                </div>
                <h3 className="relative text-lg font-bold text-[#0f172a]">{f.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-[#475569]">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="relative overflow-hidden border-t border-white/10 bg-[#0b1220] py-20 text-white md:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_30%_0%,rgba(21,94,239,0.3),transparent)]" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#60a5fa]/20 to-[#0f766e]/20 ring-1 ring-white/10">
            <Globe className="h-7 w-7 text-[#60a5fa]" />
          </div>
          <h2 className="font-[var(--font-playfair)] text-4xl font-bold md:text-5xl">Built for the African diaspora</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[#94a3b8]">
            Whether you&apos;re a professional in London buying your first plot in Lagos, a returnee in Accra looking for a family home, or an
            investor in Nairobi — EasyMoveZone removes the risk so you can buy with confidence, even from abroad.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-[15px] font-semibold text-[#0f172a] shadow-lg shadow-black/25 transition hover:bg-[#f1f5f9]"
            >
              Browse verified listings <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/auth?mode=signup"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-8 py-3.5 text-[15px] font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
            >
              Create an account
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  )
}

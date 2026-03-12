import { PublicShell } from "@/components/platform/PublicShell"
import { MortgageFinder } from "@/components/platform/MortgageFinder"
import { Sparkles, Shield, Zap, Users } from "lucide-react"

const TRUST_ITEMS = [
  { icon: Sparkles, label: "AI-powered", desc: "Instant eligibility assessment" },
  { icon: Shield, label: "Secure", desc: "Your data stays private" },
  { icon: Zap, label: "Fast matching", desc: "Results in under 60 seconds" },
  { icon: Users, label: "Real lenders", desc: "Direct connections, no middlemen" },
]

const COUNTRIES = [
  { flag: "🇳🇬", name: "Nigeria", products: "NHF, RSA-backed, Diaspora" },
  { flag: "🇰🇪", name: "Kenya", products: "KCB, Equity, NHC Gov" },
  { flag: "🇬🇭", name: "Ghana", products: "GHL, SSNIT, Republic Bank" },
  { flag: "🇿🇦", name: "South Africa", products: "FLISP, Absa 100%, SA Home Loans" },
]

export default function MortgagePage() {
  return (
    <PublicShell>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0b1f4a] via-[#0f2f6e] to-[#1a3fa0] px-4 pb-0 pt-14 sm:px-6">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/5" />

        <div className="relative mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-[#f0b14b]" />
            Mortgage Finder
          </div>
          <h1 className="mt-4 font-[var(--font-playfair)] text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Finance your move <br />
            <span className="text-[#f0b14b]">with territory-ready lenders</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/70">
            Just describe your situation in plain language. Our AI advisor will assess your eligibility,
            match you with the right lenders for your territory, and connect you directly — free, no hidden fees.
          </p>

          {/* Trust strip */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TRUST_ITEMS.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#f0b14b]" />
                <div>
                  <p className="text-xs font-bold text-white">{label}</p>
                  <p className="text-[11px] text-white/50">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Country pills */}
          <div className="mt-6 flex flex-wrap gap-2 pb-8">
            {COUNTRIES.map(c => (
              <div key={c.name} className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                <span className="text-base">{c.flag}</span>
                <div>
                  <p className="text-xs font-semibold text-white">{c.name}</p>
                  <p className="text-[10px] text-white/50">{c.products}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom wave */}
        <div className="relative -mb-px">
          <svg viewBox="0 0 1440 32" className="w-full fill-[#f4f7fc]" preserveAspectRatio="none">
            <path d="M0,32 C360,0 1080,0 1440,32 L1440,32 L0,32 Z" />
          </svg>
        </div>
      </section>

      {/* ── Chat section ── */}
      <section className="bg-[#f4f7fc] px-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          {/* Chat card */}
          <div className="rounded-2xl border border-[#dbe4f0] bg-white shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="flex items-center gap-3 border-b border-[#e8edf6] bg-[#f8fbff] px-5 py-3.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#155eef]">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#0f172a]">AI Mortgage Advisor</p>
                <p className="text-[11px] text-[#64748b]">Powered by GPT-4 · Responds instantly</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-green-400" />
                <span className="text-[11px] text-[#64748b]">Online</span>
              </div>
            </div>

            {/* The chat component */}
            <MortgageFinder />
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-[#f4f7fc] px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#155eef]">How it works</p>
          <h2 className="mt-2 text-center font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a]">
            From city shortlist to lender match in minutes
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Describe your situation",
                desc: "Tell the AI about your property goals, income, and country — in your own words.",
              },
              {
                step: "02",
                title: "Get your assessment",
                desc: "Our AI scores your eligibility and matches you with the best mortgage products for your profile.",
              },
              {
                step: "03",
                title: "Connect directly",
                desc: "Submit your details to your chosen lender. They'll contact you within 2–3 business days.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative rounded-2xl border border-[#dbe4f0] bg-white p-6">
                <p className="text-4xl font-black text-[#e8edf6]">{step}</p>
                <p className="mt-2 font-bold text-[#0f172a]">{title}</p>
                <p className="mt-1 text-sm text-[#64748b]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Country coverage ── */}
      <section className="border-t border-[#e8edf6] bg-white px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#155eef]">Coverage</p>
          <h2 className="mt-2 text-center font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a]">
            Country-specific products
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {COUNTRIES.map(c => (
              <div key={c.name} className="flex items-center gap-4 rounded-2xl border border-[#dbe4f0] p-5">
                <span className="text-4xl">{c.flag}</span>
                <div>
                  <p className="font-bold text-[#0f172a]">{c.name}</p>
                  <p className="text-xs text-[#64748b]">{c.products}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="bg-gradient-to-br from-[#0b1f4a] to-[#155eef] px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-[var(--font-playfair)] text-3xl font-bold text-white">
            Ready to fund your relocation?
          </h2>
          <p className="mt-3 text-sm text-white/70">
            Start with Mortgage Finder above, then continue in Relocate Hub to plan your move timeline.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <a href="/mortgage"
              className="rounded-full bg-white px-6 py-3 text-sm font-bold text-[#155eef] transition hover:bg-[#f0f4ff]">
              Start now →
            </a>
            <a href="/relocate"
              className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              Open Relocate Hub
            </a>
          </div>
        </div>
      </section>
    </PublicShell>
  )
}

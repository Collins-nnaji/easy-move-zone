import Link from "next/link"
import { MapPin, Home, ClipboardCheck, ArrowRight } from "lucide-react"
import { PublicShell } from "@/components/platform/PublicShell"

const STEPS = [
  {
    step: "1",
    title: "Scout your city",
    desc: "Compare cost of living, safety, and opportunity across 50+ cities.",
    href: "/cities",
    icon: MapPin,
  },
  {
    step: "2",
    title: "Secure a property",
    desc: "Browse verified listings and get matched with territory-ready lenders.",
    href: "/listings",
    icon: Home,
  },
  {
    step: "3",
    title: "Plan your move",
    desc: "Track visas, budget, and checklist — or get a custom plan from our team.",
    href: "/relocate/hub",
    icon: ClipboardCheck,
  },
]

export default function RelocatePage() {
  return (
    <PublicShell>
      {/* ── Simple hero ── */}
      <section className="border-b border-[#e8edf6] bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#155eef]">Plan your move</p>
          <h1 className="mt-3 font-[var(--font-playfair)] text-4xl font-bold leading-tight text-[#0f172a] sm:text-5xl">
            From discovery to settled — with a clear roadmap
          </h1>
          <p className="mt-4 text-base text-[#64748b]">
            Scout the right city, secure the right property, and move with checklists and support — not guesswork.
          </p>
        </div>
      </section>

      {/* ── Three steps ── */}
      <section className="bg-[#f8fbff] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6 sm:grid-cols-3">
            {STEPS.map(({ step, title, desc, href, icon: Icon }) => (
              <Link
                key={step}
                href={href}
                className="group flex flex-col rounded-2xl border border-[#dbe4f0] bg-white p-6 shadow-sm transition hover:border-[#155eef]/30 hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef4ff] text-[#155eef]">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[#64748b]">Step {step}</p>
                <h2 className="mt-1 font-[var(--font-playfair)] text-xl font-semibold text-[#0f172a]">{title}</h2>
                <p className="mt-2 flex-1 text-sm text-[#64748b]">{desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#155eef] group-hover:gap-2 transition-all">
                  Get started <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Primary CTA ── */}
      <section className="border-t border-[#e8edf6] bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-[var(--font-playfair)] text-2xl font-bold text-[#0f172a] sm:text-3xl">
            Want a custom relocation plan?
          </h2>
          <p className="mt-3 text-sm text-[#64748b]">
            Share your destination and timeline. We’ll suggest the fastest path and next steps.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/contact?direction=Relocation%20planning%20support"
              className="emz-pill-cta inline-flex rounded-full px-6 py-3 text-sm font-semibold"
            >
              Get my move plan
            </Link>
            <Link
              href="/relocate/hub"
              className="inline-flex rounded-full border border-[#dbe4f0] bg-white px-6 py-3 text-sm font-semibold text-[#0f172a] transition hover:bg-[#f8fbff]"
            >
              Track my move (checklist + budget)
            </Link>
          </div>
        </div>
      </section>

      {/* ── Proof ── */}
      <section className="border-t border-[#e8edf6] bg-[#f8fbff] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-wrap justify-center gap-4 text-center text-sm text-[#64748b]">
            <span>10,000+ families relocated</span>
            <span>·</span>
            <span>50+ cities scouted</span>
            <span>·</span>
            <span>End-to-end move support</span>
          </div>
        </div>
      </section>
    </PublicShell>
  )
}

import type { Metadata } from "next"
import Link from "next/link"
import { PublicShell } from "@/components/platform/PublicShell"
import { Building2, ShieldCheck, TrendingUp, Users, ArrowRight, CheckCircle2 } from "lucide-react"

export const metadata: Metadata = {
  title: "List Your Property — EasyMoveZone",
  description: "Reach thousands of verified tenants and buyers. List your property on EasyMoveZone for free.",
}

const benefits = [
  { icon: Users, title: "Reach verified tenants & buyers", desc: "Your listing is shown to pre-screened, serious movers — not tyre-kickers." },
  { icon: ShieldCheck, title: "Free to list, no hidden fees", desc: "Post your property at no cost. We only earn when a deal closes through our platform." },
  { icon: TrendingUp, title: "Live market pricing data", desc: "See how your asking price compares to similar properties in your area in real time." },
  { icon: Building2, title: "Manage multiple properties", desc: "Track enquiries, viewings, and offers across your entire portfolio from one dashboard." },
]

const steps = [
  { num: "01", label: "Create your listing", desc: "Add photos, price, and property details in under 10 minutes." },
  { num: "02", label: "Get verified", desc: "Our team checks your title documents — boosting your listing's credibility." },
  { num: "03", label: "Receive enquiries", desc: "Qualified buyers and tenants contact you directly through the platform." },
  { num: "04", label: "Close the deal", desc: "We can connect you with legal and documentation support to finalise fast." },
]

export default function LandlordPage() {
  return (
    <PublicShell>
      <div className="min-h-screen bg-[#f6f8fb]">
        {/* Hero */}
        <div className="bg-gradient-to-br from-[#030712] via-[#0a1128] to-[#020617] px-6 py-24 text-center">
          <span className="inline-block rounded-full border border-orange-400/30 bg-orange-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-orange-400 mb-5">
            For Landlords &amp; Property Owners
          </span>
          <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
            List your property.<br />
            <span className="bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent">
              Reach serious buyers.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-slate-400">
            Join hundreds of landlords already listing on EasyMoveZone. Verified tenants and buyers, zero listing fees, and full deal support from enquiry to handover.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/landlord/post"
              className="inline-flex items-center gap-2 rounded-xl bg-[#bf6a3c] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#005fa8]"
            >
              Post a Listing <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Talk to us first
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          {/* Benefits */}
          <div className="grid gap-5 sm:grid-cols-2">
            {benefits.map((b) => (
              <div key={b.title} className="rounded-2xl border border-[#e2e8f0] bg-white p-6 flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#bf6a3c]/10">
                  <b.icon className="h-5 w-5 text-[#bf6a3c]" />
                </div>
                <div>
                  <p className="font-bold text-[#0f172a]">{b.title}</p>
                  <p className="mt-1 text-sm text-[#64748b]">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* How it works */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-8 text-center">How it works</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s) => (
                <div key={s.num} className="rounded-2xl border border-[#e2e8f0] bg-white p-6 text-center">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#bf6a3c]/10 text-sm font-bold text-[#bf6a3c]">
                    {s.num}
                  </div>
                  <p className="font-bold text-[#0f172a] text-sm">{s.label}</p>
                  <p className="mt-1 text-xs text-[#64748b] leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 rounded-3xl border border-[#bf6a3c]/20 bg-gradient-to-br from-white to-blue-50 p-10 text-center">
            <CheckCircle2 className="mx-auto mb-4 h-9 w-9 text-[#bf6a3c]" />
            <h3 className="text-2xl font-bold text-[#0f172a]">Ready to list?</h3>
            <p className="mt-2 text-sm text-[#64748b] max-w-sm mx-auto">
              It takes less than 10 minutes. Our team reviews every listing before it goes live.
            </p>
            <Link
              href="/landlord/post"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#bf6a3c] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#005fa8]"
            >
              Post a Listing <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </PublicShell>
  )
}

"use client"

import Image from "next/image"
import { HardHat, CheckCircle2, ArrowRight, ExternalLink, MapPin, Ruler, Users } from "lucide-react"
import Link from "next/link"
import { BuildGuidedForm } from "@/components/platform/BuildGuidedForm"
import { clsx } from "clsx"

const steps = [
  "Architectural Design — match your vision to building codes",
  "Government Permits — filed and chased on your behalf",
  "Quality-Controlled Build — supervised engineering throughout",
  "Digital Milestone Logs — follow progress remotely",
  "Snagging & Handover — strict quality inspection before keys",
  "12-Month Structural Warranty — your asset is protected",
]

const promises = [
  "Pre-vetted licensed contractors only",
  "Independent site engineers on every project",
  "Fixed-price contracts — zero cost escalation",
  "Milestone-based escrow fund management",
  "Diaspora-friendly portal integration",
  "Zero-compromise material controls",
]

export function BuildPageClient() {
  return (
    <>
      {/* Compact header — no photo */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 sm:py-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-md">
              <HardHat className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-600 mb-0.5">Managed Construction</p>
              <h1 className="text-2xl font-bold tracking-tight text-[#0f172a] sm:text-3xl">
                Build to your spec
              </h1>
              <p className="mt-1 text-sm text-slate-500 max-w-xl">
                Start with partner land or your own plot. We handle design, permits, and supervised delivery to handover.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Construction partner — Najville Realties */}
      <section className="border-t border-slate-200 bg-white py-8 md:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-amber-200/60 bg-gradient-to-br from-amber-50/80 via-white to-slate-50 p-5 shadow-sm sm:p-6 lg:p-8">
            <div className="grid gap-6 lg:grid-cols-12 lg:items-center lg:gap-8">
              <div className="lg:col-span-4 flex justify-center lg:justify-start">
                <a
                  href="https://najville.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm transition hover:border-amber-300 hover:shadow-md"
                >
                  <Image
                    src="/Najville 1.png"
                    alt="Najville Realties"
                    width={220}
                    height={80}
                    className="h-16 w-auto object-contain sm:h-20"
                  />
                </a>
              </div>

              <div className="lg:col-span-8 lg:pr-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-600 mb-1">
                  Construction partner
                </p>
                <h2 className="text-xl font-bold tracking-tight text-[#0f172a] sm:text-2xl">
                  Najville Realties
                </h2>
                <p className="mt-1.5 text-sm text-slate-600 max-w-2xl leading-relaxed">
                  Najville Realties is our construction partner for both paths: buy a verified plot or build on land you own. Their architects and engineers handle design, permits, and delivery.
                </p>

                <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  <Link
                    href="/search?mode=land"
                    className="group rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:border-amber-200 hover:shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#0f172a]">Option A: Purchase land</p>
                        <p className="mt-0.5 text-xs text-slate-600">
                          Pick a verified plot and move into build planning.
                        </p>
                        <p className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-amber-700 group-hover:underline">
                          Browse land listings <ArrowRight className="h-3.5 w-3.5" />
                        </p>
                      </div>
                    </div>
                  </Link>

                  <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                        <HardHat className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#0f172a]">Option B: Build on your land</p>
                        <p className="mt-0.5 text-xs text-slate-600">
                          Already have land? We scope, design, permit, and build to your spec.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  <li className="flex items-start gap-2.5 text-[13px] text-slate-600">
                    <Ruler className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                    Custom builds aligned to your land and vision
                  </li>
                  <li className="flex items-start gap-2.5 text-[13px] text-slate-600">
                    <Users className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                    In-house architects &amp; structural engineers
                  </li>
                  <li className="flex items-start gap-2.5 text-[13px] text-slate-600">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                    Supervised construction with quality controls
                  </li>
                </ul>

                <a
                  href="https://najville.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow transition hover:bg-amber-600"
                >
                  Visit najville.com <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="bg-slate-50 py-8 md:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-12 lg:items-start lg:gap-8">

            {/* Left — guided form */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-amber-500/20 bg-[#0a0f1e] p-5 text-white shadow-xl sm:p-6">
                <div className="flex items-center gap-2.5 mb-2">
                  <HardHat className="h-5 w-5 text-amber-400" />
                  <h2 className="text-lg font-bold">Get a fixed-price scope</h2>
                </div>
                <p className="text-xs text-slate-400 mb-5">
                  Answer a few questions and we'll send you an accurate project cost with no surprises.
                </p>
                <BuildGuidedForm />
              </div>
            </div>

            {/* Right — info panels */}
            <aside className="lg:col-span-5 flex flex-col gap-4 lg:sticky lg:top-24">

              {/* Blueprint to Handover */}
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-[#0f172a] mb-3 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-600">1</span>
                  Blueprint to Handover
                </h3>
                <div className="flex flex-col gap-2.5">
                  {steps.map((step) => (
                    <div key={step} className="flex items-start gap-2.5 text-[13px] text-slate-600">
                      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                      {step}
                    </div>
                  ))}
                </div>
              </div>

              {/* Our Promise */}
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-[#0f172a] mb-3 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">2</span>
                  Our Promise
                </h3>
                <div className="flex flex-col gap-2.5">
                  {promises.map((p) => (
                    <div key={p} className="flex items-start gap-2.5 text-[13px] text-slate-600">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                      {p}
                    </div>
                  ))}
                </div>
              </div>

              {/* Need land first? */}
              <div className="rounded-3xl border border-[#e0511f]/20 bg-[#e0511f]/5 p-4.5">
                <p className="text-sm font-bold text-[#e0511f] mb-1">Don't have land yet?</p>
                <p className="text-xs text-slate-600 mb-3">
                  Buy a verified plot from our partners, then start your build.
                </p>
                <Link
                  href="/search?mode=land"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#e0511f] px-4 py-2.5 text-xs font-bold text-white shadow transition hover:bg-[#c8451a]"
                >
                  Browse land listings <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}

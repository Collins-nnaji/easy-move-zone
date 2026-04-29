"use client"

import { HardHat, CheckCircle2, ArrowRight } from "lucide-react"
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
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 sm:py-10">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-md">
              <HardHat className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-600 mb-0.5">Managed Construction</p>
              <h1 className="text-2xl font-bold tracking-tight text-[#0f172a] sm:text-3xl">
                Build to your spec
              </h1>
              <p className="mt-1.5 text-sm text-slate-500 max-w-xl">
                You own the land — we handle everything else. Architects, permits, supervised build, and digital milestones from groundbreak to handover.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="bg-slate-50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start">

            {/* Left — guided form */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-amber-500/20 bg-[#0a0f1e] p-6 text-white shadow-xl sm:p-8">
                <div className="flex items-center gap-2.5 mb-2">
                  <HardHat className="h-5 w-5 text-amber-400" />
                  <h2 className="text-lg font-bold">Get a fixed-price scope</h2>
                </div>
                <p className="text-xs text-slate-400 mb-7">
                  Answer a few questions and we'll send you an accurate project cost with no surprises.
                </p>
                <BuildGuidedForm />
              </div>
            </div>

            {/* Right — info panels */}
            <aside className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-24">

              {/* Blueprint to Handover */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-bold text-[#0f172a] mb-4 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-600">1</span>
                  Blueprint to Handover
                </h3>
                <div className="flex flex-col gap-3">
                  {steps.map((step) => (
                    <div key={step} className="flex items-start gap-2.5 text-[13px] text-slate-600">
                      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                      {step}
                    </div>
                  ))}
                </div>
              </div>

              {/* Our Promise */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-bold text-[#0f172a] mb-4 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-100 text-xs font-bold text-cyan-600">2</span>
                  Our Promise
                </h3>
                <div className="flex flex-col gap-3">
                  {promises.map((p) => (
                    <div key={p} className="flex items-start gap-2.5 text-[13px] text-slate-600">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                      {p}
                    </div>
                  ))}
                </div>
              </div>

              {/* Need land first? */}
              <div className="rounded-3xl border border-[#0033A1]/20 bg-[#0033A1]/5 p-5">
                <p className="text-sm font-bold text-[#0033A1] mb-1">Don't have land yet?</p>
                <p className="text-xs text-slate-600 mb-4">Browse verified plots on our marketplace and use the build estimator to see your all-in cost.</p>
                <Link
                  href="/search?mode=land"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0033A1] px-4 py-2.5 text-xs font-bold text-white shadow transition hover:bg-[#002880]"
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

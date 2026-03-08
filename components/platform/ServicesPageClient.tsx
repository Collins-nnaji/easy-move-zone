"use client"

import { useMemo, useState } from "react"
import { ServiceRecommender } from "@/components/platform/ServiceRecommender"
import type { Faq, Service } from "@/lib/platform/types"

interface ServicesPageClientProps {
  services: Service[]
  faqs: Faq[]
}

export function ServicesPageClient({ services, faqs }: ServicesPageClientProps) {
  const [direction, setDirection] = useState<"inbound" | "outbound">("inbound")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = useMemo(
    () => services.filter((service) => service.direction === direction),
    [direction, services]
  )

  return (
    <>
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="emz-gloss-card rounded-2xl p-6">
          <h1 className="font-[var(--font-playfair)] text-6xl font-black leading-[0.95] text-[#0d0d0d]">
            Every service built to remove one thing — friction.
          </h1>
          <p className="mt-3 max-w-2xl text-base text-[#6b6560]">
            Pick your direction. We will show the exact services, timelines, and pricing bands that fit your move.
          </p>
          <div className="mt-6 inline-flex rounded-full border border-black/10 bg-[#ede8de] p-1">
            <button
              type="button"
              onClick={() => setDirection("inbound")}
              className={`rounded-full px-4 py-2 text-sm ${direction === "inbound" ? "bg-[#0d0d0d] text-[#f5f0e8]" : "text-[#6b6560]"}`}
            >
              I am entering Africa
            </button>
            <button
              type="button"
              onClick={() => setDirection("outbound")}
              className={`rounded-full px-4 py-2 text-sm ${direction === "outbound" ? "bg-[#0d0d0d] text-[#f5f0e8]" : "text-[#6b6560]"}`}
            >
              I am expanding from Africa
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <ServiceRecommender />
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((service) => (
            <article key={service.id} className="emz-gloss-card rounded-2xl p-5">
              <h3 className="font-[var(--font-playfair)] text-2xl font-bold text-[#0d0d0d]">{service.name}</h3>
              <p className="mt-2 text-sm text-[#6b6560]">{service.description}</p>
              <div className="mt-3 space-y-1 text-sm text-[#1a1a1a]">
                <p><strong>Timeline:</strong> {service.timeline}</p>
                <p><strong>Price range:</strong> ${service.priceMin.toLocaleString()} - ${service.priceMax.toLocaleString()}</p>
              </div>
              <button
                type="button"
                onClick={() => setExpandedId(expandedId === service.id ? null : service.id)}
                className="mt-4 rounded-full border border-black/10 px-3 py-1.5 text-sm text-[#0d0d0d]"
              >
                {expandedId === service.id ? "Hide details" : "Learn more"}
              </button>
              {expandedId === service.id ? (
                <div className="mt-3 rounded-xl border border-[#c9a84c]/30 bg-[#ede8de] p-3 text-sm text-[#6b6560]">
                  <p><strong className="text-[#0d0d0d]">Client receives:</strong> {service.clientReceives}</p>
                  <p className="mt-2"><strong className="text-[#0d0d0d]">EasyMoveZone does:</strong> {service.emzExecution}</p>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <h2 className="font-[var(--font-playfair)] text-5xl font-black text-[#0d0d0d]">Pricing</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="emz-gloss-card rounded-2xl p-5">
            <p className="text-xs uppercase tracking-wider text-[#6b6560]">Explorer</p>
            <h3 className="mt-1 font-[var(--font-playfair)] text-2xl font-bold">Intelligence</h3>
            <p className="mt-1 text-4xl font-black">$2K</p>
            <p className="mt-2 text-sm text-[#6b6560]">One-time market report</p>
          </div>
          <div className="rounded-2xl border border-[#1a3a2a] bg-[#1a3a2a] p-5 text-[#f5f0e8] shadow-xl">
            <p className="text-xs uppercase tracking-wider text-[#e8c96a]">Most Popular</p>
            <h3 className="mt-1 font-[var(--font-playfair)] text-2xl font-bold">Trade Bridge</h3>
            <p className="mt-1 text-4xl font-black">$2.5K</p>
            <p className="mt-2 text-sm text-[#f5f0e8]/70">Monthly retainer</p>
          </div>
          <div className="rounded-2xl border border-black/10 bg-[#0d0d0d] p-5 text-[#f5f0e8] shadow-[0_18px_40px_-26px_rgba(13,13,13,0.6)]">
            <p className="text-xs uppercase tracking-wider text-[#f5f0e8]/60">Full Service</p>
            <h3 className="mt-1 font-[var(--font-playfair)] text-2xl font-bold">Full Entry</h3>
            <p className="mt-1 text-4xl font-black">$15K+</p>
            <p className="mt-2 text-sm text-[#f5f0e8]/70">Project-based engagement</p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <h2 className="font-[var(--font-playfair)] text-5xl font-black text-[#0d0d0d]">FAQ</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {faqs.map((faq) => (
            <details key={faq.id} className="emz-gloss-card rounded-xl p-4">
              <summary className="cursor-pointer text-sm font-medium text-[#0d0d0d]">{faq.question}</summary>
              <p className="mt-2 text-sm text-[#6b6560]">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  )
}

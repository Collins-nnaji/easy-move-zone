"use client"

import { useEffect, useMemo, useState } from "react"
import type { CorridorWithMarkets, Testimonial } from "@/lib/platform/types"

interface TestimonialsRotatorProps {
  testimonials: Testimonial[]
  corridors: CorridorWithMarkets[]
}

export function TestimonialsRotator({ testimonials, corridors }: TestimonialsRotatorProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (testimonials.length < 2) return
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [testimonials.length])

  const active = testimonials[activeIndex]
  const corridor = useMemo(
    () => corridors.find((item) => item.id === active?.corridorId),
    [active?.corridorId, corridors]
  )

  if (!active) return null

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a84c]">Case study spotlight</p>
      <h3 className="mt-2 font-[var(--font-playfair)] text-2xl font-bold text-[#0d0d0d]">{active.clientType}</h3>
      <p className="mt-2 text-sm text-[#6b6560]">
        Corridor: {corridor?.originMarket?.name ?? "Origin"} → {corridor?.destinationMarket?.name ?? "Destination"}
      </p>
      <p className="mt-2 text-sm font-medium text-[#1a1a1a]">Outcome: {active.outcome}</p>
      <blockquote className="mt-3 border-l-2 border-[#c9a84c] pl-3 text-sm italic text-[#6b6560]">
        “{active.quote}”
      </blockquote>

      <div className="mt-4 flex gap-2">
        {testimonials.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`h-2.5 rounded-full transition ${index === activeIndex ? "w-8 bg-[#0d0d0d]" : "w-2.5 bg-black/20"}`}
            aria-label={`View testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

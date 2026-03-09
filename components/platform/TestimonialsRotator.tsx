"use client"

import { useEffect, useState } from "react"
import type { Testimonial } from "@/lib/property/types"

interface TestimonialsRotatorProps {
  testimonials: Testimonial[]
}

export function TestimonialsRotator({ testimonials }: TestimonialsRotatorProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (testimonials.length < 2) return
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [testimonials.length])

  const active = testimonials[activeIndex]
  if (!active) return null

  return (
    <div className="emz-gloss-card rounded-2xl p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a84c]">Case study spotlight</p>
      <h3 className="mt-2 font-[var(--font-playfair)] text-2xl font-bold text-[#0d0d0d]">{active.moverType}</h3>
      <p className="mt-2 text-sm text-[#6b6560]">Route: {active.route}</p>
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

"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight } from "lucide-react"

const PRIMARY = "#e0511f"
const INK = "#1b231e"
const easeOut = [0.16, 1, 0.3, 1] as const

const origins = [
  { label: "UK stock", hubs: "Ready to view, finance, and collect." },
  { label: "Imports in transit", hubs: "Cars already shipping — track ETA to port." },
  { label: "CFR from Japan, US & Europe", hubs: "Cost & Freight pricing. Duty and clearance shown separately." },
]

export function AboutPageClient() {
  const reduceMotion = useReducedMotion()
  const fadeUp = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-60px" },
          transition: { duration: 0.5, delay, ease: easeOut },
        }

  return (
    <div style={{ background: "#efece4", color: INK }}>
      <section className="relative border-b border-[#e4dfd5]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(50% 40% at 100% 0%, rgba(243,170,121,0.2) 0%, transparent 55%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <motion.p {...fadeUp()} className="text-sm font-extrabold" style={{ color: PRIMARY }}>
            EasyMoveZone
          </motion.p>
          <motion.h1 {...fadeUp(0.05)} className="mt-3 max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl">
            One place to move from your current car to your next
          </motion.h1>
          <motion.p {...fadeUp(0.1)} className="mt-4 max-w-xl text-lg leading-relaxed text-[#5f655c]">
            Find a car, inspect the details, work out affordability, part-exchange what you drive now, and buy —
            including vehicles being shipped from abroad on CFR terms.
          </motion.p>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.h2 {...fadeUp()} className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            How stock arrives
          </motion.h2>
          <div className="mt-10 divide-y divide-[#e4dfd5] border-y border-[#e4dfd5]">
            {origins.map((c, i) => (
              <motion.div key={c.label} {...fadeUp(0.04 * i)} className="py-5">
                <div className="font-extrabold tracking-tight">{c.label}</div>
                <div className="mt-1 text-sm text-[#5f655c]">{c.hubs}</div>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeUp(0.15)} className="mt-12">
            <Link
              href="/cars"
              className="inline-flex items-center gap-2 rounded-2xl px-7 py-4 text-base font-bold text-white"
              style={{ background: PRIMARY }}
            >
              Browse cars
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

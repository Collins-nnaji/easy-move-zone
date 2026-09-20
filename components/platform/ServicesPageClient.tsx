"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { SERVICES } from "@/lib/logistics/catalog"
import { LandingNav } from "./LandingNav"
import { LandingFooter } from "./LandingFooter"

const PRIMARY = "#e0511f"
const INK = "#1b231e"
const easeOut = [0.16, 1, 0.3, 1] as const

export function ServicesPageClient() {
  const reduceMotion = useReducedMotion()
  const fadeUp = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-60px" },
          transition: { duration: 0.55, delay, ease: easeOut },
        }

  return (
    <div className="flex flex-col" style={{ background: "#efece4", color: INK }}>
      <LandingNav />
      <div>
        <section className="relative border-b border-[#e4dfd5]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(55% 45% at 0% 0%, rgba(224,81,31,0.14) 0%, transparent 55%)",
            }}
          />
          <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
            <motion.p {...fadeUp()} className="text-sm font-extrabold tracking-tight" style={{ color: PRIMARY }}>
              EasyMoveZone
            </motion.p>
            <motion.h1
              {...fadeUp(0.05)}
              className="mt-3 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
            >
              Freight services for Nigeria trade
            </motion.h1>
            <motion.p {...fadeUp(0.1)} className="mt-3 max-w-xl text-base text-[#5f655c] sm:text-lg">
              Sea, air, road, customs, and warehousing — export from Nigeria or import into Nigeria.
            </motion.p>
          </div>
        </section>

        <section className="py-12 lg:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 sm:grid-cols-2">
              {SERVICES.map((s, i) => (
                <motion.div key={s.key} {...fadeUp(0.05 * i)}>
                  <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">{s.title}</h2>
                  <p className="mt-2 text-[15px] leading-relaxed text-[#5f655c]">{s.body}</p>
                </motion.div>
              ))}
            </div>

            <motion.div {...fadeUp(0.15)} className="mt-12 border-t border-[#e4dfd5] pt-8">
              <Link
                href="/quote"
                className="inline-flex min-h-12 items-center gap-2 rounded-2xl px-7 py-3.5 text-base font-bold text-white transition hover:opacity-90"
                style={{ background: PRIMARY }}
              >
                Request a quote
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
      <LandingFooter />
    </div>
  )
}

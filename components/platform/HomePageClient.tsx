"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight, Plane, Ship, Truck, Warehouse, FileCheck } from "lucide-react"
import {
  BoxGlyph,
  HeroFreightArt,
  RouteGlyph,
  ShieldGlyph,
  NairaGlyph,
} from "./FreightArt"
import { CORRIDORS, FREIGHT_MODE_OPTIONS, SERVICES } from "@/lib/logistics/catalog"
import { LandingNav } from "./LandingNav"
import { LandingFooter } from "./LandingFooter"

const PRIMARY = "#e0511f"
const INK = "#1b231e"
const CREAM = "#efece4"
const SURFACE = "#f6f3ec"

const valueProps = [
  {
    glyph: RouteGlyph,
    title: "Nigeria ↔ world",
    body: "Export out of Lagos and Port Harcourt, or import into Nigeria — one team for both directions.",
  },
  {
    glyph: BoxGlyph,
    title: "Sea, air, and road",
    body: "Book the right mode for your cargo, then connect port, airport, and inland delivery without handoff chaos.",
  },
  {
    glyph: ShieldGlyph,
    title: "Customs-ready",
    body: "Clearance, documentation, and compliance support so shipments do not stall at the border.",
  },
  {
    glyph: NairaGlyph,
    title: "Quote to delivery",
    body: "Request a quote, confirm the move, and track status from booking through final delivery.",
  },
] as const

const serviceIcons = {
  sea: Ship,
  air: Plane,
  road: Truck,
  customs: FileCheck,
  warehouse: Warehouse,
} as const

const steps = [
  { step: "01", label: "Request a quote", sub: "Direction, origin, destination, mode, and cargo." },
  { step: "02", label: "Confirm & book", sub: "Rates, transit window, and docs checklist." },
  { step: "03", label: "Ship & track", sub: "Milestones from pickup through delivery." },
] as const

const gateways = [
  { name: "Apapa / Tin Can", detail: "Lagos ocean gateways" },
  { name: "Onne / PH", detail: "Port Harcourt corridor" },
  { name: "MMIA / Abuja", detail: "Air freight hubs" },
  { name: "Inland haul", detail: "Lagos · Abuja · Kano" },
] as const

const easeOut = [0.16, 1, 0.3, 1] as const

export function HomePageClient() {
  const reduceMotion = useReducedMotion()

  const fadeUp = (delay = 0, y = 16) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-40px" },
          transition: { duration: 0.55, delay, ease: easeOut },
        }

  return (
    <div className="flex flex-col" style={{ background: CREAM, color: INK }}>
      <LandingNav />

      {/* Hero — content-sized, not forced to 92vh (that left empty cream). */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(55% 50% at 8% 0%, rgba(224,81,31,0.18) 0%, transparent 58%), radial-gradient(50% 45% at 100% 8%, rgba(243,170,121,0.24) 0%, transparent 52%)",
          }}
        />

        <div className="relative mx-auto w-full max-w-7xl px-4 pt-10 pb-10 sm:px-6 sm:pt-12 sm:pb-12 lg:px-8 lg:pt-14 lg:pb-14">
          <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            <div>
              <motion.p
                {...fadeUp(0, 10)}
                className="font-display text-xl font-extrabold tracking-tight sm:text-2xl"
                style={{ color: PRIMARY }}
              >
                EasyMoveZone
              </motion.p>

              <motion.h1
                {...fadeUp(0.05, 18)}
                className="mt-3 text-[2.35rem] font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.35rem]"
                style={{ textWrap: "balance" } as React.CSSProperties}
              >
                Freight from Nigeria
                <span className="block" style={{ color: PRIMARY }}>
                  to the world — and back.
                </span>
              </motion.h1>

              <motion.p
                {...fadeUp(0.1, 14)}
                className="mt-4 max-w-lg text-base leading-relaxed text-[#5f655c] sm:text-lg"
              >
                Sea, air, road, customs, and warehousing for export out of Nigeria and import into Nigeria.
              </motion.p>

              <motion.div {...fadeUp(0.14, 14)} className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/quote"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-7 py-3.5 text-base font-bold text-white transition hover:opacity-90"
                  style={{ background: PRIMARY, boxShadow: "0 12px 28px rgba(224,81,31,.3)" }}
                >
                  Get a quote
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/track"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#d8d2c6] bg-white/80 px-7 py-3.5 text-base font-semibold text-[#4a5047] transition hover:bg-white"
                >
                  Track a shipment
                </Link>
              </motion.div>

              <motion.div
                {...fadeUp(0.18, 12)}
                className="mt-8 grid max-w-md grid-cols-3 gap-3 border-t border-[#ded7cb] pt-5"
              >
                {[
                  ["Export", "NG → world"],
                  ["Import", "world → NG"],
                  ["Track", "live status"],
                ].map(([stat, label]) => (
                  <div key={stat}>
                    <div className="text-sm font-extrabold" style={{ color: PRIMARY }}>
                      {stat}
                    </div>
                    <div className="mt-0.5 text-xs text-[#7c827a]">{label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div {...fadeUp(0.08, 20)} className="relative order-first lg:order-none">
              <HeroFreightArt className="mx-auto w-full max-w-[22rem] sm:max-w-[28rem] lg:max-w-none" />
            </motion.div>
          </div>
        </div>

        {/* Mode strip — fills the “empty” band under the hero */}
        <div className="relative border-y border-[#e4dfd5]" style={{ background: SURFACE }}>
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-[#e4dfd5] sm:grid-cols-4">
            {FREIGHT_MODE_OPTIONS.map((m, i) => (
              <motion.div
                key={m.key}
                {...fadeUp(0.04 * i)}
                className="px-4 py-4 sm:px-5 sm:py-5"
                style={{ background: SURFACE }}
              >
                <div className="text-sm font-extrabold tracking-tight">{m.label}</div>
                <div className="mt-0.5 text-xs text-[#7c827a]">{m.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="py-12 sm:py-14 lg:py-16" style={{ background: CREAM }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.h2 {...fadeUp()} className="max-w-2xl text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
            Built for export and import.
          </motion.h2>
          <motion.p {...fadeUp(0.04)} className="mt-2 max-w-xl text-[#5f655c]">
            One partner from warehouse to destination — Nigerian ports and airports at the centre.
          </motion.p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {valueProps.map((p, i) => {
              const Glyph = p.glyph
              return (
                <motion.div key={p.title} {...fadeUp(0.05 * i)}>
                  <Glyph className="h-7 w-7" style={{ color: PRIMARY }} />
                  <h3 className="mt-3 text-base font-extrabold tracking-tight sm:text-lg">{p.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#5f655c]">{p.body}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Services — all five, denser */}
      <section className="border-t border-[#e4dfd5] py-12 sm:py-14 lg:py-16" style={{ background: SURFACE }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <motion.h2 {...fadeUp()} className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
                Services
              </motion.h2>
              <motion.p {...fadeUp(0.04)} className="mt-1.5 max-w-lg text-[#5f655c]">
                End-to-end freight for commercial shippers.
              </motion.p>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 text-sm font-bold transition hover:gap-2.5"
              style={{ color: PRIMARY }}
            >
              All services
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s, i) => {
              const Icon = serviceIcons[s.key as keyof typeof serviceIcons] ?? Ship
              return (
                <motion.div key={s.key} {...fadeUp(0.04 * i)} className="flex gap-3">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0" style={{ color: PRIMARY }} strokeWidth={2.25} />
                  <div>
                    <h3 className="text-base font-extrabold tracking-tight">{s.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-[#5f655c]">{s.body}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Gateways + corridors */}
      <section className="border-t border-[#e4dfd5] py-12 sm:py-14 lg:py-16" style={{ background: CREAM }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.h2 {...fadeUp()} className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
            Gateways & corridors
          </motion.h2>
          <motion.p {...fadeUp(0.04)} className="mt-1.5 max-w-xl text-[#5f655c]">
            Trade lanes centred on Nigerian ports and airports.
          </motion.p>

          <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {gateways.map((g, i) => (
              <motion.div
                key={g.name}
                {...fadeUp(0.04 * i)}
                className="rounded-2xl border border-[#e4dfd5] px-4 py-4"
                style={{ background: SURFACE }}
              >
                <div className="text-sm font-extrabold tracking-tight">{g.name}</div>
                <div className="mt-1 text-xs text-[#7c827a]">{g.detail}</div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 divide-y divide-[#e4dfd5] border-y border-[#e4dfd5]">
            {CORRIDORS.map((c, i) => (
              <motion.div
                key={c.key}
                {...fadeUp(0.03 * i)}
                className="flex flex-col gap-0.5 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
              >
                <div className="text-[15px] font-extrabold tracking-tight">{c.label}</div>
                <div className="text-sm text-[#5f655c] sm:text-right">{c.hubs}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 py-12 sm:py-14 lg:py-16" style={{ background: INK }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
            <motion.div {...fadeUp()}>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#f3aa79]">
                How it works
              </span>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
                From quote
                <br />
                <span className="text-white/50">to cargo on the move.</span>
              </h2>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/quote"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-7 py-3.5 text-base font-bold text-white transition hover:opacity-90"
                  style={{ background: PRIMARY, boxShadow: "0 10px 24px rgba(224,81,31,.34)" }}
                >
                  Get a quote
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/20 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-white/10"
                >
                  Talk to us
                </Link>
              </div>
            </motion.div>

            <div className="flex flex-col gap-2.5">
              {steps.map((s, i) => (
                <motion.div
                  key={s.step}
                  {...fadeUp(0.05 * i)}
                  className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4"
                >
                  <span className="font-mono text-sm font-bold text-[#f3aa79]">{s.step}</span>
                  <div>
                    <p className="text-sm font-bold text-white sm:text-base">{s.label}</p>
                    <p className="mt-0.5 text-sm text-white/55">{s.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}

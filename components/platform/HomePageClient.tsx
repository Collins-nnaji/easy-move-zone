"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight, Zap } from "lucide-react"
import {
  BoxGlyph,
  HeroFreightArt,
  NairaGlyph,
  RouteGlyph,
  ShieldGlyph,
} from "./FreightArt"

const PRIMARY = "#e0511f"
const INK = "#1b231e"

const valueProps = [
  {
    glyph: BoxGlyph,
    title: "Funded jobs only",
    body: "Companies pay into escrow before a job goes live. You never run a route hoping to get paid.",
  },
  {
    glyph: RouteGlyph,
    title: "Paid as you go",
    body: "20% on pickup, 70% on delivery, the rest once the job clears. GPS and photos confirm each step.",
  },
  {
    glyph: ShieldGlyph,
    title: "Verified both ways",
    body: "Licences, hazmat certs, and insurance checked in one vault. Drivers and companies are rated after every job.",
  },
  {
    glyph: NairaGlyph,
    title: "8% on completion",
    body: "No listing fees, no subscription. We charge only when a job is actually completed.",
  },
] as const

const steps = [
  { step: "01", label: "Post or claim", sub: "Companies post funded jobs. Drivers claim the ones that fit." },
  { step: "02", label: "Run the route", sub: "Clock in, confirm pickup and delivery with GPS and photos." },
  { step: "03", label: "Get paid", sub: "Your payment is released to your wallet. Cash out in naira." },
] as const

const openJobs = [
  { pay: "₦85,000/day", vehicle: "Semi · Heavy goods", route: "Lagos → Abuja linehaul" },
  { pay: "₦12,000/hr", vehicle: "Tanker · Hazmat", route: "Port Harcourt · 3 stops" },
  { pay: "₦45,000/day", vehicle: "Sprinter · Parcel", route: "Ikeja / Airport · 12 stops" },
] as const

const easeOut = [0.16, 1, 0.3, 1] as const

export function HomePageClient() {
  const reduceMotion = useReducedMotion()

  const fadeUp = (delay = 0, y = 18) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-80px" },
          transition: { duration: 0.6, delay, ease: easeOut },
        }

  return (
    <div style={{ background: "#efece4", color: INK }} className="overflow-hidden">
      {/* ---------------------------------------------------------------- */}
      {/* Hero — headline and artwork share the width so neither half is dead */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 50% at 12% 0%, rgba(224,81,31,0.16) 0%, transparent 60%), radial-gradient(55% 45% at 100% 10%, rgba(243,170,121,0.22) 0%, transparent 55%)",
          }}
        />

        <div className="relative mx-auto w-full max-w-7xl px-4 pt-16 pb-14 sm:px-6 lg:px-8 lg:pt-20 lg:pb-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
            <div>
              <motion.p
                {...fadeUp(0, 12)}
                className="text-sm font-extrabold tracking-tight"
                style={{ color: PRIMARY }}
              >
                EasyMoveZone
              </motion.p>

              <motion.h1
                {...fadeUp(0.06, 22)}
                className="mt-4 text-[2.75rem] font-extrabold leading-[1.03] tracking-tight sm:text-6xl lg:text-[4.1rem]"
                style={{ textWrap: "balance" } as React.CSSProperties}
              >
                Move goods.
                <span className="block" style={{ color: PRIMARY }}>
                  Get paid fairly.
                </span>
              </motion.h1>

              <motion.p
                {...fadeUp(0.12, 18)}
                className="mt-5 max-w-lg text-lg leading-relaxed text-[#5f655c]"
              >
                Nigeria&apos;s delivery marketplace. Companies pay into escrow before a job goes
                live — drivers claim funded work and get paid at every step.
              </motion.p>

              <motion.div {...fadeUp(0.18, 18)} className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/move/shifts"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-7 py-4 text-base font-bold text-white shadow-lg transition hover:opacity-90"
                  style={{ background: PRIMARY, boxShadow: "0 12px 30px rgba(224,81,31,.32)" }}
                >
                  <Zap className="h-[1.125rem] w-[1.125rem]" />
                  Find work
                </Link>
                <Link
                  href="/fleet/dashboard"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#d8d2c6] bg-white/70 px-7 py-4 text-base font-semibold text-[#4a5047] backdrop-blur transition hover:bg-white"
                >
                  Post a job
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>

              {/* Proof line — replaces a whole section of self-description */}
              <motion.div
                {...fadeUp(0.24, 16)}
                className="mt-9 grid max-w-lg grid-cols-3 gap-4 border-t border-[#ded7cb] pt-6 text-sm"
              >
                {[
                  ["Escrow", "funded upfront"],
                  ["8%", "only on completion"],
                  ["Rated", "both sides"],
                ].map(([stat, label]) => (
                  <div key={stat}>
                    <div className="font-extrabold" style={{ color: PRIMARY }}>
                      {stat}
                    </div>
                    <div className="mt-0.5 text-[#7c827a]">{label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div
              {...fadeUp(0.1, 24)}
              className="relative order-first lg:order-none"
            >
              <HeroFreightArt className="mx-auto w-full max-w-[26rem] sm:max-w-[32rem] lg:max-w-none" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Why it works + open jobs, merged into one band                    */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative border-t border-[#e4dfd5] bg-[#f6f3ec] py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.h2
            {...fadeUp()}
            className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl"
          >
            Built so neither side gets stiffed.
          </motion.h2>

          <div className="mt-10 grid gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
            {valueProps.map((p, i) => {
              const Glyph = p.glyph
              return (
                <motion.div key={p.title} {...fadeUp(0.06 * i)}>
                  <Glyph className="h-8 w-8" style={{ color: PRIMARY }} />
                  <h3 className="mt-4 text-lg font-extrabold tracking-tight">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#5f655c]">{p.body}</p>
                </motion.div>
              )
            })}
          </div>

          {/* Open jobs sit inside the same band rather than getting their own */}
          <motion.div
            {...fadeUp(0.1)}
            className="mt-14 flex flex-wrap items-end justify-between gap-3 border-t border-[#e4dfd5] pt-10"
          >
            <h3 className="text-xl font-extrabold tracking-tight sm:text-2xl">Open jobs right now</h3>
            <Link
              href="/move/shifts"
              className="inline-flex items-center gap-1.5 text-sm font-bold transition hover:gap-2.5"
              style={{ color: PRIMARY }}
            >
              See all jobs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {openJobs.map((s, i) => (
              <motion.div
                key={s.route}
                {...fadeUp(0.05 * i)}
                className="rounded-2xl border border-[#e4dfd5] bg-white px-5 py-4 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/[0.05]"
              >
                <div className="text-xl font-extrabold">{s.pay}</div>
                <div className="mt-1 text-sm font-semibold text-[#5f655c]">{s.vehicle}</div>
                <div className="mt-1 text-sm text-[#8a8f86]">{s.route}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* How it works — also carries the closing call to action            */}
      {/* ---------------------------------------------------------------- */}
      <section id="how-it-works" className="scroll-mt-20 py-16 lg:py-20" style={{ background: INK }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <motion.div {...fadeUp()}>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#f3aa79]">
                How it works
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                From open job
                <br />
                <span className="text-white/50">to money in your wallet.</span>
              </h2>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/move/shifts"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-7 py-4 text-base font-bold text-white shadow-lg transition hover:opacity-90"
                  style={{ background: PRIMARY, boxShadow: "0 10px 26px rgba(224,81,31,.34)" }}
                >
                  Find work
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/fleet/dashboard"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/20 px-7 py-4 text-base font-semibold text-white transition hover:bg-white/10"
                >
                  Post a job
                </Link>
              </div>
            </motion.div>

            <div className="flex flex-col gap-3">
              {steps.map((s, i) => (
                <motion.div
                  key={s.step}
                  {...fadeUp(0.06 * i)}
                  className="flex items-start gap-5 rounded-3xl border border-white/10 bg-white/[0.04] p-6"
                >
                  <span className="font-mono text-sm font-bold text-[#f3aa79]">{s.step}</span>
                  <div>
                    <p className="text-base font-bold text-white">{s.label}</p>
                    <p className="mt-1 text-sm text-white/55">{s.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

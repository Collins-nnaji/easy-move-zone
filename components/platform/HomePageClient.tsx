"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Calendar,
  Check,
  Shield,
  Truck,
  Wallet,
  Zap,
} from "lucide-react"

const PRIMARY = "#e0511f"
const INK = "#1b231e"

const pages = [
  {
    icon: Truck,
    label: "01",
    title: "Shift Board",
    body: "Browse commercial driving shifts in your zone. See payout, vehicle type, route, and hours — then slide to claim instantly.",
  },
  {
    icon: Calendar,
    label: "02",
    title: "Live Schedule",
    body: "Clock in with GPS verification, follow turn-by-turn waypoints, and collect a digital manager sign-off when the shift ends.",
  },
  {
    icon: Wallet,
    label: "03",
    title: "Instant Wallet",
    body: "See available balance, pending payouts, and lifetime earnings. Cash out to your card in seconds for a micro-fee.",
  },
  {
    icon: Shield,
    label: "04",
    title: "Compliance Vault",
    body: "Upload and track CDL, background checks, medical certs, and insurance. Stay verified so fleet managers hire you first.",
  },
] as const

const steps = [
  { step: "01", label: "Claim a shift", sub: "Browse open routes in your zone and lock one in with a slide." },
  { step: "02", label: "Run the route", sub: "Clock in at the warehouse, follow waypoints, and sign off at the end." },
  { step: "03", label: "Get paid instantly", sub: "Cash out earnings to your card — no waiting for weekly payroll." },
] as const

const heroPoints = [
  "Shifts — commercial routes with clear daily or hourly pay, posted in real time",
  "Live tracking — GPS clock-in, waypoints, and digital sign-off on every run",
  "Instant pay — cash out shift earnings to your card the same day",
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
      <section className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 50% at 12% 0%, rgba(224,81,31,0.16) 0%, transparent 60%), radial-gradient(55% 45% at 100% 10%, rgba(243,170,121,0.22) 0%, transparent 55%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 lg:px-8 lg:pt-28 lg:pb-24">
          <div className="grid items-center gap-14 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <motion.div
                {...fadeUp(0, 12)}
                className="inline-flex items-center gap-2 rounded-full border border-[#e0511f]/20 bg-white/60 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#bf5223] backdrop-blur"
              >
                <Truck className="h-3.5 w-3.5" />
                Commercial driving, simplified
              </motion.div>

              <motion.h1
                {...fadeUp(0.06, 22)}
                className="mt-6 text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-[4.4rem]"
                style={{ textWrap: "balance" } as React.CSSProperties}
              >
                Claim shifts.
                <span className="block" style={{ color: PRIMARY }}>
                  Get paid today.
                </span>
              </motion.h1>

              <motion.p {...fadeUp(0.12, 18)} className="mt-6 max-w-xl text-lg leading-relaxed text-[#5f655c]">
                EasyMoveZone connects commercial drivers to local logistics shifts — browse routes,
                run them with live tracking, and cash out instantly. No agency middlemen, no weekly wait.
              </motion.p>

              <motion.div {...fadeUp(0.18, 18)} className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/move"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-4 text-base font-bold text-white shadow-lg transition hover:opacity-90"
                  style={{ background: PRIMARY, boxShadow: "0 12px 30px rgba(224,81,31,.32)" }}
                >
                  <Zap className="h-4.5 w-4.5" />
                  Browse open shifts
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d8d2c6] bg-white/70 px-7 py-4 text-base font-semibold text-[#4a5047] backdrop-blur transition hover:bg-white"
                >
                  How it works
                  <ArrowRight className="h-4 w-4" />
                </a>
              </motion.div>

              <motion.ul {...fadeUp(0.24, 16)} className="mt-9 flex flex-col gap-2.5">
                {heroPoints.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-[15px] font-medium text-[#4a5047]">
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white"
                      style={{ background: PRIMARY }}
                    >
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {p}
                  </li>
                ))}
              </motion.ul>
            </div>

            <motion.div {...fadeUp(0.2, 24)} className="lg:col-span-5">
              <div className="rounded-3xl border border-[#e4dfd5] bg-white/80 p-7 shadow-xl shadow-black/[0.06] backdrop-blur">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: PRIMARY }}>
                  Live shift preview
                </div>
                <div className="mt-5 space-y-3">
                  {[
                    { pay: "$180/day", vehicle: "Sprinter Van", route: "DFW North · 12 stops", hot: true },
                    { pay: "$25/hr", vehicle: "Box Truck", route: "Houston Inner · 8 drops", hot: false },
                    { pay: "$165/day", vehicle: "Client Fleet", route: "DFW East · Linehaul", hot: true },
                  ].map((s) => (
                    <div
                      key={s.pay}
                      className="rounded-2xl border border-[#ece6da] bg-[#faf8f3] px-4 py-3.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-extrabold">{s.pay}</div>
                        {s.hot && (
                          <span className="rounded-full bg-[#fbeae0] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#9c3f15]">
                            Hot
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-xs font-semibold text-[#5f655c]">{s.vehicle}</div>
                      <div className="text-xs text-[#8a8f86]">{s.route}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-2xl bg-[#1b231e] px-4 py-3 text-center text-sm font-bold text-white">
                  Slide to claim →
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative border-t border-[#e4dfd5] bg-[#f6f3ec] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp()} className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: PRIMARY }}>
              The 4-page app
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Everything a driver needs. Nothing they don&apos;t.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[#5f655c]">
              Four focused screens — shifts, schedule, wallet, and compliance — so drivers spend
              less time navigating and more time earning.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {pages.map((p, i) => {
              const Icon = p.icon
              return (
                <motion.div
                  key={p.label}
                  {...fadeUp(0.06 * i)}
                  className="flex flex-col rounded-3xl border border-[#e4dfd5] bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-black/[0.06]"
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-white"
                    style={{ background: PRIMARY }}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#bf6a3c]">
                    {p.label}
                  </span>
                  <h3 className="mt-1.5 text-xl font-bold tracking-tight">{p.title}</h3>
                  <p className="mt-3 text-[14.5px] leading-relaxed text-[#5f655c]">{p.body}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-20 py-20" style={{ background: INK }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div {...fadeUp()}>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#f3aa79]">How it works</span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                From open shift
                <br />
                <span className="text-white/50">to cash in hand.</span>
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/60">
                Claim a route, run it with live GPS tracking, and cash out the same day.
                Your compliance docs stay verified so you never miss a premium shift.
              </p>
              <Link
                href="/move"
                className="mt-8 inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:opacity-90"
                style={{ background: PRIMARY, boxShadow: "0 10px 26px rgba(224,81,31,.34)" }}
              >
                <Truck className="h-4 w-4" />
                Open the driver app
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>

            <div className="flex flex-col gap-4">
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

      <section className="relative overflow-hidden py-20" style={{ background: "#f6f3ec" }}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(50% 60% at 50% 0%, rgba(224,81,31,0.14) 0%, transparent 60%)",
          }}
        />
        <motion.div {...fadeUp()} className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e0511f]/20 bg-white/60 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#bf5223]">
            <Briefcase className="h-3.5 w-3.5" />
            Fleet managers
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Post shifts. Fill routes. Same platform.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-[#5f655c]">
            Logistics companies use the same database to post shifts with vehicle type, hours, and pay.
            Verified drivers see the payout instantly and claim with one slide.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/move"
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-4 text-base font-bold text-white shadow-lg transition hover:opacity-90"
              style={{ background: PRIMARY, boxShadow: "0 12px 30px rgba(224,81,31,.32)" }}
            >
              I&apos;m a driver
              <ArrowUpRight className="h-4.5 w-4.5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d8d2c6] bg-white px-7 py-4 text-base font-semibold text-[#4a5047] transition hover:border-[#e0511f]/30"
            >
              Post shifts as a fleet
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

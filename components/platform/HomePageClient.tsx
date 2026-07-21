"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Shield,
  Star,
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
    title: "Marketplace Loads",
    body: "Browse loads from fleet operators — parcel, heavy goods, tankers, reefers, and more. See payout, cargo type, vehicle, and operator ratings.",
  },
  {
    icon: Star,
    label: "02",
    title: "Rated Network",
    body: "Every driver, truck owner, and fleet operator has ratings. Find reliable partners with transparent reviews after every completed load.",
  },
  {
    icon: Wallet,
    label: "03",
    title: "Pay in naira",
    body: "Drivers cash out job earnings instantly. Companies pay an 8% platform fee only when a job completes — no upfront listing fees.",
  },
  {
    icon: Shield,
    label: "04",
    title: "Compliance Vault",
    body: "Driver's licence, dangerous-goods certs, medical fitness, and insurance verified in one place. Stay compliant to unlock premium tanker and heavy-goods routes.",
  },
] as const

const steps = [
  { step: "01", label: "Post or claim a job", sub: "Companies post routes. Drivers claim funded work." },
  { step: "02", label: "Run the route", sub: "GPS clock-in, waypoints, and sign-off on every run." },
  { step: "03", label: "Rate & get paid", sub: "Complete the job, rate each other, cash out in naira." },
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
      <section className="relative min-h-[min(88vh,820px)] flex items-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 50% at 12% 0%, rgba(224,81,31,0.16) 0%, transparent 60%), radial-gradient(55% 45% at 100% 10%, rgba(243,170,121,0.22) 0%, transparent 55%)",
          }}
        />
        <div className="relative mx-auto w-full max-w-7xl px-4 pt-20 pb-16 sm:px-6 lg:px-8 lg:pt-24 lg:pb-20">
          <div className="max-w-3xl">
            <motion.p
              {...fadeUp(0, 12)}
              className="text-sm font-extrabold tracking-tight sm:text-base"
              style={{ color: PRIMARY }}
            >
              EasyMoveZone
            </motion.p>

            <motion.h1
              {...fadeUp(0.06, 22)}
              className="mt-4 text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-[4.4rem]"
              style={{ textWrap: "balance" } as React.CSSProperties}
            >
              Move goods.
              <span className="block" style={{ color: PRIMARY }}>
                Pay drivers fairly.
              </span>
            </motion.h1>

            <motion.p {...fadeUp(0.12, 18)} className="mt-6 max-w-xl text-lg leading-relaxed text-[#5f655c]">
              EasyMoveZone connects drivers and companies across Nigeria — publish jobs,
              claim funded work, track GPS on the road, and settle in naira.
            </motion.p>

            <motion.div {...fadeUp(0.18, 18)} className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/move/shifts"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-7 py-4 text-base font-bold text-white shadow-lg transition hover:opacity-90"
                style={{ background: PRIMARY, boxShadow: "0 12px 30px rgba(224,81,31,.32)" }}
              >
                <Zap className="h-4.5 w-4.5" />
                Find work
              </Link>
              <Link
                href="/fleet/dashboard"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#d8d2c6] bg-white/70 px-7 py-4 text-base font-semibold text-[#4a5047] backdrop-blur transition hover:bg-white"
              >
                Hire drivers
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative border-t border-[#e4dfd5] bg-[#f6f3ec] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp()} className="mb-8 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: PRIMARY }}>
              Live corridors
            </span>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Open jobs right now</h2>
          </motion.div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { pay: "₦85,000/day", vehicle: "Semi · Heavy Goods", route: "Lagos → Abuja linehaul" },
              { pay: "₦12,000/hr", vehicle: "Tanker · Hazmat", route: "Port Harcourt · 3 stops" },
              { pay: "₦45,000/day", vehicle: "Sprinter · Parcel", route: "Ikeja / Airport · 12 stops" },
            ].map((s, i) => (
              <motion.div
                key={s.route}
                {...fadeUp(0.05 * i)}
                className="rounded-2xl border border-[#e4dfd5] bg-white px-5 py-4"
              >
                <div className="text-xl font-extrabold">{s.pay}</div>
                <div className="mt-1 text-sm font-semibold text-[#5f655c]">{s.vehicle}</div>
                <div className="mt-1 text-sm text-[#8a8f86]">{s.route}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-t border-[#e4dfd5] bg-[#f6f3ec] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp()} className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: PRIMARY }}>
              Two sides, one platform
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Everything logistics needs. Nothing it doesn&apos;t.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[#5f655c]">
              Drivers claim jobs and get paid instantly. Companies post routes, find rated
              drivers, and manage work from a dedicated console.
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
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#9aa097]">{p.label}</div>
                  <h3 className="mt-2 text-lg font-extrabold tracking-tight">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#5f655c]">{p.body}</p>
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
                From open load
                <br />
                <span className="text-white/50">to rated completion.</span>
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/60">
                Fleet operators post loads with cargo type and pay. Drivers and owner-operators
                claim, run the route, and rate each other. Commission is charged only on completion.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/move/shifts"
                  className="inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:opacity-90"
                  style={{ background: PRIMARY, boxShadow: "0 10px 26px rgba(224,81,31,.34)" }}
                >
                  <Truck className="h-4 w-4" />
                  Find work
                </Link>
                <Link
                  href="/fleet/drivers"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/20 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  <Briefcase className="h-4 w-4" />
                  Hire drivers
                </Link>
              </div>
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
            Fleet operators
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Post loads. Find great rates. Manage workload.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-[#5f655c]">
            The fleet console lets you post parcel, heavy goods, tanker, and refrigerated loads.
            Browse rated independent drivers and truck owners, track active workload, and pay
            commission only when loads complete.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/fleet/drivers"
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-4 text-base font-bold text-white shadow-lg transition hover:opacity-90"
              style={{ background: PRIMARY, boxShadow: "0 12px 30px rgba(224,81,31,.32)" }}
            >
              Hire drivers
              <ArrowUpRight className="h-4.5 w-4.5" />
            </Link>
            <Link
              href="/move/shifts"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d8d2c6] bg-white px-7 py-4 text-base font-semibold text-[#4a5047] transition hover:border-[#e0511f]/30"
            >
              Find work
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

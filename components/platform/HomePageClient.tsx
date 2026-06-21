"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import {
  ArrowRight,
  ArrowUpRight,
  Plane,
  BedDouble,
  Stamp,
  Sparkles,
  MapPin,
  Check,
} from "lucide-react"

// Brand palette shared with the in-app Move flow.
const PRIMARY = "#e0511f"
const INK = "#1b231e"

const pillars = [
  {
    icon: Plane,
    label: "Trips",
    title: "Book the journey",
    body: "Compare flights and overland routes to your destination and reserve in a tap — no twelve open tabs.",
  },
  {
    icon: BedDouble,
    label: "Stays",
    title: "Find a place to land",
    body: "Hotels for a short visit, furnished flats and coliving for a longer one — matched to how long you're staying.",
  },
  {
    icon: Stamp,
    label: "Visas",
    title: "Sort the paperwork",
    body: "The right visa route for your trip, from a free entry checklist to a specialist handling it end to end.",
  },
] as const

const spectrum = [
  { label: "2 weeks", sub: "A quick recce", mode: "Trip Pack" },
  { label: "1 month", sub: "Test the waters", mode: "Trip Pack" },
  { label: "1–3 months", sub: "A nomad stint", mode: "Nomad Mode" },
  { label: "6 months", sub: "Settle for a season", mode: "Move Plan" },
  { label: "Forever", sub: "Make it home", mode: "Move Plan" },
] as const

const steps = [
  { step: "01", label: "Tell us about your move", sub: "How long you're staying and what matters most to you." },
  { step: "02", label: "Get matched & planned", sub: "Honest destination matches plus a checklist that fits your timeline." },
  { step: "03", label: "Book trip, stay & visa", sub: "Reserve everything in one place and track it in your workspace." },
] as const

const heroPoints = [
  "Movement — flights and routes, booked in one tap",
  "Accommodation — hotels to furnished flats, matched to your stay",
  "Visa — the right entry route, from checklist to full handling",
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
      {/* Hero — photo-free, gradient + typography only */}
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
                <Sparkles className="h-3.5 w-3.5" />
                Movement · Accommodation · Visa
              </motion.div>

              <motion.h1
                {...fadeUp(0.06, 22)}
                className="mt-6 text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-[4.4rem]"
                style={{ textWrap: "balance" } as React.CSSProperties}
              >
                Get there. Stay there.
                <span className="block" style={{ color: PRIMARY }}>
                  Visa sorted.
                </span>
              </motion.h1>

              <motion.p {...fadeUp(0.12, 18)} className="mt-6 max-w-xl text-lg leading-relaxed text-[#5f655c]">
                The only app that handles movement, accommodation, and visa in one flow — whether
                you&apos;re leaving for two weeks or two years.
              </motion.p>

              <motion.div {...fadeUp(0.18, 18)} className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/move"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-4 text-base font-bold text-white shadow-lg transition hover:opacity-90"
                  style={{ background: PRIMARY, boxShadow: "0 12px 30px rgba(224,81,31,.32)" }}
                >
                  <MapPin className="h-4.5 w-4.5" />
                  Start your move
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

            {/* Right: spectrum preview card (no imagery) */}
            <motion.div {...fadeUp(0.2, 24)} className="lg:col-span-5">
              <div className="rounded-3xl border border-[#e4dfd5] bg-white/80 p-7 shadow-xl shadow-black/[0.06] backdrop-blur">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: PRIMARY }}>
                  The Move Spectrum
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-[#5f655c]">
                  Tell us how long you&apos;re staying. Everything — visa route, stay type, checklist —
                  adapts from there.
                </p>
                <div className="mt-6 space-y-2.5">
                  {spectrum.map((s) => (
                    <div
                      key={s.label}
                      className="flex items-center justify-between rounded-2xl border border-[#ece6da] bg-[#faf8f3] px-4 py-3"
                    >
                      <div>
                        <div className="text-[15px] font-bold">{s.label}</div>
                        <div className="text-xs text-[#8a8f86]">{s.sub}</div>
                      </div>
                      <span className="rounded-full bg-[#fbeae0] px-3 py-1 font-mono text-[11px] font-semibold text-[#9c3f15]">
                        {s.mode}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Three pillars */}
      <section className="relative border-t border-[#e4dfd5] bg-[#f6f3ec] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp()} className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: PRIMARY }}>
              Movement · Accommodation · Visa
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Three moves. One app.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[#5f655c]">
              Every international move hits the same three walls — how you get there, where you stay, and
              whether you&apos;re allowed in. EasyMoveZone clears all three without switching apps.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {pillars.map((p, i) => {
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

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 py-20" style={{ background: INK }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div {...fadeUp()}>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#f3aa79]">How it works</span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                From first idea
                <br />
                <span className="text-white/50">to landed.</span>
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/60">
                Tell us how long you&apos;re staying. We match your destination, build your plan, then you
                book movement, accommodation, and visa — all inside the same app.
              </p>
              <Link
                href="/move"
                className="mt-8 inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:opacity-90"
                style={{ background: PRIMARY, boxShadow: "0 10px 26px rgba(224,81,31,.34)" }}
              >
                <MapPin className="h-4 w-4" />
                Open the move app
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

      {/* Closing CTA */}
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
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Movement, accommodation, visa — handled.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-[#5f655c]">
            Two weeks or forever. One app that books how you get there, where you sleep, and how you get in.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/move"
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-4 text-base font-bold text-white shadow-lg transition hover:opacity-90"
              style={{ background: PRIMARY, boxShadow: "0 12px 30px rgba(224,81,31,.32)" }}
            >
              Start your move
              <ArrowUpRight className="h-4.5 w-4.5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d8d2c6] bg-white px-7 py-4 text-base font-semibold text-[#4a5047] transition hover:border-[#e0511f]/30"
            >
              Talk to us
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

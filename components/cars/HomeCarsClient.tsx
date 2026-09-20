"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight, Search } from "lucide-react"
import { BoxGlyph, HeroFreightArt, NairaGlyph, RouteGlyph, ShieldGlyph } from "@/components/platform/FreightArt"
import { MAKES } from "@/lib/cars/catalog"

const PRIMARY = "#e0511f"
const INK = "#1b231e"
const CREAM = "#efece4"
const SURFACE = "#f6f3ec"
const easeOut = [0.16, 1, 0.3, 1] as const

const valueProps = [
  {
    glyph: RouteGlyph,
    title: "UK stock & imports",
    body: "Ready-to-view cars, vehicles on the water, and CFR stock shipped from Japan, the US, and Europe.",
  },
  {
    glyph: BoxGlyph,
    title: "Parts on their own aisle",
    body: "Tyres, brakes, batteries and spares live on a separate parts page — not mixed into car listings.",
  },
  {
    glyph: ShieldGlyph,
    title: "Garages with a map",
    body: "Find MOT, fitting and repairs on a dedicated garage map, then book from reviews.",
  },
  {
    glyph: NairaGlyph,
    title: "Finance that stays simple",
    body: "Check a monthly figure before you enquire — cash, finance, or part-exchange towards the next car.",
  },
] as const

const hubs = [
  { href: "/cars", name: "Cars", detail: "Used · UK · CFR imports" },
  { href: "/parts", name: "Parts", detail: "Tyres · brakes · batteries" },
  { href: "/garages", name: "Garages", detail: "Map · MOT · reviews" },
  { href: "/account", name: "Dashboard", detail: "Your car · saved · PX" },
] as const

const steps = [
  { step: "01", label: "Find your car", sub: "Search make, model and budget — including imports." },
  { step: "02", label: "Work out the money", sub: "Cash, finance, or part-exchange what you drive now." },
  { step: "03", label: "Collect or book a garage", sub: "View the car, then tyres and MOT on the map if you need them." },
] as const

export function HomeCarsClient() {
  const router = useRouter()
  const reduceMotion = useReducedMotion()
  const [q, setQ] = useState("")
  const [make, setMake] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [stockType, setStockType] = useState("all")

  const fadeUp = (delay = 0, y = 16) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-40px" },
          transition: { duration: 0.55, delay, ease: easeOut },
        }

  function onSearch(e: FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (make) params.set("make", make)
    if (maxPrice) params.set("maxPrice", maxPrice)
    if (stockType !== "all") params.set("stockType", stockType)
    router.push(`/cars?${params.toString()}`)
  }

  return (
    <div className="flex flex-col" style={{ background: CREAM, color: INK }}>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(55% 50% at 8% 0%, rgba(224,81,31,0.18) 0%, transparent 58%), radial-gradient(50% 45% at 100% 8%, rgba(243,170,121,0.24) 0%, transparent 52%)",
          }}
        />

        <div className="relative mx-auto w-full max-w-7xl px-4 pb-10 pt-10 sm:px-6 sm:pb-12 sm:pt-12 lg:px-8 lg:pb-14 lg:pt-14">
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
                Find your next car
                <span className="block" style={{ color: PRIMARY }}>
                  then the parts and garage.
                </span>
              </motion.h1>
              <motion.p {...fadeUp(0.1, 14)} className="mt-4 max-w-lg text-base leading-relaxed text-[#5f655c] sm:text-lg">
                Browse quality vehicles, compare options, and search by make, model or budget. Parts and garages each have
                their own page.
              </motion.p>

              <motion.form
                {...fadeUp(0.14, 14)}
                onSubmit={onSearch}
                className="mt-7 rounded-[28px] border border-[#e4dfd5] bg-white/90 p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row">
                  <label className="relative flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa097]" />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search by make, model or keyword..."
                      className="h-12 w-full rounded-2xl border border-[#e4dfd5] bg-[#faf8f3] pl-11 pr-4 text-sm outline-none focus:border-[#e0511f]/50"
                    />
                  </label>
                  <button
                    type="submit"
                    className="inline-flex h-12 items-center justify-center rounded-2xl px-6 text-sm font-bold text-white"
                    style={{ background: PRIMARY }}
                  >
                    Search cars
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <select className={selectClass} value={make} onChange={(e) => setMake(e.target.value)}>
                    <option value="">Make</option>
                    {MAKES.map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                  <select className={selectClass} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}>
                    <option value="">Max price</option>
                    <option value="5000">£5,000</option>
                    <option value="10000">£10,000</option>
                    <option value="20000">£20,000</option>
                    <option value="35000">£35,000</option>
                  </select>
                  <select className={selectClass} value={stockType} onChange={(e) => setStockType(e.target.value)}>
                    <option value="all">UK + imports</option>
                    <option value="uk_stock">UK stock</option>
                    <option value="import">Imports</option>
                    <option value="cfr">CFR from abroad</option>
                  </select>
                </div>
              </motion.form>
            </div>

            <motion.div {...fadeUp(0.08, 20)} className="relative order-first lg:order-none">
              <HeroFreightArt className="mx-auto w-full max-w-[22rem] sm:max-w-[28rem] lg:max-w-none" />
            </motion.div>
          </div>
        </div>

        <div className="relative border-y border-[#e4dfd5]" style={{ background: SURFACE }}>
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-[#e4dfd5] sm:grid-cols-4">
            {hubs.map((h, i) => (
              <Link key={h.name} href={h.href}>
                <motion.div
                  {...fadeUp(0.04 * i)}
                  className="px-4 py-4 transition hover:bg-white sm:px-5 sm:py-5"
                  style={{ background: SURFACE }}
                >
                  <div className="text-sm font-extrabold tracking-tight">{h.name}</div>
                  <div className="mt-0.5 text-xs text-[#7c827a]">{h.detail}</div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-14 lg:py-16" style={{ background: CREAM }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.h2 {...fadeUp()} className="max-w-2xl text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
            One place to move from this car to the next.
          </motion.h2>
          <motion.p {...fadeUp(0.04)} className="mt-2 max-w-xl text-[#5f655c]">
            Cars, parts and garages are separate so the homepage is not just a buy list.
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

      <section id="how-it-works" className="scroll-mt-20 py-12 sm:py-14 lg:py-16" style={{ background: INK }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
            <motion.div {...fadeUp()}>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#f3aa79]">How it works</span>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
                From search
                <br />
                <span className="text-white/50">to the keys in your hand.</span>
              </h2>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/cars"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-7 py-3.5 text-base font-bold text-white"
                  style={{ background: PRIMARY }}
                >
                  Browse cars
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/garages"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/20 px-7 py-3.5 text-base font-semibold text-white hover:bg-white/10"
                >
                  Open garage map
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
    </div>
  )
}

const selectClass =
  "h-11 w-full rounded-2xl border border-[#e4dfd5] bg-[#faf8f3] px-3 text-[13px] font-semibold text-[#4a5047] outline-none"

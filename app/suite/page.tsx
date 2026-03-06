"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  CheckCircle2,
  FileCheck2,
  Globe,
  GraduationCap,
  Home,
  Plane,
  ScanSearch,
} from "lucide-react"
import { Button } from "@/components/ui/Button"

const EASE = [0.16, 1, 0.3, 1] as const

const HELP_CARDS = [
  {
    title: "Get accurate eligibility guidance",
    cta: "Open assessment",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1400&q=80",
    href: "/qualify",
  },
  {
    title: "Track route and destination options",
    cta: "Explore destinations",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1400&q=80",
    href: "/destinations",
  },
  {
    title: "Use funding and settlement support",
    cta: "View fee options",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1400&q=80",
    href: "/fees",
  },
]

const FLOW = [
  {
    title: "Intelligence",
    detail: "Profile scoring, route matching, and early risk visibility.",
    icon: ScanSearch,
  },
  {
    title: "Visa",
    detail: "Checklist logic, document quality, and application readiness.",
    icon: FileCheck2,
  },
  {
    title: "School",
    detail: "Shortlisting, tuition planning, and admission pathway support.",
    icon: GraduationCap,
  },
  {
    title: "Accommodation",
    detail: "City decision and pre-arrival housing coordination.",
    icon: Home,
  },
  {
    title: "Funding",
    detail: "Budget simulation, proof-of-funds strategy, and execution.",
    icon: Banknote,
  },
]

export default function SuitePage() {
  return (
    <div className="min-h-screen pt-28 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="mb-14"
        >
          <div className="relative rounded-[2rem] overflow-hidden border border-black/10 min-h-[430px] shadow-[0_35px_70px_-35px_rgba(0,0,0,0.35)]">
            <Image
              src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1800&q=80"
              alt="Migration support hero"
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-transparent" />

            <div className="relative z-10 p-8 md:p-10">
              <div className="max-w-2xl bg-white/93 border border-black/10 rounded-2xl p-6 md:p-7 backdrop-blur-sm">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/[0.04] text-black text-xs font-semibold mb-5 border border-black/10">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  Unified EMZ Suite
                </div>
                <h1 className="display-title text-4xl sm:text-5xl md:text-6xl font-bold text-black mb-3">
                  Clear migration tools
                  <br />
                  <span className="gradient-text">in one modern experience.</span>
                </h1>
                <p className="text-black/70 text-base md:text-lg mb-6">
                  Services and process are collapsed here: clear cards, clear actions, and a visible flow from intelligence to settlement.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/qualify">
                    <Button size="lg" className="gap-2">
                      Start assessment <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/fees">
                    <Button size="lg" variant="outline">See fees</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <section className="mb-16">
          <h2 className="display-title text-4xl md:text-5xl text-black mb-2">We&apos;re here to help</h2>
          <p className="text-black/70 mb-6">Everything is organized as practical options clients can act on immediately.</p>
          <div className="grid md:grid-cols-3 gap-5">
            {HELP_CARDS.map((card, index) => (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.4, ease: EASE }}
                whileHover={{ y: -7, scale: 1.01 }}
                className="premium-animated-card rounded-2xl overflow-hidden"
              >
                <div className="relative h-44">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-4 border-t border-black/10">
                  <h3 className="text-xl font-bold text-black mb-3">{card.title}</h3>
                  <Link href={card.href} className="inline-flex items-center gap-1 text-sm font-semibold text-black/75 hover:text-black transition-colors">
                    {card.cta} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="mb-16 rounded-3xl bg-white border border-black/10 p-6 md:p-8 shadow-[0_24px_50px_-34px_rgba(0,0,0,0.35)]">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
            <div>
              <h2 className="display-title text-3xl md:text-5xl text-black mb-2">Suite process flow</h2>
              <p className="text-black/70">A single operating model for the full cross-border journey.</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-black/12 bg-black/[0.03] px-3 py-1.5 text-xs font-semibold text-black/70">
              <Globe className="w-3.5 h-3.5" />
              UK · Canada · Europe
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {FLOW.map(({ title, detail, icon: Icon }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.35, ease: EASE }}
                whileHover={{ y: -6 }}
                className="rounded-xl border border-black/10 bg-white p-4"
              >
                <div className="w-10 h-10 rounded-xl bg-black/[0.06] flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-black" />
                </div>
                <h3 className="font-bold text-black mb-1">{title}</h3>
                <p className="text-xs text-black/65 leading-relaxed">{detail}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-white border border-black/12 p-7 md:p-9 shadow-[0_26px_56px_-34px_rgba(0,0,0,0.4)]">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="relative h-56 rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1600&q=80"
                alt="Global route map visual"
                fill
                sizes="(min-width: 768px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="display-title text-3xl md:text-4xl text-black mb-3">
                Never miss the right migration route.
              </h3>
              <p className="text-black/70 mb-5">
                Use the suite to keep your journey clear, measurable, and decision-ready at every stage.
              </p>
              <div className="grid sm:grid-cols-2 gap-2 mb-4">
                <div className="rounded-xl border border-black/12 px-3 py-2 text-sm text-black/65">Email address</div>
                <div className="rounded-xl border border-black/12 px-3 py-2 text-sm text-black/65">Preferred destination</div>
              </div>
              <label className="flex items-center gap-2 text-xs text-black/60 mb-5">
                <input type="checkbox" className="rounded border-black/25" />
                I agree to receive updates and migration insights.
              </label>
              <div className="flex flex-wrap gap-3">
                <Link href="/qualify">
                  <Button className="gap-2">Get assessed <ArrowRight className="w-4 h-4" /></Button>
                </Link>
                <Link href="/destinations">
                  <Button variant="outline" className="gap-2">
                    Explore routes <Plane className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 text-xs text-black/55 text-center">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-black" />
            Modern interface · clear cards · clear migration messaging
          </span>
        </div>
      </div>
    </div>
  )
}

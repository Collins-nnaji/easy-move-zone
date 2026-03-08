"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  ArrowRight,
  BadgeCheck,
  BookOpenText,
  Bot,
  Building2,
  Calculator,
  CheckCircle2,
  Compass,
  Home,
  ScanSearch,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/Button"

const EASE = [0.16, 1, 0.3, 1] as const

const CORE_VALUE = [
  { title: "Compare moving companies", desc: "Filter movers by route, service quality, and cost lane.", icon: Building2, href: "/moving-companies" },
  { title: "Visa and relocation guides", desc: "Structured playbooks for work, study, and digital nomad moves.", icon: BookOpenText, href: "/relocation-guides" },
  { title: "Housing search", desc: "Explore partner-ready listing lanes by destination city.", icon: Home, href: "/housing-search" },
  { title: "Cost-of-living comparison", desc: "Contrast cities before committing to relocation.", icon: Compass, href: "/cost-of-living" },
  { title: "Expat communities", desc: "Find groups and events for faster social onboarding abroad.", icon: Users, href: "/communities" },
  { title: "AI relocation assistant", desc: "Get instant action plans connected to platform modules.", icon: Bot, href: "/relocation-assistant" },
]

const CORE_TOOLS = [
  { title: "AI assessment", href: "/qualify", icon: ScanSearch },
  { title: "Document processing", href: "/document-support", icon: CheckCircle2 },
  { title: "Budget planner", href: "/calculator", icon: Calculator },
]

function HeroSection() {
  return (
    <section className="relative pt-32 pb-14 px-6">
      <div className="section-inner mx-auto w-full max-w-6xl">
        <div className="relative rounded-[2rem] overflow-hidden border border-black/10 shadow-[0_35px_70px_-35px_rgba(0,0,0,0.35)] min-h-[540px]">
          <Image
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1800&q=80"
            alt="Aircraft representing global travel and relocation"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/16 to-transparent" />
          <div className="relative z-10 p-8 md:p-10 lg:p-12 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 text-black text-xs font-semibold tracking-wide mb-6 border border-black/10"
            >
              <BadgeCheck className="w-3.5 h-3.5" />
              EasyMoveZone · Relocation platform
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.04, ease: EASE }}
              className="bg-white/92 backdrop-blur-sm rounded-2xl p-6 md:p-7 border border-black/12"
            >
              <h1 className="display-title text-4xl sm:text-5xl md:text-6xl font-bold text-black mb-3">
                Relocation super-app
                <br />
                for city and country moves.
              </h1>
              <p className="text-base md:text-lg text-black/72 mb-5 leading-relaxed">
                EasyMoveZone helps people move with less stress using moving company comparison, visa guides,
                housing search, cost-of-living data, expat communities, and AI relocation support.
              </p>
              <div className="flex flex-wrap gap-2.5 mb-6 text-sm">
                {["Movers + housing", "Guides + documents", "Costs + planning", "AI support"].map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-full bg-black/[0.05] px-3 py-1.5 border border-black/8">
                    <CheckCircle2 className="w-4 h-4 text-black" />
                    <span className="text-black/85">{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/suite"><Button size="lg" className="gap-2">Open relocation suite <ArrowRight className="w-4 h-4" /></Button></Link>
                <Link href="/relocation-assistant"><Button size="lg" variant="outline">Talk to AI assistant</Button></Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

function PlatformModulesSection() {
  return (
    <section className="py-16 md:py-20 px-6">
      <div className="section-inner">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: EASE }}
          className="text-center max-w-3xl mx-auto mb-10"
        >
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Platform modules</span>
          <h2 className="display-title text-4xl md:text-5xl font-bold text-foreground mt-2 mb-3">
            Everything needed for relocation execution
          </h2>
          <p className="text-muted-foreground text-lg">
            Built as one connected platform for people moving to London, Canada, Europe, and beyond.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CORE_VALUE.map(({ title, desc, icon: Icon, href }, i) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.35, ease: EASE }}
              whileHover={{ y: -5 }}
              className="rounded-2xl border border-black/12 bg-white p-5 shadow-[0_16px_38px_-28px_rgba(0,0,0,0.45)]"
            >
              <div className="w-11 h-11 rounded-xl bg-black/[0.06] text-black flex items-center justify-center mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-black mb-2">{title}</h3>
              <p className="text-sm text-black/65 leading-relaxed mb-4">{desc}</p>
              <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-black hover:text-black/80">
                Open module <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

function CoreToolsSection() {
  return (
    <section className="pb-20 px-6">
      <div className="section-inner">
        <div className="rounded-3xl border border-black/10 bg-white p-7 md:p-10 shadow-[0_26px_60px_-36px_rgba(0,0,0,0.45)]">
          <h2 className="display-title text-3xl md:text-5xl text-black mb-3">Start with core tools</h2>
          <p className="text-black/70 max-w-2xl mb-6">
            Run assessment, process documents, and validate budget first. Then continue with movers, housing, guides, and community support.
          </p>
          <div className="grid md:grid-cols-3 gap-3 mb-6">
            {CORE_TOOLS.map(({ title, href, icon: Icon }) => (
              <Link key={title} href={href} className="rounded-xl border border-black/10 bg-black/[0.02] p-4 hover:bg-black/[0.04] transition-colors">
                <div className="w-9 h-9 rounded-lg bg-black/[0.08] flex items-center justify-center mb-2">
                  <Icon className="w-4.5 h-4.5 text-black" />
                </div>
                <div className="font-semibold text-black">{title}</div>
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/suite"><Button className="gap-2">Enter full suite <ArrowRight className="w-4 h-4" /></Button></Link>
            <Link href="/moving-companies"><Button variant="outline">Compare moving companies</Button></Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <PlatformModulesSection />
      <CoreToolsSection />
    </div>
  )
}

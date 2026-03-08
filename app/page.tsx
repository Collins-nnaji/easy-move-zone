"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  Calculator,
  CheckCircle2,
  FileCheck2,
  ScanSearch,
} from "lucide-react"
import { Button } from "@/components/ui/Button"

const EASE = [0.16, 1, 0.3, 1] as const

const PLATFORM_PILLARS = [
  {
    title: "AI route assessment",
    desc: "Profile-based scoring to identify strong migration pathways for work, study, business, or travel.",
    icon: ScanSearch,
  },
  {
    title: "Document processing support",
    desc: "Structured checklists, status tracking, and upload workflow to prepare cleaner application files.",
    icon: FileCheck2,
  },
  {
    title: "Relocation budget planning",
    desc: "Practical cost modeling and funding preparation so decisions are backed by clear numbers.",
    icon: Calculator,
  },
  {
    title: "One suite operating flow",
    desc: "Assessment, document support, and next actions coordinated in a single suite experience.",
    icon: BrainCircuit,
  },
]

function HeroSection() {
  return (
    <section className="relative pt-32 pb-14 px-6">
      <div className="section-inner mx-auto w-full max-w-6xl">
        <div className="relative rounded-[2rem] overflow-hidden border border-black/10 shadow-[0_35px_70px_-35px_rgba(0,0,0,0.35)] min-h-[520px]">
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
              EasyMoveZone · AI-powered travel and relocation support
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.04, ease: EASE }}
              className="bg-white/92 backdrop-blur-sm rounded-2xl p-6 md:p-7 border border-black/12"
            >
              <h1 className="display-title text-4xl sm:text-5xl md:text-6xl font-bold text-black mb-3">
                AI document processing support
                <br />
                for global movement.
              </h1>
              <p className="text-base md:text-lg text-black/72 mb-5 leading-relaxed">
                EasyMoveZone helps people planning travel or relocation for work, study, and business.
                Start on this landing page, then continue everything inside the EMZ Suite.
              </p>

              <div className="flex flex-wrap gap-2.5 mb-6 text-sm">
                {["Route matching", "Document readiness", "Cost planning", "Suite workflow"].map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-full bg-black/[0.05] px-3 py-1.5 border border-black/8">
                    <CheckCircle2 className="w-4 h-4 text-black" />
                    <span className="text-black/85">{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/suite">
                  <Button size="lg" className="gap-2">
                    Open EMZ Suite <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/document-support">
                  <Button size="lg" variant="outline" className="gap-2">
                    Open document workspace
                  </Button>
                </Link>
                <Link href="/qualify">
                  <Button size="lg" variant="outline" className="gap-2">
                    Run quick assessment
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

function PlatformSection() {
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
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Platform overview</span>
          <h2 className="display-title text-4xl md:text-5xl font-bold text-foreground mt-2 mb-3">
            Intro landing page, suite as main app
          </h2>
          <p className="text-muted-foreground text-lg">
            This page introduces the product. The Suite is where users execute all core actions.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLATFORM_PILLARS.map(({ title, desc, icon: Icon }, i) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: EASE }}
              whileHover={{ y: -5 }}
              className="rounded-2xl border border-black/12 bg-white p-5 shadow-[0_16px_38px_-28px_rgba(0,0,0,0.45)]"
            >
              <div className="w-11 h-11 rounded-xl bg-black/[0.06] text-black flex items-center justify-center mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-black mb-2">{title}</h3>
              <p className="text-sm text-black/65 leading-relaxed">{desc}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

function SuiteGatewaySection() {
  return (
    <section className="pb-20 px-6">
      <div className="section-inner">
        <div className="rounded-3xl border border-black/10 bg-white p-7 md:p-10 text-center shadow-[0_26px_60px_-36px_rgba(0,0,0,0.45)]">
          <h2 className="display-title text-3xl md:text-5xl text-black mb-3">
            Continue in the EMZ Suite
          </h2>
          <p className="text-black/70 max-w-2xl mx-auto mb-6">
            Use the Suite as your main workspace for assessment, document support, and relocation planning.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/suite">
              <Button className="gap-2">
                Enter suite <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/calculator">
              <Button variant="outline">Open calculator</Button>
            </Link>
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
      <PlatformSection />
      <SuiteGatewaySection />
    </div>
  )
}

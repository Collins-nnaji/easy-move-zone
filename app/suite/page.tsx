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
  GraduationCap,
  Home,
  Plane,
  ScanSearch,
} from "lucide-react"
import { Button } from "@/components/ui/Button"

const EASE = [0.16, 1, 0.3, 1] as const

const SERVICE_PILLARS = [
  {
    title: "Migration Intelligence",
    desc: "Profile scoring, route-fit analysis, and destination match clarity before any expensive step.",
    icon: ScanSearch,
    bullets: ["Eligibility review", "Country-fit score", "Risk visibility"],
  },
  {
    title: "Visa Strategy & Application",
    desc: "Structured documentation planning, submission readiness, and interview positioning support.",
    icon: FileCheck2,
    bullets: ["Checklist workflow", "File review", "Submission preparation"],
  },
  {
    title: "School & Study Placement",
    desc: "Institution selection with tuition comparison and practical admission guidance.",
    icon: GraduationCap,
    bullets: ["School shortlisting", "Tuition mapping", "Admission support"],
  },
  {
    title: "Accommodation & Settlement",
    desc: "Landing-city guidance, pre-arrival housing support, and setup planning after arrival.",
    icon: Home,
    bullets: ["City selection", "Housing planning", "Settlement setup"],
  },
  {
    title: "Funding & Financial Planning",
    desc: "Transparent cost planning and proof-of-funds strategy for smarter migration decisions.",
    icon: Banknote,
    bullets: ["Budget simulation", "Proof-of-funds planning", "Funding options"],
  },
]

const PROCESS_STEPS = [
  { step: "01", title: "Intelligence", note: "Assess profile and route-fit confidence.", icon: ScanSearch },
  { step: "02", title: "Visa", note: "Prepare documents and application strategy.", icon: FileCheck2 },
  { step: "03", title: "School", note: "Shortlist institutions and map tuition impact.", icon: GraduationCap },
  { step: "04", title: "Accommodation", note: "Plan city and home setup before landing.", icon: Home },
  { step: "05", title: "Funding", note: "Finalize financial strategy and execution.", icon: Banknote },
]

const MODULE_VISUALS = [
  {
    title: "Eligibility Review & Application Checklist",
    tag: "Intelligence + Visa",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1600&q=80",
    text: "A single screen that tells clients what they qualify for and exactly what to prepare next.",
  },
  {
    title: "Funding & Financial Planner",
    tag: "Budget confidence",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=80",
    text: "Clear cost visibility across tuition, relocation, and proof-of-funds requirements.",
  },
  {
    title: "Migration Portfolio & Global Route View",
    tag: "Country strategy",
    image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1600&q=80",
    text: "A practical portfolio view of UK, Canada, and Europe options against client profiles.",
  },
  {
    title: "End-to-End Journey Flow",
    tag: "All-in-one suite",
    image: "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1600&q=80",
    text: "The full Intelligence → Visa → School → Accommodation → Funding pipeline in one experience.",
  },
]

export default function SuitePage() {
  return (
    <div className="min-h-screen pt-28 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="text-center max-w-4xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/15 text-primary text-xs font-semibold tracking-wide mb-5">
            <BadgeCheck className="w-3.5 h-3.5" />
            One unified EMZ Suite
          </div>
          <h1 className="display-title text-5xl md:text-7xl font-bold text-foreground mb-4">
            Services + process
            <br />
            <span className="gradient-text">in one mature platform page.</span>
          </h1>
          <p className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto">
            We collapsed the experience into one suite page so clients can understand what you offer, how it works,
            and what to do next without bouncing through too many pages.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/qualify">
              <Button className="gap-2">Start assessment <ArrowRight className="w-4 h-4" /></Button>
            </Link>
            <Link href="/fees">
              <Button variant="outline" className="gap-2">View pricing</Button>
            </Link>
          </div>
        </motion.section>

        <section id="services" className="mb-16">
          <div className="text-center mb-8">
            <h2 className="display-title text-3xl md:text-5xl font-bold text-foreground mb-3">
              Core <span className="gradient-text">service pillars</span>
            </h2>
            <p className="text-muted-foreground">Everything clients need in one clear structure.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICE_PILLARS.map(({ title, desc, icon: Icon, bullets }, index) => (
              <motion.article
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ delay: index * 0.06, duration: 0.45, ease: EASE }}
                whileHover={{ y: -8, scale: 1.015, rotateX: 1.8 }}
                className="premium-animated-card rounded-2xl p-5 perspective-1000"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{desc}</p>
                <div className="space-y-1.5">
                  {bullets.map((bullet) => (
                    <div key={bullet} className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="text-foreground/90">{bullet}</span>
                    </div>
                  ))}
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="process" className="mb-16 rounded-3xl bg-white text-black border border-black/10 p-6 md:p-8">
          <div className="text-center mb-8">
            <h2 className="display-title text-3xl md:text-5xl font-bold text-black mb-3">
              The suite <span className="text-black/80">workflow</span>
            </h2>
            <p className="text-black/70">One flow from intelligence to funded relocation.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {PROCESS_STEPS.map(({ step, title, note, icon: Icon }, index) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.07, duration: 0.4, ease: EASE }}
                whileHover={{ y: -6, scale: 1.015 }}
                className="rounded-xl p-4 text-center border border-black/10 bg-white shadow-[0_14px_28px_-18px_rgba(0,0,0,0.45)] hover:-translate-y-1.5 transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-black/10 text-black mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-black/65 mb-1">{step}</div>
                <h3 className="text-sm font-bold text-black mb-1">{title}</h3>
                <p className="text-xs text-black/65">{note}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="modules" className="mb-16">
          <div className="text-center mb-8">
            <h2 className="display-title text-3xl md:text-5xl font-bold text-foreground mb-3">
              Visual suite <span className="gradient-text">modules</span>
            </h2>
            <p className="text-muted-foreground">The core views that should appear in your product narrative.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {MODULE_VISUALS.map(({ title, tag, image, text }, index) => (
              <motion.article
                key={title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ delay: index * 0.08, duration: 0.45, ease: EASE }}
                whileHover={{ y: -8, scale: 1.01 }}
                className="premium-animated-card rounded-2xl overflow-hidden"
              >
                <div className="relative h-56">
                  <Image
                    src={image}
                    alt={title}
                    fill
                    sizes="(min-width: 768px) 45vw, 95vw"
                    className="object-cover transition-transform duration-700 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                  <span className="absolute left-4 bottom-4 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-white/90 text-foreground">
                    {tag}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <div className="rounded-2xl bg-white p-8 md:p-10 text-center border border-black/12 shadow-[0_24px_50px_-28px_rgba(0,0,0,0.28)]">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-black/10 text-black mb-4">
            <Plane className="w-6 h-6" />
          </div>
          <h3 className="display-title text-3xl md:text-4xl font-bold text-black mb-3">
            Ready to run the full migration suite?
          </h3>
          <p className="text-black/75 mb-6 max-w-2xl mx-auto">
            Start from eligibility intelligence, move through visa and school planning, and finish with accommodation and funding execution.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/qualify">
              <Button className="bg-white text-black hover:bg-white/90 gap-2">Get assessed <ArrowRight className="w-4 h-4" /></Button>
            </Link>
            <Link href="/destinations">
              <Button variant="outline" className="border-black/25 text-black hover:bg-black/5">Explore destinations</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

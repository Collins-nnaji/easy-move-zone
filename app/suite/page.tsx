"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  CheckCircle2,
  Globe,
  Home,
  School,
  ScanSearch,
  FileCheck2,
} from "lucide-react"
import { Button } from "@/components/ui/Button"

const EASE = [0.16, 1, 0.3, 1] as const

const SUITE_CARDS = [
  {
    title: "Eligibility Review & Application Checklist",
    subtitle: "Profile intelligence",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1600&q=80",
    icon: ScanSearch,
    text: "Assess migration fit and instantly surface checklist priorities so applicants know what to gather first.",
  },
  {
    title: "Funding & Financial Planner",
    subtitle: "Budget confidence",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=80",
    icon: Banknote,
    text: "Model tuition, relocation, and proof-of-funds scenarios with transparent assumptions and realistic timelines.",
  },
  {
    title: "Migration Portfolio & Route Intelligence",
    subtitle: "Country strategy",
    image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1600&q=80",
    icon: Globe,
    text: "Compare UK, Canada, and Europe routes against profile strength, cost expectations, and processing complexity.",
  },
  {
    title: "End-to-End Relocation Journey",
    subtitle: "Operational flow",
    image: "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1600&q=80",
    icon: Home,
    text: "Connect all stages from first assessment through visa, school, accommodation, and funding into one journey.",
  },
]

const JOURNEY_STEPS = [
  { title: "Intelligence", icon: ScanSearch, note: "Eligibility scoring and route match" },
  { title: "Visa", icon: FileCheck2, note: "Document strategy and application prep" },
  { title: "School", icon: School, note: "Admission planning and tuition mapping" },
  { title: "Accommodation", icon: Home, note: "Landing-city and housing setup support" },
  { title: "Funding", icon: Banknote, note: "Proof of funds and cost planning" },
]

export default function SuitePage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide mb-5">
            <BadgeCheck className="w-3.5 h-3.5" />
            EMZ Digital Suite
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            The migration suite that shows clients what to do, next.
          </h1>
          <p className="text-base md:text-lg text-muted-foreground">
            Built around the exact workflow you requested: <strong className="text-foreground">Intelligence, Visa, School, Accommodation, and Funding</strong>.
            Each module is designed to reduce confusion, improve decision quality, and keep progress visible.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {SUITE_CARDS.map(({ title, subtitle, image, text, icon: Icon }, index) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: index * 0.08, duration: 0.45, ease: EASE }}
              whileHover={{ y: -6 }}
              className="rounded-2xl border border-border/60 overflow-hidden bg-card shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="relative h-52">
                <Image
                  src={image}
                  alt={title}
                  fill
                  sizes="(min-width: 768px) 45vw, 95vw"
                  className="object-cover transition-transform duration-700 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                <div className="absolute left-4 bottom-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">{subtitle}</span>
                </div>
              </div>
              <div className="p-5">
                <h2 className="text-lg font-bold text-foreground mb-2">{title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
              </div>
            </motion.article>
          ))}
        </div>

        <section className="rounded-2xl border border-border/60 bg-card p-6 md:p-8 mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Suite workflow</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {JOURNEY_STEPS.map(({ title, icon: Icon, note }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.07, duration: 0.35 }}
                className="rounded-xl border border-border/60 bg-muted/30 p-4 text-center"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-bold text-sm text-foreground mb-1">{title}</div>
                <p className="text-xs text-muted-foreground">{note}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/85 p-8 md:p-10 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">Launch your migration strategy with the full EMZ Suite</h3>
          <p className="text-white/85 mb-6 text-sm md:text-base">
            Start with eligibility, lock your visa route, plan school and accommodation, then execute funding with full clarity.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/qualify">
              <Button className="bg-white text-primary hover:bg-white/90 gap-2">
                Get assessed <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2">
                View process
              </Button>
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs text-white/85">
            {["Clear steps", "No hidden flow", "Decision visibility", "Action-oriented guidance"].map((label) => (
              <span key={label} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

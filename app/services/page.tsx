"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
    BadgeCheck, ArrowRight, Sparkles, FileText, GraduationCap,
    Home, Banknote, CheckCircle2, Users, Star,
} from "lucide-react"
import { Button } from "@/components/ui/Button"

const EASE = [0.16, 1, 0.3, 1] as const

/* ── Service data ────────────────────────────────────── */
const SERVICES = [
    {
        icon: Sparkles,
        title: "Migration Intelligence",
        tag: "AI-Powered",
        desc: "Leverage our AI-powered platform to assess your migration readiness. Get country match scoring, visa eligibility probability, and a full cost simulation in Naira — all before committing to a pathway.",
        features: [
            "AI migration simulation",
            "Country match scoring",
            "Visa eligibility probability",
            "Cost simulation in ₦",
            "Downloadable assessment report",
        ],
        audience: "For anyone exploring migration options and wanting data-driven clarity before taking the first step.",
        cta: { label: "Get assessed", href: "/qualify" },
        accent: "primary" as const,
    },
    {
        icon: FileText,
        title: "Visa Planning & Application Support",
        tag: "End-to-End",
        desc: "From eligibility review to interview preparation — we guide your visa application step by step. Our team reviews your documentation, positions your profile strategically, and ensures your application is submission-ready.",
        features: [
            "Documentation checklist",
            "Eligibility review",
            "Strategy positioning",
            "Application review",
            "Interview preparation",
        ],
        audience: "For professionals, skilled workers, and students who need expert guidance through the visa process.",
        cta: { label: "Start your application", href: "/qualify" },
        accent: "secondary" as const,
    },
    {
        icon: GraduationCap,
        title: "School & University Placement",
        tag: "Education",
        desc: "We help you find the right school or university across the UK, Canada, and Europe. Compare institutions, understand tuition breakdowns, and get admission and scholarship support — all tailored to your goals.",
        features: [
            "School comparison",
            "Tuition breakdown",
            "Admission support",
            "Scholarship advisory",
            "Student visa guidance",
        ],
        audience: "For students and families seeking international education with clear cost and admission guidance.",
        cta: { label: "Explore placements", href: "/qualify" },
        accent: "primary" as const,
    },
    {
        icon: Home,
        title: "Accommodation & Settlement",
        tag: "Settlement",
        desc: "Landing in a new country is just the beginning. We source temporary and long-term housing, help you pick the right city, set up your bank account, register for healthcare, and handle utility connections.",
        features: [
            "Temporary housing sourcing",
            "Long-term rental support",
            "City selection advice",
            "Cost of living simulation",
            "Bank account & healthcare setup",
            "Utility setup support",
        ],
        audience: "For migrants who want a smooth, stress-free landing with everything arranged before arrival.",
        cta: { label: "Plan your settlement", href: "/qualify" },
        accent: "secondary" as const,
    },
    {
        icon: Banknote,
        title: "Funding & Financial Planning",
        tag: "Finance",
        desc: "Understand the true cost of relocation and plan accordingly. We help with tuition financing, education loans, proof of funds structuring, budget planning, and our relocation cost calculator gives you a clear picture in ₦.",
        features: [
            "Tuition financing options",
            "Education loan guidance",
            "Proof of funds structuring",
            "Budget planning",
            "Relocation cost calculator",
        ],
        audience: "For anyone who wants financial clarity and wants to explore funding options for their relocation.",
        cta: { label: "Plan your budget", href: "/calculator" },
        accent: "primary" as const,
    },
]

/* ── Service card ────────────────────────────────────── */
function ServiceCard({ service, index }: { service: typeof SERVICES[0]; index: number }) {
    const Icon = service.icon
    const isSecondary = service.accent === "secondary"

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: index * 0.08, duration: 0.5, ease: EASE }}
            className="fintech-card p-0 overflow-hidden"
        >
            {/* Accent header */}
            <div className={`px-6 pt-6 pb-4 ${isSecondary ? "bg-secondary/5" : "bg-primary/5"}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className={`w-11 h-11 rounded-xl ${isSecondary ? "bg-secondary/10" : "bg-primary/10"} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-5 h-5 ${isSecondary ? "text-secondary" : "text-primary"}`} />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${isSecondary ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"}`}>
                        {service.tag}
                    </span>
                </div>
                <h3 className="font-bold text-lg">{service.title}</h3>
            </div>

            {/* Body */}
            <div className="px-6 pb-6 pt-4 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{service.desc}</p>

                {/* Features */}
                <div className="space-y-1.5">
                    {service.features.map((f) => (
                        <div key={f} className="flex items-center gap-2 text-xs">
                            <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isSecondary ? "text-secondary" : "text-primary"}`} />
                            <span className="text-foreground font-medium">{f}</span>
                        </div>
                    ))}
                </div>

                {/* Audience */}
                <div className="bg-muted/50 rounded-xl p-3 border border-border/40">
                    <div className="flex items-start gap-2">
                        <Users className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        <p className="text-xs text-muted-foreground leading-relaxed">{service.audience}</p>
                    </div>
                </div>

                {/* CTA */}
                <Link href={service.cta.href}>
                    <Button size="sm" variant={isSecondary ? "secondary" : "primary"} className="w-full gap-2 mt-2">
                        {service.cta.label} <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                </Link>
            </div>
        </motion.div>
    )
}

/* ── Page ──────────────────────────────────────────────── */
export default function ServicesPage() {
    return (
        <div className="min-h-screen pt-28 pb-24 px-6">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="text-center mb-14">
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: EASE }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4"
                    >
                        <BadgeCheck className="w-3.5 h-3.5" /> What we offer
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.05, ease: EASE }}
                        className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
                    >
                        Our <span className="gradient-text">services</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground text-sm max-w-lg mx-auto"
                    >
                        Five structured service pillars covering every stage of your migration journey — from data-driven assessment to full settlement support.
                    </motion.p>
                </div>

                {/* Services grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {SERVICES.map((service, i) => (
                        <ServiceCard key={service.title} service={service} index={i} />
                    ))}
                </div>

                {/* How it all fits */}
                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="mb-16"
                >
                    <h2 className="text-2xl font-bold text-center mb-8">How our services fit together</h2>
                    <div className="grid md:grid-cols-4 gap-4">
                        {[
                            { step: "01", title: "Assess", desc: "Start with Migration Intelligence to understand your best options.", color: "text-primary" },
                            { step: "02", title: "Plan", desc: "Use Visa Planning and Funding & Financial Planning to prepare.", color: "text-secondary" },
                            { step: "03", title: "Apply", desc: "School Placement and Application Support handle your applications.", color: "text-primary" },
                            { step: "04", title: "Settle", desc: "Accommodation & Settlement ensures a smooth landing.", color: "text-secondary" },
                        ].map(({ step, title, desc, color }, i) => (
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="text-center relative"
                            >
                                <div className="fintech-card p-6 h-full">
                                    <div className={`text-4xl font-bold ${color} opacity-20 mb-3`}>{step}</div>
                                    <h3 className="font-bold text-sm mb-2">{title}</h3>
                                    <p className="text-xs text-muted-foreground">{desc}</p>
                                </div>
                                {i < 3 && (
                                    <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Pricing teaser */}
                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="mb-16"
                >
                    <div className="fintech-card p-6 max-w-3xl mx-auto">
                        <h2 className="font-bold text-lg mb-4 text-center">Service pricing</h2>
                        <div className="grid sm:grid-cols-2 gap-4 text-sm text-muted-foreground mb-5">
                            <div><strong className="text-foreground">Assessment Portal:</strong> ₦25,000 – ₦75,000</div>
                            <div><strong className="text-foreground">Migration Strategy:</strong> ₦800K – ₦2.5M</div>
                            <div><strong className="text-foreground">Full Concierge:</strong> ₦4M – ₦15M+</div>
                            <div><strong className="text-foreground">Education Placement:</strong> Commission-based</div>
                            <div className="sm:col-span-2"><strong className="text-foreground">Forex & Loan Partnerships:</strong> Commission-based</div>
                        </div>
                        <div className="text-center">
                            <Link href="/fees">
                                <Button variant="outline" className="gap-2">See full fees <ArrowRight className="w-4 h-4" /></Button>
                            </Link>
                        </div>
                    </div>
                </motion.section>

                {/* CTA */}
                <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-10 text-center">
                    <Sparkles className="w-10 h-10 text-white mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-3">Start with a free assessment</h3>
                    <p className="text-white/80 text-sm mb-6 max-w-md mx-auto">
                        Answer a few questions and our AI will match you to the best visa pathway, estimate costs, and recommend your next step.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/qualify">
                            <Button className="bg-white text-primary hover:bg-white/90 gap-2 font-bold">
                                Get assessed <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                        <Link href="/how-it-works">
                            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2">
                                Our process
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Trust badges */}
                <div className="text-center text-xs text-muted-foreground py-8 flex flex-wrap justify-center gap-4">
                    {["AI-powered assessment", "Transparent fees", "Start to finish", "We guide you"].map((t) => (
                        <span key={t} className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-accent" /> {t}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
}

"use client"

import { Section } from "@/components/ui/Section"
import { Button } from "@/components/ui/Button"
import { motion } from "framer-motion"
import { Check, ArrowRight, FileText, Globe, Building2, Briefcase, Landmark, Plane } from "lucide-react"
import Link from "next/link"
import { ServiceCard } from "@/components/services/ServiceCard"

export default function ServicesPage() {
    const categories = [
        {
            id: "immigration",
            name: "Immigration & Compliance",
            description: "End-to-end management of visas, permits, and government relations.",
            services: [
                {
                    title: "Strategic Visa Planning",
                    desc: "Comprehensive roadmap for individuals and families, analyzing all potential pathways (Skilled, Business, Family).",
                    features: ["ILR Timeline Modeling", "Dependant Cost Forecasting", "Global Talent Endorsement Review", "Eligibility Audit"],
                    icon: FileText
                },
                {
                    title: "Corporate Compliance",
                    desc: "For businesses relocating talent. Ensure your company meets all sponsor license obligations.",
                    features: ["Mock Home Office Audits", "Level 1 User Training", "Sponsor License Cooling-off Analysis", "Right to Work Checks"],
                    icon: Building2
                }
            ]
        },
        {
            id: "relocation",
            name: "Relocation & Lifestyle",
            description: "Physical settlement support to ensure a seamless transition.",
            services: [
                {
                    title: "Home Search & Acquisition",
                    desc: "Dedicated agents to find, negotiate, and secure property before you arrive.",
                    features: ["Ofsted Catchment Analysis", "Break Clause Negotiation", "Fibre Optic Availability Check", "Virtual Viewings"],
                    icon: Globe
                },
                {
                    title: "Schooling & Education",
                    desc: "Placement services for international schools and universities.",
                    features: ["Bursary Application Support", "Entrance Exam Tutoring", "SEN (Special Needs) Assessment", "School Search"],
                    icon: GraduationCapIcon
                }
            ]
        },
        {
            id: "financial",
            name: "Financial & Business",
            description: "Protecting your wealth and expanding your commercial footprint.",
            services: [
                {
                    title: "Cross-Border Tax Planning",
                    desc: "Optimize your tax position between your home and destination countries.",
                    features: ["Split-year Treatment Claims", "Overseas Workday Relief (OWR)", "Double Taxation Treaty Relief", "Residency Tax Analysis"],
                    icon: Landmark
                },
                {
                    title: "Business Incorporation",
                    desc: "Launch your venture in a new market with full legal wrapping.",
                    features: ["VAT Registration", "Registered Office Address", "Director Service Contracts", "Entity Registration"],
                    icon: Briefcase
                }
            ]
        }
    ]

    return (
        <div className="flex flex-col min-h-screen pt-20">
            {/* Split Hero */}
            <Section className="bg-background border-b border-border/40 py-20 lg:py-28 overflow-hidden relative">
                <div className="absolute inset-0 -z-10 bg-background"></div>
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 hidden lg:block -skew-x-12 translate-x-32"></div>

                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="max-w-2xl"
                        >
                            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-6">
                                <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                                Full-Stack Mobility Support
                            </div>
                            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 font-mono leading-tight">
                                Service <span className="text-primary">Catalog</span>
                            </h1>
                            <p className="text-xl text-muted-foreground font-light leading-relaxed mb-8">
                                We de-risk international mobility. Select a comprehensive support package or individual services tailored to your specific migration goals.
                            </p>
                            <div className="flex gap-4">
                                <Button size="lg" className="h-14 px-8 rounded-lg shadow-[0_0_20px_var(--primary)] text-lg">
                                    Start Assessment
                                </Button>
                                <Button variant="ghost" size="lg" className="h-14 px-8 rounded-lg text-lg">
                                    View Pricing
                                </Button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="hidden lg:block relative h-[500px]"
                        >
                            <div className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-20" style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')" }}></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-border/40 rounded-full border-dashed animate-[spin_60s_linear_infinite]"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] border border-primary/20 rounded-full animate-[spin_40s_linear_infinite_reverse]"></div>

                            {/* Floating Service Nodes */}
                            <div className="absolute top-20 right-20 bg-card p-4 rounded-xl border border-border shadow-lg animate-bounce">
                                <FileText className="w-6 h-6 text-blue-500 mb-2" />
                                <div className="text-xs font-bold">Visa Strategy</div>
                            </div>

                            <div className="absolute bottom-32 left-10 bg-card p-4 rounded-xl border border-border shadow-lg animate-bounce delay-700">
                                <Building2 className="w-6 h-6 text-purple-500 mb-2" />
                                <div className="text-xs font-bold">Incorp. LLP</div>
                            </div>

                            <div className="absolute top-40 left-32 bg-card p-3 rounded-xl border border-border shadow-lg animate-pulse">
                                <Check className="w-4 h-4 text-green-500" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </Section>

            <div className="flex-1 bg-background relative">
                <div className="absolute inset-0 grid-bg opacity-20 -z-10"></div>

                <div className="container mx-auto px-4 py-16 max-w-6xl">
                    <div className="grid md:grid-cols-[280px_1fr] gap-12 lg:gap-24">

                        {/* Sidebar Navigation (Sticky) */}
                        <aside className="hidden md:block">
                            <div className="sticky top-32 space-y-8">
                                <div className="space-y-2 border-l-2 border-border/40 pl-4">
                                    {categories.map(cat => (
                                        <a
                                            key={cat.id}
                                            href={`#${cat.id}`}
                                            className="block text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-1"
                                        >
                                            {cat.name}
                                        </a>
                                    ))}
                                </div>
                                <div className="p-6 rounded-xl bg-[#0B0F19] border border-white/10 text-white shadow-xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <h4 className="font-bold mb-2 font-mono relative z-10">Need Custom Help?</h4>
                                    <p className="text-xs text-white/70 mb-4 relative z-10 leading-relaxed">
                                        Our consultants can build a bespoke package specifically for your situation.
                                    </p>
                                    <Button size="sm" className="w-full bg-white text-black hover:bg-white/90 relative z-10 font-bold">Book Consultation</Button>
                                </div>
                            </div>
                        </aside>

                        {/* Main Content */}
                        <div className="space-y-24">
                            {categories.map((cat, i) => (
                                <section key={cat.id} id={cat.id} className="scroll-mt-32">
                                    <div className="mb-10 border-b border-border/50 pb-6">
                                        <h2 className="text-3xl font-bold mb-3 font-mono text-foreground flex items-center gap-3">
                                            <span className="text-primary/40">0{i + 1}.</span> {cat.name}
                                        </h2>
                                        <p className="text-lg text-muted-foreground">{cat.description}</p>
                                    </div>

                                    <div className="space-y-4">
                                        {cat.services.map((service, j) => (
                                            <ServiceCard
                                                key={service.title}
                                                title={service.title}
                                                description={service.desc}
                                                features={service.features}
                                                icon={service.icon}
                                            />
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function GraduationCapIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
    )
}

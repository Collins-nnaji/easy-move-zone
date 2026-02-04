"use client"

import { Section } from "@/components/ui/Section"
import { ToolCard } from "@/components/ui/ToolCard"
import { Calculator, CheckSquare, FileText, Globe, Landmark, Scale, Search, Users, Briefcase } from "lucide-react"
import { motion } from "framer-motion"

export default function ToolsPage() {
    const tools = [
        {
            title: "Visa Eligibility Checker",
            description: "Answer a few simple questions to find out which visas you qualify for in over 20 countries.",
            icon: Search,
            href: "#",
        },
        {
            title: "Cost of Living Calculator",
            description: "Compare your current expenses with your destination city to plan your budget accurately.",
            icon: Calculator,
            href: "#",
        },
        {
            title: "Points Test Calculator",
            description: "Calculate your points for skilled migration to countries like Canada, Australia, and New Zealand.",
            icon: CheckSquare,
            href: "#",
        },
        {
            title: "Document Checklist Generator",
            description: "Get a personalized list of required documents for your specific visa application.",
            icon: FileText,
            href: "#",
        },
        {
            title: "Job Market Explorer",
            description: "Analyze demand for your skills and average salaries in different regions.",
            icon: Briefcase,
        },
        {
            title: "Currency Converter",
            description: "Real-time exchange rates to help you understand the value of your savings.",
            icon: Landmark,
            href: "#",
        },
        {
            title: "Residency Timeline Map",
            description: "Visualize the path from temporary visa to permanent residency and citizenship.",
            icon: Globe,
            href: "#",
        },
        {
            title: "Find a Lawyer",
            description: "Browse our directory of verified immigration lawyers and registered migration agents.",
            icon: Scale,
            href: "#",
        },
    ]

    return (
        <div className="flex flex-col min-h-screen pt-20">
            <Section className="bg-transparent flex-1 relative overflow-hidden">
                <div className="absolute inset-0 grid-bg -z-10 bg-background"></div>

                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-16"
                    >
                        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl mb-6">
                            Migration <span className="text-primary glow-text">Tools</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Simplify your move with our suite of powerful calculators, checkers, and planning tools.
                        </p>
                    </motion.div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:gap-8">
                        {tools.map((tool, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                            >
                                <ToolCard
                                    title={tool.title}
                                    description={tool.description}
                                    icon={tool.icon}
                                    href={tool.href || "#"}
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </Section>
        </div>
    )
}

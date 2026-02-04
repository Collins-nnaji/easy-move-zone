"use client"

import { Section } from "@/components/ui/Section"
import { Card } from "@/components/ui/Card"
import { motion } from "framer-motion"
import { BookOpen, FileCheck, Video } from "lucide-react"

export default function ResourcesPage() {
    const resources = [
        {
            title: "Visa Requirements Checklist",
            type: "Guide",
            icon: FileCheck,
            readTime: "5 min read"
        },
        {
            title: "Cost of Living Comparison 2024",
            type: "Report",
            icon: BookOpen,
            readTime: "12 min read"
        },
        {
            title: "How to Ace Your Consular Interview",
            type: "Video",
            icon: Video,
            readTime: "15 min watch"
        },
        {
            title: "Skilled Worker Points Guide",
            type: "Guide",
            icon: FileCheck,
            readTime: "8 min read"
        },
        {
            title: "Best Cities for Tech Jobs",
            type: "Report",
            icon: BookOpen,
            readTime: "10 min read"
        }
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
                        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl mb-6 font-mono">
                            Migration <span className="text-primary glow-text">Resources</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
                            Expert guides, checklists, and videos to help you prepare.
                        </p>
                    </motion.div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {resources.map((res, i) => (
                            <motion.div
                                key={res.title}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, delay: i * 0.1 }}
                                className={i === 0 ? "md:col-span-2 lg:col-span-2" : ""}
                            >
                                <Card className={`p-8 tech-card cursor-pointer group h-full flex flex-col justify-between ${i === 0 ? "bg-primary/5 border-primary/20" : "bg-card/40"}`}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 rounded-xl ${i === 0 ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"} transition-all duration-300`}>
                                            <res.icon className={i === 0 ? "w-8 h-8" : "w-6 h-6"} />
                                        </div>
                                        <span className="text-xs font-mono text-muted-foreground border border-primary/20 bg-primary/5 px-2 py-1 rounded-sm uppercase tracking-wider">{res.type}</span>
                                    </div>
                                    <div>
                                        <h3 className={`font-bold mb-2 group-hover:text-primary transition-colors ${i === 0 ? "text-3xl" : "text-xl"}`}>{res.title}</h3>
                                        <p className="text-sm text-muted-foreground font-mono">{res.readTime}</p>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </Section>
        </div>
    )
}

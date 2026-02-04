"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

interface ServiceCardProps {
    title: string
    description: string
    features: string[]
    icon: any
}

export function ServiceCard({ title, description, features, icon: Icon }: ServiceCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <div className="group grid md:grid-cols-[80px_1fr_120px] gap-6 p-8 rounded-xl bg-card border border-border/40 hover:border-primary/30 transition-all hover:bg-card/80">
            <div className="flex justify-center pt-2">
                <div className="w-12 h-12 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                </div>
            </div>

            <div className="flex flex-col">
                <h3 className="text-xl font-bold mb-3">{title}</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                    {description}
                </p>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-4 border-t border-border/40 mt-2">
                                <span className="text-xs font-mono text-primary uppercase tracking-wider mb-3 block">Exact Deliverables</span>
                                <ul className="grid sm:grid-cols-2 gap-3 mb-6">
                                    {features.map(feature => (
                                        <li key={feature} className="flex items-start text-sm text-foreground/80 font-mono">
                                            <Check className="w-4 h-4 text-primary mr-2 mt-0.5 shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <div className="p-4 bg-muted/20 rounded-lg border border-border/40">
                                    <span className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Typical Process</span>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="px-2 py-1 bg-background rounded border border-border/50 text-xs">Audit</span>
                                        <span className="text-muted-foreground">→</span>
                                        <span className="px-2 py-1 bg-background rounded border border-border/50 text-xs">Strategy</span>
                                        <span className="text-muted-foreground">→</span>
                                        <span className="px-2 py-1 bg-background rounded border border-border/50 text-xs">Execution</span>
                                        <span className="text-muted-foreground">→</span>
                                        <span className="px-2 py-1 bg-background rounded border border-border/50 text-xs text-primary bg-primary/5 border-primary/20">Result</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex justify-end items-start pt-2">
                <Button
                    variant="outline"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="hover:bg-primary/5 border-primary/20 gap-2 w-full md:w-auto"
                >
                    {isExpanded ? "Close" : "Details"}
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
            </div>
        </div>
    )
}

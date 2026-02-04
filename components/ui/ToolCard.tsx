"use client"

import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { ArrowRight, LucideIcon } from "lucide-react"

interface ToolCardProps {
    title: string
    description: string
    icon: LucideIcon
    href: string
}

export function ToolCard({ title, description, icon: Icon, href }: ToolCardProps) {
    return (
        <Card className="group p-8 flex flex-col h-full tech-card bg-card/40 hover:bg-card/60 cursor-pointer" onClick={() => window.location.href = href}>
            <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-[0_0_15px_rgba(var(--primary),0.4)] transition-all duration-300">
                <Icon className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-muted-foreground mb-8 flex-1 leading-relaxed">
                {description}
            </p>
            <div className="mt-auto">
                <Button variant="ghost" className="w-full justify-between group-hover:bg-primary/10 group-hover:text-primary hover:no-underline">
                    Use Tool <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
            </div>
        </Card>
    )
}

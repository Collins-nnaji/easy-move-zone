"use client"

import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { motion } from "framer-motion"

interface CountryCardProps {
    name: string
    slug: string
    image: string
    description: string
    index?: number
}

export function CountryCard({ name, slug, image, description, index = 0 }: CountryCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
        >
            <Card className={`group relative h-[400px] overflow-hidden rounded-xl bg-muted/20 tech-card p-0 border-none`}>
                <div className="relative h-48 w-full bg-muted overflow-hidden">
                    <Image
                        src={image}
                        alt={`Relocate to ${name}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300" />
                </div>
                <div className="flex flex-col flex-1 p-6">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground flex-1 leading-relaxed">{description}</p>
                    <div className="mt-6 pt-4 border-t border-border/50">
                        <Link href={`/index`} className="w-full" tabIndex={-1}>
                            <Button variant="outline" className="w-full group-hover:bg-primary/10 group-hover:text-black group-hover:border-primary transition-all duration-300">
                                Explore {name}
                            </Button>
                        </Link>
                    </div>
                </div>
            </Card>
        </motion.div>
    )
}

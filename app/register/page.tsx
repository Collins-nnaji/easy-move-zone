"use client"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import Link from "next/link"
import { motion } from "framer-motion"

export default function RegisterPage() {
    return (
        <div className="flex min-h-screen items-center justify-center relative overflow-hidden pt-20 pb-12">
            <div className="absolute inset-0 grid-bg -z-10 bg-background"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] opacity-40"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md px-4"
            >
                <Card className="p-8 tech-card border-primary/20 shadow-2xl shadow-primary/10 backdrop-blur-xl bg-background/60 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-50"></div>

                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold tracking-tight mb-2 font-mono">Create Account</h1>
                        <p className="text-muted-foreground">Start your global journey today</p>
                    </div>

                    <form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none" htmlFor="first-name">First name</label>
                                <input id="first-name" type="text" className="flex h-12 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all hover:border-primary/50 focus:border-primary" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none" htmlFor="last-name">Last name</label>
                                <input id="last-name" type="text" className="flex h-12 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all hover:border-primary/50 focus:border-primary" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none" htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                className="flex h-12 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all hover:border-primary/50 focus:border-primary"
                                placeholder="m@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none" htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                className="flex h-12 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all hover:border-primary/50 focus:border-primary"
                            />
                        </div>

                        <Button className="w-full h-12 text-lg font-semibold mt-4 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">Sign Up</Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted-foreground">Already have an account? </span>
                        <Link href="/login" className="font-semibold text-primary hover:underline">
                            Log in
                        </Link>
                    </div>
                </Card>
            </motion.div>
        </div>
    )
}

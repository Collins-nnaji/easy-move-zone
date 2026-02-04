"use client"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import Link from "next/link"
import { motion } from "framer-motion"

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center relative overflow-hidden pt-20 pb-12">
            <div className="absolute inset-0 grid-bg -z-10 bg-background"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] opacity-40"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md px-4"
            >
                <Card className="p-8 tech-card border-primary/20 shadow-2xl shadow-primary/10 backdrop-blur-xl bg-background/60 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold tracking-tight mb-2 font-mono">Welcome Back</h1>
                        <p className="text-muted-foreground">Sign in to your EasyMoveZone account</p>
                    </div>

                    <form className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none" htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                className="flex h-12 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:border-primary/50 focus:border-primary"
                                placeholder="m@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium leading-none" htmlFor="password">Password</label>
                                <Link href="#" className="text-sm font-medium text-primary hover:underline hover:text-primary/80 transition-colors">Forgot password?</Link>
                            </div>
                            <input
                                id="password"
                                type="password"
                                className="flex h-12 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:border-primary/50 focus:border-primary"
                            />
                        </div>

                        <Button className="w-full h-12 text-lg font-semibold mt-4 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">Sign In</Button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-muted"></span></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or continue with</span></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" type="button" className="hover:bg-primary/5 hover:border-primary/30">Google</Button>
                            <Button variant="outline" type="button" className="hover:bg-primary/5 hover:border-primary/30">GitHub</Button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted-foreground">Don&apos;t have an account? </span>
                        <Link href="/register" className="font-semibold text-primary hover:underline">
                            Sign up
                        </Link>
                    </div>
                </Card>
            </motion.div>
        </div>
    )
}

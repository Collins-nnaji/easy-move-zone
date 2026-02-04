"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, X, Globe } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false)
    const [scrolled, setScrolled] = React.useState(false)

    React.useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const navigation = [
        { name: "How it Works", href: "/#how-it-works" },
        { name: "Services", href: "/services" },
        { name: "Destinations", href: "/countries" },
        { name: "Resources", href: "/resources" },
    ]

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={cn(
                "fixed top-0 z-50 w-full transition-all duration-300",
                scrolled
                    ? "glass"
                    : "bg-transparent py-4"
            )}
        >
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group" onClick={() => setIsMenuOpen(false)}>
                        {/* Using Next.js Image for the logo. Ensure 'public/logo.png' exists. */}
                        <div className="relative h-10 w-40 overflow-hidden">
                            <img
                                src="/EMZ_1 1.png"
                                alt="EasyMoveZone"
                                className="object-contain h-full w-full"
                            />
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex md:gap-8 items-center">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="text-sm font-bold text-foreground/80 transition-colors hover:text-primary"
                            >
                                {item.name}
                            </Link>
                        ))}
                        <Link href="/tools" className="text-sm font-bold text-foreground/80 transition-colors hover:text-primary">
                            Tools
                        </Link>
                    </nav>

                    {/* Desktop CTA */}
                    <div className="hidden items-center gap-4 md:flex">
                        <Link href="/login">
                            <span className="text-sm font-medium text-muted-foreground hover:text-primary">
                                Log in
                            </span>
                        </Link>
                        <Link href="/register">
                            <Button size="sm">Get Started</Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-md p-2.5 text-foreground"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMenuOpen ? (
                                <X className="h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Menu className="h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden glass border-b border-border"
                    >
                        <div className="space-y-1 px-4 pb-4 pt-2">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <div className="mt-4 flex flex-col gap-2 pt-4 border-t border-border">
                                <Button variant="ghost" className="w-full justify-start">Log in</Button>
                                <Button className="w-full">Get Started</Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    )
}

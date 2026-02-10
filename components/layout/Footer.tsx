import Link from "next/link"
import { Shield } from "lucide-react"

export function Footer() {
    const navigation = {
        marketplace: [
            { name: 'Buy Property', href: '#' },
            { name: 'Rent Apartment', href: '#' },
            { name: 'Shortlet Stays', href: '#' },
            { name: 'Commercial', href: '#' },
        ],
        trust: [
            { name: 'Verification Process', href: '#' },
            { name: 'Escrow Service', href: '#' },
            { name: 'Agent Vetting', href: '#' },
        ],
        company: [
            { name: 'About Us', href: '#' },
            { name: 'Careers', href: '#' },
            { name: 'Press', href: '#' },
        ],
        legal: [
            { name: 'Privacy Policy', href: '#' },
            { name: 'Terms of Service', href: '#' },
        ],
    }

    return (
        <footer className="bg-muted/20 border-t border-border" aria-labelledby="footer-heading">
            <h2 id="footer-heading" className="sr-only">
                Footer
            </h2>
            <div className="container mx-auto px-4 pb-8 pt-16 md:px-6 lg:pt-24">
                <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Shield className="h-6 w-6 text-primary" />
                            <span className="text-xl font-bold tracking-tight text-foreground">
                                EasyMoveZone
                            </span>
                        </div>
                        <p className="text-sm leading-6 text-muted-foreground max-w-sm">
                            The trust-first real estate platform. We verify every listing so you can move with confidence.
                        </p>
                    </div>
                    <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                <h3 className="text-sm font-semibold leading-6 text-foreground">Marketplace</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    {navigation.marketplace.map((item) => (
                                        <li key={item.name}>
                                            <a href={item.href} className="text-sm leading-6 text-muted-foreground hover:text-primary transition-colors">
                                                {item.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mt-10 md:mt-0">
                                <h3 className="text-sm font-semibold leading-6 text-foreground">Trust & Safety</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    {navigation.trust.map((item) => (
                                        <li key={item.name}>
                                            <a href={item.href} className="text-sm leading-6 text-muted-foreground hover:text-primary transition-colors">
                                                {item.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                <h3 className="text-sm font-semibold leading-6 text-foreground">Company</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    {navigation.company.map((item) => (
                                        <li key={item.name}>
                                            <a href={item.href} className="text-sm leading-6 text-muted-foreground hover:text-primary transition-colors">
                                                {item.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mt-10 md:mt-0">
                                <h3 className="text-sm font-semibold leading-6 text-foreground">Legal</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    {navigation.legal.map((item) => (
                                        <li key={item.name}>
                                            <a href={item.href} className="text-sm leading-6 text-muted-foreground hover:text-primary transition-colors">
                                                {item.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-16 border-t border-border pt-8 sm:mt-20 lg:mt-24">
                    <p className="text-xs leading-5 text-muted-foreground">&copy; {new Date().getFullYear()} EasyMoveZone, Inc. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}

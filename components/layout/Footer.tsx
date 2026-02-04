import Link from "next/link"
import { Globe } from "lucide-react"

export function Footer() {
    const navigation = {
        solutions: [
            { name: 'Migration', href: '/services' },
            { name: 'Relocation', href: '/services' },
            { name: 'Corporate', href: '/services' },
            { name: 'Families', href: '/services' },
        ],
        support: [
            { name: 'Guides', href: '/resources' },
            { name: 'API Status', href: '#' },
            { name: 'Contact', href: '/contact' },
        ],
        company: [
            { name: 'About', href: '/about' },
            { name: 'Blog', href: '#' },
            { name: 'Jobs', href: '#' },
            { name: 'Partners', href: '#' },
        ],
        legal: [
            { name: 'Privacy', href: '#' },
            { name: 'Terms', href: '#' },
        ],
    }

    return (
        <footer className="bg-muted/30 border-t border-border" aria-labelledby="footer-heading">
            <h2 id="footer-heading" className="sr-only">
                Footer
            </h2>
            <div className="container mx-auto px-4 pb-8 pt-16 md:px-6 lg:pt-24">
                <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Globe className="h-6 w-6 text-primary" />
                            <span className="text-xl font-bold tracking-tight text-foreground">
                                EasyMoveZone
                            </span>
                        </div>
                        <p className="text-sm leading-6 text-muted-foreground max-w-sm">
                            Helping people move countries with clarity, transparency, and long-term support. Your trusted partner in global mobility.
                        </p>
                        <div className="flex space-x-6">
                            {/* Social placeholders */}
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <span className="sr-only">Facebook</span>
                                <span className="h-6 w-6">FB</span>
                            </a>
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <span className="sr-only">Twitter</span>
                                <span className="h-6 w-6">TW</span>
                            </a>
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <span className="sr-only">LinkedIn</span>
                                <span className="h-6 w-6">LI</span>
                            </a>
                        </div>
                    </div>
                    <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                <h3 className="text-sm font-semibold leading-6 text-foreground">Solutions</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    {navigation.solutions.map((item) => (
                                        <li key={item.name}>
                                            <a href={item.href} className="text-sm leading-6 text-muted-foreground hover:text-primary transition-colors">
                                                {item.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mt-10 md:mt-0">
                                <h3 className="text-sm font-semibold leading-6 text-foreground">Support</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    {navigation.support.map((item) => (
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

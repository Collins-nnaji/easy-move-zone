import Link from "next/link"
import { Zap, MapPin } from "lucide-react"

export function Footer() {
  const navigation = {
    product: [
      { name: "Get assessed", href: "/qualify" },
      { name: "Process", href: "/how-it-works" },
      { name: "Fees", href: "/fees" },
      { name: "Destinations", href: "/destinations" },
      { name: "Dashboard", href: "/dashboard" },
    ],
    markets: [
      { name: "Lagos", href: "#" },
      { name: "Abuja", href: "#" },
      { name: "Port Harcourt", href: "#" },
      { name: "Enugu (coming)", href: "#" },
    ],
    company: [
      { name: "About EMZ", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Press", href: "#" },
    ],
    legal: [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "FMBN Licensing", href: "#" },
    ],
  }

  return (
    <footer className="bg-muted/20 border-t border-border" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      <div className="max-w-7xl mx-auto px-6 pb-8 pt-16 md:px-10">
        <div className="xl:grid xl:grid-cols-5 xl:gap-8">
          {/* Brand column */}
          <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">EasyMoveZone</span>
            </div>
            <p className="text-sm leading-6 text-muted-foreground max-w-xs">
              Relocation consultancy from Nigeria. We assess candidates and guide you from start to finish. Transparent process and fees.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              Lagos · Abuja · Port Harcourt
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-secondary inline-block" />
              FMBN Licensed · PENCOM Registered · SEC Compliant · CBN Regulated Partner
            </div>
          </div>

          {/* Link columns */}
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-3 xl:mt-0 md:grid-cols-4 md:gap-6">
            <div>
              <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Product</h3>
              <ul className="mt-5 space-y-3">
                {navigation.product.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Markets</h3>
              <ul className="mt-5 space-y-3">
                {navigation.markets.map((item) => (
                  <li key={item.name}>
                    <a href={item.href} className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Company</h3>
              <ul className="mt-5 space-y-3">
                {navigation.company.map((item) => (
                  <li key={item.name}>
                    <a href={item.href} className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Legal</h3>
              <ul className="mt-5 space-y-3">
                {navigation.legal.map((item) => (
                  <li key={item.name}>
                    <a href={item.href} className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-start gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} EasyMoveZone Nigeria Ltd. RC 1234567. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground max-w-sm text-right">
            We assess candidates and provide start-to-finish guidance. Fees are transparent and confirmed before you commit.
          </p>
        </div>
      </div>
    </footer>
  )
}

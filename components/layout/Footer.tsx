import Link from "next/link"
import { Zap, MapPin } from "lucide-react"

export function Footer() {
  const navigation = {
    product: [
      { name: "Public Services", href: "/services" },
      { name: "Pricing Plans", href: "/pricing" },
      { name: "City Index", href: "/index" },
      { name: "About Us", href: "/about" },
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
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/15 border border-black/15">
                <Zap className="w-3.5 h-3.5 text-black" />
              </div>
              <span className="text-lg font-bold tracking-tight">EasyMoveZone</span>
            </div>
            <p className="text-sm leading-6 text-muted-foreground max-w-xs">
              AI-powered document processing support and travel/relocation tools platform for work, study, business, and global movement planning.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              Lagos · Abuja · Port Harcourt
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-secondary inline-block" />
              From decision to settlement
            </div>
          </div>

        </div>

        <div className="mt-16 border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-start gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} EasyMoveZone Nigeria Ltd. RC 1234567. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground max-w-sm text-right">
            Landing page intro plus a practical suite workspace for assessment, document support, and relocation planning.
          </p>
        </div>

        {/* Compliance disclaimer */}
        <div className="mt-8 border-t border-border/50 pt-6">
          <p className="text-[11px] leading-relaxed text-muted-foreground/70 max-w-4xl">
            <strong className="text-muted-foreground">Disclaimer:</strong> EasyMoveZone provides migration advisory, strategic planning, and relocation support services. We do not provide regulated immigration legal advice or act as direct visa representatives. For UK immigration matters regulated by the Office of the Immigration Services Commissioner (OISC), and Canadian applications requiring a licensed Regulated Canadian Immigration Consultant (RCIC), we refer clients to our licensed partner professionals. All visa and immigration decisions are made solely by the relevant government immigration authorities.
          </p>
        </div>
      </div>
    </footer>
  )
}

import Link from "next/link"
import { BRAND } from "@/lib/brand"

const LINKS = [
  { href: "/cars", label: "Cars" },
  { href: "/parts", label: "Parts" },
  { href: "/garages", label: "Garages" },
  { href: "/sell", label: "Sell" },
  { href: "/contact", label: "Contact" },
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/privacy", label: "Privacy" },
]

export function PlatformFooter() {
  return (
    <footer id="contact" className="relative z-[45] border-t border-[#e4dfd5] bg-[#1b231e] text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="text-[11px] text-white/55">© {new Date().getFullYear()} {BRAND.name}</p>
        <nav className="flex flex-wrap gap-x-4 gap-y-1">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-[11px] font-semibold text-white/70 hover:text-white">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}

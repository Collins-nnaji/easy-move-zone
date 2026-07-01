"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, LayoutGrid, MapPin, Users } from "lucide-react"
import { clsx } from "clsx"

const NAV = [
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/visa-templates", label: "Visa templates", icon: BookOpen },
  { href: "/admin/embassies", label: "Embassies", icon: MapPin },
] as const

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#0b0f17] text-white">
      <header className="border-b border-white/10 bg-[#0b0f17]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <LayoutGrid className="h-5 w-5 text-[#e0511f]" />
            <div>
              <p className="text-sm font-bold">EasyMoveZone Admin</p>
              <p className="text-[11px] text-white/40">Operational tooling</p>
            </div>
          </div>
          <Link href="/visa" className="text-xs font-semibold text-white/60 hover:text-white">
            ← Back to app
          </Link>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-3 sm:px-6">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold whitespace-nowrap transition",
                  active ? "bg-white text-[#0f172a]" : "text-white/60 hover:bg-white/10 hover:text-white",
                )}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </header>
      <main>{children}</main>
    </div>
  )
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BadgeCheck, Briefcase, LayoutGrid, Users } from "lucide-react"
import { clsx } from "clsx"

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutGrid },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
  { href: "/admin/users", label: "Users", icon: Users },
] as const

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#0b0f17] text-white">
      <header className="border-b border-white/10 bg-[#0b0f17]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <BadgeCheck className="h-5 w-5 text-[#e0511f]" />
            <div>
              <p className="text-sm font-bold">EasyMoveZone Admin</p>
              <p className="text-[11px] text-white/40">Jobs, users</p>
            </div>
          </div>
          <Link href="/" className="text-xs font-semibold text-white/60 hover:text-white">
            ← Back to app
          </Link>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-3 sm:px-6">
          {NAV.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                  active ? "bg-[#e0511f] text-white" : "text-white/60 hover:bg-white/5 hover:text-white",
                )}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </header>
      {children}
    </div>
  )
}

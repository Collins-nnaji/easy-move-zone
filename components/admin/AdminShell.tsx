"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Building2, Users, Truck, ShieldCheck,
  BarChart3, Home, ArrowLeft,
} from "lucide-react"
import { clsx } from "clsx"

const navItems = [
  { href: "/admin/listings", label: "Listings",  icon: Building2      },
  { href: "/admin/users",    label: "Users",     icon: Users          },
  { href: "/admin/vendors",  label: "Vendors",   icon: Truck          },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-white/10 flex flex-col p-5 sticky top-0 h-screen">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="h-8 w-8 rounded-xl bg-[#E85C2D] flex items-center justify-center shrink-0">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="block text-sm font-bold text-white leading-none">Admin</span>
            <span className="block text-[10px] text-white/50 mt-0.5">EasyMoveZone</span>
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/")
            return (
              <Link key={href} href={href}
                className={clsx(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:bg-white/5 hover:text-white/80"
                )}>
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-white/10 pt-4 flex flex-col gap-2">
          <Link href="/dashboard"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/50 hover:bg-white/5 hover:text-white/80 transition-all">
            <Home className="h-4 w-4 shrink-0" />
            User dashboard
          </Link>
          <Link href="/"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/50 hover:bg-white/5 hover:text-white/80 transition-all">
            <ArrowLeft className="h-4 w-4 shrink-0" />
            Back to site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 overflow-auto">
        {children}
      </div>
    </div>
  )
}

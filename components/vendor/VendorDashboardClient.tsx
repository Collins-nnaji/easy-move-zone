"use client"

import Link from "next/link"
import { useState } from "react"
import {
  Truck, Plus, Star, Eye, MessageSquare, TrendingUp,
  CheckCircle2, Clock, XCircle, MoreHorizontal, LayoutDashboard,
  User, Building2,
} from "lucide-react"
import { clsx } from "clsx"

const navItems = [
  { href: "/vendor",     label: "Services",  icon: Truck,          active: true  },
  { href: "/dashboard",  label: "Overview",  icon: LayoutDashboard, active: false },
  { href: "/profile",    label: "Profile",   icon: User,           active: false  },
]

const services = [
  { id: 1, name: "Full Home Removals",     status: "live",    price: "£350+", enquiries: 12, views: 248, rating: 4.8 },
  { id: 2, name: "Packing & Unpacking",    status: "live",    price: "£120+", enquiries: 7,  views: 143, rating: 4.6 },
  { id: 3, name: "International Shipping", status: "pending", price: "Quote", enquiries: 0,  views: 0,   rating: 0   },
]

const statusBadge: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  live:    { label: "Live",    className: "bg-emerald-100 text-emerald-800", icon: CheckCircle2 },
  pending: { label: "Pending", className: "bg-amber-100 text-amber-800",    icon: Clock        },
  draft:   { label: "Draft",   className: "bg-slate-100 text-slate-600",    icon: XCircle      },
}

const enquiries = [
  { name: "Amara O.",  service: "Full Home Removals",     date: "Today",     note: "3-bed house, Manchester to London" },
  { name: "Femi K.",   service: "Full Home Removals",     date: "Yesterday", note: "1-bed flat, same city"             },
  { name: "Chloe M.",  service: "Packing & Unpacking",    date: "2 days ago", note: "Full pack, next week"            },
]

export function VendorDashboardClient() {
  const [tab, setTab] = useState<"services" | "enquiries">("services")

  return (
    <div className="relo-app-shell">
      {/* Sidebar */}
      <aside id="relo-app-sidebar" className="relo-app-sidebar">
        <div className="flex items-center gap-2 px-2 mb-6 sm:mb-8">
          <div className="w-7 h-7 rounded-lg bg-[#E85C2D] flex items-center justify-center shrink-0">
            <Truck className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-display font-bold text-[15px] text-[#1A1612]">vendor</span>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}
                className={`relo-sidebar-nav-item ${item.active ? "!bg-[rgba(232,92,45,0.1)] !text-[#E85C2D] !font-semibold" : ""}`}>
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-8 pt-6 border-t border-[#E4DFDA] flex flex-col gap-3">
          {[
            ["Active services", "2"],
            ["Total enquiries", "19"],
            ["Avg. rating", "4.7 ★"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between items-center">
              <span className="text-xs text-[#6B6460]">{k}</span>
              <span className="text-sm font-bold text-[#1A1612]">{v}</span>
            </div>
          ))}
        </div>

        <Link href="/vendor/post"
          className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-[#E85C2D] py-3 text-sm font-semibold text-white hover:bg-[#D44E22] transition-colors">
          <Plus className="h-4 w-4" />
          Post service
        </Link>
      </aside>

      {/* Main */}
      <main className="relo-app-main">
        {/* Page header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#1A1612]">Vendor dashboard</h1>
            <p className="text-sm text-[#6B6460] mt-1">Manage your services and enquiries</p>
          </div>
          <Link href="/vendor/post"
            className="hidden sm:flex items-center gap-2 rounded-xl bg-[#E85C2D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#D44E22] transition-colors">
            <Plus className="h-4 w-4" />
            Post service
          </Link>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Active services", value: "2", icon: Truck,       color: "text-[#E85C2D]" },
            { label: "Total views",     value: "391", icon: Eye,        color: "text-[#4A7C59]" },
            { label: "Enquiries",       value: "19", icon: MessageSquare, color: "text-[#0033A1]" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl border border-[#E4DFDA] bg-white p-5">
              <Icon className={`h-5 w-5 ${color} mb-3`} />
              <div className="text-2xl font-bold text-[#1A1612]">{value}</div>
              <div className="text-xs text-[#6B6460] mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 rounded-2xl bg-[#F7F5F0] p-1 w-fit">
          {(["services", "enquiries"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={clsx("rounded-xl px-5 py-2 text-sm font-semibold capitalize transition-all",
                tab === t ? "bg-white text-[#1A1612] shadow-sm" : "text-[#6B6460] hover:text-[#1A1612]"
              )}>
              {t}
            </button>
          ))}
        </div>

        {/* Services tab */}
        {tab === "services" && (
          <div className="space-y-4">
            {services.map((svc) => {
              const badge = statusBadge[svc.status]
              const BadgeIcon = badge.icon
              return (
                <div key={svc.id} className="rounded-2xl border border-[#E4DFDA] bg-white p-5 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F0EDE8] shrink-0">
                    <Truck className="h-5 w-5 text-[#E85C2D]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-[#1A1612] text-sm truncate">{svc.name}</span>
                      <span className={clsx("flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0", badge.className)}>
                        <BadgeIcon className="h-2.5 w-2.5" />{badge.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#6B6460]">
                      <span className="font-semibold text-[#E85C2D]">{svc.price}</span>
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{svc.views}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{svc.enquiries}</span>
                      {svc.rating > 0 && <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-400" />{svc.rating}</span>}
                    </div>
                  </div>
                  <button className="shrink-0 rounded-xl border border-[#E4DFDA] p-2 text-[#6B6460] hover:bg-[#F7F5F0] transition-colors">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              )
            })}

            <Link href="/vendor/post"
              className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#E4DFDA] py-8 text-sm font-semibold text-[#9B8F87] hover:border-[#E85C2D]/50 hover:text-[#E85C2D] transition-all">
              <Plus className="h-4 w-4" />
              Add another service
            </Link>
          </div>
        )}

        {/* Enquiries tab */}
        {tab === "enquiries" && (
          <div className="space-y-4">
            {enquiries.map((enq, i) => (
              <div key={i} className="rounded-2xl border border-[#E4DFDA] bg-white p-5 flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#E85C2D] to-[#D44E22] text-white shrink-0 text-sm font-bold">
                  {enq.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-semibold text-[#1A1612] text-sm">{enq.name}</span>
                    <span className="text-xs text-[#9B8F87]">{enq.date}</span>
                  </div>
                  <p className="text-xs text-[#6B6460] mb-1">{enq.service}</p>
                  <p className="text-xs text-[#9B8F87]">{enq.note}</p>
                </div>
                <button className="shrink-0 rounded-xl bg-[#E85C2D]/10 px-3 py-1.5 text-xs font-semibold text-[#E85C2D] hover:bg-[#E85C2D]/20 transition-colors">
                  Reply
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

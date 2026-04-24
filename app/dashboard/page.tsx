import { redirect } from "next/navigation"
import { authServer } from "@/lib/auth/server"
import Link from "next/link"
import { PublicShell } from "@/components/platform/PublicShell"
import {
  Sprout,
  Truck,
  Package,
  TrendingUp,
  Bell,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3,
  Settings,
  Plus,
  Eye,
} from "lucide-react"

const myListings = [
  { id: "p1", crop: "Maize (white)", quantity: "5 tonnes", state: "Kaduna", status: "active", price: "₦420/kg", views: 34 },
  { id: "p2", crop: "Sorghum", quantity: "2 tonnes", state: "Kano", status: "pending", price: "₦380/kg", views: 0 },
]

const myShipments = [
  { id: "SHP-0041", crop: "Maize — 5 tonnes", from: "Kaduna", to: "Lagos", status: "in_transit" as const, eta: "Apr 22" },
  { id: "SHP-0038", crop: "Tomatoes — 80 crates", from: "Benue", to: "Abuja", status: "delivered" as const, eta: "Delivered" },
]

const marketHighlights = [
  { crop: "Maize", price: "₦42,000/100kg", trend: "up" },
  { crop: "Tomatoes", price: "₦28,500/crate", trend: "down" },
  { crop: "Yam", price: "₦1,200/tuber", trend: "up" },
]

const notifications = [
  { id: "n1", message: "Transporter assigned to SHP-0041 — Musa Logistics", time: "2 hours ago", read: false },
  { id: "n2", message: "Buyer enquiry on your Maize listing in Kaduna", time: "5 hours ago", read: false },
  { id: "n3", message: "Maize price up 3.2% at Kano Dawanau market", time: "1 day ago", read: true },
]

const statusConfig = {
  in_transit: { label: "In transit", color: "text-emerald-700", bg: "bg-emerald-50", icon: Truck },
  delivered: { label: "Delivered", color: "text-slate-600", bg: "bg-slate-100", icon: CheckCircle2 },
  pending: { label: "Awaiting pickup", color: "text-amber-700", bg: "bg-amber-50", icon: Clock },
  issue: { label: "Issue", color: "text-red-700", bg: "bg-red-50", icon: AlertCircle },
}

export default async function AgroDashboardPage() {
  const session = await authServer.getSession()
  if (!session?.data?.user) redirect("/auth?redirect=/dashboard")
  const { user } = session.data
  const displayName = user.name || user.email?.split("@")[0] || "there"

  return (
    <PublicShell>
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f6f8fb] via-white to-[#ecf5f1]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-32 top-16 h-[420px] w-[420px] rounded-full bg-emerald-200/40 blur-[120px]" />
          <div className="absolute -left-32 bottom-0 h-[360px] w-[360px] rounded-full bg-blue-200/30 blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Command center
              </p>
              <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
                Welcome back, {displayName}
              </h1>
              <p className="mt-1 text-sm text-slate-500">Your agro logistics hub — listings, shipments, and prices.</p>
            </div>
            <Link
              href="/produce/list"
              className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-200/70 transition hover:bg-emerald-500 hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" />
              New listing
            </Link>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
            {[
              { icon: Sprout, label: "Active listings", value: myListings.filter((l) => l.status === "active").length, color: "bg-emerald-100 text-emerald-700" },
              { icon: Truck, label: "Shipments", value: myShipments.length, color: "bg-amber-100 text-amber-700" },
              { icon: Package, label: "Delivered", value: myShipments.filter((s) => s.status === "delivered").length, color: "bg-blue-100 text-blue-700" },
              { icon: Bell, label: "Unread alerts", value: notifications.filter((n) => !n.read).length, color: "bg-red-100 text-red-700" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl ${s.color}`}>
                  <s.icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div className="text-2xl font-bold text-slate-900">{s.value}</div>
                <div className="mt-0.5 text-xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">

              {/* My Produce Listings */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-bold text-slate-900">My produce listings</h2>
                  <Link href="/produce/list" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:underline">
                    <Plus className="h-3.5 w-3.5" /> New <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {myListings.map((l) => (
                    <div key={l.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <div className="flex items-start gap-3">
                        <Sprout className="mt-0.5 h-5 w-5 text-emerald-500 shrink-0" strokeWidth={1.75} />
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{l.crop}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {l.state} · {l.quantity} · {l.price}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${l.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          {l.status}
                        </span>
                        {l.status === "active" && (
                          <span className="flex items-center gap-1 text-[11px] text-slate-400">
                            <Eye className="h-3 w-3" /> {l.views} views
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipments */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-bold text-slate-900">Active shipments</h2>
                  <Link href="/shipments" className="text-sm font-semibold text-emerald-600 hover:underline flex items-center gap-1">
                    All shipments <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {myShipments.map((s) => {
                    const cfg = statusConfig[s.status]
                    return (
                      <Link key={s.id} href="/shipments" className="flex items-center justify-between rounded-xl border border-slate-100 p-4 transition hover:shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 rounded-lg p-1.5 ${cfg.bg}`}>
                            <cfg.icon className={`h-4 w-4 ${cfg.color}`} strokeWidth={1.75} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-400">{s.id}</p>
                            <p className="text-sm font-semibold text-slate-800">{s.crop}</p>
                            <p className="text-xs text-slate-500">{s.from} → {s.to}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                          <p className="mt-1 text-[11px] text-slate-400">ETA {s.eta}</p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Market prices */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    Market prices
                  </h3>
                  <Link href="/price-board" className="text-xs font-semibold text-blue-600 hover:underline">Full board</Link>
                </div>
                <div className="space-y-2">
                  {marketHighlights.map((m) => (
                    <div key={m.crop} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                      <span className="text-sm text-slate-700">{m.crop}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-900">{m.price}</span>
                        <TrendingUp className={`h-3.5 w-3.5 ${m.trend === "up" ? "text-emerald-500" : "text-red-400 rotate-180"}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notifications */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-1.5">
                  <Bell className="h-4 w-4 text-amber-500" />
                  Alerts
                </h3>
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div key={n.id} className={`rounded-lg p-3 ${n.read ? "bg-white" : "bg-emerald-50 border border-emerald-100"}`}>
                      <p className="text-xs leading-relaxed text-slate-700">{n.message}</p>
                      <p className="mt-1 text-[11px] text-slate-400">{n.time}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick links */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1">
                <Link href="/produce" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                  <Sprout className="h-4 w-4 text-emerald-500" /> Browse produce market
                </Link>
                <Link href="/transporters" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                  <Truck className="h-4 w-4 text-amber-500" /> Find transporters
                </Link>
                <Link href="/price-board" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                  <BarChart3 className="h-4 w-4 text-blue-500" /> Price board
                </Link>
                <Link href="/profile" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                  <Settings className="h-4 w-4 text-slate-400" /> Settings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicShell>
  )
}

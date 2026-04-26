import { redirect } from "next/navigation"
import { authServer } from "@/lib/auth/server"
import Link from "next/link"
import { PublicShell } from "@/components/platform/PublicShell"
import {
  Heart,
  FileText,
  MessageSquare,
  Bell,
  Folder,
  ArrowRight,
  MapPin,
  TrendingUp,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  Home,
  Settings,
  BadgeCheck,
  Eye,
} from "lucide-react"

const savedProperties = [
  { id: "1", title: "Verified 800sqm Plot — Lekki Phase 2", city: "Lagos", price: "₦85M", status: "verified", gradient: "linear-gradient(135deg, #0a1628, #1a4a7a)" },
  { id: "2", title: "Title-Clear 3BR Detached — Maitama", city: "Abuja", price: "₦120M", status: "verified", gradient: "linear-gradient(135deg, #0a2818, #1a6a4a)" },
  { id: "5", title: "4BR Semi-Detached — Gwarinpa", city: "Abuja", price: "₦75M", status: "verified", gradient: "linear-gradient(135deg, #0a2828, #1a6a6a)" },
]

const transactions = [
  { id: "t1", property: "800sqm Plot — Lekki Phase 2", status: "in-progress", amount: "₦85,000,000", date: "March 15, 2026" },
]

const notifications = [
  { id: "n1", message: "Your enquiry on Lekki Phase 2 plot received a response", time: "2 hours ago", read: false },
  { id: "n2", message: "New verified listing in Ikoyi matches your search", time: "1 day ago", read: false },
  { id: "n3", message: "Verification complete for your saved property in Maitama", time: "3 days ago", read: true },
]

const documents = [
  { name: "Purchase Agreement — Lekki Plot", type: "PDF", date: "March 15, 2026" },
  { name: "Due Diligence Report — Maitama House", type: "PDF", date: "March 10, 2026" },
  { name: "Payment Receipt — Initial Deposit", type: "PDF", date: "March 16, 2026" },
]

const txStatusConfig: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
  "in-progress": { color: "#d97706", icon: Clock },
  "completed": { color: "#059669", icon: CheckCircle2 },
  "initiated": { color: "#155eef", icon: Circle },
  "cancelled": { color: "#dc2626", icon: AlertCircle },
}

export default async function BuyerDashboardPage() {
  const session = await authServer.getSession()
  if (!session?.data?.user) redirect("/auth?redirect=/dashboard")
  const { user } = session.data
  const displayName = user.name || user.email?.split("@")[0] || "there"

  return (
    <PublicShell>
      <div className="min-h-screen bg-[#f6f8fb]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a]">Welcome back, {displayName}</h1>
              <p className="mt-1 text-sm text-[#64748b]">Your buyer dashboard — saved properties, transactions, and documents.</p>
            </div>
            <Link href="/search" className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-[#155eef] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1249d1]">
              Browse Properties
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
            {[
              { icon: Heart, label: "Saved", value: savedProperties.length, color: "#dc2626" },
              { icon: FileText, label: "Transactions", value: transactions.length, color: "#155eef" },
              { icon: Folder, label: "Documents", value: documents.length, color: "#7c3aed" },
              { icon: Bell, label: "Notifications", value: notifications.filter((n) => !n.read).length, color: "#d97706" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-[#e2e8f0] bg-white p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: s.color + "10", color: s.color }}>
                    <s.icon className="h-4.5 w-4.5" />
                  </div>
                </div>
                <div className="font-[var(--font-playfair)] text-2xl font-bold text-[#0f172a]">{s.value}</div>
                <div className="text-xs text-[#64748b]">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Saved Properties */}
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-[#0f172a]">Saved Properties</h2>
                  <Link href="/search" className="text-sm font-semibold text-[#155eef] hover:underline flex items-center gap-1">
                    Browse more <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {savedProperties.map((p) => (
                    <Link key={p.id} href={`/properties/${p.id}`} className="flex items-center gap-4 rounded-xl border border-[#e2e8f0] p-3 transition-all hover:shadow-sm hover:border-[#155eef]/20">
                      <div className="h-16 w-20 rounded-lg flex-shrink-0" style={{ background: p.gradient }} />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[#0f172a] text-sm truncate">{p.title}</div>
                        <div className="text-xs text-[#64748b] flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{p.city}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-[#0f172a] text-sm">{p.price}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <BadgeCheck className="h-3 w-3 text-[#059669]" />
                          <span className="text-[11px] text-[#059669] font-semibold">Verified</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Transaction Tracker */}
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6">
                <h2 className="text-lg font-bold text-[#0f172a] mb-5">Transaction Tracker</h2>
                {transactions.length === 0 ? (
                  <p className="text-sm text-[#64748b]">No transactions yet.</p>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((tx) => {
                      const cfg = txStatusConfig[tx.status] ?? txStatusConfig["initiated"]
                      return (
                        <div key={tx.id} className="rounded-xl border border-[#e2e8f0] p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-[#0f172a] text-sm">{tx.property}</div>
                              <div className="text-xs text-[#64748b] mt-0.5">{tx.date}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-[#0f172a] text-sm">{tx.amount}</div>
                              <div className="flex items-center gap-1 mt-0.5">
                                <cfg.icon className="h-3 w-3" style={{ color: cfg.color }} />
                                <span className="text-[11px] font-semibold" style={{ color: cfg.color }}>{tx.status.replace("-", " ")}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Document Vault */}
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6">
                <h2 className="text-lg font-bold text-[#0f172a] mb-5">Document Vault</h2>
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.name} className="flex items-center justify-between rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-[#155eef]" />
                        <div>
                          <div className="text-sm font-medium text-[#0f172a]">{doc.name}</div>
                          <div className="text-xs text-[#94a3b8]">{doc.date}</div>
                        </div>
                      </div>
                      <span className="rounded-full bg-[#f1f5f9] px-2.5 py-0.5 text-[11px] font-semibold text-[#475569]">{doc.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Notifications */}
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6">
                <h3 className="text-sm font-bold text-[#0f172a] mb-4">Notifications</h3>
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div key={n.id} className={`rounded-lg p-3 text-sm ${n.read ? "bg-white" : "bg-[#eff6ff] border border-[#155eef]/10"}`}>
                      <p className="text-[#0f172a] text-xs leading-relaxed">{n.message}</p>
                      <p className="text-[11px] text-[#94a3b8] mt-1">{n.time}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 space-y-2">
                <Link href="/profile" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]">
                  <Settings className="h-4 w-4" /> Account Settings
                </Link>
                <Link href="/search" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]">
                  <Home className="h-4 w-4" /> Browse Properties
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicShell>
  )
}

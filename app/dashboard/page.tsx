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
  { id: "prop-001", title: "3-Bed Detached Home, Lekki Phase 1", city: "Lagos", price: "₦85,000,000", gradient: "linear-gradient(135deg,#0072CE22,#00C6FF22)" },
  { id: "prop-002", title: "4-Bed Semi-Detached, Maitama", city: "Abuja", price: "₦120,000,000", gradient: "linear-gradient(135deg,#7c3aed22,#a78bfa22)" },
  { id: "prop-003", title: "2-Bed Apartment, Ikeja GRA", city: "Lagos", price: "₦42,500,000", gradient: "linear-gradient(135deg,#05966922,#34d39922)" },
]

const transactions = [
  { id: "tx-001", property: "3-Bed Detached Home, Lekki Phase 1", date: "12 May 2025", amount: "₦85,000,000", status: "in-progress" },
  { id: "tx-002", property: "Land Purchase — Epe Corridor", date: "3 Feb 2025", amount: "₦18,000,000", status: "completed" },
  { id: "tx-003", property: "2-Bed Apartment, Ikeja GRA", date: "28 Jan 2025", amount: "₦42,500,000", status: "initiated" },
]

const equityDeals = [
  { id: "eq-001", property: "4-Bed Semi-Detached, Maitama", totalValue: "₦120,000,000", equityOwned: 35, ownedValue: "₦42,000,000", nextBuyout: "Jan 2026" },
  { id: "eq-002", property: "Commercial Unit, Victoria Island", totalValue: "₦200,000,000", equityOwned: 15, ownedValue: "₦30,000,000", nextBuyout: "Jun 2026" },
]

const activeBuilds = [
  { id: "bld-001", property: "3-Bed Bungalow — Lugbe, Abuja", estHandover: "Q4 2025", currentPhase: "Brickwork", progress: 45 },
  { id: "bld-002", property: "Duplex — Sangotedo, Lagos", estHandover: "Q1 2026", currentPhase: "Foundation", progress: 18 },
]

const notifications = [
  { id: "n-001", message: "Your offer on Lekki Phase 1 property has been accepted. Proceed to payment to secure the property.", time: "2 hours ago", read: false },
  { id: "n-002", message: "Build update: Brickwork phase on your Lugbe property is 45% complete.", time: "Yesterday", read: false },
  { id: "n-003", message: "Document request: Please upload your proof of funds for the Maitama transaction.", time: "3 days ago", read: true },
]

const documents = [
  { name: "Certificate of Occupancy — Lekki Phase 1", date: "12 May 2025", type: "C of O" },
  { name: "Sale Agreement — Ikeja GRA Apartment", date: "28 Jan 2025", type: "Agreement" },
  { name: "Survey Plan — Lugbe Build Plot", date: "10 Dec 2024", type: "Survey" },
  { name: "NHF Pre-Approval Letter", date: "5 Nov 2024", type: "Finance" },
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
                  {savedProperties.length === 0 ? (
                    <div className="py-8 text-center text-sm text-[#64748b]">No saved properties yet.</div>
                  ) : (
                    savedProperties.map((p) => (
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
                    ))
                  )}
                </div>
              </div>

              {/* Shared Ownership (Equity Tracker) */}
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6">
                <h2 className="text-lg font-bold text-[#0f172a] mb-5">Shared Ownership Tracker</h2>
                <div className="space-y-4">
                  {equityDeals.length === 0 ? (
                    <div className="py-8 text-center text-sm text-[#64748b]">No active equity allocations.</div>
                  ) : (
                    equityDeals.map((deal) => (
                      <div key={deal.id} className="rounded-xl border border-[#e2e8f0] p-4 bg-[#f8fafc]">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="font-semibold text-[#0f172a] text-sm">{deal.property}</div>
                            <div className="text-xs text-[#64748b] mt-0.5">Total Value: {deal.totalValue}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-medium text-slate-500">Next Buyout Window</div>
                            <div className="text-xs font-bold text-[#0033A1] mt-0.5">{deal.nextBuyout}</div>
                          </div>
                        </div>
                        <div className="relative pt-1">
                          <div className="flex mb-2 items-center justify-between">
                            <div>
                              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-[#0033A1] bg-blue-50">
                                Your Equity
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-semibold inline-block text-[#0033A1]">
                                {deal.equityOwned}% ({deal.ownedValue})
                              </span>
                            </div>
                          </div>
                          <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-slate-200">
                            <div style={{ width: `${deal.equityOwned}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#0072CE]"></div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Build Management Tracker */}
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6">
                <h2 className="text-lg font-bold text-[#0f172a] mb-5">Build Progress Management</h2>
                <div className="space-y-4">
                  {activeBuilds.length === 0 ? (
                    <div className="py-8 text-center text-sm text-[#64748b]">No active construction builds.</div>
                  ) : (
                    activeBuilds.map((build) => (
                      <div key={build.id} className="rounded-xl border border-[#e2e8f0] p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="font-semibold text-[#0f172a] text-sm">{build.property}</div>
                            <div className="text-xs text-[#64748b] mt-0.5">Est. Handover: {build.estHandover}</div>
                          </div>
                          <span className="rounded-full bg-[#fff7ed] px-2.5 py-1 text-[11px] font-semibold text-[#c2410c] border border-[#ffedd5]">
                            {build.currentPhase}
                          </span>
                        </div>
                        <div className="relative pt-1">
                          <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-slate-100">
                            <div style={{ width: `${build.progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-amber-500"></div>
                          </div>
                          <div className="flex text-[10px] text-slate-400 mt-1 justify-between">
                            <span>Foundation</span>
                            <span className="text-amber-600 font-medium">Brickwork</span>
                            <span>Roofing</span>
                            <span>Finishing</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Transaction Tracker */}
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6">
                <h2 className="text-lg font-bold text-[#0f172a] mb-5">Transaction Tracker</h2>
                {transactions.length === 0 ? (
                  <div className="py-8 text-center text-sm text-[#64748b]">No transactions yet.</div>
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
                  {documents.length === 0 ? (
                    <div className="py-8 text-center text-sm text-[#64748b]">No documents loaded.</div>
                  ) : (
                    documents.map((doc) => (
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
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Notifications */}
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6">
                <h3 className="text-sm font-bold text-[#0f172a] mb-4">Notifications</h3>
                <div className="space-y-3">
                  {notifications.length === 0 ? (
                    <div className="py-4 text-center text-xs text-[#94a3b8]">Clean slate.</div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className={`rounded-lg p-3 text-sm ${n.read ? "bg-white" : "bg-[#eff6ff] border border-[#155eef]/10"}`}>
                        <p className="text-[#0f172a] text-xs leading-relaxed">{n.message}</p>
                        <p className="text-[11px] text-[#94a3b8] mt-1">{n.time}</p>
                      </div>
                    ))
                  )}
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

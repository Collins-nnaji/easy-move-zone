import { redirect } from "next/navigation"
import { authServer } from "@/lib/auth/server"
import { getBuyerDashboard } from "@/lib/dashboard/data"
import Link from "next/link"
import { PublicShell } from "@/components/platform/PublicShell"
import {
  Heart,
  FileText,
  Bell,
  Folder,
  ArrowRight,
  MapPin,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  Home,
  Settings,
  BadgeCheck,
} from "lucide-react"

const SAVED_GRADIENTS = [
  "linear-gradient(135deg,#bf6a3c22,#00C6FF22)",
  "linear-gradient(135deg,#bf6a3c22,#f3aa7922)",
  "linear-gradient(135deg,#05966922,#34d39922)",
  "linear-gradient(135deg,#f59e0b22,#fde68a22)",
]

// No backing tables yet — shown as empty-state sections.
const equityDeals: { id: string; property: string; totalValue: string; equityOwned: number; ownedValue: string; nextBuyout: string }[] = []
const activeBuilds: { id: string; property: string; estHandover: string; currentPhase: string; progress: number }[] = []

const txStatusConfig: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
  "in-progress": { color: "#d97706", icon: Clock },
  "completed": { color: "#059669", icon: CheckCircle2 },
  "initiated": { color: "#e0511f", icon: Circle },
  "cancelled": { color: "#dc2626", icon: AlertCircle },
}

export default async function BuyerDashboardPage() {
  const session = await authServer.getSession()
  if (!session?.data?.user) redirect("/auth?redirect=/dashboard")
  const { user } = session.data
  const displayName = user.name || user.email?.split("@")[0] || "there"

  const data = await getBuyerDashboard(String(user.id))
  const savedProperties = data.saved.map((s, i) => ({
    id: s.id,
    title: s.title,
    city: s.city,
    price: s.price,
    verified: s.verified,
    gradient: SAVED_GRADIENTS[i % SAVED_GRADIENTS.length],
  }))
  const transactions = data.transactions.map((t) => ({
    id: t.id,
    property: t.title,
    date: t.date,
    amount: t.amount,
    status: t.status,
  }))
  const documents = data.documents
  // Notifications derived from real enquiries + transactions.
  const notifications = [
    ...data.enquiries.map((e) => ({
      id: `enq-${e.id}`,
      message: e.status === "replied"
        ? `Your enquiry on “${e.title}” has a reply from the agent.`
        : `Enquiry sent on “${e.title}”. We'll notify you when the agent responds.`,
      time: e.date,
      read: e.status === "replied",
    })),
    ...data.transactions.map((t) => ({
      id: `tx-${t.id}`,
      message: `Transaction on “${t.title}” is ${t.status.replace("-", " ")}.`,
      time: t.date,
      read: t.status === "completed",
    })),
  ].slice(0, 6)

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
            <Link href="/search" className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-[#e0511f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#c8451a]">
              Browse Properties
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
            {[
              { icon: Heart, label: "Saved", value: savedProperties.length, color: "#dc2626" },
              { icon: FileText, label: "Transactions", value: transactions.length, color: "#e0511f" },
              { icon: Folder, label: "Documents", value: documents.length, color: "#bf6a3c" },
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
                  <Link href="/search" className="text-sm font-semibold text-[#e0511f] hover:underline flex items-center gap-1">
                    Browse more <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {savedProperties.length === 0 ? (
                    <div className="py-8 text-center text-sm text-[#64748b]">No saved properties yet.</div>
                  ) : (
                    savedProperties.map((p) => (
                      <Link key={p.id} href={`/properties/${p.id}`} className="flex items-center gap-4 rounded-xl border border-[#e2e8f0] p-3 transition-all hover:shadow-sm hover:border-[#e0511f]/20">
                        <div className="h-16 w-20 rounded-lg flex-shrink-0" style={{ background: p.gradient }} />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-[#0f172a] text-sm truncate">{p.title}</div>
                          <div className="text-xs text-[#64748b] flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{p.city}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-bold text-[#0f172a] text-sm">{p.price}</div>
                          {p.verified && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <BadgeCheck className="h-3 w-3 text-[#059669]" />
                              <span className="text-[11px] text-[#059669] font-semibold">Verified</span>
                            </div>
                          )}
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
                            <div className="text-xs font-bold text-[#e0511f] mt-0.5">{deal.nextBuyout}</div>
                          </div>
                        </div>
                        <div className="relative pt-1">
                          <div className="flex mb-2 items-center justify-between">
                            <div>
                              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-[#e0511f] bg-blue-50">
                                Your Equity
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-semibold inline-block text-[#e0511f]">
                                {deal.equityOwned}% ({deal.ownedValue})
                              </span>
                            </div>
                          </div>
                          <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-slate-200">
                            <div style={{ width: `${deal.equityOwned}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#bf6a3c]"></div>
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
                          <FileText className="h-5 w-5 text-[#e0511f]" />
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
                      <div key={n.id} className={`rounded-lg p-3 text-sm ${n.read ? "bg-white" : "bg-[#eff6ff] border border-[#e0511f]/10"}`}>
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

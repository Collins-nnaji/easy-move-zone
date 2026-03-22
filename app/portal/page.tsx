import { redirect } from "next/navigation"
import { authServer } from "@/lib/auth/server"
import Link from "next/link"
import { PublicShell } from "@/components/platform/PublicShell"
import {
  Plus,
  Building2,
  Eye,
  MessageSquare,
  TrendingUp,
  BarChart3,
  Upload,
  FileCheck,
  Settings,
  CreditCard,
  BadgeCheck,
  Clock,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Users,
  DollarSign,
} from "lucide-react"

const agentListings = [
  { id: "1", title: "800sqm Plot — Lekki Phase 2", city: "Lagos", price: "₦85M", status: "verified", views: 342, enquiries: 18 },
  { id: "2", title: "3BR Detached — Maitama", city: "Abuja", price: "₦120M", status: "verified", views: 187, enquiries: 9 },
  { id: "4", title: "1200sqm Industrial — Apapa", city: "Lagos", price: "₦250M", status: "pending", views: 54, enquiries: 3 },
]

const recentEnquiries = [
  { id: "e1", buyer: "Chidi O.", property: "Lekki Phase 2 Plot", message: "Is the C of O verified? I'm in the UK and want to buy remotely.", time: "3 hours ago", status: "new" },
  { id: "e2", buyer: "Amara K.", property: "Maitama 3BR House", message: "Can you arrange a virtual tour? What's the earliest possession date?", time: "1 day ago", status: "replied" },
  { id: "e3", buyer: "Tunde A.", property: "Apapa Industrial Plot", message: "What's the zoning classification? Need it for warehouse development.", time: "2 days ago", status: "new" },
]

const statusColors: Record<string, string> = { verified: "#059669", pending: "#d97706", new: "#155eef", replied: "#64748b" }

export default async function AgentPortalPage() {
  const session = await authServer.getSession()
  if (!session?.data?.user) redirect("/auth?redirect=/portal")
  const { user } = session.data
  const displayName = user.name || user.email?.split("@")[0] || "Agent"

  return (
    <PublicShell>
      <div className="min-h-screen bg-[#f6f8fb]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a]">Agent Portal</h1>
              <p className="mt-1 text-sm text-[#64748b]">Manage your listings, enquiries, and analytics.</p>
            </div>
            <Link href="/portal/new" className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-[#155eef] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1249d1]">
              <Plus className="h-4 w-4" /> List Property
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
            {[
              { icon: Building2, label: "Active Listings", value: agentListings.length, color: "#155eef" },
              { icon: Eye, label: "Total Views", value: "583", color: "#7c3aed" },
              { icon: MessageSquare, label: "Enquiries", value: "30", color: "#d97706" },
              { icon: DollarSign, label: "Lead Value", value: "₦455M", color: "#059669" },
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
            <div className="lg:col-span-2 space-y-6">
              {/* My Listings */}
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-[#0f172a]">My Listings</h2>
                  <Link href="/portal/new" className="text-sm font-semibold text-[#155eef] hover:underline flex items-center gap-1">
                    <Plus className="h-3.5 w-3.5" /> Add new
                  </Link>
                </div>
                <div className="space-y-3">
                  {agentListings.map((l) => (
                    <div key={l.id} className="flex items-center gap-4 rounded-xl border border-[#e2e8f0] p-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-[#0f172a] text-sm truncate">{l.title}</span>
                          <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: statusColors[l.status] + "10", color: statusColors[l.status] }}>
                            {l.status === "verified" && <BadgeCheck className="h-3 w-3" />}
                            {l.status === "pending" && <Clock className="h-3 w-3" />}
                            {l.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[#64748b]">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{l.city}</span>
                          <span className="font-semibold text-[#0f172a]">{l.price}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-[#64748b] flex-shrink-0">
                        <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{l.views}</span>
                        <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />{l.enquiries}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Enquiries */}
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6">
                <h2 className="text-lg font-bold text-[#0f172a] mb-5">Recent Enquiries</h2>
                <div className="space-y-3">
                  {recentEnquiries.map((eq) => (
                    <div key={eq.id} className={`rounded-xl border p-4 ${eq.status === "new" ? "border-[#155eef]/20 bg-[#eff6ff]/50" : "border-[#e2e8f0]"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#155eef]/10 text-xs font-bold text-[#155eef]">
                            {eq.buyer.split(" ").map((w) => w[0]).join("")}
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-[#0f172a]">{eq.buyer}</span>
                            <span className="mx-1.5 text-[#cbd5e1]">·</span>
                            <span className="text-xs text-[#64748b]">{eq.property}</span>
                          </div>
                        </div>
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: statusColors[eq.status] + "10", color: statusColors[eq.status] }}>
                          {eq.status}
                        </span>
                      </div>
                      <p className="text-sm text-[#475569] pl-10">{eq.message}</p>
                      <p className="text-[11px] text-[#94a3b8] pl-10 mt-1">{eq.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Quick Actions */}
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5">
                <h3 className="text-sm font-bold text-[#0f172a] mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  {[
                    { icon: Plus, label: "List New Property", href: "/portal/new" },
                    { icon: Upload, label: "Upload Documents", href: "/portal" },
                    { icon: BarChart3, label: "View Analytics", href: "/portal" },
                    { icon: CreditCard, label: "Manage Subscription", href: "/portal" },
                    { icon: Settings, label: "Account Settings", href: "/profile" },
                  ].map((a) => (
                    <Link key={a.label} href={a.href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a] transition-colors">
                      <a.icon className="h-4 w-4" />
                      {a.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Subscription */}
              <div className="rounded-2xl border border-[#155eef]/20 bg-[#eff6ff] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="h-5 w-5 text-[#155eef]" />
                  <h3 className="text-sm font-bold text-[#155eef]">Standard Plan</h3>
                </div>
                <p className="text-xs text-[#475569] mb-3">Up to 10 active listings with verification support.</p>
                <button className="w-full rounded-xl border border-[#155eef]/20 bg-white px-4 py-2.5 text-sm font-semibold text-[#155eef] hover:bg-[#155eef] hover:text-white transition-colors">
                  Upgrade to Featured
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicShell>
  )
}

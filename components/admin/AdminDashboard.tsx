"use client"

import { useEffect, useState } from "react"
import {
  Users, Building2, Home, CreditCard, CheckCircle, XCircle,
  Clock, ShieldCheck, AlertCircle, RefreshCw, BadgeCheck,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardData {
  stats: {
    totalUsers: number
    totalBuyers: number
    totalSellers: number
    totalAgents: number
    pendingListings: number
    approvedListings: number
    totalMortgages: number
  }
  users: UserRow[]
  listings: ListingRow[]
  mortgageApplications: MortgageRow[]
  agents: AgentRow[]
}

interface UserRow {
  auth_user_id: string
  full_name: string | null
  role: string
  is_agent: boolean
  agent_company: string | null
  agent_verified: boolean
  created_at: string
  updated_at: string
}

interface ListingRow {
  id: string
  title: string
  city_slug: string
  country: string
  submission_status: string
  submitted_by: string | null
  submitted_at: string | null
  reviewed_at: string | null
  reviewer_notes: string | null
  price_usd: number
}

interface MortgageRow {
  id: string
  full_name: string
  email: string
  country: string
  city: string
  property_price_usd: number
  loan_amount_usd: number
  ai_score: number | null
  status: string
  submitted_at: string
  lender_id: string | null
}

interface AgentRow {
  auth_user_id: string
  full_name: string | null
  agent_company: string | null
  agent_license: string | null
  agent_bio: string | null
  agent_verified: boolean
  seller_service_cities: string[] | null
  updated_at: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

type Tab = "overview" | "listings" | "mortgages" | "agents" | "users"

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  draft: "bg-gray-100 text-gray-600",
  submitted: "bg-blue-100 text-blue-800",
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  )
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: number; sub?: string; color: string
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[#dbe4f0] bg-white p-5">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-black text-[#0f172a]">{value}</p>
        <p className="text-xs font-semibold text-[#64748b]">{label}</p>
        {sub && <p className="text-[11px] text-[#94a3b8]">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Listings tab ─────────────────────────────────────────────────────────────

function ListingsTab({ listings }: { listings: ListingRow[] }) {
  const [updating, setUpdating] = useState<string | null>(null)
  const [localListings, setLocalListings] = useState(listings)
  const [notes, setNotes] = useState<Record<string, string>>({})

  async function updateStatus(id: string, status: string) {
    setUpdating(id)
    try {
      await fetch(`/api/admin/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes: notes[id] }),
      })
      setLocalListings(prev => prev.map(l => l.id === id ? { ...l, submission_status: status } : l))
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="space-y-3">
      {localListings.length === 0 && (
        <p className="text-sm text-[#64748b]">No user-submitted listings yet.</p>
      )}
      {localListings.map(listing => (
        <div key={listing.id} className="rounded-2xl border border-[#dbe4f0] bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-bold text-[#0f172a]">{listing.title}</p>
              <p className="text-xs text-[#64748b]">{listing.city_slug}, {listing.country} · ${listing.price_usd?.toLocaleString()}</p>
              <p className="mt-1 text-[11px] text-[#94a3b8]">
                Submitted: {listing.submitted_at ? new Date(listing.submitted_at).toLocaleDateString() : "—"}
                {listing.reviewed_at && ` · Reviewed: ${new Date(listing.reviewed_at).toLocaleDateString()}`}
              </p>
              {listing.reviewer_notes && (
                <p className="mt-1 text-xs italic text-[#64748b]">Notes: {listing.reviewer_notes}</p>
              )}
            </div>
            <StatusBadge status={listing.submission_status} />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              placeholder="Review note (optional)"
              value={notes[listing.id] ?? ""}
              onChange={e => setNotes(prev => ({ ...prev, [listing.id]: e.target.value }))}
              className="flex-1 min-w-[180px] rounded-xl border border-[#c8d8f0] px-3 py-1.5 text-xs"
            />
            <button
              onClick={() => void updateStatus(listing.id, "approved")}
              disabled={updating === listing.id || listing.submission_status === "approved"}
              className="flex items-center gap-1 rounded-full bg-green-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              {updating === listing.id ? "…" : "Approve"}
            </button>
            <button
              onClick={() => void updateStatus(listing.id, "rejected")}
              disabled={updating === listing.id || listing.submission_status === "rejected"}
              className="flex items-center gap-1 rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40"
            >
              <XCircle className="h-3.5 w-3.5" /> Reject
            </button>
            <button
              onClick={() => void updateStatus(listing.id, "pending")}
              disabled={updating === listing.id || listing.submission_status === "pending"}
              className="flex items-center gap-1 rounded-full border border-[#dbe4f0] px-3 py-1.5 text-xs font-bold text-[#64748b] disabled:opacity-40"
            >
              <Clock className="h-3.5 w-3.5" /> Set pending
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Agents tab ───────────────────────────────────────────────────────────────

function AgentsTab({ agents }: { agents: AgentRow[] }) {
  const [localAgents, setLocalAgents] = useState(agents)
  const [updating, setUpdating] = useState<string | null>(null)

  async function toggleVerified(id: string, current: boolean) {
    setUpdating(id)
    try {
      await fetch(`/api/admin/agents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentVerified: !current }),
      })
      setLocalAgents(prev => prev.map(a => a.auth_user_id === id ? { ...a, agent_verified: !current } : a))
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="space-y-3">
      {localAgents.length === 0 && (
        <p className="text-sm text-[#64748b]">No agents have registered yet.</p>
      )}
      {localAgents.map(agent => (
        <div key={agent.auth_user_id} className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-[#dbe4f0] bg-white p-5">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-[#0f172a]">{agent.full_name ?? "—"}</p>
              {agent.agent_verified && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                  <BadgeCheck className="h-3 w-3" /> Verified
                </span>
              )}
            </div>
            <p className="text-xs text-[#64748b]">{agent.agent_company ?? "No company"}</p>
            {agent.agent_license && <p className="text-[11px] text-[#94a3b8]">Licence: {agent.agent_license}</p>}
            {agent.agent_bio && <p className="mt-1 max-w-md text-xs text-[#64748b] italic">{agent.agent_bio}</p>}
            {agent.seller_service_cities && agent.seller_service_cities.length > 0 && (
              <p className="mt-1 text-[11px] text-[#94a3b8]">Cities: {agent.seller_service_cities.join(", ")}</p>
            )}
          </div>
          <button
            onClick={() => void toggleVerified(agent.auth_user_id, agent.agent_verified)}
            disabled={updating === agent.auth_user_id}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${
              agent.agent_verified
                ? "border border-[#dbe4f0] text-[#64748b] hover:border-red-300 hover:text-red-600"
                : "bg-[#155eef] text-white hover:bg-[#1347c8]"
            } disabled:opacity-40`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            {updating === agent.auth_user_id ? "…" : agent.agent_verified ? "Revoke verification" : "Verify agent"}
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

export function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [tab, setTab] = useState<Tab>("overview")

  async function load() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/dashboard")
      if (!res.ok) { setError("Access denied or server error."); return }
      setData((await res.json()) as DashboardData)
    } catch {
      setError("Failed to load dashboard.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "listings", label: `Listings ${data ? `(${data.stats.pendingListings} pending)` : ""}` },
    { id: "mortgages", label: `Mortgages ${data ? `(${data.stats.totalMortgages})` : ""}` },
    { id: "agents", label: `Agents ${data ? `(${data.stats.totalAgents})` : ""}` },
    { id: "users", label: `Users ${data ? `(${data.stats.totalUsers})` : ""}` },
  ]

  return (
    <div className="min-h-screen bg-[#f4f7fc]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0b1f4a] to-[#155eef] px-6 py-6">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">EasyMoveZone</p>
            <h1 className="mt-1 text-2xl font-black text-white">Admin Dashboard</h1>
          </div>
          <button
            onClick={() => void load()}
            disabled={loading}
            className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20 disabled:opacity-40"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tab strip */}
      <div className="border-b border-[#dbe4f0] bg-white px-6">
        <div className="mx-auto max-w-7xl flex gap-1 overflow-x-auto py-2">
          {TABS.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                tab === t.id ? "bg-[#155eef] text-white" : "text-[#475569] hover:bg-[#f0f4fa]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-[#64748b]">
            <RefreshCw className="h-4 w-4 animate-spin" /> Loading…
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {data && !loading && (
          <>
            {/* Overview */}
            {tab === "overview" && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard icon={Users} label="Total users" value={data.stats.totalUsers}
                    sub={`${data.stats.totalBuyers} buyers · ${data.stats.totalSellers} sellers`}
                    color="bg-blue-100 text-blue-600" />
                  <StatCard icon={Building2} label="Agent accounts" value={data.stats.totalAgents}
                    color="bg-purple-100 text-purple-600" />
                  <StatCard icon={Home} label="Pending listings" value={data.stats.pendingListings}
                    sub={`${data.stats.approvedListings} approved`}
                    color="bg-amber-100 text-amber-600" />
                  <StatCard icon={CreditCard} label="Mortgage applications" value={data.stats.totalMortgages}
                    color="bg-green-100 text-green-600" />
                </div>

                {/* Quick action — pending listings */}
                {data.stats.pendingListings > 0 && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-4 w-4 text-amber-600" />
                      <p className="font-bold text-amber-900">{data.stats.pendingListings} listing{data.stats.pendingListings !== 1 ? "s" : ""} awaiting review</p>
                    </div>
                    <button onClick={() => setTab("listings")}
                      className="rounded-full bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700">
                      Review now →
                    </button>
                  </div>
                )}

                {/* Recent mortgages preview */}
                <div className="rounded-2xl border border-[#dbe4f0] bg-white p-5">
                  <p className="mb-3 font-bold text-[#0f172a]">Recent mortgage applications</p>
                  {data.mortgageApplications.slice(0, 5).map(m => (
                    <div key={m.id} className="flex items-center justify-between border-b border-[#f0f4fa] py-2 last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-[#0f172a]">{m.full_name}</p>
                        <p className="text-xs text-[#64748b]">{m.country} · ${m.loan_amount_usd?.toLocaleString()} loan</p>
                      </div>
                      <div className="text-right">
                        {m.ai_score != null && (
                          <p className={`text-sm font-black ${m.ai_score >= 75 ? "text-green-600" : m.ai_score >= 55 ? "text-amber-600" : "text-red-500"}`}>
                            {m.ai_score}/100
                          </p>
                        )}
                        <StatusBadge status={m.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Listings */}
            {tab === "listings" && <ListingsTab listings={data.listings} />}

            {/* Mortgages */}
            {tab === "mortgages" && (
              <div className="space-y-3">
                {data.mortgageApplications.length === 0 && (
                  <p className="text-sm text-[#64748b]">No mortgage applications yet.</p>
                )}
                {data.mortgageApplications.map(m => (
                  <div key={m.id} className="rounded-2xl border border-[#dbe4f0] bg-white p-5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-[#0f172a]">{m.full_name}</p>
                        <p className="text-xs text-[#64748b]">{m.email}</p>
                        <p className="mt-1 text-xs text-[#64748b]">
                          {m.city}, {m.country} · Property ${m.property_price_usd?.toLocaleString()} · Loan ${m.loan_amount_usd?.toLocaleString()}
                        </p>
                        {m.lender_id && <p className="text-[11px] text-[#94a3b8]">Lender: {m.lender_id}</p>}
                        <p className="text-[11px] text-[#94a3b8]">
                          Submitted: {new Date(m.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {m.ai_score != null && (
                          <p className={`text-xl font-black ${m.ai_score >= 75 ? "text-green-600" : m.ai_score >= 55 ? "text-amber-600" : "text-red-500"}`}>
                            {m.ai_score}/100
                          </p>
                        )}
                        <StatusBadge status={m.status} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Agents */}
            {tab === "agents" && <AgentsTab agents={data.agents} />}

            {/* Users */}
            {tab === "users" && (
              <div className="overflow-hidden rounded-2xl border border-[#dbe4f0] bg-white">
                <table className="w-full text-sm">
                  <thead className="border-b border-[#dbe4f0] bg-[#f8fbff]">
                    <tr>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#64748b]">Name</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#64748b]">Role</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#64748b]">Agent</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#64748b]">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.users.map(u => (
                      <tr key={u.auth_user_id} className="border-b border-[#f0f4fa] last:border-0 hover:bg-[#f8fbff]">
                        <td className="px-4 py-3 font-medium text-[#0f172a]">{u.full_name ?? "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            u.role === "seller" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                          }`}>{u.role}</span>
                        </td>
                        <td className="px-4 py-3">
                          {u.is_agent ? (
                            <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-green-700">
                              <BadgeCheck className="h-3.5 w-3.5" />
                              {u.agent_verified ? "Verified" : "Pending"}
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#94a3b8]">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-[#64748b]">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

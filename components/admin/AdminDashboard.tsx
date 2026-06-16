"use client"

import { useEffect, useState } from "react"
import {
  Users, Building2, CreditCard, CheckCircle,
  Clock, RefreshCw, BadgeCheck, AlertCircle,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardData {
  stats: {
    totalUsers: number
    totalBuyers: number
    totalSellers: number
    totalAgents: number
    pendingRequests: number
    completedRequests: number
    totalMortgages: number
  }
  users: UserRow[]
  serviceRequests: RequestRow[]
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

interface RequestRow {
  id: string
  service_name: string
  user_name: string | null
  status: string
  created_at: string | null
  price_usd: number | null
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

type Tab = "overview" | "requests" | "mortgages" | "agents" | "users"

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  active: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
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

// ─── Service Requests tab ─────────────────────────────────────────────────────

function RequestsTab({ requests }: { requests: RequestRow[] }) {
  const [updating, setUpdating] = useState<string | null>(null)

  async function updateStatus(id: string, status: string) {
    setUpdating(id)
    try {
      await fetch(`/api/admin/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="space-y-3">
      {requests.length === 0 && (
        <p className="text-sm text-[#64748b]">No service requests yet.</p>
      )}
      {requests.map(req => (
        <div key={req.id} className="rounded-2xl border border-[#dbe4f0] bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-bold text-[#0f172a]">{req.service_name}</p>
              <p className="text-xs text-[#64748b]">Requested by: {req.user_name ?? "Unknown"} · ${req.price_usd?.toLocaleString() ?? "—"}</p>
              <p className="mt-1 text-[11px] text-[#94a3b8]">
                Date: {req.created_at ? new Date(req.created_at).toLocaleDateString() : "—"}
              </p>
            </div>
            <StatusBadge status={req.status} />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
               onClick={() => void updateStatus(req.id, "active")}
               disabled={updating === req.id}
               className="rounded-full bg-[#e0511f] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
            >
              Mark Active
            </button>
            <button
               onClick={() => void updateStatus(req.id, "completed")}
               disabled={updating === req.id}
               className="rounded-full bg-green-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
            >
              Mark Completed
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
          </div>
          <button
            onClick={() => void toggleVerified(agent.auth_user_id, agent.agent_verified)}
            disabled={updating === agent.auth_user_id}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${
              agent.agent_verified
                ? "border border-[#dbe4f0] text-[#64748b] hover:border-red-300 hover:text-red-600"
                : "bg-[#e0511f] text-white hover:bg-[#1347c8]"
            } disabled:opacity-40`}
          >
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
    { id: "requests", label: `Requests ${data ? `(${data.stats.pendingRequests} new)` : ""}` },
    { id: "mortgages", label: `Mortgages ${data ? `(${data.stats.totalMortgages})` : ""}` },
    { id: "agents", label: `Agents ${data ? `(${data.stats.totalAgents})` : ""}` },
    { id: "users", label: `Users ${data ? `(${data.stats.totalUsers})` : ""}` },
  ]

  return (
    <div className="min-h-screen bg-[#f4f7fc]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0b1f4a] to-[#e0511f] px-6 py-6">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">EasyMoveZone</p>
            <h1 className="mt-1 text-2xl font-black text-white">Admin Dashboard</h1>
          </div>
          <button
            onClick={() => void load()}
            className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20"
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
              onClick={() => setTab(t.id)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                tab === t.id ? "bg-[#e0511f] text-white" : "text-[#475569] hover:bg-[#f0f4fa]"
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
                    sub={`${data.stats.totalBuyers} individual · ${data.stats.totalSellers} corporate`}
                    color="bg-orange-100 text-[#e0511f]" />
                  <StatCard icon={Building2} label="Partner accounts" value={data.stats.totalAgents}
                    color="bg-orange-100 text-orange-600" />
                  <StatCard icon={CheckCircle} label="Service Requests" value={data.stats.pendingRequests}
                    sub={`${data.stats.completedRequests} completed`}
                    color="bg-amber-100 text-amber-600" />
                  <StatCard icon={CreditCard} label="Mortgage queries" value={data.stats.totalMortgages}
                    color="bg-green-100 text-green-600" />
                </div>

                {/* Quick action — pending requests */}
                {data.stats.pendingRequests > 0 && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-4 w-4 text-amber-600" />
                      <p className="font-bold text-amber-900">{data.stats.pendingRequests} request{data.stats.pendingRequests !== 1 ? "s" : ""} awaiting action</p>
                    </div>
                    <button onClick={() => setTab("requests")}
                      className="rounded-full bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700">
                      Manage requests →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Requests */}
            {tab === "requests" && <RequestsTab requests={data.serviceRequests} />}

            {/* Mortgages */}
            {tab === "mortgages" && (
              <div className="space-y-3">
                {data.mortgageApplications.map(m => (
                  <div key={m.id} className="rounded-2xl border border-[#dbe4f0] bg-white p-5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-[#0f172a]">{m.full_name}</p>
                        <p className="text-xs text-[#64748b]">{m.email}</p>
                        <p className="mt-1 text-xs text-[#64748b]">
                          {m.city}, {m.country} · Property ${m.property_price_usd?.toLocaleString()} · Loan ${m.loan_amount_usd?.toLocaleString()}
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
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Role</th>
                      <th className="px-4 py-3 text-left">Agent</th>
                      <th className="px-4 py-3 text-left">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.users.map(u => (
                      <tr key={u.auth_user_id} className="border-b border-[#f0f4fa] last:border-0 hover:bg-[#f8fbff]">
                        <td className="px-4 py-3">{u.full_name ?? "—"}</td>
                        <td className="px-4 py-3 capitalize">{u.role}</td>
                        <td className="px-4 py-3">{u.is_agent ? (u.agent_verified ? "Verified" : "Pending") : "—"}</td>
                        <td className="px-4 py-3">{new Date(u.created_at).toLocaleDateString()}</td>
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

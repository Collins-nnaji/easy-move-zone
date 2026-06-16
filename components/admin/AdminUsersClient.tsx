"use client"

import { useEffect, useState } from "react"
import {
  Users, Search, RefreshCw, CheckCircle2, Clock, Shield,
  Mail, MoreHorizontal, Loader2, UserCheck, UserX,
} from "lucide-react"
import { clsx } from "clsx"

interface UserRow {
  auth_user_id: string
  full_name: string | null
  role: string
  is_agent: boolean
  agent_company: string | null
  agent_verified: boolean
  created_at: string
  email?: string | null
}

const ROLE_COLORS: Record<string, string> = {
  admin:    "bg-red-900/40 text-red-300",
  agent:    "bg-orange-900/40 text-orange-300",
  landlord: "bg-blue-900/40 text-blue-300",
  vendor:   "bg-orange-900/40 text-orange-300",
  user:     "bg-slate-700 text-slate-300",
}

function fmtDate(s: string) {
  try { return new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) }
  catch { return s }
}

export function AdminUsersClient() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  async function load() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/users")
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users ?? [])
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    const matchSearch = !q || (u.full_name ?? "").toLowerCase().includes(q) || (u.email ?? "").toLowerCase().includes(q)
    const matchRole = roleFilter === "all" || u.role === roleFilter
    return matchSearch && matchRole
  })

  const roles = ["all", ...Array.from(new Set(users.map((u) => u.role))).sort()]

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-white">Users</h1>
          <p className="text-sm text-white/50 mt-0.5">{users.length} total accounts</p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 disabled:opacity-50 transition-all">
          <RefreshCw className={clsx("h-3.5 w-3.5", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users…"
            className="rounded-xl bg-white/10 pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 w-56" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {roles.map((r) => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={clsx("rounded-xl px-3 py-2 text-xs font-semibold capitalize transition-all",
                roleFilter === r ? "bg-white text-[#0f172a]" : "bg-white/10 text-white/60 hover:bg-white/15"
              )}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-white/40">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />Loading users…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 p-16 text-center text-white/30">No users found.</div>
      ) : (
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">Name / Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden md:table-cell">Agent</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden sm:table-cell">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((u) => (
                <tr key={u.auth_user_id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white">{u.full_name || "—"}</div>
                    {u.email && <div className="text-xs text-white/40 mt-0.5">{u.email}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx("rounded-full px-2.5 py-1 text-[10px] font-bold capitalize", ROLE_COLORS[u.role] ?? "bg-slate-700 text-slate-300")}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {u.is_agent ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-400">
                        {u.agent_verified ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {u.agent_company || "Agent"}
                      </span>
                    ) : <span className="text-white/20">—</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-white/40 hidden sm:table-cell">{fmtDate(u.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="rounded-lg p-1.5 text-white/30 hover:bg-white/10 hover:text-white transition-all">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

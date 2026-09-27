"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { BadgeCheck, CheckCircle2, Clock, Loader2, RefreshCw, Search, ShieldCheck, ShieldOff } from "lucide-react"
import { clsx } from "clsx"

interface UserRow {
  id: string
  name: string | null
  email: string | null
  email_verified: boolean
  image: string | null
  created_at: string
  updated_at: string | null
  auth_role: string | null
  banned: boolean
  full_name: string | null
  profile_role: string | null
  phone: string | null
  nationality: string | null
  subscription_tier: string | null
  is_agent: boolean
  agent_company: string | null
  agent_verified: boolean
  has_profile: boolean
  last_active: string | null
  active_sessions: number
  providers: string[]
  is_admin: boolean
}

type Filter = "all" | "admins" | "signed-in" | "no-profile" | "agents"

const FILTERS: Array<{ id: Filter; label: string; test: (u: UserRow) => boolean }> = [
  { id: "all", label: "All", test: () => true },
  { id: "admins", label: "Admins", test: (u) => u.is_admin },
  { id: "signed-in", label: "Signed in now", test: (u) => u.active_sessions > 0 },
  { id: "no-profile", label: "No profile yet", test: (u) => !u.has_profile },
  { id: "agents", label: "Agents", test: (u) => u.is_agent },
]

const PROVIDER_LABELS: Record<string, string> = { credential: "Email", google: "Google", github: "GitHub", apple: "Apple" }

function fmtDate(value: string | null | undefined) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

function fmtAgo(value: string | null | undefined) {
  if (!value) return "Never"
  const minutes = Math.round((Date.now() - new Date(value).getTime()) / 60_000)
  if (minutes < 2) return "Just now"
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  const days = Math.round(hours / 24)
  return days < 30 ? `${days} d ago` : fmtDate(value)
}

function initials(user: UserRow) {
  const source = user.name || user.full_name || user.email || "?"
  return source
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

async function fetchUsers(): Promise<UserRow[]> {
  const res = await fetch("/api/admin/users", { cache: "no-store" })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || "Could not load users")
  return data.users ?? []
}

export function AdminUsersClient() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<Filter>("all")
  const [patchingId, setPatchingId] = useState<string | null>(null)

  const refresh = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchUsers()
      .then(setUsers)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load users"))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load users"))
      .finally(() => setLoading(false))
  }, [])

  async function toggleAgentVerified(user: UserRow) {
    setPatchingId(user.id)
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentVerified: !user.agent_verified }),
      })
      if (!res.ok) return
      const data = (await res.json()) as { user: Partial<UserRow> }
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, ...data.user } : u)))
    } finally {
      setPatchingId(null)
    }
  }

  const stats = useMemo(
    () => ({
      total: users.length,
      verified: users.filter((u) => u.email_verified).length,
      signedIn: users.filter((u) => u.active_sessions > 0).length,
      admins: users.filter((u) => u.is_admin).length,
    }),
    [users],
  )

  const activeFilter = FILTERS.find((f) => f.id === filter) ?? FILTERS[0]
  const q = search.trim().toLowerCase()
  const filtered = users.filter(
    (u) =>
      activeFilter.test(u) &&
      (!q || [u.name, u.full_name, u.email].some((value) => (value ?? "").toLowerCase().includes(q))),
  )

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Users</h1>
          <p className="mt-0.5 text-sm text-white/50">Accounts from Neon Auth, with their EasyMoveZone profile and sign-in activity.</p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/15 disabled:opacity-50"
        >
          <RefreshCw className={clsx("h-3.5 w-3.5", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Accounts", stats.total],
          ["Verified emails", stats.verified],
          ["Signed in now", stats.signedIn],
          ["Admins", stats.admins],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/40">{label}</p>
            <p className="mt-1 text-2xl font-bold">{Number(value).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email…"
            className="w-64 rounded-xl bg-white/10 py-2 pl-9 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={clsx(
                "rounded-xl px-3 py-2 text-xs font-semibold transition-all",
                filter === f.id ? "bg-white text-[#0f172a]" : "bg-white/10 text-white/60 hover:bg-white/15",
              )}
            >
              {f.label} <span className="opacity-60">{users.filter(f.test).length}</span>
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mb-4 rounded-xl bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-200">{error}</p>}

      {loading && !users.length ? (
        <div className="flex items-center justify-center py-20 text-white/40">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          Loading users…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 p-16 text-center text-white/30">No users found.</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-left text-xs font-semibold uppercase tracking-wide text-white/40">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Sign-in</th>
                <th className="px-4 py-3">Access</th>
                <th className="px-4 py-3">Profile</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Last active</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((u) => (
                <tr key={u.id} className="transition-colors hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {u.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={u.image} alt="" referrerPolicy="no-referrer" className="h-9 w-9 shrink-0 rounded-full object-cover" />
                      ) : (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold">{initials(u)}</span>
                      )}
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-white">{u.name || u.full_name || "—"}</div>
                        <div className="flex items-center gap-1 truncate text-xs text-white/40">
                          {u.email}
                          {u.email_verified && <BadgeCheck className="h-3 w-3 shrink-0 text-emerald-400" aria-label="Email verified" />}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {u.providers.length ? (
                        u.providers.map((p) => (
                          <span key={p} className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/70">
                            {PROVIDER_LABELS[p] ?? p}
                          </span>
                        ))
                      ) : (
                        <span className="text-white/20">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {u.is_admin ? (
                        <span className="rounded-full bg-red-900/40 px-2.5 py-1 text-[10px] font-bold text-red-300">Admin</span>
                      ) : (
                        <span className="rounded-full bg-slate-700 px-2.5 py-1 text-[10px] font-bold text-slate-300">User</span>
                      )}
                      {u.banned && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-2.5 py-1 text-[10px] font-bold text-rose-200">
                          <ShieldOff className="h-3 w-3" /> Banned
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {u.has_profile ? (
                      <div className="space-y-0.5 text-white/60">
                        <p className="capitalize">{u.profile_role ?? "—"}{u.subscription_tier ? ` · ${u.subscription_tier}` : ""}</p>
                        {u.nationality && <p className="text-white/40">{u.nationality}</p>}
                        {u.is_agent && (
                          <p className="flex items-center gap-1 text-emerald-400">
                            {u.agent_verified ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                            {u.agent_company || "Agent"}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-white/30">No profile yet</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-white/50">{fmtDate(u.created_at)}</td>
                  <td className="px-4 py-3 text-xs">
                    <p className="text-white/60">{fmtAgo(u.last_active)}</p>
                    {u.active_sessions > 0 && (
                      <p className="mt-0.5 flex items-center gap-1 text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        {u.active_sessions} active session{u.active_sessions === 1 ? "" : "s"}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.is_agent ? (
                      <button
                        type="button"
                        disabled={patchingId === u.id}
                        onClick={() => void toggleAgentVerified(u)}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] font-semibold text-white/70 hover:bg-white/10 disabled:opacity-50"
                      >
                        {patchingId === u.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldCheck className="h-3 w-3" />}
                        {u.agent_verified ? "Revoke" : "Verify"}
                      </button>
                    ) : null}
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

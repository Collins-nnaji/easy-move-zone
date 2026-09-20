"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { REQUEST_STATUSES, type RequestStatus } from "@/lib/requests/types"

interface RequestRow {
  id: string
  auth_user_id: string | null
  name: string
  email: string
  phone: string | null
  goal: string
  destination: string | null
  timeline: string | null
  message: string
  status: RequestStatus
  created_at: string
}

const STATUS_STYLE: Record<RequestStatus, string> = {
  new: "bg-[#e0511f]/20 text-[#f3aa79]",
  in_review: "bg-amber-400/15 text-amber-300",
  contacted: "bg-sky-400/15 text-sky-300",
  closed: "bg-white/10 text-white/40",
}

const STATUS_LABEL: Record<RequestStatus, string> = {
  new: "New",
  in_review: "In review",
  contacted: "Contacted",
  closed: "Closed",
}

export function AdminRequestsClient() {
  const [requests, setRequests] = useState<RequestRow[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<RequestStatus | "all">("all")

  useEffect(() => {
    fetch("/api/admin/requests")
      .then(async (res) => {
        if (!res.ok) throw new Error("failed")
        return (await res.json()) as { requests: RequestRow[] }
      })
      .then((data) => setRequests(data.requests ?? []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false))
  }, [])

  async function updateStatus(id: string, status: RequestStatus) {
    setSavingId(id)
    try {
      const res = await fetch(`/api/admin/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
      }
    } finally {
      setSavingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading requests…
      </div>
    )
  }

  const shown = filter === "all" ? requests : requests.filter((r) => r.status === filter)
  const openCount = requests.filter((r) => r.status !== "closed").length

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-xl font-bold">Concierge requests</h1>
      <p className="mt-1 text-sm text-white/50">{requests.length} total · {openCount} open</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {(["all", ...REQUEST_STATUSES] as const).map((s) => {
          const active = filter === s
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                active ? "bg-white text-[#0f172a]" : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {s === "all" ? "All" : STATUS_LABEL[s]}
            </button>
          )
        })}
      </div>

      <div className="mt-6 space-y-3">
        {shown.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-10 text-center text-white/30">
            No requests here yet.
          </div>
        ) : (
          shown.map((r) => (
            <div key={r.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{r.name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[r.status]}`}>
                      {STATUS_LABEL[r.status]}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/50">
                    <a href={`mailto:${r.email}`} className="hover:text-white">{r.email}</a>
                    {r.phone ? <a href={`tel:${r.phone}`} className="hover:text-white">{r.phone}</a> : null}
                    <span className="capitalize">Goal: {r.goal}</span>
                    {r.destination ? <span>→ {r.destination}</span> : null}
                    {r.timeline ? <span>· {r.timeline}</span> : null}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={r.status}
                    disabled={savingId === r.id}
                    onChange={(e) => updateStatus(r.id, e.target.value as RequestStatus)}
                    className="rounded-lg border border-white/15 bg-[#0b0f17] px-2 py-1.5 text-xs text-white"
                  >
                    {REQUEST_STATUSES.map((s) => (
                      <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                    ))}
                  </select>
                </div>
              </div>
              {r.message ? (
                <p className="mt-3 whitespace-pre-wrap rounded-xl bg-black/20 px-3 py-2 text-sm text-white/70">{r.message}</p>
              ) : null}
              <div className="mt-2 text-[11px] text-white/30">
                {new Date(r.created_at).toLocaleString()}
                {r.auth_user_id ? " · signed-in user" : " · guest"}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

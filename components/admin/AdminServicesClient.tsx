"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { SERVICE_STATUSES, type ServiceBookingStatus } from "@/lib/services/types"

interface BookingRow {
  id: string
  auth_user_id: string
  service_name: string
  goal: string
  destination: string | null
  name: string
  email: string
  phone: string | null
  notes: string
  status: ServiceBookingStatus
  manager_id: string | null
  manager_name: string | null
  created_at: string
}

interface ManagerRow {
  id: string
  name: string
  title: string
  active: boolean
}

const STATUS_LABEL: Record<ServiceBookingStatus, string> = {
  assigned: "Assigned",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
}

const STATUS_STYLE: Record<ServiceBookingStatus, string> = {
  assigned: "bg-[#e0511f]/20 text-[#f3aa79]",
  in_progress: "bg-sky-400/15 text-sky-300",
  completed: "bg-emerald-400/15 text-emerald-300",
  cancelled: "bg-white/10 text-white/40",
}

export function AdminServicesClient() {
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [managers, setManagers] = useState<ManagerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/admin/services")
      .then(async (res) => {
        if (!res.ok) throw new Error("failed")
        return (await res.json()) as { bookings: BookingRow[]; managers: ManagerRow[] }
      })
      .then((data) => {
        setBookings(data.bookings ?? [])
        setManagers(data.managers ?? [])
      })
      .catch(() => {
        setBookings([])
        setManagers([])
      })
      .finally(() => setLoading(false))
  }, [])

  async function patch(id: string, payload: { status?: ServiceBookingStatus; managerId?: string | null }) {
    setSavingId(id)
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => {
            if (b.id !== id) return b
            const next = { ...b }
            if (payload.status) next.status = payload.status
            if (payload.managerId !== undefined) {
              next.manager_id = payload.managerId
              next.manager_name = managers.find((m) => m.id === payload.managerId)?.name ?? null
            }
            return next
          }),
        )
      }
    } finally {
      setSavingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading services…
      </div>
    )
  }

  const openCount = bookings.filter((b) => b.status === "assigned" || b.status === "in_progress").length

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-xl font-bold">Service bookings</h1>
      <p className="mt-1 text-sm text-white/50">{bookings.length} total · {openCount} open · {managers.length} managers</p>

      <div className="mt-6 space-y-3">
        {bookings.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-10 text-center text-white/30">
            No service bookings yet.
          </div>
        ) : (
          bookings.map((b) => (
            <div key={b.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{b.service_name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[b.status]}`}>
                      {STATUS_LABEL[b.status]}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/50">
                    <span>{b.name}</span>
                    <a href={`mailto:${b.email}`} className="hover:text-white">{b.email}</a>
                    {b.phone ? <a href={`tel:${b.phone}`} className="hover:text-white">{b.phone}</a> : null}
                    {b.destination ? <span>→ {b.destination}</span> : null}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={b.manager_id ?? ""}
                    disabled={savingId === b.id}
                    onChange={(e) => patch(b.id, { managerId: e.target.value || null })}
                    className="rounded-lg border border-white/15 bg-[#0b0f17] px-2 py-1.5 text-xs text-white"
                  >
                    <option value="">Unassigned</option>
                    {managers.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  <select
                    value={b.status}
                    disabled={savingId === b.id}
                    onChange={(e) => patch(b.id, { status: e.target.value as ServiceBookingStatus })}
                    className="rounded-lg border border-white/15 bg-[#0b0f17] px-2 py-1.5 text-xs text-white"
                  >
                    {SERVICE_STATUSES.map((s) => (
                      <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                    ))}
                  </select>
                </div>
              </div>
              {b.notes ? (
                <p className="mt-3 whitespace-pre-wrap rounded-xl bg-black/20 px-3 py-2 text-sm text-white/70">{b.notes}</p>
              ) : null}
              <div className="mt-2 text-[11px] text-white/30">
                {new Date(b.created_at).toLocaleString()} · goal: {b.goal}
                {b.manager_name ? ` · manager: ${b.manager_name}` : " · unassigned"}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

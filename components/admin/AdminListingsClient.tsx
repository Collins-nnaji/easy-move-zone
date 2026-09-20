"use client"

import { useEffect, useState } from "react"
import { Check, Loader2, X } from "lucide-react"
import type { CarListingRow } from "@/lib/cars/marketplace"

export function AdminListingsClient() {
  const [items, setItems] = useState<CarListingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending")
  const [busyId, setBusyId] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})

  const load = (status: typeof filter) => {
    setLoading(true)
    fetch(`/api/admin/listings?status=${status}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("failed")
        return (await res.json()) as { items: CarListingRow[] }
      })
      .then((data) => setItems(data.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load(filter)
  }, [filter])

  async function review(id: string, action: "approve" | "reject") {
    setBusyId(id)
    try {
      const res = await fetch(`/api/admin/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notes: notes[id] || undefined }),
      })
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id))
      }
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading listings…
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-xl font-bold">Car listing review</h1>
      <p className="mt-1 text-sm text-white/50">
        Private sellers upload photos to Neon storage. Approve a car before it appears on /cars.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {(["pending", "approved", "rejected", "all"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${
              filter === s ? "bg-white text-[#0f172a]" : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-10 text-center text-white/30">
            No listings in this queue.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">
                      {item.year} {item.make} {item.model} {item.trim}
                    </span>
                    <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[11px] font-semibold capitalize text-amber-300">
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-white/70">
                    £{Number(item.price).toLocaleString()} · {Number(item.mileage).toLocaleString()} miles · {item.fuel} ·{" "}
                    {item.transmission} · {item.body}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/45">
                    <span>{item.seller_name || "Seller"}</span>
                    <span>{item.seller_email}</span>
                    <span>{item.location || "No location"}</span>
                    <span>{new Date(item.created_at).toLocaleString()}</span>
                  </div>
                  {item.description ? <p className="mt-2 text-sm text-white/60">{item.description}</p> : null}
                </div>
              </div>

              <div className="mt-3 flex gap-2 overflow-x-auto">
                {(item.photos ?? []).map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <a key={src} href={src} target="_blank" rel="noreferrer">
                    <img src={src} alt="" className="h-24 w-36 rounded-lg object-cover" />
                  </a>
                ))}
              </div>

              {item.status === "pending" ? (
                <>
                  <textarea
                    value={notes[item.id] ?? ""}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [item.id]: e.target.value }))}
                    placeholder="Review notes (optional)"
                    className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30"
                    rows={2}
                  />
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => review(item.id, "approve")}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      <Check className="h-3.5 w-3.5" /> Approve
                    </button>
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => review(item.id, "reject")}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500/90 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      <X className="h-3.5 w-3.5" /> Reject
                    </button>
                  </div>
                </>
              ) : item.admin_notes ? (
                <p className="mt-3 text-xs text-white/45">Notes: {item.admin_notes}</p>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

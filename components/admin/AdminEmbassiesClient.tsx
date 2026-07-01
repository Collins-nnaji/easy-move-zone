"use client"

import { useEffect, useState } from "react"
import { Loader2, Plus, Save, Trash2 } from "lucide-react"
import type { Embassy, MissionType } from "@/lib/visa/types"

const MISSION_TYPES: MissionType[] = ["embassy", "consulate", "consulate_general", "visa_application_center", "trade_office"]

const BLANK: Omit<Embassy, "id" | "createdAt" | "updatedAt"> = {
  country: "",
  locatedInCountry: "",
  missionType: "embassy",
  city: "",
  address: "",
  phone: "",
  email: "",
  website: "",
  appointmentBookingUrl: "",
  latitude: null,
  longitude: null,
  jurisdictionNotes: "",
  operatingHours: "",
  services: [],
  isActive: true,
}

async function fetchEmbassies(): Promise<Embassy[]> {
  const res = await fetch("/api/admin/embassies", { cache: "no-store" })
  if (!res.ok) return []
  return ((await res.json()) as { embassies: Embassy[] }).embassies
}

export function AdminEmbassiesClient() {
  const [embassies, setEmbassies] = useState<Embassy[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Embassy | typeof BLANK>(BLANK)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState("")

  useEffect(() => {
    fetchEmbassies()
      .then(setEmbassies)
      .finally(() => setLoading(false))
  }, [])

  function selectEmbassy(id: string) {
    const e = embassies.find((row) => row.id === id)
    if (!e) return
    setActiveId(id)
    setDraft({ ...e })
    setStatus("")
  }

  function newEmbassy() {
    setActiveId(null)
    setDraft(BLANK)
    setStatus("")
  }

  async function save() {
    if (saving) return
    setSaving(true)
    setStatus("")
    try {
      const isNew = activeId === null
      const res = await fetch(isNew ? "/api/admin/embassies" : `/api/admin/embassies/${activeId}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      })
      if (!res.ok) throw new Error("save failed")
      const data = (await res.json()) as { embassy: Embassy }
      setEmbassies((prev) => (isNew ? [data.embassy, ...prev] : prev.map((e) => (e.id === data.embassy.id ? data.embassy : e))))
      setActiveId(data.embassy.id)
      setDraft(data.embassy)
      setStatus("Saved.")
    } catch {
      setStatus("Unable to save embassy.")
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this embassy entry?")) return
    const res = await fetch(`/api/admin/embassies/${id}`, { method: "DELETE" })
    if (!res.ok) return
    setEmbassies((prev) => prev.filter((e) => e.id !== id))
    if (activeId === id) newEmbassy()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading embassies…
      </div>
    )
  }

  return (
    <div className="grid gap-0 lg:grid-cols-[280px_1fr]">
      <aside className="border-b border-white/10 p-4 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wide text-white/40">Embassies</p>
          <button type="button" onClick={newEmbassy} className="text-white/60 hover:text-white">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 space-y-1">
          {embassies.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => selectEmbassy(e.id)}
              className={`block w-full rounded-xl px-3 py-2 text-left text-sm ${
                activeId === e.id ? "bg-white text-[#0f172a] font-semibold" : "text-white/70 hover:bg-white/10"
              }`}
            >
              {e.country} in {e.city}
            </button>
          ))}
        </div>
      </aside>

      <div className="space-y-4 p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold">{activeId ? "Edit embassy" : "New embassy"}</h1>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => void save()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#e0511f] px-4 py-2 text-sm font-semibold disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </button>
            {activeId ? (
              <button
                type="button"
                onClick={() => void remove(activeId)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-white/60 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
        {status ? <p className="text-sm text-emerald-400">{status}</p> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-white/50">Represents country</span>
            <input value={draft.country} onChange={(e) => setDraft({ ...draft, country: e.target.value })} className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white" />
          </label>
          <label className="block text-sm">
            <span className="text-white/50">Located in country</span>
            <input value={draft.locatedInCountry} onChange={(e) => setDraft({ ...draft, locatedInCountry: e.target.value })} className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white" />
          </label>
          <label className="block text-sm">
            <span className="text-white/50">City</span>
            <input value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white" />
          </label>
          <label className="block text-sm">
            <span className="text-white/50">Mission type</span>
            <select value={draft.missionType} onChange={(e) => setDraft({ ...draft, missionType: e.target.value as MissionType })} className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white">
              {MISSION_TYPES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-white/50">Address</span>
          <input value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-white/50">Phone</span>
            <input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white" />
          </label>
          <label className="block text-sm">
            <span className="text-white/50">Email</span>
            <input value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white" />
          </label>
          <label className="block text-sm">
            <span className="text-white/50">Website</span>
            <input value={draft.website} onChange={(e) => setDraft({ ...draft, website: e.target.value })} className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white" />
          </label>
          <label className="block text-sm">
            <span className="text-white/50">Appointment booking URL</span>
            <input value={draft.appointmentBookingUrl} onChange={(e) => setDraft({ ...draft, appointmentBookingUrl: e.target.value })} className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white" />
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-white/50">Operating hours</span>
          <input value={draft.operatingHours} onChange={(e) => setDraft({ ...draft, operatingHours: e.target.value })} className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white" />
        </label>
        <label className="block text-sm">
          <span className="text-white/50">Jurisdiction notes</span>
          <textarea value={draft.jurisdictionNotes} onChange={(e) => setDraft({ ...draft, jurisdictionNotes: e.target.value })} rows={2} className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white" />
        </label>
      </div>
    </div>
  )
}

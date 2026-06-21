"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  ClipboardList,
  Loader2,
  MapPin,
  Plane,
  Plus,
  Sparkles,
  Trash2,
  User,
} from "lucide-react"
import type { MoveBooking } from "@/lib/bookings/types"
import { fetchBookings } from "@/lib/bookings/client"
import {
  createSavedSearch,
  deleteSavedSearch,
  fetchProfileWorkspace,
  saveProfile,
} from "@/lib/profile/client"
import type { SavedSearch, UserProfile } from "@/lib/profile/types"
import type { RelocationPlan, RelocationTask } from "@/lib/relocate/types"
import { fetchWorkspace } from "@/lib/relocate/client"

interface DestinationOption {
  id: string
  city: string
  country: string
}

interface ProfileWorkspaceProps {
  authName: string
  authEmail: string
}

const STAY_LABELS: Record<string, string> = {
  trip: "Short trip (1–4 weeks)",
  nomad: "Nomad stay (1–6 months)",
  move: "Full relocation (6+ months)",
}

export function ProfileWorkspace({ authName, authEmail }: ProfileWorkspaceProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusMsg, setStatusMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [avatarHint, setAvatarHint] = useState("")

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [plan, setPlan] = useState<RelocationPlan | null>(null)
  const [tasks, setTasks] = useState<RelocationTask[]>([])
  const [bookings, setBookings] = useState<MoveBooking[]>([])
  const [destinations, setDestinations] = useState<DestinationOption[]>([])

  const [searchForm, setSearchForm] = useState({
    name: "",
    citySlug: "",
    budgetMin: "",
    budgetMax: "",
  })
  const [creatingSearch, setCreatingSearch] = useState(false)

  const displayName = profile?.fullName || authName
  const completedTasks = useMemo(() => tasks.filter((t) => t.status === "done").length, [tasks])
  const activeBookings = useMemo(() => bookings.filter((b) => b.status !== "cancelled"), [bookings])

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setErrorMsg("")
      try {
        const [workspace, relocate, bookingRows, destRes] = await Promise.all([
          fetchProfileWorkspace(),
          fetchWorkspace().catch(() => ({ plan: null, tasks: [], contacts: [] })),
          fetchBookings().catch(() => []),
          fetch("/api/move/destinations", { cache: "no-store" }).then(async (res) => {
            if (!res.ok) return [] as DestinationOption[]
            const data = (await res.json()) as { destinations?: DestinationOption[] }
            return data.destinations ?? []
          }),
        ])
        if (!mounted) return
        setProfile(workspace.profile)
        setSavedSearches(workspace.savedSearches)
        setPlan(relocate.plan)
        setTasks(relocate.tasks)
        setBookings(bookingRows)
        setDestinations(destRes)
      } catch {
        if (mounted) setErrorMsg("Unable to load your profile right now.")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void load()
    return () => {
      mounted = false
    }
  }, [])

  function updateField<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setProfile((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  function togglePreferredDestination(id: string) {
    setProfile((prev) => {
      if (!prev) return prev
      const set = new Set(prev.movePreferredDestinations)
      if (set.has(id)) set.delete(id)
      else set.add(id)
      return { ...prev, movePreferredDestinations: [...set] }
    })
  }

  async function handleSave() {
    if (!profile || saving) return
    setSaving(true)
    setStatusMsg("")
    setErrorMsg("")
    try {
      const saved = await saveProfile(profile)
      setProfile(saved)
      setStatusMsg("Profile saved.")
    } catch {
      setErrorMsg("Unable to save profile.")
    } finally {
      setSaving(false)
    }
  }

  async function handleCreateSearch() {
    const name = searchForm.name.trim()
    if (!name || creatingSearch) return
    setCreatingSearch(true)
    setErrorMsg("")
    try {
      const saved = await createSavedSearch({
        name,
        citySlug: searchForm.citySlug || undefined,
        budgetMin: searchForm.budgetMin ? Number(searchForm.budgetMin) : null,
        budgetMax: searchForm.budgetMax ? Number(searchForm.budgetMax) : null,
      })
      setSavedSearches((prev) => [saved, ...prev])
      setSearchForm({ name: "", citySlug: "", budgetMin: "", budgetMax: "" })
      setStatusMsg("Saved search added.")
    } catch {
      setErrorMsg("Unable to save search.")
    } finally {
      setCreatingSearch(false)
    }
  }

  async function handleDeleteSearch(id: string) {
    const prev = savedSearches
    setSavedSearches((list) => list.filter((item) => item.id !== id))
    try {
      await deleteSavedSearch(id)
    } catch {
      setSavedSearches(prev)
      setErrorMsg("Unable to delete saved search.")
    }
  }

  function destinationLabel(slug: string | null) {
    if (!slug) return "Any destination"
    const match = destinations.find((d) => d.id === slug)
    return match ? `${match.city}, ${match.country}` : slug
  }

  if (loading || !profile) {
    return (
      <div className="mx-auto flex max-w-5xl items-center justify-center px-4 py-20">
        <div className="inline-flex items-center gap-2 rounded-xl border border-[#dbe4f0] bg-white px-4 py-3 text-sm text-[#475569]">
          <Loader2 className="h-4 w-4 animate-spin text-[#e0511f]" />
          Loading profile…
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden pb-20 pt-6 sm:px-6 sm:pt-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-[#e0511f]/[0.07] via-[#0f766e]/[0.04] to-transparent" />
      <div className="relative mx-auto max-w-5xl space-y-6 px-4">
        {/* Hero */}
        <div className="emz-hero-bento flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setAvatarHint("Photo upload arrives in a future update — your avatar will sync here.")}
              className="group relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e0511f] to-[#0f4ec4] text-white shadow-lg shadow-[#e0511f]/30"
              aria-label="Change profile photo"
            >
              <User className="h-9 w-9" strokeWidth={1.75} />
              <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/0 transition group-hover:bg-black/25">
                <Camera className="h-5 w-5 opacity-0 transition group-hover:opacity-100" />
              </span>
            </button>
            <div>
              <span className="emz-section-eyebrow !text-[10px]">
                <Sparkles className="h-3 w-3" />
                Your account
              </span>
              <h1 className="mt-2 font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a] sm:text-4xl">{displayName}</h1>
              <p className="mt-1 text-sm text-[#64748b]">{authEmail}</p>
              {avatarHint ? <p className="mt-2 text-xs text-[#64748b]">{avatarHint}</p> : null}
            </div>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSave()}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e0511f] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {saving ? "Saving…" : "Save profile"}
          </button>
        </div>

        {statusMsg ? (
          <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-sm text-[#059669]">{statusMsg}</div>
        ) : null}
        {errorMsg ? (
          <div className="flex items-center gap-2 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errorMsg}
          </div>
        ) : null}

        {/* Summary cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/move" className="emz-rich-card group block p-6 transition hover:border-[#e0511f]/30 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#e0511f]">My plan</p>
                <h2 className="mt-1 font-[var(--font-playfair)] text-xl font-semibold text-[#0f172a]">
                  {plan?.destinationCity ? `${plan.destinationCity}${plan.destinationCountry ? `, ${plan.destinationCountry}` : ""}` : "No destination saved yet"}
                </h2>
                <p className="mt-2 text-sm text-[#64748b]">
                  {plan
                    ? `${plan.status.replace(/_/g, " ")} · ${completedTasks}/${tasks.length} tasks done`
                    : "Save a plan in the Move app to get started."}
                </p>
              </div>
              <ClipboardList className="h-5 w-5 text-[#e0511f]" />
            </div>
            <p className="mt-4 text-xs font-semibold text-[#e0511f] group-hover:underline">Open Move app →</p>
          </Link>

          <Link href="/move" className="emz-rich-card group block p-6 transition hover:border-[#e0511f]/30 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#e0511f]">My bookings</p>
                <h2 className="mt-1 font-[var(--font-playfair)] text-xl font-semibold text-[#0f172a]">
                  {activeBookings.length} active reservation{activeBookings.length === 1 ? "" : "s"}
                </h2>
                <p className="mt-2 text-sm text-[#64748b]">
                  {bookings.length === 0
                    ? "Book trips, stays, or visa support from the Move app."
                    : bookings.slice(0, 2).map((b) => b.itemTitle).join(" · ")}
                </p>
              </div>
              <Plane className="h-5 w-5 text-[#e0511f]" />
            </div>
            <p className="mt-4 text-xs font-semibold text-[#e0511f] group-hover:underline">Manage bookings →</p>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          {/* Personal + move preferences */}
          <article className="emz-rich-card space-y-6 p-6 sm:p-8">
            <div>
              <h2 className="font-[var(--font-playfair)] text-xl font-bold text-[#0f172a]">Personal details</h2>
              <p className="mt-1 text-sm text-[#64748b]">How we reach you and where you&apos;re coming from</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-[#475569]">Full name</span>
                <input
                  value={profile.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  placeholder={authName}
                  className="w-full rounded-xl border border-[#dbe4f0] px-3 py-2.5"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-[#475569]">Phone</span>
                <input
                  value={profile.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="+1 555 000 0000"
                  className="w-full rounded-xl border border-[#dbe4f0] px-3 py-2.5"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-[#475569]">Nationality</span>
                <input
                  value={profile.nationality}
                  onChange={(e) => updateField("nationality", e.target.value)}
                  placeholder="e.g. Nigerian, British"
                  className="w-full rounded-xl border border-[#dbe4f0] px-3 py-2.5"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-[#475569]">Preferred contact</span>
                <select
                  value={profile.preferredContactMethod}
                  onChange={(e) => updateField("preferredContactMethod", e.target.value as UserProfile["preferredContactMethod"])}
                  className="w-full rounded-xl border border-[#dbe4f0] px-3 py-2.5"
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </label>
            </div>

            <div className="border-t border-[#e2e8f0] pt-6">
              <h3 className="font-[var(--font-playfair)] text-lg font-semibold text-[#0f172a]">Move preferences</h3>
              <p className="mt-1 text-sm text-[#64748b]">Helps us tailor destinations and planning tips</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block text-sm sm:col-span-2">
                  <span className="mb-1 block font-medium text-[#475569]">Work mode</span>
                  <select
                    value={profile.moveWorkMode ?? ""}
                    onChange={(e) => updateField("moveWorkMode", (e.target.value || null) as UserProfile["moveWorkMode"])}
                    className="w-full rounded-xl border border-[#dbe4f0] px-3 py-2.5"
                  >
                    <option value="">Not set</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-site assignment</option>
                    <option value="business_owner">Business owner</option>
                    <option value="student">Student</option>
                  </select>
                </label>
                <label className="block text-sm sm:col-span-2">
                  <span className="mb-1 block font-medium text-[#475569]">Stay length</span>
                  <select
                    value={profile.moveStayPreference ?? ""}
                    onChange={(e) => updateField("moveStayPreference", (e.target.value || null) as UserProfile["moveStayPreference"])}
                    className="w-full rounded-xl border border-[#dbe4f0] px-3 py-2.5"
                  >
                    <option value="">Not set</option>
                    {Object.entries(STAY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </label>
              </div>

              {destinations.length > 0 ? (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium text-[#475569]">Preferred destinations</p>
                  <div className="flex flex-wrap gap-2">
                    {destinations.map((dest) => {
                      const active = profile.movePreferredDestinations.includes(dest.id)
                      return (
                        <button
                          key={dest.id}
                          type="button"
                          onClick={() => togglePreferredDestination(dest.id)}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                            active
                              ? "bg-[#e0511f] text-white"
                              : "border border-[#dbe4f0] bg-white text-[#475569] hover:border-[#e0511f]/40"
                          }`}
                        >
                          {dest.city}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : null}

              <label className="mt-4 block text-sm">
                <span className="mb-1 block font-medium text-[#475569]">Notes</span>
                <textarea
                  value={profile.moveNotes}
                  onChange={(e) => updateField("moveNotes", e.target.value)}
                  rows={3}
                  placeholder="Visa constraints, family needs, timing, budget context…"
                  className="w-full rounded-xl border border-[#dbe4f0] px-3 py-2.5"
                />
              </label>
            </div>
          </article>

          {/* Quick links + saved searches */}
          <div className="space-y-6">
            <article className="emz-rich-card p-6">
              <h2 className="font-[var(--font-playfair)] text-lg font-semibold text-[#0f172a]">Quick links</h2>
              <div className="mt-4 space-y-2">
                <Link href="/move" className="flex items-center gap-3 rounded-xl border border-[#dbe4f0] bg-[#f8fbff] p-3 text-sm font-semibold text-[#0f172a] transition hover:border-[#e0511f]/40">
                  <MapPin className="h-4 w-4 text-[#e0511f]" />
                  Open the Move app
                </Link>
                <Link href="/contact" className="flex items-center gap-3 rounded-xl border border-[#dbe4f0] bg-[#f8fbff] p-3 text-sm font-semibold text-[#0f172a] transition hover:border-[#e0511f]/40">
                  <Sparkles className="h-4 w-4 text-[#e0511f]" />
                  Contact support
                </Link>
              </div>
            </article>

            <article className="emz-rich-card p-6">
              <h2 className="font-[var(--font-playfair)] text-lg font-semibold text-[#0f172a]">Saved destination searches</h2>
              <p className="mt-1 text-sm text-[#64748b]">Bookmark cities and budget ranges to revisit later</p>

              <div className="mt-4 space-y-2">
                <input
                  value={searchForm.name}
                  onChange={(e) => setSearchForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Search name"
                  className="w-full rounded-xl border border-[#dbe4f0] px-3 py-2 text-sm"
                />
                <select
                  value={searchForm.citySlug}
                  onChange={(e) => setSearchForm((prev) => ({ ...prev, citySlug: e.target.value }))}
                  className="w-full rounded-xl border border-[#dbe4f0] px-3 py-2 text-sm"
                >
                  <option value="">Any destination</option>
                  {destinations.map((d) => (
                    <option key={d.id} value={d.id}>{d.city}, {d.country}</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min={0}
                    value={searchForm.budgetMin}
                    onChange={(e) => setSearchForm((prev) => ({ ...prev, budgetMin: e.target.value }))}
                    placeholder="Budget min (USD/mo)"
                    className="rounded-xl border border-[#dbe4f0] px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    min={0}
                    value={searchForm.budgetMax}
                    onChange={(e) => setSearchForm((prev) => ({ ...prev, budgetMax: e.target.value }))}
                    placeholder="Budget max (USD/mo)"
                    className="rounded-xl border border-[#dbe4f0] px-3 py-2 text-sm"
                  />
                </div>
                <button
                  type="button"
                  disabled={creatingSearch}
                  onClick={() => void handleCreateSearch()}
                  className="inline-flex items-center gap-2 rounded-full bg-[#091520] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {creatingSearch ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  Save search
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {savedSearches.length === 0 ? (
                  <p className="text-sm text-[#64748b]">No saved searches yet.</p>
                ) : (
                  savedSearches.map((search) => (
                    <div key={search.id} className="flex items-start justify-between gap-2 rounded-xl border border-[#dbe4f0] bg-[#f8fbff] p-3">
                      <div>
                        <p className="text-sm font-semibold text-[#0f172a]">{search.name}</p>
                        <p className="text-xs text-[#64748b]">{destinationLabel(search.citySlug)}</p>
                        {(search.budgetMin || search.budgetMax) ? (
                          <p className="mt-0.5 text-xs text-[#64748b]">
                            ${search.budgetMin?.toLocaleString() ?? "—"} – ${search.budgetMax?.toLocaleString() ?? "—"} / mo
                          </p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleDeleteSearch(search.id)}
                        className="rounded-lg border border-[#dbe4f0] p-1.5 text-[#94a3b8] hover:text-red-600"
                        aria-label="Delete saved search"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { SubmitListingForm } from "@/components/profile/SubmitListingForm"
import { JourneyFlowStrip } from "@/components/platform/JourneyFlowStrip"
import type { RelocationContact, RelocationPlan, RelocationTask } from "@/lib/relocate/types"
import {
  User, MapPin, Phone, Mail, Building2, BadgeCheck, Clock,
  Trash2, Plus, Heart, Home, Briefcase, ChevronRight, AlertCircle,
  CheckCircle, Save, Shield,
} from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────────────────

type ProfileRole = "buyer" | "seller"
type ContactMethod = "email" | "phone" | "whatsapp"
type ListingType = "rent" | "buy" | "commercial"

interface ProfileData {
  role: ProfileRole
  fullName: string
  phone: string
  preferredContactMethod: ContactMethod
  buyerPreferredCities: string[]
  buyerListingTypes: ListingType[]
  buyerBudgetMin: number | null
  buyerBudgetMax: number | null
  buyerBedroomsMin: number | null
  buyerNotes: string
  sellerCompanyName: string
  sellerLicense: string
  sellerServiceCities: string[]
  sellerPropertyTypes: ListingType[]
  sellerNotes: string
  isAgent: boolean
  agentLicense: string
  agentCompany: string
  agentBio: string
  agentVerified: boolean
}

interface SavedSearch {
  id: string
  name: string
  citySlug: string | null
  listingType: ListingType | null
  budgetMin: number | null
  budgetMax: number | null
  bedroomsMin: number | null
  createdAt: string
}

interface NewSavedSearchForm {
  name: string
  citySlug: string
  listingType: "" | ListingType
  budgetMin: string
  budgetMax: string
  bedroomsMin: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const emptyProfile: ProfileData = {
  role: "buyer",
  fullName: "",
  phone: "",
  preferredContactMethod: "email",
  buyerPreferredCities: [],
  buyerListingTypes: [],
  buyerBudgetMin: null,
  buyerBudgetMax: null,
  buyerBedroomsMin: null,
  buyerNotes: "",
  sellerCompanyName: "",
  sellerLicense: "",
  sellerServiceCities: [],
  sellerPropertyTypes: [],
  sellerNotes: "",
  isAgent: false,
  agentLicense: "",
  agentCompany: "",
  agentBio: "",
  agentVerified: false,
}

const initialSavedSearchForm: NewSavedSearchForm = {
  name: "", citySlug: "", listingType: "",
  budgetMin: "", budgetMax: "", bedroomsMin: "",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function csvToArray(value: string): string[] {
  return value.split(",").map((s) => s.trim()).filter(Boolean)
}
function arrayToCsv(value: string[]): string { return value.join(", ") }

function InputField({
  label, value, onChange, type = "text", placeholder, className = "",
}: {
  label: string; value: string | number; onChange: (v: string) => void
  type?: string; placeholder?: string; className?: string
}) {
  return (
    <label className={`block text-sm font-medium text-[#475569] ${className}`}>
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl border border-[#c8d8f0] bg-white px-3 py-2.5 text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#155eef] focus:outline-none focus:ring-2 focus:ring-[#155eef]/20"
      />
    </label>
  )
}

function SectionCard({ title, icon: Icon, children, accent }: {
  title: string; icon: React.ElementType; children: React.ReactNode; accent?: string
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#dbe4f0] bg-white shadow-sm">
      <div className={`flex items-center gap-3 border-b border-[#e8edf6] px-6 py-4 ${accent ?? "bg-[#f8fbff]"}`}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#155eef]/10">
          <Icon className="h-4 w-4 text-[#155eef]" />
        </div>
        <h2 className="font-semibold text-[#0f172a]">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ProfileWorkspace({
  initialRole, displayName, email, cityOptions,
}: {
  initialRole: ProfileRole
  displayName: string
  email: string
  cityOptions: Array<{ slug: string; name: string }>
}) {
  const [profile, setProfile] = useState<ProfileData>({ ...emptyProfile, role: initialRole, fullName: displayName })
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "ok" | "error">("idle")
  const [statusMsg, setStatusMsg] = useState("")
  const [newSearch, setNewSearch] = useState<NewSavedSearchForm>(initialSavedSearchForm)
  const [savingSearch, setSavingSearch] = useState(false)
  const [activeSection, setActiveSection] = useState<"details" | "preferences" | "relocation" | "listings">("details")
  const [relocationPlan, setRelocationPlan] = useState<RelocationPlan | null>(null)
  const [relocationTasks, setRelocationTasks] = useState<RelocationTask[]>([])
  const [relocationContacts, setRelocationContacts] = useState<RelocationContact[]>([])
  const [relocationLoading, setRelocationLoading] = useState(true)
  const [relocationError, setRelocationError] = useState("")
  const [updatingRelocationStatus, setUpdatingRelocationStatus] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const [profileRes] = await Promise.all([
          fetch("/api/profile"),
          loadRelocationWorkspace(),
        ])
        const data = (await profileRes.json()) as { profile?: ProfileData; savedSearches?: SavedSearch[] }
        if (!mounted) return
        setProfile({ ...emptyProfile, role: initialRole, fullName: displayName, ...data.profile })
        setSavedSearches(data.savedSearches ?? [])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void load()
    return () => { mounted = false }
  }, [displayName, initialRole])

  function upd<K extends keyof ProfileData>(k: K, v: ProfileData[K]) {
    setProfile((prev) => ({ ...prev, [k]: v }))
  }

  async function loadRelocationWorkspace() {
    setRelocationLoading(true)
    setRelocationError("")
    try {
      const res = await fetch("/api/relocate/plan", { cache: "no-store" })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        setRelocationError(data.error ?? "Unable to load relocation workspace.")
        return
      }
      const data = (await res.json()) as {
        plan: RelocationPlan | null
        tasks: RelocationTask[]
        contacts: RelocationContact[]
      }
      setRelocationPlan(data.plan ?? null)
      setRelocationTasks(data.tasks ?? [])
      setRelocationContacts(data.contacts ?? [])
    } catch {
      setRelocationError("Unable to load relocation workspace.")
    } finally {
      setRelocationLoading(false)
    }
  }

  async function updateRelocationStatus(status: RelocationPlan["status"]) {
    setUpdatingRelocationStatus(true)
    setRelocationError("")
    try {
      const planPayload = relocationPlan
        ? { ...relocationPlan, status }
        : { planName: "My relocation plan", status }
      const res = await fetch("/api/relocate/plan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: planPayload,
        }),
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        setRelocationError(data.error ?? "Unable to update relocation status.")
        return
      }
      const data = (await res.json()) as { plan: RelocationPlan }
      setRelocationPlan(data.plan)
    } catch {
      setRelocationError("Unable to update relocation status.")
    } finally {
      setUpdatingRelocationStatus(false)
    }
  }

  const buyerCitiesCsv = useMemo(() => arrayToCsv(profile.buyerPreferredCities), [profile.buyerPreferredCities])
  const sellerCitiesCsv = useMemo(() => arrayToCsv(profile.sellerServiceCities), [profile.sellerServiceCities])
  const completedRelocationTasks = useMemo(
    () => relocationTasks.filter((task) => task.status === "done").length,
    [relocationTasks]
  )
  const relocationBudgetTotal = useMemo(() => {
    if (!relocationPlan) return 0
    return (
      relocationPlan.budgetHousingUsd +
      relocationPlan.budgetTravelUsd +
      relocationPlan.budgetSetupUsd +
      relocationPlan.budgetBufferUsd
    )
  }, [relocationPlan])

  async function saveProfile() {
    setSaving(true); setSaveStatus("idle"); setStatusMsg("")
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      })
      const data = (await res.json()) as { profile?: ProfileData; error?: string }
      if (!res.ok) { setSaveStatus("error"); setStatusMsg(data.error ?? "Could not save profile."); return }
      if (data.profile) setProfile(data.profile)
      setSaveStatus("ok"); setStatusMsg("Profile saved successfully.")
      setTimeout(() => setSaveStatus("idle"), 3000)
    } finally {
      setSaving(false)
    }
  }

  async function createSavedSearch() {
    if (!newSearch.name.trim()) { setStatusMsg("Search name is required."); return }
    setSavingSearch(true)
    try {
      const res = await fetch("/api/profile/saved-searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSearch.name,
          citySlug: newSearch.citySlug || null,
          listingType: newSearch.listingType || null,
          budgetMin: newSearch.budgetMin ? Number(newSearch.budgetMin) : null,
          budgetMax: newSearch.budgetMax ? Number(newSearch.budgetMax) : null,
          bedroomsMin: newSearch.bedroomsMin ? Number(newSearch.bedroomsMin) : null,
        }),
      })
      const data = (await res.json()) as { savedSearch?: SavedSearch; error?: string }
      if (!res.ok || !data.savedSearch) { setStatusMsg(data.error ?? "Could not save search."); return }
      setSavedSearches((prev) => [data.savedSearch as SavedSearch, ...prev])
      setNewSearch(initialSavedSearchForm)
    } finally {
      setSavingSearch(false)
    }
  }

  async function deleteSearch(id: string) {
    const prev = savedSearches
    setSavedSearches((s) => s.filter((x) => x.id !== id))
    const res = await fetch(`/api/profile/saved-searches/${id}`, { method: "DELETE" })
    if (!res.ok) { setSavedSearches(prev); setStatusMsg("Could not delete saved search.") }
  }

  const role = profile.role
  const initials = (displayName || email).slice(0, 2).toUpperCase()

  const NAV_ITEMS = [
    { id: "details" as const, label: "My details", icon: User },
    { id: "preferences" as const, label: role === "buyer" ? "Buyer preferences" : "Seller profile", icon: role === "buyer" ? Heart : Briefcase },
    { id: "relocation" as const, label: "Relocation workspace", icon: MapPin },
    ...(role === "seller" ? [{ id: "listings" as const, label: "List a property", icon: Home }] : []),
  ]

  return (
    <div className="min-h-screen bg-[#f4f7fc]">
      {/* ── Header banner ── */}
      <div className="bg-gradient-to-r from-[#0b1f4a] to-[#155eef] px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-xl font-black text-white backdrop-blur-sm">
              {initials}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">My Account</p>
              <h1 className="text-2xl font-black text-white">{displayName}</h1>
              <p className="text-sm text-white/60">{email}</p>
            </div>
            <div className="ml-auto flex flex-wrap gap-2">
              {/* Role toggle */}
              <div className="inline-flex rounded-full border border-white/20 bg-white/10 p-1 backdrop-blur-sm">
                <button type="button"
                  onClick={() => { upd("role", "buyer"); setActiveSection("details") }}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${role === "buyer" ? "bg-white text-[#155eef]" : "text-white/70 hover:text-white"}`}
                >
                  Buyer
                </button>
                <button type="button"
                  onClick={() => { upd("role", "seller"); setActiveSection("details") }}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${role === "seller" ? "bg-white text-[#155eef]" : "text-white/70 hover:text-white"}`}
                >
                  Seller
                </button>
              </div>
            </div>
          </div>

          {/* Agent status badge */}
          {profile.isAgent && (
            <div className="mt-4">
              {profile.agentVerified ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/20 border border-green-400/30 px-3 py-1 text-xs font-bold text-green-300">
                  <BadgeCheck className="h-3.5 w-3.5" /> Verified Agent · {profile.agentCompany || "Independent"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 px-3 py-1 text-xs font-bold text-amber-300">
                  <Clock className="h-3.5 w-3.5" /> Agent application pending admin review
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <JourneyFlowStrip current="profile" />

      {/* ── Content ── */}
      <div className="mx-auto -mt-10 w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[240px_1fr]">

          {/* ── Sidebar nav ── */}
          <aside className="space-y-2">
            <div className="overflow-hidden rounded-2xl border border-[#dbe4f0] bg-white shadow-sm">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveSection(id)}
                  className={`flex w-full items-center gap-3 border-b border-[#f0f4fa] px-4 py-3.5 text-left text-sm font-semibold last:border-0 transition ${
                    activeSection === id
                      ? "bg-[#eef4ff] text-[#155eef]"
                      : "text-[#475569] hover:bg-[#f8fbff]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  <ChevronRight className={`ml-auto h-3.5 w-3.5 transition-transform ${activeSection === id ? "rotate-90" : ""}`} />
                </button>
              ))}
            </div>

            {/* Quick save */}
            <button
              type="button"
              onClick={() => void saveProfile()}
              disabled={saving || loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#155eef] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#1347c8] disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving…" : "Save profile"}
            </button>

            {saveStatus !== "idle" && (
              <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold ${
                saveStatus === "ok"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}>
                {saveStatus === "ok" ? <CheckCircle className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                {statusMsg}
              </div>
            )}

            {loading && (
              <p className="text-center text-xs text-[#94a3b8]">Loading profile…</p>
            )}
          </aside>

          {/* ── Main content ── */}
          <div className="space-y-5">

            {/* ── Details section ── */}
            {activeSection === "details" && (
              <>
                <SectionCard title="Personal details" icon={User}>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <InputField label="Full name" value={profile.fullName}
                      onChange={(v) => upd("fullName", v)} placeholder="Your legal name" className="lg:col-span-2" />
                    <InputField label="Phone number" value={profile.phone}
                      onChange={(v) => upd("phone", v)} placeholder="+234 800 000 0000" />
                  </div>
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium text-[#475569]">Preferred contact method</p>
                    <div className="flex gap-2">
                      {(["email", "phone", "whatsapp"] as ContactMethod[]).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => upd("preferredContactMethod", m)}
                          className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold capitalize transition ${
                            profile.preferredContactMethod === m
                              ? "border-[#155eef] bg-[#eef4ff] text-[#155eef]"
                              : "border-[#dbe4f0] bg-white text-[#475569] hover:border-[#c8d8f0]"
                          }`}
                        >
                          {m === "email" && <Mail className="h-3.5 w-3.5" />}
                          {m === "phone" && <Phone className="h-3.5 w-3.5" />}
                          {m === "whatsapp" && <Phone className="h-3.5 w-3.5" />}
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Account role" icon={Shield}>
                  <p className="text-sm text-[#64748b] mb-4">
                    Switch between buyer and seller mode. Your preferences for each role are saved separately.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {([
                      { r: "buyer" as ProfileRole, icon: Heart, title: "Buyer", desc: "Search properties, save searches, track listings you love." },
                      { r: "seller" as ProfileRole, icon: Building2, title: "Seller / Agent", desc: "Submit properties, manage listings, declare agent status." },
                    ]).map(({ r, icon: Icon, title, desc }) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => upd("role", r)}
                        className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition ${
                          role === r ? "border-[#155eef] bg-[#eef4ff]" : "border-[#dbe4f0] bg-white hover:border-[#c8d8f0]"
                        }`}
                      >
                        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${role === r ? "bg-[#155eef]" : "bg-[#f0f4fa]"}`}>
                          <Icon className={`h-4 w-4 ${role === r ? "text-white" : "text-[#64748b]"}`} />
                        </div>
                        <div>
                          <p className="font-bold text-[#0f172a]">{title}</p>
                          <p className="text-xs text-[#64748b]">{desc}</p>
                        </div>
                        {role === r && <CheckCircle className="ml-auto h-4 w-4 shrink-0 text-[#155eef]" />}
                      </button>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard title="Relocation workspace overview" icon={MapPin}>
                  {relocationLoading ? (
                    <p className="text-sm text-[#64748b]">Loading relocation summary…</p>
                  ) : (
                    <>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-xl border border-[#dbe4f0] bg-[#f8fbff] p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#64748b]">Status</p>
                          <p className="mt-1 text-sm font-bold text-[#0f172a]">
                            {relocationPlan ? relocationPlan.status.replace("_", " ") : "Not started"}
                          </p>
                        </div>
                        <div className="rounded-xl border border-[#dbe4f0] bg-[#f8fbff] p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#64748b]">Tasks</p>
                          <p className="mt-1 text-sm font-bold text-[#0f172a]">
                            {completedRelocationTasks}/{relocationTasks.length} done
                          </p>
                        </div>
                        <div className="rounded-xl border border-[#dbe4f0] bg-[#f8fbff] p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#64748b]">Contacts</p>
                          <p className="mt-1 text-sm font-bold text-[#0f172a]">{relocationContacts.length} saved</p>
                        </div>
                        <div className="rounded-xl border border-[#dbe4f0] bg-[#f8fbff] p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#64748b]">Budget</p>
                          <p className="mt-1 text-sm font-bold text-[#0f172a]">${relocationBudgetTotal.toLocaleString()}</p>
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-[#94a3b8]">
                        Destination: {relocationPlan?.destinationCity || "—"}, {relocationPlan?.destinationCountry || "—"}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveSection("relocation")}
                          className="rounded-full border border-[#155eef] bg-[#eef4ff] px-4 py-2 text-xs font-semibold text-[#155eef]"
                        >
                          Manage in profile
                        </button>
                        <Link href="/relocate" className="rounded-full border border-[#dbe4f0] px-4 py-2 text-xs font-semibold text-[#475569]">
                          Open full Relocate Hub
                        </Link>
                      </div>
                    </>
                  )}
                </SectionCard>
              </>
            )}

            {/* ── Relocation workspace ── */}
            {activeSection === "relocation" && (
              <SectionCard title="Relocation workspace sync" icon={MapPin}>
                {relocationLoading ? (
                  <p className="text-sm text-[#64748b]">Loading relocation workspace…</p>
                ) : (
                  <>
                    {relocationError ? (
                      <div className="mb-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {relocationError}
                      </div>
                    ) : null}

                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-xl border border-[#dbe4f0] bg-[#f8fbff] p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#64748b]">Destination</p>
                        <p className="mt-1 text-sm font-bold text-[#0f172a]">
                          {relocationPlan?.destinationCity || "—"}
                        </p>
                        <p className="text-xs text-[#64748b]">{relocationPlan?.destinationCountry || "—"}</p>
                      </div>
                      <div className="rounded-xl border border-[#dbe4f0] bg-[#f8fbff] p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#64748b]">Move date</p>
                        <p className="mt-1 text-sm font-bold text-[#0f172a]">{relocationPlan?.moveDate || "Not set"}</p>
                      </div>
                      <div className="rounded-xl border border-[#dbe4f0] bg-[#f8fbff] p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#64748b]">Checklist</p>
                        <p className="mt-1 text-sm font-bold text-[#0f172a]">{completedRelocationTasks}/{relocationTasks.length} completed</p>
                      </div>
                      <div className="rounded-xl border border-[#dbe4f0] bg-[#f8fbff] p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#64748b]">Support contacts</p>
                        <p className="mt-1 text-sm font-bold text-[#0f172a]">{relocationContacts.length}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                      <div>
                        <p className="mb-1 text-sm font-medium text-[#475569]">Relocation status</p>
                        <select
                          value={relocationPlan?.status ?? "planning"}
                          onChange={(e) => void updateRelocationStatus(e.target.value as RelocationPlan["status"])}
                          disabled={updatingRelocationStatus}
                          className="w-full rounded-xl border border-[#c8d8f0] bg-white px-3 py-2.5 text-sm focus:border-[#155eef] focus:outline-none disabled:opacity-50"
                        >
                          <option value="planning">Planning</option>
                          <option value="in_progress">In progress</option>
                          <option value="ready_to_move">Ready to move</option>
                          <option value="settled">Settled</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => void loadRelocationWorkspace()}
                        className="rounded-xl border border-[#dbe4f0] px-4 py-2.5 text-sm font-semibold text-[#475569] hover:border-[#c8d8f0]"
                      >
                        Refresh
                      </button>
                    </div>

                    <div className="mt-4 rounded-xl border border-[#dbe4f0] bg-[#f8fbff] p-3">
                      <p className="text-sm font-semibold text-[#0f172a]">Recent relocation tasks</p>
                      {relocationTasks.length === 0 ? (
                        <p className="mt-1 text-xs text-[#64748b]">No tasks yet. Start in Relocate Hub to generate your timeline.</p>
                      ) : (
                        <ul className="mt-2 space-y-1.5 text-xs text-[#475569]">
                          {relocationTasks.slice(0, 5).map((task) => (
                            <li key={task.id} className="flex items-center justify-between gap-2">
                              <span>{task.title}</span>
                              <span className="rounded-full bg-[#e8edf6] px-2 py-0.5 text-[10px]">{task.status.replace("_", " ")}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link href="/relocate" className="rounded-full bg-[#155eef] px-4 py-2 text-xs font-semibold text-white">
                        Open Relocate Hub
                      </Link>
                      <Link href="/cities" className="rounded-full border border-[#dbe4f0] px-4 py-2 text-xs font-semibold text-[#475569]">
                        Continue scouting cities
                      </Link>
                      <Link href="/listings" className="rounded-full border border-[#dbe4f0] px-4 py-2 text-xs font-semibold text-[#475569]">
                        Continue listing search
                      </Link>
                    </div>
                  </>
                )}
              </SectionCard>
            )}

            {/* ── Buyer preferences ── */}
            {activeSection === "preferences" && role === "buyer" && (
              <>
                <SectionCard title="Buying preferences" icon={Heart}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <p className="mb-1.5 text-sm font-medium text-[#475569]">Preferred cities</p>
                      <input
                        value={buyerCitiesCsv}
                        onChange={(e) => upd("buyerPreferredCities", csvToArray(e.target.value))}
                        placeholder="e.g. Lagos, Nairobi, Accra"
                        className="w-full rounded-xl border border-[#c8d8f0] bg-white px-3 py-2.5 text-sm focus:border-[#155eef] focus:outline-none focus:ring-2 focus:ring-[#155eef]/20"
                      />
                      <p className="mt-1 text-[11px] text-[#94a3b8]">Comma-separated city names</p>
                    </div>
                    <InputField label="Minimum bedrooms" value={profile.buyerBedroomsMin ?? ""} type="number"
                      onChange={(v) => upd("buyerBedroomsMin", v ? Number(v) : null)} placeholder="e.g. 3" />
                    <div />
                    <InputField label="Budget min (USD)" value={profile.buyerBudgetMin ?? ""} type="number"
                      onChange={(v) => upd("buyerBudgetMin", v ? Number(v) : null)} placeholder="e.g. 50000" />
                    <InputField label="Budget max (USD)" value={profile.buyerBudgetMax ?? ""} type="number"
                      onChange={(v) => upd("buyerBudgetMax", v ? Number(v) : null)} placeholder="e.g. 250000" />
                  </div>

                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium text-[#475569]">Ownership type</p>
                    <div className="flex gap-2">
                      {(["buy", "commercial"] as ListingType[]).map((t) => {
                        const sel = profile.buyerListingTypes.includes(t)
                        return (
                          <button key={t} type="button"
                            onClick={() => upd("buyerListingTypes", sel
                              ? profile.buyerListingTypes.filter((x) => x !== t)
                              : [...profile.buyerListingTypes, t])}
                            className={`rounded-full border px-4 py-2 text-xs font-semibold capitalize transition ${
                              sel ? "border-[#155eef] bg-[#eef4ff] text-[#155eef]" : "border-[#dbe4f0] bg-white text-[#475569]"
                            }`}
                          >{t}</button>
                        )
                      })}
                    </div>
                  </div>

                  <label className="mt-4 block text-sm font-medium text-[#475569]">
                    Additional notes
                    <textarea rows={3} value={profile.buyerNotes}
                      onChange={(e) => upd("buyerNotes", e.target.value)}
                      placeholder="Anything specific you're looking for…"
                      className="mt-1.5 w-full rounded-xl border border-[#c8d8f0] bg-white px-3 py-2.5 text-sm focus:border-[#155eef] focus:outline-none focus:ring-2 focus:ring-[#155eef]/20"
                    />
                  </label>
                </SectionCard>

                {/* Saved searches */}
                <SectionCard title="Saved searches" icon={MapPin}>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <input placeholder="Search name *" value={newSearch.name}
                      onChange={(e) => setNewSearch((p) => ({ ...p, name: e.target.value }))}
                      className="rounded-xl border border-[#c8d8f0] px-3 py-2.5 text-sm focus:border-[#155eef] focus:outline-none" />
                    <select value={newSearch.citySlug}
                      onChange={(e) => setNewSearch((p) => ({ ...p, citySlug: e.target.value }))}
                      className="rounded-xl border border-[#c8d8f0] bg-white px-3 py-2.5 text-sm focus:border-[#155eef] focus:outline-none">
                      <option value="">Any city</option>
                      {cityOptions.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                    </select>
                    <select value={newSearch.listingType}
                      onChange={(e) => setNewSearch((p) => ({ ...p, listingType: e.target.value as NewSavedSearchForm["listingType"] }))}
                      className="rounded-xl border border-[#c8d8f0] bg-white px-3 py-2.5 text-sm focus:border-[#155eef] focus:outline-none">
                      <option value="">Any type</option>
                      <option value="buy">Buy</option>
                      <option value="commercial">Commercial</option>
                    </select>
                    <InputField label="" value={newSearch.budgetMin} type="number" placeholder="Min budget (USD)"
                      onChange={(v) => setNewSearch((p) => ({ ...p, budgetMin: v }))} />
                    <InputField label="" value={newSearch.budgetMax} type="number" placeholder="Max budget (USD)"
                      onChange={(v) => setNewSearch((p) => ({ ...p, budgetMax: v }))} />
                    <button type="button" onClick={() => void createSavedSearch()} disabled={savingSearch}
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#155eef] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                      <Plus className="h-4 w-4" /> {savingSearch ? "Saving…" : "Save search"}
                    </button>
                  </div>

                  {savedSearches.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {savedSearches.map((s) => (
                        <li key={s.id} className="flex items-center justify-between rounded-xl border border-[#dbe4f0] bg-[#f8fbff] px-4 py-3">
                          <div>
                            <p className="text-sm font-semibold text-[#0f172a]">{s.name}</p>
                            <p className="text-xs text-[#64748b]">
                              {s.citySlug || "Any city"} · {s.listingType || "Any type"}
                              {s.budgetMin ? ` · From $${s.budgetMin.toLocaleString()}` : ""}
                              {s.budgetMax ? ` to $${s.budgetMax.toLocaleString()}` : ""}
                            </p>
                          </div>
                          <button type="button" onClick={() => void deleteSearch(s.id)}
                            className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#dbe4f0] text-[#94a3b8] hover:border-red-300 hover:text-red-500">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {savedSearches.length === 0 && (
                    <p className="mt-3 text-xs text-[#94a3b8]">No saved searches yet. Create one above to get notified of matching listings.</p>
                  )}
                </SectionCard>
              </>
            )}

            {/* ── Seller profile ── */}
            {activeSection === "preferences" && role === "seller" && (
              <>
                <SectionCard title="Seller details" icon={Building2}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InputField label="Company / business name" value={profile.sellerCompanyName}
                      onChange={(v) => upd("sellerCompanyName", v)} placeholder="e.g. Prime Realty" />
                    <InputField label="Registration / licence number" value={profile.sellerLicense}
                      onChange={(v) => upd("sellerLicense", v)} placeholder="e.g. RC-123456" />
                    <div className="sm:col-span-2">
                      <p className="mb-1.5 text-sm font-medium text-[#475569]">Cities you service</p>
                      <input value={sellerCitiesCsv}
                        onChange={(e) => upd("sellerServiceCities", csvToArray(e.target.value))}
                        placeholder="e.g. Lagos, Abuja, Port Harcourt"
                        className="w-full rounded-xl border border-[#c8d8f0] bg-white px-3 py-2.5 text-sm focus:border-[#155eef] focus:outline-none focus:ring-2 focus:ring-[#155eef]/20" />
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium text-[#475569]">Property types you sell</p>
                    <div className="flex gap-2">
                      {(["buy", "commercial"] as ListingType[]).map((t) => {
                        const sel = profile.sellerPropertyTypes.includes(t)
                        return (
                          <button key={t} type="button"
                            onClick={() => upd("sellerPropertyTypes", sel
                              ? profile.sellerPropertyTypes.filter((x) => x !== t)
                              : [...profile.sellerPropertyTypes, t])}
                            className={`rounded-full border px-4 py-2 text-xs font-semibold capitalize transition ${
                              sel ? "border-[#155eef] bg-[#eef4ff] text-[#155eef]" : "border-[#dbe4f0] bg-white text-[#475569]"
                            }`}
                          >{t}</button>
                        )
                      })}
                    </div>
                  </div>

                  <label className="mt-4 block text-sm font-medium text-[#475569]">
                    Notes / pitch
                    <textarea rows={3} value={profile.sellerNotes}
                      onChange={(e) => upd("sellerNotes", e.target.value)}
                      placeholder="Describe your specialty, track record, or anything buyers should know…"
                      className="mt-1.5 w-full rounded-xl border border-[#c8d8f0] bg-white px-3 py-2.5 text-sm focus:border-[#155eef] focus:outline-none focus:ring-2 focus:ring-[#155eef]/20"
                    />
                  </label>
                </SectionCard>

                {/* Agent declaration */}
                <SectionCard title="Agent status" icon={BadgeCheck}>
                  <div className="flex items-start gap-3">
                    <input type="checkbox" id="is-agent" checked={profile.isAgent}
                      onChange={(e) => upd("isAgent", e.target.checked)}
                      className="mt-1 h-4 w-4 accent-[#155eef] cursor-pointer" />
                    <label htmlFor="is-agent" className="cursor-pointer">
                      <p className="text-sm font-semibold text-[#0f172a]">I am a licensed real estate agent</p>
                      <p className="mt-0.5 text-xs text-[#64748b]">
                        Declaring this sends your profile for admin verification. Once approved, you&apos;ll appear
                        in the agent directory and can submit listings on behalf of clients.
                      </p>
                    </label>
                  </div>

                  {profile.isAgent && (
                    <>
                      {/* Verification status pill */}
                      <div className="mt-4">
                        {profile.agentVerified ? (
                          <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                            <BadgeCheck className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="text-sm font-bold text-green-800">Agent verified by EasyMoveZonne</p>
                              <p className="text-xs text-green-600">Your profile appears in the agent directory.</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                            <Clock className="h-5 w-5 text-amber-600" />
                            <div>
                              <p className="text-sm font-bold text-amber-800">Pending admin review</p>
                              <p className="text-xs text-amber-600">
                                Save your details below and we&apos;ll review your application within 1–2 business days.
                                You won&apos;t appear in the agent directory until verified.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <InputField label="Agency / company name" value={profile.agentCompany}
                          onChange={(v) => upd("agentCompany", v)} placeholder="e.g. Prime Realty Nigeria" />
                        <InputField label="Agent licence number" value={profile.agentLicense}
                          onChange={(v) => upd("agentLicense", v)} placeholder="e.g. ESVARBON-2024-00123" />
                        <label className="text-sm font-medium text-[#475569] sm:col-span-2">
                          Short bio
                          <textarea rows={2} value={profile.agentBio}
                            onChange={(e) => upd("agentBio", e.target.value)}
                            placeholder="e.g. 8 years experience in Lagos luxury real estate, fluent in English and Yoruba…"
                            className="mt-1.5 w-full rounded-xl border border-[#c8d8f0] bg-white px-3 py-2.5 text-sm focus:border-[#155eef] focus:outline-none focus:ring-2 focus:ring-[#155eef]/20"
                          />
                        </label>
                      </div>
                    </>
                  )}
                </SectionCard>
              </>
            )}

            {/* ── List a property ── */}
            {activeSection === "listings" && role === "seller" && (
              <SectionCard title="Submit a property listing" icon={Home}>
                <p className="mb-5 text-sm text-[#64748b]">
                  Fill in the property details below. A video walkthrough is required before you can submit.
                  All listings are reviewed by our team before going live on the platform.
                </p>
                <SubmitListingForm cityOptions={cityOptions} />
              </SectionCard>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  User,
  Phone,
  Mail,
  MessageSquare,
  Save,
  CheckCircle,
  AlertCircle,
  Shield,
  MapPin,
  Clock,
} from "lucide-react"
import Link from "next/link"

// ─── Types ───────────────────────────────────────────────────────────────────

type ContactMethod = "email" | "phone" | "whatsapp"

interface ProfileData {
  fullName: string
  phone: string
  preferredContactMethod: ContactMethod
  notes: string
}

interface RelocationPlan {
  id: string
  destinationCity: string
  destinationCountry: string
  moveDate: string | null
  status: "planning" | "in_progress" | "ready_to_move" | "settled"
}

interface RelocationTask {
  id: string
  title: string
  status: "pending" | "in_progress" | "completed"
}

interface RelocationContact {
  id: string
  name: string
  role: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const emptyProfile: ProfileData = {
  fullName: "",
  phone: "",
  preferredContactMethod: "email",
  notes: "",
}

// ─── Helper Components ────────────────────────────────────────────────────────

function SectionCard({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#dbe4f0] bg-white transition hover:border-[#c8d8f0]">
      <div className="flex items-center gap-2 border-b border-[#f0f4fa] bg-[#f8fbff] px-6 py-4">
        <Icon className="h-4 w-4 text-[#e0511f]" />
        <h2 className="text-sm font-bold tracking-tight text-[#0f172a] uppercase">{title}</h2>
      </div>
      <div className="px-6 py-6">{children}</div>
    </div>
  )
}

function InputField({ label, value, onChange, type = "text", placeholder, icon: Icon }: any) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-[#475569]">
        {Icon && <Icon className="h-3.5 w-3.5 opacity-60" />}
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#c8d8f0] bg-white px-3 py-2.5 text-sm transition focus:border-[#e0511f] focus:outline-none focus:ring-2 focus:ring-[#e0511f]/20"
      />
    </label>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ProfileWorkspace({
  displayName, email,
}: {
  displayName: string
  email: string
}) {
  const [profile, setProfile] = useState<ProfileData>({ ...emptyProfile, fullName: displayName })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "ok" | "error">("idle")
  const [statusMsg, setStatusMsg] = useState("")
  const [activeSection, setActiveSection] = useState<"details" | "relocation">("details")
  const [relocationPlan, setRelocationPlan] = useState<RelocationPlan | null>(null)
  const [relocationTasks, setRelocationTasks] = useState<RelocationTask[]>([])
  const [relocationContacts, setRelocationContacts] = useState<RelocationContact[]>([])
  const [relocationLoading, setRelocationLoading] = useState(false)
  const [relocationError, setRelocationError] = useState("")
  const [updatingRelocationStatus, setUpdatingRelocationStatus] = useState(false)

  // Fetch data
  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const profileRes = await fetch("/api/user/profile")
        if (!profileRes.ok) throw new Error("Failed to load profile")
        const data = (await profileRes.json()) as { profile?: ProfileData }
        if (!mounted) return
        setProfile({ ...emptyProfile, fullName: displayName, ...data.profile })
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [displayName])

  // Relocation Workspace Data
  const loadRelocationWorkspace = useCallback(async () => {
    setRelocationLoading(true)
    setRelocationError("")
    try {
      const res = await fetch("/api/relocation-plan")
      if (!res.ok) throw new Error("No active relocation plan found.")
      const data = await res.json()
      setRelocationPlan(data.plan)
      setRelocationTasks(data.tasks || [])
      setRelocationContacts(data.contacts || [])
    } catch (err: any) {
      setRelocationError(err.message)
    } finally {
      setRelocationLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeSection === "relocation") {
      loadRelocationWorkspace()
    }
  }, [activeSection, loadRelocationWorkspace])

  const updateRelocationStatus = async (newStatus: RelocationPlan["status"]) => {
    if (!relocationPlan) return
    setUpdatingRelocationStatus(true)
    try {
      const res = await fetch("/api/relocation-plan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error("Update failed")
      setRelocationPlan(p => p ? { ...p, status: newStatus } : null)
    } catch (err) {
      console.error(err)
    } finally {
      setUpdatingRelocationStatus(false)
    }
  }

  // Update profile field
  const upd = (field: keyof ProfileData, val: any) => {
    setProfile((p) => ({ ...p, [field]: val }))
    if (saveStatus !== "idle") setSaveStatus("idle")
  }

  // Save profile
  const saveProfile = async () => {
    setSaving(true)
    setSaveStatus("idle")
    setStatusMsg("")
    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      })
      if (!res.ok) throw new Error("Failed to save")
      setSaveStatus("ok")
      setStatusMsg("Changes saved successfully")
    } catch (err) {
      setSaveStatus("error")
      setStatusMsg("Failed to save changes")
    } finally {
      setSaving(true)
      setTimeout(() => setSaving(false), 800)
    }
  }

  const completedRelocationTasks = relocationTasks.filter(t => t.status === "completed").length

  const NAV_ITEMS = [
    { id: "details" as const, label: "My details", icon: User },
    { id: "relocation" as const, label: "Relocation workspace", icon: MapPin },
  ]

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e0511f] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fbff] pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] pt-12 pb-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">My Account</p>
              <h1 className="text-2xl font-black text-white">{displayName}</h1>
              <p className="text-sm text-white/60">{email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto -mt-12 px-6">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Sidebar Nav */}
          <aside className="h-fit rounded-2xl border border-[#dbe4f0] bg-white p-4 shadow-sm md:sticky md:top-24">
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const active = activeSection === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
                      active ? "bg-[#eef4ff] text-[#e0511f]" : "text-[#64748b] hover:bg-[#f8faff] hover:text-[#0f172a]"
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${active ? "text-[#e0511f]" : "text-[#94a3b8]"}`} />
                    {item.label}
                  </button>
                )
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Save Status Bar */}
            {saveStatus !== "idle" && (
              <div className={`flex items-center gap-3 rounded-2xl border px-6 py-4 animate-in fade-in slide-in-from-top-4 ${
                saveStatus === "ok" ? "border-green-100 bg-green-50 text-green-700" : "border-red-100 bg-red-50 text-red-700"
              }`}>
                {saveStatus === "ok" ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                <p className="text-sm font-bold">{statusMsg}</p>
              </div>
            )}

            {/* ── Details Section ── */}
            {activeSection === "details" && (
              <>
                <SectionCard title="Personal Information" icon={User}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InputField label="Full name" value={profile.fullName} onChange={(v: string) => upd("fullName", v)}
                      placeholder="e.g. John Doe" />
                    <InputField label="Phone number" value={profile.phone} onChange={(v: string) => upd("phone", v)}
                      placeholder="+234..." type="tel" icon={Phone} />
                    <div className="sm:col-span-2">
                      <p className="mb-2 text-sm font-medium text-[#475569]">Preferred contact method</p>
                      <div className="flex flex-wrap gap-2">
                        {(["email", "phone", "whatsapp"] as ContactMethod[]).map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => upd("preferredContactMethod", m)}
                            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold capitalize transition ${
                              profile.preferredContactMethod === m
                                ? "border-[#e0511f] bg-[#eef4ff] text-[#e0511f]"
                                : "border-[#dbe4f0] bg-white text-[#475569] hover:border-[#cbd5e1]"
                            }`}
                          >
                            {m === "email" && <Mail className="h-3.5 w-3.5" />}
                            {m === "phone" && <Phone className="h-3.5 w-3.5" />}
                            {m === "whatsapp" && <MessageSquare className="h-3.5 w-3.5" />}
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center gap-4 border-t border-[#f0f4fa] pt-6">
                    <button
                      onClick={saveProfile}
                      disabled={saving}
                      className="flex items-center gap-2 rounded-xl bg-[#e0511f] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#e0511f]/20 transition hover:bg-[#1255d9] disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      {saving ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                </SectionCard>

                <SectionCard title="Additional Info" icon={Shield}>
                  <p className="text-sm text-[#64748b] mb-4">
                    Any extra information that might help us customize your migration experience.
                  </p>
                  <label className="block text-sm font-medium text-[#475569]">
                    Notes
                    <textarea rows={3} value={profile.notes}
                      onChange={(e) => upd("notes", e.target.value)}
                      placeholder="Special requirements, concerns, or goals…"
                      className="mt-1.5 w-full rounded-xl border border-[#c8d8f0] bg-white px-3 py-2.5 text-sm focus:border-[#e0511f] focus:outline-none focus:ring-2 focus:ring-[#e0511f]/20"
                    />
                  </label>
                </SectionCard>

                <SectionCard title="Relocation workspace overview" icon={MapPin}>
                  {!relocationPlan ? (
                    <div className="text-center">
                      <p className="mb-4 text-sm text-[#64748b]">You don&apos;t have an active relocation workspace yet.</p>
                      <Link href="/services" className="inline-flex items-center gap-2 rounded-xl bg-[#0f172a] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1e293b]">
                        Get started with Relocate Hub
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-4 rounded-xl border border-green-100 bg-green-50/50 p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                          <CheckCircle className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#0f172a]">Active Relocation Workspace</p>
                          <p className="text-xs text-[#64748b]">Your relocation to {relocationPlan.destinationCity} is in progress.</p>
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-[#94a3b8]">
                        Destination: {relocationPlan?.destinationCity || "—"}, {relocationPlan?.destinationCountry || "—"}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveSection("relocation")}
                          className="rounded-full border border-[#e0511f] bg-[#eef4ff] px-4 py-2 text-xs font-semibold text-[#e0511f]"
                        >
                          Manage in profile
                        </button>
                        <Link href="/app/dashboard" className="rounded-full border border-[#dbe4f0] px-4 py-2 text-xs font-semibold text-[#475569]">
                          Dashboard
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
                          className="w-full rounded-xl border border-[#c8d8f0] bg-white px-3 py-2.5 text-sm focus:border-[#e0511f] focus:outline-none disabled:opacity-50"
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
                      <Link href="/app/dashboard" className="rounded-full bg-[#e0511f] px-4 py-2 text-xs font-semibold text-white">
                        Dashboard
                      </Link>
                      <Link href="/services" className="rounded-full border border-[#dbe4f0] px-4 py-2 text-xs font-semibold text-[#475569]">
                        Explore all services
                      </Link>
                    </div>
                  </>
                )}
              </SectionCard>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

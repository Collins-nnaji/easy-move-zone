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
  Sparkles,
  User,
} from "lucide-react"
import { fetchProfileWorkspace, saveProfile } from "@/lib/profile/client"
import type { UserProfile } from "@/lib/profile/types"
import { fetchApplications } from "@/lib/visa/client"
import type { VisaApplication } from "@/lib/visa/types"

interface ProfileWorkspaceProps {
  authName: string
  authEmail: string
}

export function ProfileWorkspace({ authName, authEmail }: ProfileWorkspaceProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusMsg, setStatusMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [avatarHint, setAvatarHint] = useState("")

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [applications, setApplications] = useState<VisaApplication[]>([])

  const displayName = profile?.fullName || authName
  const activeApplications = useMemo(
    () => applications.filter((a) => a.status !== "approved" && a.status !== "rejected" && a.status !== "expired"),
    [applications],
  )

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setErrorMsg("")
      try {
        const [workspace, apps] = await Promise.all([
          fetchProfileWorkspace(),
          fetchApplications().catch(() => []),
        ])
        if (!mounted) return
        setProfile(workspace.profile)
        setApplications(apps)
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

        {/* Summary card */}
        <Link href="/visa/applications" className="emz-rich-card group block p-6 transition hover:border-[#e0511f]/30 hover:shadow-md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#e0511f]">My visa applications</p>
              <h2 className="mt-1 font-[var(--font-playfair)] text-xl font-semibold text-[#0f172a]">
                {applications.length === 0
                  ? "No applications yet"
                  : `${activeApplications.length} in progress · ${applications.length} total`}
              </h2>
              <p className="mt-2 text-sm text-[#64748b]">
                {applications.length === 0
                  ? "Start tracking a visa application to see it here."
                  : applications.slice(0, 2).map((a) => a.label).join(" · ")}
              </p>
            </div>
            <ClipboardList className="h-5 w-5 text-[#e0511f]" />
          </div>
          <p className="mt-4 text-xs font-semibold text-[#e0511f] group-hover:underline">Open your applications →</p>
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          {/* Personal details */}
          <article className="emz-rich-card space-y-6 p-6 sm:p-8">
            <div>
              <h2 className="font-[var(--font-playfair)] text-xl font-bold text-[#0f172a]">Personal details</h2>
              <p className="mt-1 text-sm text-[#64748b]">How we reach you and your nationality for visa lookups</p>
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
          </article>

          {/* Quick links */}
          <article className="emz-rich-card p-6">
            <h2 className="font-[var(--font-playfair)] text-lg font-semibold text-[#0f172a]">Quick links</h2>
            <div className="mt-4 space-y-2">
              <Link href="/visa" className="flex items-center gap-3 rounded-xl border border-[#dbe4f0] bg-[#f8fbff] p-3 text-sm font-semibold text-[#0f172a] transition hover:border-[#e0511f]/40">
                <MapPin className="h-4 w-4 text-[#e0511f]" />
                Look up visa requirements
              </Link>
              <Link href="/embassies" className="flex items-center gap-3 rounded-xl border border-[#dbe4f0] bg-[#f8fbff] p-3 text-sm font-semibold text-[#0f172a] transition hover:border-[#e0511f]/40">
                <MapPin className="h-4 w-4 text-[#e0511f]" />
                Embassy directory
              </Link>
              <Link href="/contact" className="flex items-center gap-3 rounded-xl border border-[#dbe4f0] bg-[#f8fbff] p-3 text-sm font-semibold text-[#0f172a] transition hover:border-[#e0511f]/40">
                <Sparkles className="h-4 w-4 text-[#e0511f]" />
                Contact support
              </Link>
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}

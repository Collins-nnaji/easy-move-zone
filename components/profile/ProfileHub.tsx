"use client"

import Link from "next/link"
import { useEffect, useRef, useState, type ReactNode } from "react"
import {
  ArrowUpRight,
  ClipboardCheck,
  FileText,
  Loader2,
  LogOut,
  Save,
  Trash2,
  Upload,
  User,
} from "lucide-react"
import { authClient } from "@/lib/auth/client"
import {
  EMPTY_CAREER_PROFILE,
  type CareerProfile,
} from "@/lib/career/profile-store"
import { EMPTY_PROFILE, type UserProfile } from "@/lib/profile/types"
import type { CheckDocumentMeta } from "@/lib/check/types"

interface ProfileHubProps {
  authName: string
  authEmail: string
}

type Badge = {
  roleKey: string
  roleTitle: string
  tier: string
  bestScore: number
}

const fieldClass =
  "h-11 w-full rounded-xl border border-[#e4dfd5] bg-white px-3 text-sm text-[#1b231e] outline-none focus:border-[#e0511f]"
const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#7c827a]"
const TWIN_KEY = "emz.career.twin.skills.v1"

function Section({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-3xl border border-[#e4dfd5] bg-white p-6 shadow-sm sm:p-7">
      <h2 className="text-lg font-extrabold text-[#1b231e]">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-[#6e746b]">{subtitle}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  )
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function ProfileHub({ authName, authEmail }: ProfileHubProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [badges, setBadges] = useState<Badge[]>([])
  const [profile, setProfile] = useState<UserProfile>({
    ...EMPTY_PROFILE,
    fullName: authName,
  })
  const [career, setCareer] = useState<CareerProfile>({
    ...EMPTY_CAREER_PROFILE,
    email: authEmail,
  })
  const [skillDraft, setSkillDraft] = useState("")
  const [documents, setDocuments] = useState<CheckDocumentMeta[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const [profileRes, badgeRes] = await Promise.all([
          fetch("/api/profile", { cache: "no-store" }),
          fetch("/api/assessments?badges=1"),
        ])
        if (profileRes.status === 401) throw new Error("unauthorized")
        if (profileRes.ok) {
          const data = await profileRes.json()
          if (!mounted) return
          if (data.profile) {
            setProfile({
              ...EMPTY_PROFILE,
              ...data.profile,
              fullName: data.profile.fullName || authName,
            })
          }
          if (data.career) {
            setCareer({
              ...EMPTY_CAREER_PROFILE,
              ...data.career,
              email: data.career.email || authEmail,
            })
            if (data.career.skills?.length) {
              try {
                window.localStorage.setItem(
                  TWIN_KEY,
                  JSON.stringify({ extractedSkills: data.career.skills }),
                )
              } catch {
                /* ignore */
              }
            }
          }
          if (Array.isArray(data.documents)) setDocuments(data.documents)
        }
        if (badgeRes.ok) {
          const data = await badgeRes.json()
          if (mounted) setBadges(data.badges ?? [])
        }
      } catch {
        if (mounted) setError("Could not load your profile. Try refreshing.")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void load()
    return () => {
      mounted = false
    }
  }, [authEmail, authName])

  async function saveAll() {
    setSaving(true)
    setMessage(null)
    setError(null)
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, career }),
      })
      if (res.status === 401) throw new Error("unauthorized")
      if (!res.ok) throw new Error("failed")
      const data = await res.json()
      if (data.profile) setProfile({ ...EMPTY_PROFILE, ...data.profile })
      if (data.career) {
        setCareer({ ...EMPTY_CAREER_PROFILE, ...data.career })
        if (data.career.skills?.length) {
          window.localStorage.setItem(
            TWIN_KEY,
            JSON.stringify({ extractedSkills: data.career.skills }),
          )
        }
      }
      setMessage("Profile saved. Fit Check will use your skills on Jobs.")
    } catch {
      setError("Could not save. Check your connection and try again.")
    } finally {
      setSaving(false)
    }
  }

  function addSkill() {
    const next = skillDraft
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (!next.length) return
    setCareer((prev) => ({
      ...prev,
      skills: [...new Set([...prev.skills, ...next])].slice(0, 40),
    }))
    setSkillDraft("")
  }

  function removeSkill(skill: string) {
    setCareer((prev) => ({
      ...prev,
      skills: prev.skills.filter((item) => item !== skill),
    }))
  }

  async function onUpload(file: File | null) {
    if (!file) return
    setUploading(true)
    setMessage(null)
    setError(null)
    try {
      const form = new FormData()
      form.append("file", file)
      form.append("kind", "cv")
      const res = await fetch("/api/profile/documents", { method: "POST", body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")
      setDocuments(data.documents ?? [])
      if (Array.isArray(data.extractedSkills) && data.extractedSkills.length) {
        setCareer((prev) => ({
          ...prev,
          skills: [...new Set([...prev.skills, ...data.extractedSkills])].slice(0, 40),
        }))
        window.localStorage.setItem(
          TWIN_KEY,
          JSON.stringify({ extractedSkills: data.extractedSkills }),
        )
        setMessage(`CV uploaded. Added ${data.extractedSkills.length} skills from your document.`)
      } else {
        setMessage("CV uploaded to your vault.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.")
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  async function removeDocument(id: string) {
    setError(null)
    try {
      const res = await fetch(`/api/profile/documents?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Delete failed")
      setDocuments(data.documents ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete file.")
    }
  }

  async function signOut() {
    await authClient.signOut()
    window.location.href = "/"
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-[#6e746b]">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading your profile…
      </div>
    )
  }

  const destinationsText = profile.movePreferredDestinations.join(", ")

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-8 sm:px-6 sm:py-10">
      <div className="rounded-3xl border border-[#e4dfd5] bg-white p-6 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e0511f] text-white">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h1 className="page-title text-xl font-extrabold text-[#1b231e] sm:text-2xl">
                {profile.fullName || authName}
              </h1>
              <p className="text-sm text-[#6e746b]">{authEmail}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void saveAll()}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#e0511f] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save profile
          </button>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-[#5f655c]">
          Keep your career details and CVs here so My Workspace, Fit Check, and sponsorship picks use your real profile.
        </p>
        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          <Link
            href="/workspace"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1b231e] py-3 text-sm font-bold text-white"
          >
            My Workspace <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/work-simulation"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#ded7cb] py-3 text-sm font-bold text-[#1b231e]"
          >
            Work Simulation
          </Link>
          <Link
            href="/jobs"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#ded7cb] py-3 text-sm font-bold text-[#1b231e]"
          >
            Sponsored jobs
          </Link>
        </div>
        {(message || error) && (
          <p
            className={`mt-4 rounded-xl px-3 py-2 text-sm ${
              error ? "bg-rose-50 text-rose-800" : "bg-emerald-50 text-emerald-900"
            }`}
          >
            {error || message}
          </p>
        )}
      </div>

      <Section title="Basics" subtitle="How we reach you and how your name appears.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="fullName">
              Full name
            </label>
            <input
              id="fullName"
              className={fieldClass}
              value={profile.fullName}
              onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="phone">
              Phone
            </label>
            <input
              id="phone"
              className={fieldClass}
              value={profile.phone || career.phone}
              onChange={(e) => {
                const phone = e.target.value
                setProfile((p) => ({ ...p, phone }))
                setCareer((c) => ({ ...c, phone }))
              }}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="nationality">
              Nationality
            </label>
            <input
              id="nationality"
              className={fieldClass}
              value={profile.nationality}
              onChange={(e) => setProfile((p) => ({ ...p, nationality: e.target.value }))}
              placeholder="e.g. Nigerian"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="contact">
              Preferred contact
            </label>
            <select
              id="contact"
              className={fieldClass}
              value={profile.preferredContactMethod}
              onChange={(e) =>
                setProfile((p) => ({
                  ...p,
                  preferredContactMethod: e.target.value as UserProfile["preferredContactMethod"],
                }))
              }
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="linkedin">
              LinkedIn URL
            </label>
            <input
              id="linkedin"
              className={fieldClass}
              value={career.linkedinUrl}
              onChange={(e) => setCareer((c) => ({ ...c, linkedinUrl: e.target.value }))}
              placeholder="https://linkedin.com/in/…"
            />
          </div>
        </div>
      </Section>

      <Section title="Career" subtitle="Used for Fit Check overlap and job recommendations.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="currentRole">
              Current role
            </label>
            <input
              id="currentRole"
              className={fieldClass}
              value={career.currentRole}
              onChange={(e) => setCareer((c) => ({ ...c, currentRole: e.target.value }))}
              placeholder="e.g. Business Analyst"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="currentCompany">
              Current company
            </label>
            <input
              id="currentCompany"
              className={fieldClass}
              value={career.currentCompany}
              onChange={(e) => setCareer((c) => ({ ...c, currentCompany: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="location">
              Current location
            </label>
            <input
              id="location"
              className={fieldClass}
              value={career.currentLocation}
              onChange={(e) => setCareer((c) => ({ ...c, currentLocation: e.target.value }))}
              placeholder="City, country"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="years">
              Years of experience
            </label>
            <input
              id="years"
              type="number"
              min={0}
              max={50}
              className={fieldClass}
              value={career.yearsExperience ?? ""}
              onChange={(e) =>
                setCareer((c) => ({
                  ...c,
                  yearsExperience: e.target.value === "" ? null : Number(e.target.value),
                }))
              }
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="seniority">
              Seniority
            </label>
            <select
              id="seniority"
              className={fieldClass}
              value={career.seniority}
              onChange={(e) => setCareer((c) => ({ ...c, seniority: e.target.value }))}
            >
              <option value="">Select</option>
              <option value="Junior">Junior</option>
              <option value="Mid">Mid</option>
              <option value="Senior">Senior</option>
              <option value="Lead">Lead</option>
              <option value="Manager">Manager</option>
              <option value="Director">Director</option>
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="industry">
              Industry
            </label>
            <input
              id="industry"
              className={fieldClass}
              value={career.industry}
              onChange={(e) => setCareer((c) => ({ ...c, industry: e.target.value }))}
              placeholder="e.g. Fintech"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="bio">
              Short bio
            </label>
            <textarea
              id="bio"
              rows={3}
              className="w-full rounded-xl border border-[#e4dfd5] bg-white px-3 py-2.5 text-sm text-[#1b231e] outline-none focus:border-[#e0511f]"
              value={career.bio}
              onChange={(e) => setCareer((c) => ({ ...c, bio: e.target.value }))}
              placeholder="What you do and what you're aiming for abroad."
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="searchStatus">
              Job search status
            </label>
            <select
              id="searchStatus"
              className={fieldClass}
              value={career.jobSearchStatus}
              onChange={(e) => setCareer((c) => ({ ...c, jobSearchStatus: e.target.value }))}
            >
              <option value="Open">Open to roles</option>
              <option value="Passive">Open to the right role</option>
              <option value="Closed">Not looking</option>
            </select>
          </div>
          <div className="flex items-end gap-4 pb-1">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-[#1b231e]">
              <input
                type="checkbox"
                checked={career.isOpenToWork}
                onChange={(e) => setCareer((c) => ({ ...c, isOpenToWork: e.target.checked }))}
                className="h-4 w-4 rounded border-[#ded7cb]"
              />
              Open to work
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-[#1b231e]">
              <input
                type="checkbox"
                checked={career.visaRequired}
                onChange={(e) => setCareer((c) => ({ ...c, visaRequired: e.target.checked }))}
                className="h-4 w-4 rounded border-[#ded7cb]"
              />
              Need sponsorship
            </label>
          </div>
        </div>
      </Section>

      <Section title="Skills" subtitle="These power Fit Check on the Jobs board.">
        <div className="flex flex-wrap gap-2">
          {career.skills.length === 0 ? (
            <p className="text-sm text-[#6e746b]">No skills yet — add them or upload a CV.</p>
          ) : (
            career.skills.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => removeSkill(skill)}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#f3efe6] px-3 py-1.5 text-xs font-bold text-[#1b231e] hover:bg-[#e8e1d3]"
                title="Remove"
              >
                {skill}
                <span className="text-[#9a9286]">×</span>
              </button>
            ))
          )}
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            className={fieldClass}
            value={skillDraft}
            onChange={(e) => setSkillDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addSkill()
              }
            }}
            placeholder="Add skills, comma-separated"
          />
          <button
            type="button"
            onClick={addSkill}
            className="shrink-0 rounded-xl border border-[#ded7cb] px-4 py-2.5 text-sm font-bold text-[#1b231e]"
          >
            Add
          </button>
        </div>
      </Section>

      <Section title="Move preferences" subtitle="Where you want to go and how you want to work.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="destinations">
              Preferred destinations
            </label>
            <input
              id="destinations"
              className={fieldClass}
              value={destinationsText}
              onChange={(e) =>
                setProfile((p) => ({
                  ...p,
                  movePreferredDestinations: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                }))
              }
              placeholder="UK, Canada, Germany"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="workMode">
              Work mode
            </label>
            <select
              id="workMode"
              className={fieldClass}
              value={profile.moveWorkMode ?? ""}
              onChange={(e) =>
                setProfile((p) => ({
                  ...p,
                  moveWorkMode: (e.target.value || null) as UserProfile["moveWorkMode"],
                }))
              }
            >
              <option value="">Select</option>
              <option value="onsite">On-site</option>
              <option value="hybrid">Hybrid</option>
              <option value="remote">Remote</option>
              <option value="business_owner">Business owner</option>
              <option value="student">Student</option>
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="stay">
              Stay preference
            </label>
            <select
              id="stay"
              className={fieldClass}
              value={profile.moveStayPreference ?? ""}
              onChange={(e) =>
                setProfile((p) => ({
                  ...p,
                  moveStayPreference: (e.target.value || null) as UserProfile["moveStayPreference"],
                }))
              }
            >
              <option value="">Select</option>
              <option value="trip">Short trip</option>
              <option value="nomad">Flexible / nomad</option>
              <option value="move">Permanent move</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="notes">
              Notes
            </label>
            <textarea
              id="notes"
              rows={2}
              className="w-full rounded-xl border border-[#e4dfd5] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#e0511f]"
              value={profile.moveNotes}
              onChange={(e) => setProfile((p) => ({ ...p, moveNotes: e.target.value }))}
              placeholder="Family, timeline, visa constraints…"
            />
          </div>
        </div>
      </Section>

      <Section title="CV vault" subtitle="Upload source documents here, then open them in My Workspace to edit, refine with AI, and save reusable CVs.">
        <div className="mb-4 flex justify-end">
          <Link href="/workspace?view=cvs#cv-workspace" className="inline-flex items-center gap-2 rounded-xl bg-[#1b231e] px-4 py-2.5 text-xs font-bold text-white">
            Open My CVs <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt,.md,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(e) => void onUpload(e.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-xl border border-dashed border-[#cfc6b6] bg-[#faf8f3] px-4 py-3 text-sm font-bold text-[#1b231e] disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin text-[#2f5d50]" /> : <Upload className="h-4 w-4" />}
          {uploading ? "Uploading, reading & structuring…" : "Upload CV"}
        </button>
        {uploading && <div className="mt-3 max-w-sm overflow-hidden rounded-full bg-[#dfe7e3]"><div className="h-1.5 w-3/4 animate-pulse rounded-full bg-[#2f5d50]" /></div>}
        {documents.length === 0 ? (
          <p className="mt-4 text-sm text-[#6e746b]">No documents yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-[#faf8f3] px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-2 truncate text-sm font-semibold text-[#1b231e]">
                    <FileText className="h-4 w-4 shrink-0 text-[#e0511f]" />
                    {doc.fileName}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#7c827a]">
                    {doc.kind} · {formatBytes(doc.bytes)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {doc.kind === "cv" && <Link href={`/workspace?view=cvs&document=${encodeURIComponent(doc.id)}#cv-workspace`} className="rounded-lg px-2.5 py-2 text-xs font-bold text-[#2f5d50] hover:bg-white">Use & edit</Link>}
                  <button
                    type="button"
                    onClick={() => void removeDocument(doc.id)}
                    className="rounded-lg p-2 text-[#9a5040] hover:bg-white"
                    aria-label={`Delete ${doc.fileName}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Badges" subtitle="Earn bronze, silver, or gold from role assessments.">
        {badges.length === 0 ? (
          <p className="text-sm text-[#5f655c]">
            No badges yet.{" "}
            <Link href="/work-simulation" className="font-bold text-[#e0511f] underline-offset-2 hover:underline">
              Take a role assessment
            </Link>
            .
          </p>
        ) : (
          <ul className="space-y-2">
            {badges.map((badge) => (
              <li
                key={badge.roleKey}
                className="flex items-center justify-between rounded-xl bg-[#faf8f3] px-3 py-2.5 text-sm"
              >
                <span className="inline-flex items-center gap-2 font-semibold">
                  <ClipboardCheck className="h-4 w-4 text-[#e0511f]" />
                  {badge.roleTitle}
                </span>
                <span className="text-xs font-bold uppercase text-[#7c827a]">
                  {badge.tier} · {badge.bestScore}%
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#efe9dd] pt-4 pb-8">
        <div className="flex flex-wrap gap-4">
          <Link href="/sponsors" className="text-sm font-bold text-[#4a5047] underline-offset-4 hover:underline">
            Sponsors
          </Link>
          <Link href="/jobs" className="text-sm font-bold text-[#4a5047] underline-offset-4 hover:underline">
            Jobs
          </Link>
        </div>
        <button
          type="button"
          onClick={() => void signOut()}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-[#c0492a]"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </div>
    </div>
  )
}

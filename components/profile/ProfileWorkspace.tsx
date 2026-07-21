"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowUpRight, Briefcase, CheckCircle2, Loader2, Truck, User } from "lucide-react"
import { authClient } from "@/lib/auth/client"
import { fetchDriverWorkspace, updateDriverProfile } from "@/lib/driver/client"
import { fetchFleetWorkspace, updateFleetProfile } from "@/lib/fleet/client"
import type { DriverProfile, FleetProfile } from "@/lib/driver/types"

interface ProfileWorkspaceProps {
  authName: string
  authEmail: string
  initialRole?: "driver" | "fleet"
}

export function ProfileWorkspace({
  authName,
  authEmail,
  initialRole = "driver",
}: ProfileWorkspaceProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusMsg, setStatusMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [role, setRole] = useState<"driver" | "fleet">(initialRole)
  const [displayName, setDisplayName] = useState(authName)
  const [zone, setZone] = useState("Lagos Mainland")
  const [companyName, setCompanyName] = useState("")
  const [driver, setDriver] = useState<DriverProfile | null>(null)
  const [fleet, setFleet] = useState<FleetProfile | null>(null)

  useEffect(() => {
    setRole(initialRole)
  }, [initialRole])

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const [d, f] = await Promise.all([
          fetchDriverWorkspace({ zone: "All zones" }),
          fetchFleetWorkspace(),
        ])
        if (!mounted) return
        setDriver(d.profile)
        setFleet(f.profile)
        setDisplayName(d.profile.displayName || f.profile.contactName || authName)
        setZone(initialRole === "fleet" ? f.profile.zone : d.profile.zone)
        setCompanyName(f.profile.companyName)
        // Only auto-pick fleet when no explicit from= query was provided via initialRole default path
        if (
          initialRole === "driver" &&
          f.profile.onboardingCompleted &&
          !d.profile.onboardingCompleted
        ) {
          setRole("fleet")
          setZone(f.profile.zone)
        }
      } catch (err) {
        if (mounted) setErrorMsg(err instanceof Error ? err.message : "Unable to load profile.")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void load()
    return () => {
      mounted = false
    }
  }, [authName, initialRole])

  async function save() {
    setSaving(true)
    setStatusMsg("")
    setErrorMsg("")
    try {
      if (role === "driver") {
        await updateDriverProfile({
          displayName,
          zone,
          onboardingCompleted: true,
        })
      } else {
        await updateFleetProfile({
          companyName: companyName || "My Fleet",
          contactName: displayName,
          zone,
          onboardingCompleted: true,
        })
      }
      setStatusMsg("Profile saved.")
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unable to save.")
    } finally {
      setSaving(false)
    }
  }

  async function signOut() {
    await authClient.signOut()
    window.location.href = "/"
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-[#6e746b]">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading profile…
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <div className="rounded-3xl border border-[#e4dfd5] bg-white p-7 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e0511f] text-white">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#1b231e]">Your account</h1>
            <p className="text-sm text-[#6e746b]">{authEmail}</p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-[#5f655c]">
          One account works for both sides of the marketplace. Edit the active role below, then open either app.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setRole("driver")
              if (driver?.zone) setZone(driver.zone)
            }}
            className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition ${
              role === "driver" ? "border-[#e0511f] bg-[#fbeae0] text-[#9c3f15]" : "border-[#e4dfd5] text-[#4a5047]"
            }`}
          >
            <Truck className="h-4 w-4" /> Driver
          </button>
          <button
            type="button"
            onClick={() => {
              setRole("fleet")
              if (fleet?.zone) setZone(fleet.zone)
            }}
            className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition ${
              role === "fleet" ? "border-[#e0511f] bg-[#fbeae0] text-[#9c3f15]" : "border-[#e4dfd5] text-[#4a5047]"
            }`}
          >
            <Briefcase className="h-4 w-4" /> Fleet
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#9aa097]">Display name</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#e4dfd5] px-4 py-3 text-sm"
            />
          </label>
          {role === "fleet" && (
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9aa097]">Company</span>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#e4dfd5] px-4 py-3 text-sm"
              />
            </label>
          )}
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#9aa097]">Primary zone</span>
            <input
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#e4dfd5] px-4 py-3 text-sm"
            />
          </label>
        </div>

        {(driver || fleet) && (
          <div className="mt-5 rounded-2xl bg-[#faf8f3] px-4 py-3 text-sm text-[#5f655c]">
            {role === "driver" ? (
              <>
                Rating: {driver?.ratingAvg?.toFixed(1) ?? "0.0"} ★ ({driver?.ratingCount ?? 0} reviews)
                {driver?.verified ? " · Verified" : ""}
              </>
            ) : (
              <>
                Fleet rating: {fleet?.ratingAvg?.toFixed(1) ?? "0.0"} ★ ({fleet?.ratingCount ?? 0} reviews) ·{" "}
                {fleet?.commissionBps ? fleet.commissionBps / 100 : 8}% commission
              </>
            )}
          </div>
        )}

        {statusMsg && (
          <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#2f7d4f]">
            <CheckCircle2 className="h-4 w-4" /> {statusMsg}
          </p>
        )}
        {errorMsg && <p className="mt-4 text-sm font-semibold text-[#c0492a]">{errorMsg}</p>}

        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="mt-6 w-full rounded-2xl bg-[#e0511f] py-3.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Link
            href="/move/shifts"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#e4dfd5] bg-[#faf8f3] py-3 text-sm font-bold text-[#1b231e]"
          >
            <Truck className="h-4 w-4 text-[#e0511f]" />
            Open Driver app
            <ArrowUpRight className="h-3.5 w-3.5 text-[#9aa097]" />
          </Link>
          <Link
            href="/fleet/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#e4dfd5] bg-[#faf8f3] py-3 text-sm font-bold text-[#1b231e]"
          >
            <Briefcase className="h-4 w-4 text-[#e0511f]" />
            Open Fleet console
            <ArrowUpRight className="h-3.5 w-3.5 text-[#9aa097]" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => void signOut()}
          className="mt-3 w-full rounded-2xl border border-[#f3d6c4] py-3 text-sm font-bold text-[#c0492a]"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}

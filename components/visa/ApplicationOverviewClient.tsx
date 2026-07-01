"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2, ListChecks, FolderOpen } from "lucide-react"
import { fetchApplication, updateApplication } from "@/lib/visa/client"
import type { ApplicationStatus, VisaApplication } from "@/lib/visa/types"
import { ExpiryBadge } from "@/components/visa/ExpiryBadge"
import { AiQaPanel } from "@/components/visa/AiQaPanel"

const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: "researching", label: "Researching" },
  { value: "gathering_documents", label: "Gathering documents" },
  { value: "submitted", label: "Submitted" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "expired", label: "Expired" },
]

export function ApplicationOverviewClient({ id }: { id: string }) {
  const [application, setApplication] = useState<VisaApplication | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApplication(id)
      .then(setApplication)
      .finally(() => setLoading(false))
  }, [id])

  async function onStatusChange(status: ApplicationStatus) {
    if (!application) return
    const updated = await updateApplication(application.id, { status })
    setApplication(updated)
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-16 text-[#4a5047]">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading application…
      </div>
    )
  }

  if (!application) {
    return <p className="py-16 text-[#4a5047]">Application not found.</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1b231e]">{application.label}</h1>
        <p className="mt-1 text-[#4a5047]">
          {application.applicantNationality} → {application.destinationCountry} · {application.visaTypeLabel || application.visaType}
        </p>
      </div>

      <div className="rounded-2xl border border-[#e4dfd5] bg-white p-6 shadow-sm">
        <label className="block text-sm">
          <span className="font-medium text-[#1b231e]">Status</span>
          <select
            value={application.status}
            onChange={(e) => void onStatusChange(e.target.value as ApplicationStatus)}
            className="mt-1 w-full max-w-xs rounded-xl border border-[#e4dfd5] px-3 py-2 text-sm outline-none focus:border-[#e0511f]"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </label>

        <div className="mt-4 flex flex-wrap gap-6 text-sm text-[#1b231e]">
          {application.targetTravelDate ? (
            <div>
              <p className="text-xs uppercase tracking-wide text-[#4a5047]">Target travel date</p>
              <p className="font-medium">{application.targetTravelDate}</p>
            </div>
          ) : null}
          {application.passportExpiryDate ? (
            <div>
              <p className="text-xs uppercase tracking-wide text-[#4a5047]">Passport expiry</p>
              <ExpiryBadge expiryDate={application.passportExpiryDate} label="Passport" />
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href={`/visa/applications/${application.id}/checklist`}
          className="flex items-center gap-3 rounded-2xl border border-[#e4dfd5] bg-white p-5 shadow-sm hover:border-[#e0511f]"
        >
          <ListChecks className="h-6 w-6 text-[#e0511f]" />
          <div>
            <p className="font-semibold text-[#1b231e]">Document checklist</p>
            <p className="text-sm text-[#4a5047]">Track what you still need</p>
          </div>
        </Link>
        <Link
          href={`/visa/applications/${application.id}/documents`}
          className="flex items-center gap-3 rounded-2xl border border-[#e4dfd5] bg-white p-5 shadow-sm hover:border-[#e0511f]"
        >
          <FolderOpen className="h-6 w-6 text-[#e0511f]" />
          <div>
            <p className="font-semibold text-[#1b231e]">Documents</p>
            <p className="text-sm text-[#4a5047]">Upload and manage files</p>
          </div>
        </Link>
      </div>

      <AiQaPanel
        nationality={application.applicantNationality}
        destinationCountry={application.destinationCountry}
        visaType={application.visaType}
      />
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2, Plus } from "lucide-react"
import { fetchApplications } from "@/lib/visa/client"
import type { VisaApplication } from "@/lib/visa/types"

const STATUS_LABEL: Record<VisaApplication["status"], string> = {
  researching: "Researching",
  gathering_documents: "Gathering documents",
  submitted: "Submitted",
  approved: "Approved",
  rejected: "Rejected",
  expired: "Expired",
}

const STATUS_COLOR: Record<VisaApplication["status"], string> = {
  researching: "bg-slate-100 text-slate-700",
  gathering_documents: "bg-amber-50 text-amber-700",
  submitted: "bg-blue-50 text-blue-700",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
  expired: "bg-red-50 text-red-700",
}

export function ApplicationsListClient() {
  const [applications, setApplications] = useState<VisaApplication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApplications()
      .then(setApplications)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-16 text-[#4a5047]">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading your applications…
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1b231e]">Your visa applications</h1>
        <Link
          href="/visa/applications/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[#e0511f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c8451a]"
        >
          <Plus className="h-4 w-4" /> New application
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#d8d2c6] p-10 text-center text-[#4a5047]">
          <p>You haven&apos;t started tracking a visa application yet.</p>
          <Link href="/visa/applications/new" className="mt-3 inline-block font-semibold text-[#e0511f] hover:underline">
            Start your first application →
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {applications.map((app) => (
            <li key={app.id}>
              <Link
                href={`/visa/applications/${app.id}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-[#e4dfd5] bg-white p-5 shadow-sm hover:border-[#e0511f]"
              >
                <div>
                  <p className="font-semibold text-[#1b231e]">{app.label}</p>
                  <p className="text-sm text-[#4a5047]">
                    {app.applicantNationality} → {app.destinationCountry} · {app.visaTypeLabel || app.visaType}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLOR[app.status]}`}>
                  {STATUS_LABEL[app.status]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

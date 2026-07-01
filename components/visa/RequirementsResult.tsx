"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AlertTriangle, CheckCircle2, Clock, FileText, Loader2, ShieldCheck } from "lucide-react"
import { fetchRequirements, type RequirementsResponse } from "@/lib/visa/client"
import { AiQaPanel } from "@/components/visa/AiQaPanel"

export function RequirementsResult({ nationality, destination, visaType }: {
  nationality: string
  destination: string
  visaType: string
}) {
  const [data, setData] = useState<RequirementsResponse | null>(null)
  const [loadedKey, setLoadedKey] = useState("")
  const currentKey = `${nationality}|${destination}|${visaType}`
  const loading = loadedKey !== currentKey

  useEffect(() => {
    let cancelled = false
    fetchRequirements(nationality, destination, visaType).then((res) => {
      if (cancelled) return
      setData(res)
      setLoadedKey(currentKey)
    })
    return () => {
      cancelled = true
    }
  }, [nationality, destination, visaType, currentKey])

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-16 text-[#4a5047]">
        <Loader2 className="h-5 w-5 animate-spin" /> Looking up requirements…
      </div>
    )
  }

  if (!data) {
    return <p className="py-16 text-[#4a5047]">Unable to load visa requirements right now. Please try again.</p>
  }

  const { template, verified, unavailable } = data
  const applyParams = new URLSearchParams({ nationality, destination, visaType })

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#e4dfd5] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-bold text-[#1b231e]">{template.visaTypeLabel || visaType}</h2>
          {verified ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
              <ShieldCheck className="h-3 w-3" /> Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
              <AlertTriangle className="h-3 w-3" /> AI-assisted — verify with the embassy
            </span>
          )}
        </div>
        <p className="mt-2 text-sm text-[#4a5047]">{template.summary}</p>

        {unavailable ? (
          <p className="mt-4 text-sm text-[#4a5047]">
            Try the <Link href="/embassies" className="font-semibold text-[#e0511f] hover:underline">embassy directory</Link> for
            an official source, or check back once AI guidance is configured.
          </p>
        ) : null}

        {(template.processingTimeEstimate || template.feeEstimate) && (
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-[#1b231e]">
            {template.processingTimeEstimate ? (
              <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4 text-[#e0511f]" /> {template.processingTimeEstimate}</span>
            ) : null}
            {template.feeEstimate ? (
              <span className="inline-flex items-center gap-1"><FileText className="h-4 w-4 text-[#e0511f]" /> {template.feeEstimate}</span>
            ) : null}
          </div>
        )}
      </div>

      {template.requiredDocuments.length > 0 ? (
        <div className="rounded-2xl border border-[#e4dfd5] bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wide text-[#4a5047]">Required documents</h3>
          <ul className="mt-3 space-y-2">
            {template.requiredDocuments.map((doc, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#1b231e]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#e0511f]" />
                <span>
                  <span className="font-semibold">{doc.label}</span>
                  {doc.mandatory ? "" : " (if applicable)"} — {doc.description}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {template.validityNotes ? (
        <div className="rounded-2xl border border-[#e4dfd5] bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wide text-[#4a5047]">Good to know</h3>
          <p className="mt-2 text-sm text-[#1b231e]">{template.validityNotes}</p>
        </div>
      ) : null}

      <Link
        href={`/visa/applications/new?${applyParams}`}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e0511f] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#c8451a]"
      >
        Start tracking this application →
      </Link>

      <AiQaPanel nationality={nationality} destinationCountry={destination} visaType={visaType} />
    </div>
  )
}

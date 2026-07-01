"use client"

import { useEffect, useState } from "react"
import { Clock, Globe, Loader2, Mail, MapPin, Phone } from "lucide-react"
import { fetchEmbassy } from "@/lib/visa/client"
import type { Embassy } from "@/lib/visa/types"

const MISSION_LABEL: Record<Embassy["missionType"], string> = {
  embassy: "Embassy",
  consulate: "Consulate",
  consulate_general: "Consulate General",
  visa_application_center: "Visa Application Center",
  trade_office: "Trade Office",
}

export function EmbassyDetailClient({ id }: { id: string }) {
  const [embassy, setEmbassy] = useState<Embassy | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEmbassy(id)
      .then(setEmbassy)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-16 text-[#4a5047]">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading embassy…
      </div>
    )
  }

  if (!embassy) {
    return <p className="py-16 text-[#4a5047]">Embassy not found.</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-[#e0511f]">{MISSION_LABEL[embassy.missionType]}</p>
        <h1 className="mt-2 text-2xl font-bold text-[#1b231e] sm:text-3xl">
          {embassy.country} {MISSION_LABEL[embassy.missionType]} in {embassy.city}
        </h1>
        <p className="mt-1 text-[#4a5047]">Located in {embassy.locatedInCountry}</p>
      </div>

      <div className="space-y-3 rounded-2xl border border-[#e4dfd5] bg-white p-6 shadow-sm">
        {embassy.address ? (
          <p className="flex items-start gap-2 text-sm text-[#1b231e]"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#e0511f]" /> {embassy.address}</p>
        ) : null}
        {embassy.phone ? (
          <p className="flex items-center gap-2 text-sm text-[#1b231e]"><Phone className="h-4 w-4 shrink-0 text-[#e0511f]" /> {embassy.phone}</p>
        ) : null}
        {embassy.email ? (
          <p className="flex items-center gap-2 text-sm text-[#1b231e]"><Mail className="h-4 w-4 shrink-0 text-[#e0511f]" /> {embassy.email}</p>
        ) : null}
        {embassy.website ? (
          <p className="flex items-center gap-2 text-sm text-[#1b231e]">
            <Globe className="h-4 w-4 shrink-0 text-[#e0511f]" />
            <a href={embassy.website} target="_blank" rel="noreferrer" className="text-[#e0511f] hover:underline">{embassy.website}</a>
          </p>
        ) : null}
        {embassy.operatingHours ? (
          <p className="flex items-center gap-2 text-sm text-[#1b231e]"><Clock className="h-4 w-4 shrink-0 text-[#e0511f]" /> {embassy.operatingHours}</p>
        ) : null}
      </div>

      {embassy.appointmentBookingUrl ? (
        <a
          href={embassy.appointmentBookingUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e0511f] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#c8451a]"
        >
          Book an appointment →
        </a>
      ) : null}

      {embassy.jurisdictionNotes ? (
        <div className="rounded-2xl border border-[#e4dfd5] bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wide text-[#4a5047]">Jurisdiction</h3>
          <p className="mt-2 text-sm text-[#1b231e]">{embassy.jurisdictionNotes}</p>
        </div>
      ) : null}

      {embassy.services.length > 0 ? (
        <div className="rounded-2xl border border-[#e4dfd5] bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wide text-[#4a5047]">Services</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {embassy.services.map((s) => (
              <li key={s} className="rounded-full bg-[#faf7f2] px-3 py-1 text-xs font-medium text-[#1b231e]">{s}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

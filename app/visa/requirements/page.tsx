import type { Metadata } from "next"
import { PublicShell } from "@/components/platform/PublicShell"
import { VisaLookupForm } from "@/components/visa/VisaLookupForm"
import { RequirementsResult } from "@/components/visa/RequirementsResult"

export const metadata: Metadata = {
  title: "Visa requirements | EasyMoveZone",
}

function firstString(v: string | string[] | undefined): string {
  if (v === undefined) return ""
  return Array.isArray(v) ? (v[0] ?? "") : v
}

export default async function VisaRequirementsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const q = await searchParams
  const nationality = firstString(q.nationality)
  const destination = firstString(q.destination)
  const visaType = firstString(q.visaType)

  return (
    <PublicShell>
      <div className="mx-auto max-w-2xl px-4 pb-20 pt-32 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-wide text-[#e0511f]">Visa requirements</p>
        <h1 className="mt-2 text-2xl font-bold text-[#1b231e] sm:text-3xl">
          {nationality && destination ? `${nationality} citizens applying to ${destination}` : "Requirements lookup"}
        </h1>

        <div className="mt-6">
          <VisaLookupForm initialNationality={nationality} initialDestination={destination} initialVisaType={visaType} />
        </div>

        {nationality && destination && visaType ? (
          <div className="mt-8">
            <RequirementsResult nationality={nationality} destination={destination} visaType={visaType} />
          </div>
        ) : null}
      </div>
    </PublicShell>
  )
}

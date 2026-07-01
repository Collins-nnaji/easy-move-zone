import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { authServer } from "@/lib/auth/server"
import { PublicShell } from "@/components/platform/PublicShell"
import { NewApplicationClient } from "@/components/visa/NewApplicationClient"

export const metadata: Metadata = {
  title: "New visa application | EasyMoveZone",
}

function firstString(v: string | string[] | undefined): string {
  if (v === undefined) return ""
  return Array.isArray(v) ? (v[0] ?? "") : v
}

export default async function NewApplicationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await authServer.getSession()
  if (!session?.data?.user) redirect("/auth?redirect=/visa/applications/new")

  const q = await searchParams
  const nationality = firstString(q.nationality)
  const destination = firstString(q.destination)
  const visaType = firstString(q.visaType)

  return (
    <PublicShell>
      <div className="mx-auto max-w-2xl px-4 pb-20 pt-32 sm:px-6">
        <h1 className="mb-6 text-2xl font-bold text-[#1b231e]">Start tracking a visa application</h1>
        <NewApplicationClient initialNationality={nationality} initialDestination={destination} initialVisaType={visaType} />
      </div>
    </PublicShell>
  )
}

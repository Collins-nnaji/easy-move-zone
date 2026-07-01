import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { authServer } from "@/lib/auth/server"
import { PublicShell } from "@/components/platform/PublicShell"
import { ApplicationOverviewClient } from "@/components/visa/ApplicationOverviewClient"

export const metadata: Metadata = {
  title: "Visa application | EasyMoveZone",
}

export default async function ApplicationOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await authServer.getSession()
  const { id } = await params
  if (!session?.data?.user) redirect(`/auth?redirect=/visa/applications/${id}`)

  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl px-4 pb-20 pt-32 sm:px-6">
        <ApplicationOverviewClient id={id} />
      </div>
    </PublicShell>
  )
}

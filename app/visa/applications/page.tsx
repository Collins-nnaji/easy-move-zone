import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { authServer } from "@/lib/auth/server"
import { PublicShell } from "@/components/platform/PublicShell"
import { ApplicationsListClient } from "@/components/visa/ApplicationsListClient"

export const metadata: Metadata = {
  title: "Your visa applications | EasyMoveZone",
}

export default async function VisaApplicationsPage() {
  const session = await authServer.getSession()
  if (!session?.data?.user) redirect("/auth?redirect=/visa/applications")

  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl px-4 pb-20 pt-32 sm:px-6">
        <ApplicationsListClient />
      </div>
    </PublicShell>
  )
}

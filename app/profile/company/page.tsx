import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { authServer } from "@/lib/auth/server"
import { PublicShell } from "@/components/platform/PublicShell"
import { CompanyProfileEditor } from "@/components/profile/CompanyProfileEditor"

export const metadata: Metadata = {
  title: "Company profile — EasyMoveZone",
  description: "Edit your company / fleet operator profile.",
}

export default async function CompanyProfilePage() {
  const session = await authServer.getSession()
  if (!session?.data?.user) redirect("/auth?redirect=/profile/company")
  const { user } = session.data
  const authName = user.name || user.email?.split("@")[0] || "Dispatch"

  return (
    <PublicShell>
      <CompanyProfileEditor authName={authName} />
    </PublicShell>
  )
}

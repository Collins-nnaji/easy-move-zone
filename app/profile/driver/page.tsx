import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { authServer } from "@/lib/auth/server"
import { PublicShell } from "@/components/platform/PublicShell"
import { DriverProfileEditor } from "@/components/profile/DriverProfileEditor"

export const metadata: Metadata = {
  title: "Driver profile — EasyMoveZone",
  description: "Edit your driver marketplace profile.",
}

export default async function DriverProfilePage() {
  const session = await authServer.getSession()
  if (!session?.data?.user) redirect("/auth?redirect=/profile/driver")
  const { user } = session.data
  const authName = user.name || user.email?.split("@")[0] || "Driver"

  return (
    <PublicShell>
      <DriverProfileEditor authName={authName} />
    </PublicShell>
  )
}

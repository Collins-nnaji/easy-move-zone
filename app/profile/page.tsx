import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { authServer } from "@/lib/auth/server"
import { PublicShell } from "@/components/platform/PublicShell"
import { ProfileWorkspace } from "@/components/profile/ProfileWorkspace"

export const metadata: Metadata = {
  title: "Profile — EasyMoveZone",
  description: "Manage your account details and visa application workspace.",
}

export default async function ProfilePage() {
  const session = await authServer.getSession()
  if (!session?.data?.user) redirect("/auth?redirect=/profile")
  const { user } = session.data
  const authName = user.name || user.email?.split("@")[0] || "Member"
  const authEmail = user.email ?? ""

  return (
    <PublicShell>
      <ProfileWorkspace authName={authName} authEmail={authEmail} />
    </PublicShell>
  )
}

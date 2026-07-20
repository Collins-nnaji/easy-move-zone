import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { authServer } from "@/lib/auth/server"
import { PublicShell } from "@/components/platform/PublicShell"
import { ProfileWorkspace } from "@/components/profile/ProfileWorkspace"

export const metadata: Metadata = {
  title: "Profile — EasyMoveZone",
  description:
    "Manage your driver and fleet marketplace profiles, open either app, and sign out.",
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await authServer.getSession()
  if (!session?.data?.user) redirect("/auth?redirect=/profile")
  const { user } = session.data
  const authName = user.name || user.email?.split("@")[0] || "Member"
  const authEmail = user.email ?? ""
  const q = await searchParams
  const from = typeof q.from === "string" ? q.from : ""
  const initialRole = from === "fleet" ? "fleet" : "driver"

  return (
    <PublicShell>
      <ProfileWorkspace authName={authName} authEmail={authEmail} initialRole={initialRole} />
    </PublicShell>
  )
}

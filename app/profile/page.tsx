import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { authServer } from "@/lib/auth/server"
import { PublicShell } from "@/components/platform/PublicShell"
import { ProfileHub } from "@/components/profile/ProfileHub"

export const metadata: Metadata = {
  title: "Account — EasyMoveZone",
  description: "Manage your separate driver and company profiles on EasyMoveZone.",
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
  if (from === "fleet") redirect("/profile/company")
  if (from === "move" || from === "driver") redirect("/profile/driver")

  return (
    <PublicShell>
      <ProfileHub authName={authName} authEmail={authEmail} />
    </PublicShell>
  )
}

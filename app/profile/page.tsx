import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { authServer } from "@/lib/auth/server"
import { PublicShell } from "@/components/platform/PublicShell"
import { ProfileHub } from "@/components/profile/ProfileHub"

export const metadata: Metadata = {
  title: "Your profile",
  description: "Edit your career profile, skills, move preferences, and assessment badges.",
}

export default async function ProfilePage() {
  const session = await authServer.getSession()
  if (!session?.data?.user) redirect("/auth?redirect=/profile")
  const { user } = session.data
  const authName = user.name || user.email?.split("@")[0] || "Member"
  const authEmail = user.email ?? ""

  return (
    <PublicShell>
      <ProfileHub authName={authName} authEmail={authEmail} />
    </PublicShell>
  )
}

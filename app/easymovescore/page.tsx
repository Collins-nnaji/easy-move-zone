import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { authServer } from "@/lib/auth/server"
import { PathfinderClient } from "@/components/pathfinder/PathfinderClient"

export const metadata: Metadata = {
  title: "EasyMove Score",
  description:
    "Upload your CV, pick destinations and target careers, and get your EasyMove Score with simulator and skill ROI.",
  alternates: { canonical: "/easymovescore" },
}

export default async function EasyMoveScorePage() {
  const session = await authServer.getSession()
  if (!session?.data?.user) redirect("/auth?redirect=/easymovescore")
  const { user } = session.data
  const userName = user.name || user.email?.split("@")[0] || "Member"
  const userEmail = user.email ?? ""

  return <PathfinderClient userName={userName} userEmail={userEmail} />
}

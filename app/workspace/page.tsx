import type { Metadata } from "next"
import { authServer } from "@/lib/auth/server"
import { PathfinderClient } from "@/components/pathfinder/PathfinderClient"
import { AuthPreviewGate } from "@/components/platform/AuthPreviewGate"

export const metadata: Metadata = {
  title: "My Workspace",
  description: "Plan your move, manage and improve your CVs, and complete work simulations in one personal workspace.",
  alternates: { canonical: "/workspace" },
}

export default async function WorkspacePage() {
  const session = await authServer.getSession()
  const user = session?.data?.user
  return (
    <AuthPreviewGate signedIn={Boolean(user)} redirectTo="/workspace" title="My Workspace">
      <PathfinderClient />
    </AuthPreviewGate>
  )
}

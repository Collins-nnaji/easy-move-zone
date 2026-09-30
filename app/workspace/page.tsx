import type { Metadata } from "next"
import { authServer } from "@/lib/auth/server"
import { PathfinderClient } from "@/components/pathfinder/PathfinderClient"
import { AuthPreviewGate } from "@/components/platform/AuthPreviewGate"
import { buildPageMetadata } from "@/lib/site-metadata"

export const metadata: Metadata = buildPageMetadata({
  title: "My Workspace — Career and Move Planner",
  description:
    "Plan a career or country move, score your visa chances, build and improve your CVs, and complete work simulations in one personal workspace.",
  path: "/workspace",
  keywords: ["career planner", "move abroad planner", "CV builder", "career change", "visa chances", "work simulation"],
})

export default async function WorkspacePage() {
  const session = await authServer.getSession()
  const user = session?.data?.user
  return (
    <AuthPreviewGate signedIn={Boolean(user)} redirectTo="/workspace" title="My Workspace">
      <PathfinderClient />
    </AuthPreviewGate>
  )
}

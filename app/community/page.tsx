import { redirect } from "next/navigation"
import { authServer } from "@/lib/auth/server"
import { CommunityPage } from "@/components/platform/CommunityPage"

export const metadata = {
  title: "Community — EasyMoveZone",
  description: "Connect with people moving to the same city. Share tips, find flatmates, get insider advice.",
}

export default async function Community() {
  const session = await authServer.getSession()
  if (!session?.data?.user) redirect("/auth?redirect=/community")
  return <CommunityPage />
}

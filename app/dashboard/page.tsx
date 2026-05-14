import { redirect } from "next/navigation"
import { authServer } from "@/lib/auth/server"
import { MoverDashboard } from "@/components/platform/MoverDashboard"

export const metadata = {
  title: "Your Dashboard — EasyMoveZone",
  description: "Your personalised relocation dashboard. Housing matches, tasks, cost tracker, and AI concierge.",
}

export default async function DashboardPage() {
  const session = await authServer.getSession()
  if (!session?.data?.user) redirect("/auth?redirect=/dashboard")
  return <MoverDashboard user={session.data.user} />
}

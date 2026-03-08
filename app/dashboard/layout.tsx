import { redirect } from "next/navigation"
import { neonAuth } from "@neondatabase/auth/next/server"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { session, user } = await neonAuth()
  if (!session || !user) redirect("/contact?view=account&redirect=/dashboard/client")
  return <>{children}</>
}

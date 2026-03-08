import { redirect } from "next/navigation"
import { neonAuth } from "@neondatabase/auth/next/server"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { session, user } = await neonAuth()
  if (!session || !user) redirect("/auth?redirect=/dashboard/client")
  return <>{children}</>
}

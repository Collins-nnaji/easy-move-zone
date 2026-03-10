import { redirect } from "next/navigation"
import { neonAuth } from "@neondatabase/auth/next/server"
import { AdminDashboard } from "@/components/admin/AdminDashboard"

const ADMIN_EMAIL = "collinsnnaji1@gmail.com"

export default async function AdminPage() {
  const { user } = await neonAuth().catch(() => ({ user: null, session: null }))

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect("/auth?next=/admin")
  }

  return <AdminDashboard />
}

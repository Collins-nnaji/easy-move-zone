import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/auth/admin"
import { AdminUsersClient } from "@/components/admin/AdminUsersClient"

export default async function AdminUsersPage() {
  const admin = await requireAdmin()
  if (!admin) redirect("/auth?redirect=/admin/users")
  return <AdminUsersClient />
}

import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/auth/admin"
import { AdminRequestsClient } from "@/components/admin/AdminRequestsClient"

export default async function AdminRequestsPage() {
  const admin = await requireAdmin()
  if (!admin) redirect("/auth?redirect=/admin/requests")
  return <AdminRequestsClient />
}

import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/auth/admin"
import { AdminServicesClient } from "@/components/admin/AdminServicesClient"

export default async function AdminServicesPage() {
  const admin = await requireAdmin()
  if (!admin) redirect("/auth?redirect=/admin/services")
  return <AdminServicesClient />
}

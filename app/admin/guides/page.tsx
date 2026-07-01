import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/auth/admin"
import { AdminGuidesClient } from "@/components/admin/AdminGuidesClient"

export default async function AdminGuidesPage() {
  const admin = await requireAdmin()
  if (!admin) redirect("/auth?redirect=/admin/guides")
  return <AdminGuidesClient />
}

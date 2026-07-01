import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/auth/admin"
import { AdminEmbassiesClient } from "@/components/admin/AdminEmbassiesClient"

export default async function AdminEmbassiesPage() {
  const admin = await requireAdmin()
  if (!admin) redirect("/auth?redirect=/admin/embassies")
  return <AdminEmbassiesClient />
}

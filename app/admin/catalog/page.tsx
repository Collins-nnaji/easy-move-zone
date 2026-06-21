import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/auth/admin"
import { AdminCatalogClient } from "@/components/admin/AdminCatalogClient"

export default async function AdminCatalogPage() {
  const admin = await requireAdmin()
  if (!admin) redirect("/auth?redirect=/admin/catalog")
  return <AdminCatalogClient />
}

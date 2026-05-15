import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/auth/admin"
import { AdminVendorsClient } from "@/components/admin/AdminVendorsClient"

export default async function AdminVendorsPage() {
  const admin = await requireAdmin()
  if (!admin) redirect("/auth?redirect=/admin/vendors")
  return <AdminVendorsClient />
}

import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/auth/admin"
import { AdminListingsClient } from "@/components/admin/AdminListingsClient"

export default async function AdminListingsPage() {
  const admin = await requireAdmin()
  if (!admin) redirect("/auth?redirect=/admin/listings")
  return <AdminListingsClient />
}

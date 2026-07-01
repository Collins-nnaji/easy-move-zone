import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/auth/admin"
import { AdminVisaTemplatesClient } from "@/components/admin/AdminVisaTemplatesClient"

export default async function AdminVisaTemplatesPage() {
  const admin = await requireAdmin()
  if (!admin) redirect("/auth?redirect=/admin/visa-templates")
  return <AdminVisaTemplatesClient />
}

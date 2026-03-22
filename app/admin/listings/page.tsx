import { redirect } from "next/navigation"
import { PublicShell } from "@/components/platform/PublicShell"
import { AdminListingsClient } from "@/components/admin/AdminListingsClient"
import { requireAdmin } from "@/lib/auth/admin"

export default async function AdminListingsPage() {
  const admin = await requireAdmin()
  if (!admin) redirect("/auth?redirect=/admin/listings")

  return (
    <PublicShell>
      <div className="min-h-screen bg-[#f6f8fb]">
        <AdminListingsClient />
      </div>
    </PublicShell>
  )
}

import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/auth/admin"
import { PublicShell } from "@/components/platform/PublicShell"
import { AdminSubmissionsClient } from "@/components/admin/AdminSubmissionsClient"

export default async function AdminSubmissionsPage() {
  const admin = await requireAdmin()
  if (!admin) redirect("/auth?redirect=/admin/submissions")

  return (
    <PublicShell>
      <div className="min-h-screen bg-[#f6f8fb]">
        <AdminSubmissionsClient />
      </div>
    </PublicShell>
  )
}

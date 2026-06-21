import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/auth/admin"
import { AdminBookingsClient } from "@/components/admin/AdminBookingsClient"

export default async function AdminBookingsPage() {
  const admin = await requireAdmin()
  if (!admin) redirect("/auth?redirect=/admin/bookings")
  return <AdminBookingsClient />
}

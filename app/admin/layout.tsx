import type { Metadata } from "next"
import { AdminShell } from "@/components/admin/AdminShell"

export const metadata: Metadata = {
  title: "Admin — EasyMoveZone",
  description: "Internal admin tools for users, catalog, guides, and bookings.",
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}

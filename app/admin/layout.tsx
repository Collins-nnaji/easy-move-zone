import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Admin — EasyMoveZone",
  description:
    "Manage EasyMoveZone produce, routes, export destinations, pictures, enquiries and delivery requests.",
  robots: { index: false, follow: false },
};

// Middleware only proves *someone* is signed in; the admin_users check needs a
// database read, so it has to happen here. Individual admin pages call
// requireAdmin() too — this makes the shell itself fail closed if one forgets.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect("/auth?redirect=/admin");

  return <AdminShell>{children}</AdminShell>;
}

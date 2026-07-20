import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminDisputesClient } from "@/components/admin/AdminDisputesClient";

export default async function AdminDisputesPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/auth?redirect=/admin/disputes");
  return <AdminDisputesClient />;
}

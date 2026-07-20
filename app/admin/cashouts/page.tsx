import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminCashoutsClient } from "@/components/admin/AdminCashoutsClient";

export default async function AdminCashoutsPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/auth?redirect=/admin/cashouts");
  return <AdminCashoutsClient />;
}

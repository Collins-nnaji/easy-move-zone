import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminKycClient } from "@/components/admin/AdminKycClient";

export default async function AdminKycPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/auth?redirect=/admin/kyc");
  return <AdminKycClient />;
}

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { PlatformManager } from "@/components/admin/PlatformManager";
export default async function AdminHomePage() {
  if (!(await requireAdmin())) redirect("/auth?redirect=/admin");
  return <PlatformManager />;
}

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { MoveManager } from "@/components/moving/MoveManager";
export default async function AdminHomePage() {
  if (!(await requireAdmin())) redirect("/auth?redirect=/admin");
  return <MoveManager />;
}

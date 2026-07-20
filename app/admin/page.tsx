import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import { getOpsDashboardStats } from "@/lib/admin/marketplace-ops";
import { AlertTriangle, ShieldCheck, Users, Wallet } from "lucide-react";

export default async function AdminHomePage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/auth?redirect=/admin");

  const stats = await getOpsDashboardStats();

  const cards = [
    {
      href: "/admin/kyc",
      title: "KYC review",
      desc: `${stats.pendingKyc} document${stats.pendingKyc === 1 ? "" : "s"} awaiting approval`,
      icon: ShieldCheck,
      accent: stats.pendingKyc > 0,
    },
    {
      href: "/admin/cashouts",
      title: "Cashout failures",
      desc: `${stats.failedCashouts} failed Stripe transfer${stats.failedCashouts === 1 ? "" : "s"}`,
      icon: Wallet,
      accent: stats.failedCashouts > 0,
    },
    {
      href: "/admin/disputes",
      title: "Dispute flags",
      desc: `${stats.disputeFlags} low-star rating${stats.disputeFlags === 1 ? "" : "s"} to triage`,
      icon: AlertTriangle,
      accent: stats.disputeFlags > 0,
    },
    {
      href: "/admin/users",
      title: "Users",
      desc: "Search accounts and verify agents",
      icon: Users,
      accent: false,
    },
  ] as const;

  return (
    <div className="mx-auto max-w-5xl p-6 sm:p-8">
      <h1 className="text-2xl font-bold">Marketplace ops</h1>
      <p className="mt-1 text-sm text-white/50">Signed in as {admin.email}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className={`rounded-2xl border p-5 transition ${
              c.accent
                ? "border-[#e0511f]/40 bg-[#e0511f]/10 hover:bg-[#e0511f]/15"
                : "border-white/10 bg-white/[0.03] hover:border-[#e0511f]/40 hover:bg-white/[0.06]"
            }`}
          >
            <c.icon className={`h-5 w-5 ${c.accent ? "text-[#f3aa79]" : "text-[#e0511f]"}`} />
            <p className="mt-3 font-semibold">{c.title}</p>
            <p className="mt-1 text-sm text-white/50">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

import { requireSignedIn } from "@/lib/auth/guard";
import { PublicShell } from "@/components/platform/PublicShell";
import { CustomerDashboard } from "@/components/marketplace/CustomerDashboard";
export const metadata = {
  title: "Your moves & account",
  robots: { index: false, follow: false },
};
export default async function ProfilePage() {
  await requireSignedIn("/profile");
  return (
    <PublicShell>
      <CustomerDashboard />
    </PublicShell>
  );
}

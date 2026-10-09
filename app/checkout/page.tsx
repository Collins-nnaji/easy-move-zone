import { Suspense } from "react";
import { PublicShell } from "@/components/platform/PublicShell";
import { Checkout } from "@/components/marketplace/Checkout";
export const metadata = {
  title: "Payment & receipts",
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <PublicShell>
      <Suspense fallback={<p className="p-12">Loading checkout…</p>}>
        <Checkout />
      </Suspense>
    </PublicShell>
  );
}

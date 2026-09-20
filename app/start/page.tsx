import type { Metadata } from "next";
import { Suspense } from "react";
import { RoleChooser } from "@/components/platform/RoleChooser";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Open EasyMoveZone",
  description: `Choose how you'll use ${BRAND.name} — as a company posting jobs, or a driver claiming them.`,
};

// RoleChooser reads ?add= and ?redirect= via useSearchParams(), which opts the
// subtree into client-side rendering — it must sit behind a Suspense boundary
// or the production build fails to prerender this route.
export default function StartPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: BRAND.backgroundColor }} />}>
      <RoleChooser />
    </Suspense>
  );
}

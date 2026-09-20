import type { Metadata } from "next";
import { Suspense } from "react";
import { RoleChooser } from "@/components/platform/RoleChooser";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Open EasyMoveZone",
  description: `Choose how you'll use ${BRAND.name} — as a shipper moving freight, or a carrier running inland legs.`,
};

export default function StartPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: BRAND.backgroundColor }} />}>
      <RoleChooser />
    </Suspense>
  );
}

import type { Metadata } from "next";
import { PublicShell } from "@/components/platform/PublicShell";
import { ExportBoard } from "@/components/produce/ExportBoard";
import { buildPageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Export Nigerian Produce",
  description:
    "Plan your Nigerian produce export with EasyMoveZone. We coordinate collection, transport to port and export preparation with one team.",
  path: "/export",
});

export default function ExportPage() {
  return (
    <PublicShell>
      <ExportBoard />
    </PublicShell>
  );
}

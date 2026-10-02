import type { Metadata } from "next";
import { PublicShell } from "@/components/platform/PublicShell";
import { LotsClient } from "@/components/produce/LotsClient";
import { buildPageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Buy Nigerian Produce",
  description:
    "Explore Nigerian produce by quantity, quality and location. EasyMoveZone helps coordinate your purchase, collection and delivery.",
  path: "/lots",
});

export default function LotsPage() {
  return (
    <PublicShell>
      <LotsClient />
    </PublicShell>
  );
}

import type { Metadata } from "next";
import { PublicShell } from "@/components/platform/PublicShell";
import { RoutesBoard } from "@/components/produce/RoutesBoard";
import { buildPageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Delivery Routes Across Nigeria",
  description:
    "Find Nigerian produce delivery routes, explore transport estimates and let EasyMoveZone arrange collection, transport and delivery.",
  path: "/routes",
});

export default function RoutesPage() {
  return (
    <PublicShell>
      <RoutesBoard />
    </PublicShell>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicShell } from "@/components/platform/PublicShell";
import { WorkerHub } from "@/components/moving/WorkerHub";
import { buildPageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Crew hub for movers and vehicle owners",
  description:
    "Join EasyMoveZone as a mover or vehicle owner in Lagos and receive moving jobs assigned by the operations team.",
  path: "/hub",
  noIndex: true,
});

export default function HubPage() {
  return (
    <PublicShell>
      <Suspense
        fallback={
          <div className="px-4 py-16 text-sm text-[#5f655c]">Loading the crew hub…</div>
        }
      >
        <WorkerHub />
      </Suspense>
    </PublicShell>
  );
}

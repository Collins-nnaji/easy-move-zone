import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicShell } from "@/components/platform/PublicShell";
import { BookMove } from "@/components/moving/BookMove";
import { buildPageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Book a Home, Office or Bulky-item Move",
  description:
    "Request a moving quote in Lagos. Share your inventory, photos, addresses, stairs and preferred date for a coordinated home, office or bulky-item move.",
  path: "/book",
});

export default function BookPage() {
  return (
    <PublicShell>
      <Suspense
        fallback={
          <div className="px-4 py-16 text-sm text-[#5f655c]">
            Loading the booking form…
          </div>
        }
      >
        <BookMove />
      </Suspense>
    </PublicShell>
  );
}

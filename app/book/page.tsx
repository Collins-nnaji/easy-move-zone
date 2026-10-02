import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicShell } from "@/components/platform/PublicShell";
import { BookClient } from "@/components/produce/BookClient";
import { buildPageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Arrange a Produce Delivery",
  description:
    "Request a Nigerian produce delivery. Share your produce, weight, collection point and destination; our team confirms the price and arrangements.",
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
        <BookClient />
      </Suspense>
    </PublicShell>
  );
}

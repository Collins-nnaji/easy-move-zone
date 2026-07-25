import type { Metadata } from "next";
import { Suspense } from "react";
import { Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { FleetApp } from "./FleetApp";
import { BRAND } from "@/lib/brand";
import { requireRole } from "@/lib/auth/guard";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-hanken",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fleet console",
  description: `${BRAND.name} fleet operator console — post loads, find rated drivers, manage workload.`,
  applicationName: BRAND.shortName,
};

// The fleet console is private — see the note in app/move/layout.tsx.
export default async function FleetLayout() {
  await requireRole("company", "/fleet/dashboard");

  return (
    <div style={{ display: "contents" }} className={`${hanken.variable} ${plexMono.variable}`}>
      <Suspense fallback={<div className="move-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "40vh" }} />}>
        <FleetApp />
      </Suspense>
    </div>
  );
}

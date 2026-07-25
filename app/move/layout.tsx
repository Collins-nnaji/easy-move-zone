import type { Metadata } from "next";
import { Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { DriverApp } from "./DriverApp";
import { BRAND } from "@/lib/brand";
import { requireRole } from "@/lib/auth/guard";

// The design's type pairing: Hanken Grotesk (UI/display) + IBM Plex Mono
// (tags, stats, wordmark). Exposed as CSS variables the app references.
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
  title: "Driver app",
  description: BRAND.description,
  applicationName: BRAND.shortName,
  appleWebApp: {
    capable: true,
    title: BRAND.shortName,
    statusBarStyle: "default",
  },
};

// Every /move/* route renders through this single client component.
// Per-route page.tsx files register bookmarkable URLs with Next.js.
//
// The driver app is private: requireRole() redirects to /auth when there is no
// session, and to /start when the account exists but has no driver profile yet.
// Gating here (rather than only in middleware) means the check reads the
// profile tables and covers every /move/* route.
export default async function MoveLayout() {
  await requireRole("driver", "/move/shifts");

  return (
    <div style={{ display: "contents" }} className={`${hanken.variable} ${plexMono.variable}`}>
      <DriverApp />
    </div>
  );
}

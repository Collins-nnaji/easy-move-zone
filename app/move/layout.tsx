import type { Metadata } from "next";
import { Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { DriverApp } from "./DriverApp";

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
  title: "EasyMoveZone — Commercial driving shifts",
  description:
    "Claim local commercial driving shifts, track your route live, cash out instantly, and keep your compliance docs verified — all in one driver app.",
};

// Every /move/* route renders through this single client component.
// Per-route page.tsx files register bookmarkable URLs with Next.js.
export default function MoveLayout() {
  return (
    <div style={{ display: "contents" }} className={`${hanken.variable} ${plexMono.variable}`}>
      <DriverApp />
    </div>
  );
}

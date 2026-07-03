import type { Metadata } from "next";
import { Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { EasyMoveZoneApp } from "./EasyMoveZoneApp";

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
  title: "EasyMoveZone — Your move, made easy.",
  description:
    "See the visas you qualify for and your exact document checklist in minutes — no consultant. Then sort movement and accommodation, adapting to how long you're staying.",
};

// Every /move/* route (see EasyMoveZoneApp's screenFromPath/buildMovePath)
// renders through this single client component, which reads the URL itself
// to decide what to show. The per-route page.tsx files below exist only to
// register real, bookmarkable URLs with Next.js's router — they render
// nothing themselves.
export default function MoveLayout() {
  return (
    <div style={{ display: "contents" }} className={`${hanken.variable} ${plexMono.variable}`}>
      <EasyMoveZoneApp />
    </div>
  );
}

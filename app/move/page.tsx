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
  title: "EasyMoveZone — Move Spectrum",
  description:
    "Two weeks or forever — we get you there, sorted. One app for every kind of international move, adapting to how long you're staying.",
};

export default function MovePage() {
  return (
    <div style={{ display: "contents" }} className={`${hanken.variable} ${plexMono.variable}`}>
      <EasyMoveZoneApp />
    </div>
  );
}

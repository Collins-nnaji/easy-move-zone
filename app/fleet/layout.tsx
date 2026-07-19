import type { Metadata } from "next";
import { Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { FleetApp } from "./FleetApp";
import { BRAND } from "@/lib/brand";

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

export default function FleetLayout() {
  return (
    <div style={{ display: "contents" }} className={`${hanken.variable} ${plexMono.variable}`}>
      <FleetApp />
    </div>
  );
}

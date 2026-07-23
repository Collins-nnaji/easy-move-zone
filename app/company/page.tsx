import type { Metadata } from "next";
import { LandingNav } from "@/components/platform/LandingNav";
import { LandingFooter } from "@/components/platform/LandingFooter";
import { CompanyLandingClient } from "@/components/platform/CompanyLandingClient";
import { PublicShell } from "@/components/platform/PublicShell";

export const metadata: Metadata = {
  title: "Post jobs & hire drivers — for companies",
  description:
    "Post funded delivery jobs and hire rated drivers across Nigeria. Escrow pay in naira, track every run live, and pay only 8% on completion.",
};

export default function CompanyLandingPage() {
  return (
    <PublicShell>
      <LandingNav audience="company" />
      <CompanyLandingClient />
      <LandingFooter audience="company" />
    </PublicShell>
  );
}

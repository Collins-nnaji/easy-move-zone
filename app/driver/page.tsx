import type { Metadata } from "next";
import { LandingNav } from "@/components/platform/LandingNav";
import { LandingFooter } from "@/components/platform/LandingFooter";
import { DriverLandingClient } from "@/components/platform/DriverLandingClient";
import { PublicShell } from "@/components/platform/PublicShell";

export const metadata: Metadata = {
  title: "Drive & earn — funded delivery jobs",
  description:
    "Claim funded commercial driving jobs across Nigeria, track routes with GPS, and cash out in naira. Every job is funded upfront before you drive.",
};

export default function DriverLandingPage() {
  return (
    <PublicShell>
      <LandingNav audience="driver" />
      <DriverLandingClient />
      <LandingFooter audience="driver" />
    </PublicShell>
  );
}

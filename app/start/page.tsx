import type { Metadata } from "next";
import { RoleChooser } from "@/components/platform/RoleChooser";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Open EasyMoveZone",
  description: `Choose how you'll use ${BRAND.name} — as a company posting jobs, or a driver claiming them.`,
};

export default function StartPage() {
  return <RoleChooser />;
}

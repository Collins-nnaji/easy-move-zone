import type { Metadata } from "next"
import { JobsClient } from "@/components/mobility/JobsClient"

export const metadata: Metadata = {
  title: "Sponsored jobs",
  description:
    "Browse visa-linked and sponsorship-friendly roles with Fit Check — must-haves, skill overlap, and when to skip.",
  alternates: { canonical: "/jobs" },
}

export default function JobsPage() {
  return <JobsClient />
}

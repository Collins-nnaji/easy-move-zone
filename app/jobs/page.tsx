import type { Metadata } from "next"
import { JobsClient } from "@/components/mobility/JobsClient"
import { authServer } from "@/lib/auth/server"
import { AuthPreviewGate } from "@/components/platform/AuthPreviewGate"
import { buildPageMetadata } from "@/lib/site-metadata"

export const metadata: Metadata = buildPageMetadata({
  title: "Visa Sponsorship Jobs with Fit Check",
  description:
    "Browse visa-linked and sponsorship-friendly roles with Fit Check — must-haves, how well you fit, and when to skip.",
  path: "/jobs",
  keywords: ["visa sponsorship jobs", "sponsored jobs", "jobs with visa sponsorship", "skilled worker jobs", "job fit check"],
})

export default async function JobsPage({ searchParams }: { searchParams: Promise<{ jobId?: string }> }) {
  const [session, params] = await Promise.all([authServer.getSession(), searchParams])
  const jobId = params.jobId?.trim() || ""
  const redirectTo = jobId ? `/jobs?jobId=${encodeURIComponent(jobId)}` : "/jobs"
  return (
    <AuthPreviewGate signedIn={Boolean(session?.data?.user)} redirectTo={redirectTo} title="the jobs board">
      <JobsClient initialJobId={jobId} />
    </AuthPreviewGate>
  )
}

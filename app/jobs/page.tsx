import type { Metadata } from "next"
import { JobsClient } from "@/components/mobility/JobsClient"
import { authServer } from "@/lib/auth/server"
import { AuthPreviewGate } from "@/components/platform/AuthPreviewGate"

export const metadata: Metadata = {
  title: "Sponsored jobs",
  description:
    "Browse visa-linked and sponsorship-friendly roles with Fit Check — must-haves, skill overlap, and when to skip.",
  alternates: { canonical: "/jobs" },
}

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

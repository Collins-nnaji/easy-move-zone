import type { Metadata } from "next"
import { authServer } from "@/lib/auth/server"
import { AuthPreviewGate } from "@/components/platform/AuthPreviewGate"
import { ApplicationPackClient } from "@/components/career/ApplicationPackClient"

export const metadata: Metadata = {
  title: "Application pack",
  description: "Create a tailored CV, cover letter, and application answers from a job and your saved CV.",
  robots: { index: false, follow: false },
}

export default async function ApplicationPackPage({ searchParams }: { searchParams: Promise<{ jobId?: string }> }) {
  const [{ jobId }, session] = await Promise.all([searchParams, authServer.getSession()])
  return (
    <AuthPreviewGate signedIn={Boolean(session?.data?.user)} redirectTo={`/application-pack?jobId=${encodeURIComponent(jobId || "")}`} title="Application Pack">
      {jobId ? <ApplicationPackClient jobId={jobId} /> : <div className="mx-auto max-w-xl px-4 py-20 text-center"><h1 className="text-2xl font-extrabold">Choose a job first</h1><p className="mt-2 text-sm text-[#626861]">Run Fit Check on a role, then select Create CV & application pack.</p></div>}
    </AuthPreviewGate>
  )
}

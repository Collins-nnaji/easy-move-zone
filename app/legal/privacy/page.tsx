import type { Metadata } from "next"
import Link from "next/link"
import { PublicShell } from "@/components/platform/PublicShell"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How EasyMoveZone collects and uses personal information for career and relocation tools.",
}

export default function PrivacyPage() {
  return (
    <PublicShell>
      <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e0511f]">Legal</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#1b231e]">Privacy Policy</h1>
        <p className="mt-3 text-sm text-[#6e746b]">Last updated: September 26, 2026</p>

        <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-[#4a5047]">
          <p>
            We collect account details (name, email), career profile data (skills, role, destinations),
            documents you upload to your vault (such as CVs), assessment results and badges, and support
            enquiries you submit.
          </p>
          <h2 className="text-lg font-bold text-[#1b231e]">How we use data</h2>
          <p>
            To sign you in, personalise Fit Check and EasyMove Score, store your profile and documents,
            award assessment badges, and respond to specialist or contact enquiries.
          </p>
          <h2 className="text-lg font-bold text-[#1b231e]">Sharing</h2>
          <p>
            We use infrastructure providers for auth, database, and optional file storage. We do not sell
            your personal data. Specialist enquiries are reviewed only by EasyMoveZone support staff.
          </p>
          <h2 className="text-lg font-bold text-[#1b231e]">Documents</h2>
          <p>
            CV and supporting uploads are stored for your account so Fit Check and path tools can use
            them. You can delete vault files from your profile.
          </p>
          <h2 className="text-lg font-bold text-[#1b231e]">Your choices</h2>
          <p>
            Contact us to request access, correction, or deletion of your account data. See also our{" "}
            <Link href="/legal/terms" className="font-semibold text-[#e0511f] underline-offset-2 hover:underline">
              Terms of Service
            </Link>
            .
          </p>
        </div>
      </article>
    </PublicShell>
  )
}

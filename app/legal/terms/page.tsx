import type { Metadata } from "next"
import Link from "next/link"
import { PublicShell } from "@/components/platform/PublicShell"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms for using EasyMoveZone career, sponsorship, and relocation tools.",
}

export default function TermsPage() {
  return (
    <PublicShell>
      <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e0511f]">Legal</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#1b231e]">Terms of Service</h1>
        <p className="mt-3 text-sm text-[#6e746b]">Last updated: September 26, 2026</p>

        <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-[#4a5047]">
          <p>
            EasyMoveZone provides software tools to explore career moves abroad, check visa sponsorship
            signals, practise role assessments, and request specialist support. By creating an account or
            using the product, you agree to these terms.
          </p>
          <h2 className="text-lg font-bold text-[#1b231e]">1. Not legal or immigration advice</h2>
          <p>
            Scores, Fit Checks, sponsor lists, news, and simulations are informational. They are not
            immigration, legal, or employment advice. Always verify requirements with official government
            sources and qualified advisers before you apply or relocate.
          </p>
          <h2 className="text-lg font-bold text-[#1b231e]">2. Accounts</h2>
          <p>
            You must provide accurate account and profile information. You are responsible for activity
            under your login and for documents you upload.
          </p>
          <h2 className="text-lg font-bold text-[#1b231e]">3. Content & jobs</h2>
          <p>
            Job and sponsor data may come from public registers and third-party listings. We do not
            guarantee vacancies, sponsorship outcomes, or that a listing remains open.
          </p>
          <h2 className="text-lg font-bold text-[#1b231e]">4. Specialist support</h2>
          <p>
            Enquiries submitted via specialist support are requests for follow-up, not a guaranteed
            service engagement until separately confirmed.
          </p>
          <h2 className="text-lg font-bold text-[#1b231e]">5. Acceptable use</h2>
          <p>
            Do not misuse the platform, attempt unauthorised access, or upload unlawful content. We may
            suspend accounts that abuse the service.
          </p>
          <p>
            See our{" "}
            <Link href="/legal/privacy" className="font-semibold text-[#e0511f] underline-offset-2 hover:underline">
              Privacy Policy
            </Link>{" "}
            for how we handle personal data.
          </p>
        </div>
      </article>
    </PublicShell>
  )
}

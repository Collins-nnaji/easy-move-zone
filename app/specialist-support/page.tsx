import type { Metadata } from "next"
import { PublicShell } from "@/components/platform/PublicShell"
import { SpecialistEnquiryForm } from "@/components/platform/SpecialistEnquiryForm"
import { buildPageMetadata } from "@/lib/site-metadata"

export const metadata: Metadata = buildPageMetadata({
  title: "Specialist Relocation Support",
  description:
    "Request one-to-one help planning a move abroad — destinations, sponsorship, career fit, and next steps.",
  path: "/specialist-support",
  keywords: ["relocation support", "move abroad help", "visa sponsorship advice", "relocation specialist"],
})

export default function SpecialistSupportPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <p className="text-sm font-extrabold tracking-tight text-[#e0511f]">Specialist support</p>
        <h1 className="page-title mt-2 text-3xl font-extrabold tracking-tight text-[#1b231e] sm:text-4xl">
          Need hands-on help to relocate?
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#5f655c] sm:text-base">
          Use this form if self-serve tools aren&apos;t enough — complex visas, career switches across borders, family
          moves, or you want a specialist to review your case. We&apos;ll reply with next steps.
        </p>
        <div className="mt-8">
          <SpecialistEnquiryForm />
        </div>
      </div>
    </PublicShell>
  )
}

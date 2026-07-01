import type { Metadata } from "next"
import { PublicShell } from "@/components/platform/PublicShell"
import { VisaLookupForm } from "@/components/visa/VisaLookupForm"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Visa requirements lookup | EasyMoveZone",
  description: "Look up visa requirements, document checklists, and embassy contacts by nationality and destination.",
}

export default function VisaLandingPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-2xl px-4 pb-20 pt-32 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-wide text-[#e0511f]">Visa assistant</p>
        <h1 className="mt-2 text-3xl font-bold text-[#1b231e] sm:text-4xl">
          What do you need for your visa?
        </h1>
        <p className="mt-3 text-[#4a5047]">
          Tell us your nationality, where you&apos;re headed, and the visa type — we&apos;ll show typical
          requirements, a document checklist, and nearby embassies.
        </p>

        <div className="mt-8">
          <VisaLookupForm />
        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link href="/visa/applications" className="font-semibold text-[#e0511f] hover:underline">
            Track a visa application →
          </Link>
          <Link href="/embassies" className="font-semibold text-[#e0511f] hover:underline">
            Browse the embassy directory →
          </Link>
        </div>
      </div>
    </PublicShell>
  )
}

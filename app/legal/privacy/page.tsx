import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/platform/PublicShell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How EasyMoveZone collects and uses personal information.",
};

export default function PrivacyPage() {
  return (
    <PublicShell>
      <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e0511f]">Legal</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#1b231e]">Privacy Policy</h1>
        <p className="mt-3 text-sm text-[#6e746b]">Last updated: July 20, 2026</p>

        <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-[#4a5047]">
          <p>
            We collect account details (name, email), profile data (zone, vehicle, company), booking
            activity, compliance documents you upload, ratings, and payment metadata needed to operate
            the marketplace.
          </p>
          <h2 className="text-lg font-bold text-[#1b231e]">How we use data</h2>
          <p>
            To authenticate you, match drivers and fleet operators, process escrow/payouts, show
            ratings and verified badges, send booking notifications, and improve product reliability.
          </p>
          <h2 className="text-lg font-bold text-[#1b231e]">Sharing</h2>
          <p>
            Counterparty details needed for a booking (company/driver name, ratings, route summary)
            are visible to the other party. Payment processors (e.g. Stripe) and auth/database
            providers process data under their own terms.
          </p>
          <h2 className="text-lg font-bold text-[#1b231e]">Documents</h2>
          <p>
            Compliance vault uploads are stored securely and accessible to your account. Ops review
            tooling may access them for verification.
          </p>
          <h2 className="text-lg font-bold text-[#1b231e]">Your choices</h2>
          <p>
            You may update profile data in-app or request deletion via{" "}
            <Link href="/contact" className="font-semibold text-[#e0511f]">Contact</Link>.
          </p>
        </div>
      </article>
    </PublicShell>
  );
}

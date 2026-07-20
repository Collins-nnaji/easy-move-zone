import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/platform/PublicShell";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms for using the EasyMoveZone logistics marketplace.",
};

export default function TermsPage() {
  return (
    <PublicShell>
      <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e0511f]">Legal</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#1b231e]">Terms of Service</h1>
        <p className="mt-3 text-sm text-[#6e746b]">Last updated: July 20, 2026</p>

        <div className="prose-emz mt-8 space-y-5 text-[15px] leading-relaxed text-[#4a5047]">
          <p>
            EasyMoveZone is a commission-based logistics marketplace connecting fleet operators with
            independent drivers and truck owners. By creating an account or booking a load, you agree
            to these terms.
          </p>
          <h2 className="text-lg font-bold text-[#1b231e]">1. Marketplace role</h2>
          <p>
            EasyMoveZone provides software tools to post, fund, claim, and complete loads. We are not
            the carrier, broker of record for every load, or employer of drivers unless separately
            agreed in writing.
          </p>
          <h2 className="text-lg font-bold text-[#1b231e]">2. Booking & escrow</h2>
          <p>
            Fleet operators must fund escrow before a load is bookable. Drivers claim or accept offers
            only on funded loads. Platform commission is deducted when a load is marked complete.
          </p>
          <h2 className="text-lg font-bold text-[#1b231e]">3. Accounts & compliance</h2>
          <p>
            You must provide accurate profile and licensing information. Drivers are responsible for
            maintaining valid CDL, insurance, medical certification, and any endorsements required for
            the cargo they accept.
          </p>
          <h2 className="text-lg font-bold text-[#1b231e]">4. Payments</h2>
          <p>
            Payouts and funding may be processed by Stripe or recorded on our ledger during staging.
            Cashouts may include a micro-fee disclosed in the wallet.
          </p>
          <h2 className="text-lg font-bold text-[#1b231e]">5. Ratings & conduct</h2>
          <p>
            After completion, parties may rate each other. Fraud, harassment, or unsafe operations may
            result in suspension.
          </p>
          <h2 className="text-lg font-bold text-[#1b231e]">6. Contact</h2>
          <p>
            Questions: <Link href="/contact" className="font-semibold text-[#e0511f]">Contact us</Link>.
          </p>
        </div>
      </article>
    </PublicShell>
  );
}

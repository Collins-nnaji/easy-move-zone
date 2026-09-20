import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/platform/PublicShell";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms for using EasyMoveZone international logistics and freight services.",
};

export default function TermsPage() {
  return (
    <PublicShell>
      <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e0511f]">Legal</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#1b231e]">Terms of Service</h1>
        <p className="mt-3 text-sm text-[#6e746b]">Last updated: September 20, 2026</p>

        <div className="prose-emz mt-8 space-y-5 text-[15px] leading-relaxed text-[#4a5047]">
          <p>
            EasyMoveZone provides international logistics and freight forwarding services for cargo
            moving between Nigeria and the rest of the world, including sea, air, road, customs
            coordination, and warehousing. By requesting a quote, booking a shipment, or creating an
            account, you agree to these terms.
          </p>
          <h2 className="text-lg font-bold text-[#1b231e]">1. Services</h2>
          <p>
            We arrange and coordinate freight on your behalf. Actual carriage may be performed by
            ocean carriers, airlines, trucking partners, or other subcontractors. Unless we expressly
            agree in writing to act as carrier of record, we act as a freight forwarder / logistics
            coordinator.
          </p>
          <h2 className="text-lg font-bold text-[#1b231e]">2. Quotes & bookings</h2>
          <p>
            Quotes are estimates based on the information you provide (cargo, weight/volume, mode,
            Incoterms, and routing). Final charges may change if cargo details, documentation, or
            carrier rates change before sailing or flight. Bookings are confirmed when we issue a
            booking confirmation and any required deposit is received.
          </p>
          <h2 className="text-lg font-bold text-[#1b231e]">3. Shipper responsibilities</h2>
          <p>
            You must provide accurate cargo descriptions, values, HS codes where applicable, and all
            documents required for export from or import into Nigeria. Dangerous goods must be
            declared. Delays or penalties from inaccurate information are your responsibility.
          </p>
          <h2 className="text-lg font-bold text-[#1b231e]">4. Payments</h2>
          <p>
            Invoices are due as stated on the quote or booking confirmation. Payments may be
            processed via Paystack or other processors we designate. Unpaid balances may result in
            cargo hold or suspension of services.
          </p>
          <h2 className="text-lg font-bold text-[#1b231e]">5. Limitation</h2>
          <p>
            Liability for loss or damage is limited to the extent permitted by applicable law and any
            governing transport conventions or carrier terms that apply to your shipment.
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

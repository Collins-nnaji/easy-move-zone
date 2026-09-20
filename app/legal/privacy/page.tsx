import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/platform/PublicShell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How EasyMoveZone collects and uses personal information for logistics services.",
};

export default function PrivacyPage() {
  return (
    <PublicShell>
      <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e0511f]">Legal</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#1b231e]">Privacy Policy</h1>
        <p className="mt-3 text-sm text-[#6e746b]">Last updated: September 20, 2026</p>

        <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-[#4a5047]">
          <p>
            We collect account details (name, email, phone), company information, quote and shipment
            details (origin, destination, cargo description), documents you upload for clearance, and
            payment metadata needed to operate our logistics services.
          </p>
          <h2 className="text-lg font-bold text-[#1b231e]">How we use data</h2>
          <p>
            To respond to quote requests, book and track shipments, coordinate with carriers and
            customs agents, process payments, send status updates, and improve service reliability.
          </p>
          <h2 className="text-lg font-bold text-[#1b231e]">Sharing</h2>
          <p>
            We share shipment details with carriers, terminals, customs brokers, and other parties
            necessary to move your cargo. Payment processors and infrastructure providers process
            data under their own terms.
          </p>
          <h2 className="text-lg font-bold text-[#1b231e]">Documents</h2>
          <p>
            Commercial documents and compliance files you upload are stored securely and used only
            for clearing and delivering your shipments and for regulatory obligations.
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

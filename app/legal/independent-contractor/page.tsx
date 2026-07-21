import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/platform/PublicShell";

export const metadata: Metadata = {
  title: "Independent contractor notice",
  description: "Drivers and truck owners on EasyMoveZone operate as independent contractors.",
};

export default function IndependentContractorPage() {
  return (
    <PublicShell>
      <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e0511f]">Legal</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#1b231e]">
          Independent contractor notice
        </h1>
        <p className="mt-3 text-sm text-[#6e746b]">Last updated: July 20, 2026</p>

        <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-[#4a5047]">
          <p>
            Drivers and truck owners who book loads on EasyMoveZone do so as <strong>independent
            contractors</strong>, not as employees of EasyMoveZone or of fleet operators unless a
            separate employment agreement exists.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>You choose which loads to accept.</li>
            <li>You provide your own equipment unless the load specifies client fleet.</li>
            <li>You are responsible for taxes, insurance, and licensing required for your work.</li>
            <li>Platform fees and payouts may generate tax reporting where required by Nigerian law.</li>
          </ul>
          <p>
            Fleet operators are responsible for confirming insurance, authority, and cargo requirements
            before dispatch. See also our{" "}
            <Link href="/legal/terms" className="font-semibold text-[#e0511f]">Terms</Link>.
          </p>
        </div>
      </article>
    </PublicShell>
  );
}

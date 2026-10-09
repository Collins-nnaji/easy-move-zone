import { PublicShell } from "@/components/platform/PublicShell";
import { buildPageMetadata } from "@/lib/site-metadata";
import Link from "next/link";
import s from "@/components/marketplace/Marketplace.module.css";

export const metadata = buildPageMetadata({
  title: "Damage, cover & cancellations",
  description:
    "How to record item condition, report damage, request changes and understand moving cover.",
  path: "/damage-policy",
});
export default function Page() {
  return (
    <PublicShell>
      <div className={s.page}>
        <p className={s.eyebrow}>CARE, EVIDENCE & CLEAR EXPECTATIONS</p>
        <h1>Your belongings matter.</h1>
        <p className={s.intro}>
          Agree the inventory and handling requirements before your move. Keep
          pickup and delivery photos so everyone has the same record.
        </p>
        <section className={s.card}>
          <h2>Insurance and cover</h2>
          <p>
            Insurance is not automatically included. If cover is offered for
            your booking, ask for the insurer, covered items, limits,
            exclusions, claims process and any extra charge in writing before
            paying. No blanket insurance promise is made on this page.
          </p>
          <h2>Before collection</h2>
          <p>
            Declare fragile, unusually heavy and valuable items. Confirm who
            packs them and what materials or special equipment are included.
            Keep jewellery, cash, documents and personal essentials with you.
          </p>
          <h2>Condition records</h2>
          <p>
            Customers and assigned crew can record item names, condition and
            photos at pickup and delivery. The customer reviews and signs the
            saved record. Signed records are locked. A signature records the
            observed condition and does not prevent a later issue report.
          </p>
          <h2>Damage or missing items</h2>
          <p>
            Report concerns as soon as you notice them using your account or
            support. Include the move reference, affected items, pickup and
            delivery photos, and a description. Operations records and reviews
            the issue with the partner, and records the outcome. Compensation or
            insurance claims depend on the agreed booking terms and supporting
            evidence.
          </p>
          <h2>Rescheduling and cancellations</h2>
          <p>
            Online changes are available at least 48 hours before moving day,
            before the crew starts travelling. New dates depend on availability.
            Contact support for later changes and guest bookings. Paid
            cancellations go to refund review; refunds are processed by the team
            after reviewing agreed costs and any services already provided.
            Cancelling online does not itself transfer money back.
          </p>
        </section>
        <div className={s.row}>
          <Link href="/profile" className="logistics-button">
            Manage a move or report an issue
          </Link>
          <Link href="/contact" className={s.link}>
            Contact support
          </Link>
        </div>
      </div>
    </PublicShell>
  );
}

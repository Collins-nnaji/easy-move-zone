import Link from "next/link";
import { PublicShell } from "@/components/platform/PublicShell";
import s from "@/components/marketplace/Marketplace.module.css";
export const metadata = {
  title: "Business moving accounts",
  description:
    "Repeat moving and delivery bookings for offices, furniture stores and estate agencies.",
};
export default function Page() {
  return (
    <PublicShell>
      <div className={s.page}>
        <p className={s.eyebrow}>FOR TEAMS, SHOPS & PROPERTY PARTNERS</p>
        <h1>
          Your deliveries.
          <br />
          One working relationship.
        </h1>
        <p className={s.intro}>
          Save your business profile and regular addresses, organise office
          relocations and repeat customer deliveries, and keep receipts in one
          account.
        </p>
        <div className={s.grid}>
          {[
            [
              "Offices",
              "Plan department moves, equipment transfers and office relocations around your working hours.",
            ],
            [
              "Furniture stores",
              "Book bulky-item deliveries from your showroom or warehouse to your customer’s door.",
            ],
            [
              "Estate agencies",
              "Coordinate tenant handovers and moving requests with one operations contact.",
            ],
          ].map(([t, d]) => (
            <article className={s.card} key={t}>
              <h2>{t}</h2>
              <p>{d}</p>
            </article>
          ))}
        </div>
        <div className={s.row}>
          <Link href="/profile" className="logistics-button">
            Set up a business profile
          </Link>
          <Link href="/contact?service=Business%20account" className={s.link}>
            Discuss recurring bookings & rates
          </Link>
        </div>
      </div>
    </PublicShell>
  );
}

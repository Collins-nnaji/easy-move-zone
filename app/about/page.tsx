import { PublicShell } from "@/components/platform/PublicShell";
import { buildPageMetadata } from "@/lib/site-metadata";
import Link from "next/link";
import s from "@/components/marketplace/Marketplace.module.css";

export const metadata = buildPageMetadata({
  title: "About EasyMoveZone",
  description:
    "Meet the approach behind EasyMoveZone: local moving partners and careful coordination.",
  path: "/about",
});
export default function Page() {
  return (
    <PublicShell>
      <div className={s.page}>
        <p className={s.eyebrow}>A BETTER WAY TO MOVE</p>
        <h1>
          Local people.
          <br />
          Careful coordination.
        </h1>
        <p className={s.intro}>
          EasyMoveZone connects households and businesses with moving crews and
          vehicle owners. We coordinate the inventory, quote, booking and job
          updates so you have one place to follow your move.
        </p>
        <div className={s.grid}>
          {[
            [
              "Our model",
              "We work with existing moving partners rather than requiring every vehicle to be owned by us. Each booking records the assigned crew and vehicle.",
            ],
            [
              "Our checks",
              "Partners submit ID, guarantor details and vehicle documents where applicable. Operations reviews submissions before a partner becomes available for assignment.",
            ],
            [
              "Our accountability",
              "Reviewed quotes, payment receipts, condition records and a claims log help both customers and partners resolve questions with evidence.",
            ],
          ].map(([title, body]) => (
            <article key={title} className={s.card}>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
        <section className={s.card}>
          <h2>Business & team details</h2>
          <p>{process.env.EMZ_LEGAL_NAME || "EasyMoveZone"}</p>
          <p>
            {process.env.EMZ_CAC_NUMBER
              ? `CAC registration: ${process.env.EMZ_CAC_NUMBER}`
              : "CAC registration details are available on request from our team."}
          </p>
          {process.env.EMZ_TEAM_DESCRIPTION && (
            <p>{process.env.EMZ_TEAM_DESCRIPTION}</p>
          )}
          {process.env.EMZ_BUSINESS_ADDRESS && (
            <p>{process.env.EMZ_BUSINESS_ADDRESS}</p>
          )}
          <Link href="/contact" className={s.link}>
            Contact the operations team
          </Link>
        </section>
        <Link href="/damage-policy" className={s.link}>
          Read our damage & cover policy
        </Link>
      </div>
    </PublicShell>
  );
}

import { PublicShell } from "@/components/platform/PublicShell";
import { buildPageMetadata } from "@/lib/site-metadata";
import Link from "next/link";
import s from "@/components/marketplace/Marketplace.module.css";
import { PricingCalculator } from "@/components/marketplace/PricingCalculator";
export const metadata = buildPageMetadata({
  title: "Moving prices & instant estimates",
  description:
    "Estimate home, office and bulky-item moves in Lagos, Abuja and Port Harcourt.",
  path: "/pricing",
});
export default function Page() {
  return (
    <PublicShell>
      <div className={s.page}>
        <p className={s.eyebrow}>KNOW THE RANGE BEFORE YOU BOOK</p>
        <h1>
          A clear starting price.
          <br />A reviewed final quote.
        </h1>
        <p className={s.intro}>
          Tell us about your move to estimate the cost before sharing contact
          details. Photos and route checks turn your range into a quote.
        </p>
        <PricingCalculator />
        <div className={s.grid}>
          {[
            [
              "Vehicle & crew",
              "A suitable vehicle, fuel and standard loading crew are included in the starting rate.",
            ],
            [
              "Distance & access",
              "Longer routes, stairs, truck size and area-specific access add to the estimate.",
            ],
            [
              "Optional help",
              "Packing, unpacking, assembly, cleaning and extra loaders are itemised through your chosen services.",
            ],
          ].map(([title, body]) => (
            <article className={s.card} key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
        <Link className={s.link} href="/faq">
          Common pricing questions
        </Link>
      </div>
    </PublicShell>
  );
}

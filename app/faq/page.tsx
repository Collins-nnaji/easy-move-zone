import { PublicShell } from "@/components/platform/PublicShell";
import { buildPageMetadata } from "@/lib/site-metadata";
import Link from "next/link";
import s from "@/components/marketplace/Marketplace.module.css";
import { FAQ } from "@/lib/marketplace/content";
export const metadata = buildPageMetadata({
  title: "Moving questions, answered",
  description:
    "Answers about pricing, payments, cancellation, crew verification and moving-day support.",
  path: "/faq",
});
export default function Page() {
  return (
    <PublicShell>
      <div className={s.page}>
        <p className={s.eyebrow}>A LITTLE CLARITY GOES A LONG WAY</p>
        <h1>Before moving day.</h1>
        <div className={s.faq}>
          {FAQ.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
        <div className={s.row}>
          <Link href="/contact" className="logistics-button">
            Ask our team
          </Link>
          <Link href="/book" className={s.link}>
            Plan a move
          </Link>
        </div>
      </div>
    </PublicShell>
  );
}

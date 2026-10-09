import { PublicShell } from "@/components/platform/PublicShell";
import { buildPageMetadata } from "@/lib/site-metadata";
import Link from "next/link";
import s from "@/components/marketplace/Marketplace.module.css";
import { TIPS } from "@/lib/marketplace/content";
export const metadata = buildPageMetadata({
  title: "Moving checklist & practical tips",
  description:
    "Plan Lagos home moves, Lekki deliveries and office relocations with practical checklists.",
  path: "/moving-tips",
});
export default function Page() {
  return (
    <PublicShell>
      <div className={s.page}>
        <p className={s.eyebrow}>A LITTLE PLANNING. A SMOOTHER MOVE.</p>
        <h1>
          Make room for
          <br />
          your next chapter.
        </h1>
        <div className={s.grid}>
          {TIPS.map((t) => (
            <article className={s.card} key={t.slug}>
              <h2>{t.title}</h2>
              <p>{t.intro}</p>
              <Link className={s.link} href={`/moving-tips/${t.slug}`}>
                Read checklist →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </PublicShell>
  );
}

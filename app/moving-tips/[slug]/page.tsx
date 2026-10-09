import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/platform/PublicShell";
import { TIPS } from "@/lib/marketplace/content";
import { buildPageMetadata } from "@/lib/site-metadata";
import s from "@/components/marketplace/Marketplace.module.css";
export function generateStaticParams() {
  return TIPS.map((t) => ({ slug: t.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = TIPS.find((p) => p.slug === slug);
  return post
    ? buildPageMetadata({
        title: post.title,
        description: post.intro,
        path: `/moving-tips/${slug}`,
      })
    : {};
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = TIPS.find((p) => p.slug === slug);
  if (!t) notFound();
  return (
    <PublicShell>
      <article className={s.page}>
        <Link href="/moving-tips" className={s.link}>
          ← All moving tips
        </Link>
        <h1>{t.title}</h1>
        <p className={s.intro}>{t.intro}</p>
        {t.steps.map((step, i) => (
          <section className={s.card} key={i}>
            <p className={s.eyebrow}>STEP {i + 1}</p>
            <p>{step}</p>
          </section>
        ))}
        <Link href="/book" className="logistics-button">
          Plan your move
        </Link>
      </article>
    </PublicShell>
  );
}

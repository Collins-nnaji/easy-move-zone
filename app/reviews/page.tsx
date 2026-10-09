import { PublicShell } from "@/components/platform/PublicShell";
import { buildPageMetadata } from "@/lib/site-metadata";
import s from "@/components/marketplace/Marketplace.module.css";
import { PublicReviews } from "@/components/marketplace/PublicReviews";
export const metadata = buildPageMetadata({
  title: "Customer moving reviews",
  description: "Read reviews from customers with completed EasyMoveZone moves.",
  path: "/reviews",
});
export default function Page() {
  return (
    <PublicShell>
      <div className={s.page}>
        <p className={s.eyebrow}>FROM PEOPLE WHO HAVE MOVED WITH US</p>
        <h1>
          Real moves.
          <br />
          Real experiences.
        </h1>
        <p className={s.intro}>
          Only completed bookings can submit a review. We check submissions for
          personal information and inappropriate content before publication.
        </p>
        <PublicReviews />
      </div>
    </PublicShell>
  );
}

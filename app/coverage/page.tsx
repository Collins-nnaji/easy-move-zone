import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { PublicShell } from "@/components/platform/PublicShell";
import { HeroFreightArt } from "@/components/platform/FreightArt";
import { AREAS } from "@/lib/moving/model";
import { buildPageMetadata } from "@/lib/site-metadata";
export const metadata = buildPageMetadata({
  title: "Moving in Lagos",
  description:
    "Plan a home move, office relocation or bulky delivery in Lagos. Our team confirms coverage and availability for your exact addresses.",
  path: "/coverage",
});
export default function CoveragePage() {
  return (
    <PublicShell>
      <div className="logistics-home">
        <section className="logistics-hero">
          <div className="logistics-container logistics-hero-grid">
            <div>
              <p className="logistics-eyebrow">
                NIGERIA IS HOME. LAGOS IS OUR START.
              </p>
              <h1>
                Local knowledge.
                <br />A smoother move.
              </h1>
              <p className="logistics-intro">
                We’re starting with Lagos moves and carefully coordinating each
                job. Share your pickup and destination addresses so our team can
                confirm availability.
              </p>
              <Link href="/book" className="logistics-button">
                Check my move <ArrowRight size={18} />
              </Link>
            </div>
            <div className="logistics-visual">
              <HeroFreightArt className="logistics-truck" />
            </div>
          </div>
        </section>
        <section className="logistics-container logistics-section">
          <p className="logistics-eyebrow">TELL US YOUR NEIGHBOURHOOD</p>
          <h2>
            Across town.
            <br />
            Across a new chapter.
          </h2>
          <div className="logistics-services">
            {AREAS.map((area) => (
              <Link
                className="logistics-service moving-area-card"
                key={area}
                href={`/book?area=${encodeURIComponent(area)}`}
              >
                <MapPin size={24} />
                <div>
                  <h3>{area}</h3>
                  <p>
                    Request availability for your exact addresses and moving
                    date.
                  </p>
                </div>
                <ArrowRight size={18} />
              </Link>
            ))}
          </div>
          <p className="logistics-route-intro">
            Listed areas are enquiry locations. Truck and crew availability are
            confirmed by our team. For moves outside Lagos, contact us before
            planning your booking.
          </p>
          <Link href="/contact" className="logistics-text-link">
            Ask about another location <ArrowRight size={16} />
          </Link>
        </section>
      </div>
    </PublicShell>
  );
}

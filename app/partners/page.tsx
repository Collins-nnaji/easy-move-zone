import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublicShell } from "@/components/platform/PublicShell";
import { buildPageMetadata } from "@/lib/site-metadata";
export const metadata = buildPageMetadata({
  title: "Moving and Delivery Partners",
  description:
    "Work with EasyMoveZone as a truck owner, moving crew, furniture seller, estate agent or office manager in Lagos.",
  path: "/partners",
});
export default function PartnersPage() {
  return (
    <PublicShell>
      <div className="logistics-home">
        <section className="logistics-process">
          <div className="logistics-container logistics-section">
            <p className="logistics-eyebrow">BUILD BETTER MOVES WITH US</p>
            <h1>
              Your business.
              <br />
              Our coordination.
            </h1>
            <p className="logistics-intro">
              We’re building a network of dependable truck owners, moving crews
              and businesses in Lagos. Help customers move with care, and bring
              repeat deliveries together.
            </p>
            <Link href="/hub" className="logistics-button">
              Join the crew hub <ArrowRight size={18} />
            </Link>
          </div>
        </section>
        <section className="logistics-container logistics-section">
          <div className="logistics-services">
            {[
              [
                "Truck owners and moving crews",
                "Tell us about your vehicles, service areas, crew experience and availability. We review partner details before coordinating a job.",
              ],
              [
                "Furniture and appliance shops",
                "Arrange bulky deliveries for your customers. Share item details and collection windows for a quote and coordinated delivery.",
              ],
              [
                "Estate agents and office managers",
                "Help tenants and teams organise their next move. One point of contact for inventory, scheduling and moving arrangements.",
              ],
            ].map(([title, body], i) => (
              <article
                className="logistics-service moving-partner-card"
                key={title}
              >
                <span className="logistics-service-number">0{i + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                  <Link
                    href={
                      i === 0
                        ? "/hub"
                        : `/contact?service=${encodeURIComponent(title)}`
                    }
                    className="logistics-text-link"
                  >
                    {i === 0 ? "Open the crew hub" : "Talk to our team"}{" "}
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </PublicShell>
  );
}

import Link from "next/link";
import { ArrowRight, House, Building2, Package } from "lucide-react";
import { PublicShell } from "@/components/platform/PublicShell";
import { buildPageMetadata } from "@/lib/site-metadata";
import { SERVICES } from "@/lib/moving/model";
export const metadata = buildPageMetadata({
  title: "Home, Office and Bulky-item Moving Services",
  description:
    "Arrange trucks, loading crews, packing, unpacking and furniture transport in Lagos with EasyMoveZone.",
  path: "/services",
});
const icons = [House, Building2, Package];
const checklists = [
  "Furniture, appliances, boxes and personal belongings. Share your room count and photos to help us plan the right truck and crew.",
  "Desks, chairs, computers and office equipment. Share your inventory, preferred hours and building access so we can coordinate the relocation.",
  "Sofas, fridges, beds, generators and bulky purchases. Tell us the item dimensions, seller pickup details and any stairs at either end.",
];
export default function ServicesPage() {
  return (
    <PublicShell>
      <div className="logistics-home">
        <section className="logistics-process">
          <div className="logistics-container logistics-section">
            <p className="logistics-eyebrow">A MOVE FOR EVERY NEXT STEP</p>
            <h1>
              Home. Office.
              <br />
              Something heavy.
            </h1>
            <p className="logistics-intro">
              One place for your truck, movers and packing help. Tell us what
              you need and get a quote before you commit.
            </p>
          </div>
        </section>
        <section className="logistics-container logistics-section">
          <div className="logistics-services">
            {SERVICES.map((s, i) => {
              const Icon = icons[i];
              return (
                <article
                  id={s.id}
                  key={s.id}
                  className="logistics-service"
                  style={{ scrollMarginTop: 100 }}
                >
                  <span className="logistics-service-number">0{i + 1}</span>
                  <Icon size={32} strokeWidth={1.4} />
                  <div>
                    <h3>{s.name}</h3>
                    <p>{s.description}</p>
                    <p>{checklists[i]}</p>
                    <Link
                      href={`/book?service=${s.id}`}
                      className="logistics-text-link"
                    >
                      Request a quote <ArrowRight size={16} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
        <section className="logistics-process">
          <div className="logistics-container logistics-section">
            <p className="logistics-eyebrow">THE DETAILS MAKE THE DIFFERENCE</p>
            <h2>
              A clear plan.
              <br />
              Before moving day.
            </h2>
            <ol className="logistics-steps">
              {[
                [
                  "Help that fits your move",
                  "Choose loading help, packing, unpacking, assembly or cleaning. We confirm which extras are available and price them separately.",
                ],
                [
                  "Pricing with the full picture",
                  "Your quote accounts for inventory, distance, truck size, stairs, lifts, parking and estate access. Changes to the plan are agreed with you.",
                ],
                [
                  "Care from pickup to arrival",
                  "Keep an item checklist and condition photos. Check your items on arrival and contact support with your reference if something is missing or damaged.",
                ],
              ].map(([title, body], i) => (
                <li key={title}>
                  <span>0{i + 1}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section className="logistics-container logistics-closing">
          <div>
            <h2>
              Your next move
              <br />
              starts here.
            </h2>
          </div>
          <Link href="/book" className="logistics-button">
            Book a move <ArrowRight size={18} />
          </Link>
        </section>
      </div>
    </PublicShell>
  );
}

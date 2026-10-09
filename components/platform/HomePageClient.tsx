"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  MapPin,
  Package,
  Truck,
  Building2,
} from "lucide-react";
import { HeroFreightArt } from "@/components/platform/FreightArt";
import { AREAS } from "@/lib/moving/model";

const SERVICES = [
  {
    name: "Move my home",
    detail:
      "A room or a whole household. Book a truck, a loading crew and optional packing and unpacking.",
    href: "/book?service=home",
    icon: Truck,
  },
  {
    name: "Move my office",
    detail:
      "Desks, equipment and a coordinated move. Plan around your working hours and get back to business.",
    href: "/book?service=office",
    icon: Building2,
  },
  {
    name: "Move an item",
    detail:
      "Sofas, fridges, beds and generators. Arrange transport for bulky purchases, from the seller to your door.",
    href: "/book?service=item",
    icon: Package,
  },
];

export function HomePageClient() {
  const [selectedRoute, setSelectedRoute] = useState(AREAS[0]);
  const bookingHref = `/book?area=${encodeURIComponent(selectedRoute)}`;
  return (
    <div className="logistics-home">
      <section className="logistics-hero">
        <div className="logistics-container logistics-hero-grid">
          <div>
            <p className="logistics-eyebrow">
              <span /> Your move, made easy.
            </p>
            <h1 style={{ whiteSpace: "pre-line" }}>
              {"Move your home, office\nor heavy items.\nWithout the stress."}
            </h1>
            <p className="logistics-intro">
              {
                "Book trusted movers, a truck and packing help in one place. Clear pricing and reliable coordination, starting in Lagos."
              }
            </p>
            <div className="logistics-actions">
              <Link href="/book" className="logistics-button">
                Book a move <ArrowRight size={18} />
              </Link>
              <Link href="/hub" className="logistics-text-link">
                Move or drive with us <ArrowUpRight size={18} />
              </Link>
            </div>
            <div className="logistics-promise">
              <Check size={16} /> One team. A clear quote. Every step
              coordinated.
            </div>
          </div>
          <div className="logistics-visual">
            <div className="logistics-visual-top">
              <span>THE WHOLE JOURNEY, HANDLED</span>
              <Truck size={20} />
            </div>
            <HeroFreightArt className="logistics-truck" />
            <div className="logistics-journey">
              <div>
                <span className="logistics-dot" />
                Your doorstep
              </div>
              <span className="logistics-journey-line" />
              <div>
                <MapPin size={15} />
                Your destination
              </div>
            </div>
            <p>
              Packing. Moving. Settling in.
              <br />
              <strong>We connect every step.</strong>
            </p>
          </div>
        </div>
      </section>

      <div className="logistics-strip">
        <div className="logistics-container">
          <span>For life’s next chapter.</span>
          <Link href="/services#home">
            Home moves <ArrowUpRight size={14} />
          </Link>
          <Link href="/services#office">
            Office moves <ArrowUpRight size={14} />
          </Link>
          <Link href="/services#item">
            Heavy items <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      <section className="logistics-container logistics-section" id="services">
        <div className="logistics-section-heading">
          <p className="logistics-eyebrow">WHAT WE HANDLE</p>
          <h2>
            Less organising.
            <br />
            More getting things done.
          </h2>
          <p>
            You don’t need to find a driver or coordinate each stage yourself.
            Give us the details. Our team brings the journey together.
          </p>
        </div>
        <div className="logistics-services">
          {SERVICES.map((service, index) => (
            <Link
              key={service.href}
              href={service.href}
              className="logistics-service"
            >
              <span className="logistics-service-number">0{index + 1}</span>
              <service.icon size={32} strokeWidth={1.4} />
              <div>
                <h3>{service.name}</h3>
                <p>{service.detail}</p>
              </div>
              <ArrowUpRight className="logistics-service-arrow" size={24} />
            </Link>
          ))}
        </div>
      </section>

      <section className="logistics-process">
        <div className="logistics-container logistics-section">
          <div className="logistics-section-heading">
            <p className="logistics-eyebrow">A SIMPLE WAY TO MOVE</p>
            <h2>
              You make the request.
              <br />
              We handle the road ahead.
            </h2>
            <Link href="/book" className="logistics-text-link">
              Book a move <ArrowRight size={18} />
            </Link>
          </div>
          <ol className="logistics-steps">
            {[
              [
                "Tell us what you need",
                "Tell us what’s moving, share photos and add both addresses. Include stairs, parking and your preferred date.",
              ],
              [
                "We arrange the journey",
                "Get an estimated range, receive a reviewed quote, then pay a deposit. We coordinate your crew and vehicle for the agreed date.",
              ],
              [
                "Stay updated until delivery",
                "Keep your move reference for crew and arrival updates. Use your item checklist at collection and delivery.",
              ],
            ].map(([title, body], index) => (
              <li key={title}>
                <span>0{index + 1}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="logistics-routes">
        <div className="logistics-container logistics-section logistics-route-layout">
          <div>
            <p className="logistics-eyebrow">LAGOS · ABUJA · PORT HARCOURT</p>
            <h2>
              From your old place.
              <br />
              To your next beginning.
            </h2>
            <p className="logistics-route-intro">
              Request a move in Lagos, Abuja or Port Harcourt. Tell us your
              neighbourhood and we’ll confirm partner availability for your
              exact route.
            </p>
            <Link href="/coverage" className="logistics-text-link">
              Explore our coverage <ArrowRight size={18} />
            </Link>
          </div>
          <div className="logistics-route-picker">
            <label htmlFor="home-route">Where are you moving?</label>
            <select
              id="home-route"
              value={selectedRoute}
              onChange={(event) => setSelectedRoute(event.target.value)}
            >
              {AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
            <div className="logistics-route-stops">
              <MapPin size={22} />
              <div>
                <span>COLLECTION</span>
                <strong>{selectedRoute}</strong>
              </div>
              <ArrowRight size={22} />
              <div>
                <span>DELIVERY</span>
                <strong>Your new address</strong>
              </div>
            </div>
            <p>Home moves · Office moves · Bulky items</p>
            <Link href={bookingHref} className="logistics-button">
              Plan my move <ArrowRight size={18} />
            </Link>
            <small>Get a range now. Confirm your quote before payment.</small>
          </div>
        </div>
      </section>

      <section className="logistics-container logistics-section">
        <div className="logistics-section-heading">
          <p className="logistics-eyebrow">CONFIDENCE AT EVERY STEP</p>
          <h2>
            Know the price.
            <br />
            Keep the record.
          </h2>
        </div>
        <div className="logistics-services">
          {[
            [
              "Estimate before booking",
              "See a range before sharing your details. Receive a reviewed quote before paying a deposit.",
              "/pricing",
              "Explore pricing",
            ],
            [
              "Care you can document",
              "Record item condition at pickup and delivery, sign the checklist and report concerns in your account.",
              "/damage-policy",
              "Damage & cover policy",
            ],
            [
              "Hear from customers",
              "Read published reviews from completed moves, and leave your own after delivery.",
              "/reviews",
              "Customer reviews",
            ],
          ].map(([title, body, href, label]) => (
            <article className="logistics-service" key={href}>
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
                <Link href={href} className="logistics-text-link">
                  {label} <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
        <div className="flex flex-wrap gap-6 mt-8">
          <Link href="/about" className="logistics-text-link">
            Meet EasyMoveZone <ArrowRight size={16} />
          </Link>
          <Link href="/faq" className="logistics-text-link">
            Moving FAQs <ArrowRight size={16} />
          </Link>
          <Link href="/business" className="logistics-text-link">
            Business accounts <ArrowRight size={16} />
          </Link>
        </div>
      </section>
      <section className="logistics-container logistics-closing">
        <div>
          <p className="logistics-eyebrow">LET’S GET IT MOVING</p>
          <h2>
            A new place ahead?
            <br />A team ready to help.
          </h2>
        </div>
        <div>
          <p>
            Moving home, changing offices or delivering furniture? Tell us what
            you need and we’ll help you plan the next step.
          </p>
          <Link href="/contact" className="logistics-button">
            Talk to EasyMoveZone <ArrowUpRight size={18} />
          </Link>
          <Link href="/track" className="logistics-text-link">
            Already have a reference? Track your move <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}

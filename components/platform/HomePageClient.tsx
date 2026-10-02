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
  Ship,
} from "lucide-react";
import { HeroFreightArt } from "@/components/platform/FreightArt";
import { useProduceCatalog } from "@/components/produce/CatalogProvider";
import Image from "next/image";

const SERVICES = [
  {
    name: "Move your produce",
    detail:
      "From your farm or warehouse to the next market. We arrange the truck, collection and delivery.",
    href: "/book",
    icon: Truck,
  },
  {
    name: "Buy produce in bulk",
    detail:
      "Explore available produce by weight, quality and location. Ask our team to help arrange your purchase and transport.",
    href: "/lots",
    icon: Package,
  },
  {
    name: "Get your goods to port",
    detail:
      "We coordinate transport to Apapa, Tin Can or Onne and help you prepare for the next stage of your export.",
    href: "/export",
    icon: Ship,
  },
];

export function HomePageClient() {
  const {
    corridors: CORRIDORS,
    commodityById,
    placeLabel,
    settings,
  } = useProduceCatalog();
  const [selectedRoute, setSelectedRoute] = useState(CORRIDORS[0]?.id ?? "");
  const route =
    CORRIDORS.find((item) => item.id === selectedRoute) ?? CORRIDORS[0];
  const bookingHref = route
    ? `/book?from=${route.from}&to=${route.to}&crop=${route.crops[0]}`
    : "/book";

  return (
    <div className="logistics-home">
      <section className="logistics-hero">
        <div className="logistics-container logistics-hero-grid">
          <div>
            <p className="logistics-eyebrow">
              <span /> Nigerian produce. Moving forward.
            </p>
            <h1 style={{ whiteSpace: "pre-line" }}>{settings.homeTitle}</h1>
            <p className="logistics-intro">{settings.homeDescription}</p>
            <div className="logistics-actions">
              <Link href="/book" className="logistics-button">
                Arrange a delivery <ArrowRight size={18} />
              </Link>
              <Link href="/contact" className="logistics-text-link">
                Talk to our team <ArrowUpRight size={18} />
              </Link>
            </div>
            <div className="logistics-promise">
              <Check size={16} /> One team from collection to delivery
            </div>
          </div>
          <div className="logistics-visual">
            <div className="logistics-visual-top">
              <span>THE WHOLE JOURNEY, HANDLED</span>
              <Truck size={20} />
            </div>
            {settings.homeImage ? (
              <Image
                src={settings.homeImage}
                alt="Produce collection and delivery"
                width={560}
                height={340}
                unoptimized
                className="logistics-truck"
              />
            ) : (
              <HeroFreightArt className="logistics-truck" />
            )}
            <div className="logistics-journey">
              <div>
                <span className="logistics-dot" />
                Your farm
              </div>
              <span className="logistics-journey-line" />
              <div>
                <MapPin size={15} />
                Your destination
              </div>
            </div>
            <p>
              Collection. Transport. Delivery.
              <br />
              <strong>We connect every step.</strong>
            </p>
          </div>
        </div>
      </section>

      <div className="logistics-strip">
        <div className="logistics-container">
          <span>Built for the people who feed Nigeria</span>
          <Link href="/farmers">
            Farmers <ArrowUpRight size={14} />
          </Link>
          <Link href="/traders">
            Traders <ArrowUpRight size={14} />
          </Link>
          <Link href="/exporters">
            Exporters <ArrowUpRight size={14} />
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
              Start your delivery request <ArrowRight size={18} />
            </Link>
          </div>
          <ol className="logistics-steps">
            {[
              [
                "Tell us what you need",
                "Share your produce, weight, collection address and destination. Tell us when it will be ready.",
              ],
              [
                "We arrange the journey",
                "Our team confirms the price and collection details, then coordinates the right transport for your produce.",
              ],
              [
                "Stay updated until delivery",
                "Follow your shipment with its tracking reference. Come to one team for questions along the way.",
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
            <p className="logistics-eyebrow">ACROSS NIGERIA</p>
            <h2>
              From where it grows.
              <br />
              To where it’s needed.
            </h2>
            <p className="logistics-route-intro">
              Explore our listed delivery routes. Choose a journey to start a
              request with your collection and destination already filled in.
            </p>
            <Link href="/routes" className="logistics-text-link">
              Explore all routes <ArrowRight size={18} />
            </Link>
          </div>
          <div className="logistics-route-picker">
            <label htmlFor="home-route">Where do you need to deliver?</label>
            <select
              id="home-route"
              value={selectedRoute}
              onChange={(event) => setSelectedRoute(event.target.value)}
            >
              {CORRIDORS.map((item) => (
                <option value={item.id} key={item.id}>
                  {placeLabel(item.from)} → {placeLabel(item.to)}
                </option>
              ))}
            </select>
            <div className="logistics-route-stops">
              <MapPin size={22} />
              <div>
                <span>COLLECTION</span>
                <strong>{placeLabel(route?.from ?? "")}</strong>
              </div>
              <ArrowRight size={22} />
              <div>
                <span>DELIVERY</span>
                <strong>{placeLabel(route?.to ?? "")}</strong>
              </div>
            </div>
            <p>
              {(route?.crops ?? [])
                .map((crop) => commodityById(crop)?.name)
                .filter(Boolean)
                .join(" · ")}
            </p>
            <Link href={bookingHref} className="logistics-button">
              Request this delivery <ArrowRight size={18} />
            </Link>
            <small>Price and availability are confirmed by our team.</small>
          </div>
        </div>
      </section>

      <section className="logistics-container logistics-closing">
        <div>
          <p className="logistics-eyebrow">LET’S GET IT MOVING</p>
          <h2>
            A harvest to move?
            <br />A team ready to help.
          </h2>
        </div>
        <div>
          <p>
            One delivery or regular shipments. Tell us what you need and we’ll
            help you plan the next step.
          </p>
          <Link href="/contact" className="logistics-button">
            Talk to EasyMoveZone <ArrowUpRight size={18} />
          </Link>
          <Link href="/track" className="logistics-text-link">
            Already have a reference? Track your shipment{" "}
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}

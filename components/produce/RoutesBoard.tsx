"use client";

import Link from "next/link";
import Image from "next/image";
import { useProduceCatalog } from "./CatalogProvider";
import { useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  MapPin,
  Search,
  Ship,
  Truck,
  X,
} from "lucide-react";
import { HeroFreightArt } from "@/components/platform/FreightArt";
import { estimateFare, formatNaira } from "@/lib/produce/catalog";
import shared from "./CommercePages.module.css";
import styles from "./JourneyPages.module.css";

export function RoutesBoard() {
  const {
    corridors: CORRIDORS,
    settings,
    commodityById,
    placeById,
    placeLabel,
  } = useProduceCatalog();
  const ZONES = [
    ...new Set(
      CORRIDORS.map((route) => placeById(route.from)?.zone).filter(Boolean),
    ),
  ];
  const PORTS = new Set(
    CORRIDORS.filter((route) => placeById(route.to)?.kind === "port").map(
      (route) => route.to,
    ),
  ).size;
  const [search, setSearch] = useState("");
  const [zone, setZone] = useState("all");
  const [destination, setDestination] = useState("all");
  const [selectedId, setSelectedId] = useState(CORRIDORS[0]?.id ?? "");
  const [crop, setCrop] = useState(CORRIDORS[0]?.crops[0] ?? "");
  const [weight, setWeight] = useState("30");
  const plannerRef = useRef<HTMLDivElement>(null);
  const route =
    CORRIDORS.find((item) => item.id === selectedId) ?? CORRIDORS[0];
  const tonnes = Number(weight);
  const validWeight = Number.isFinite(tonnes) && tonnes >= 0.1 && tonnes <= 500;
  const estimate = validWeight ? estimateFare(route?.km ?? 0, tonnes) : null;
  const bookingParams = new URLSearchParams({
    from: route?.from ?? "",
    to: route?.to ?? "",
    crop,
    tonnes: weight,
  });
  const routes = useMemo(
    () =>
      CORRIDORS.filter((item) => {
        const origin = placeById(item.from);
        const term = search.trim().toLowerCase();
        return (
          (zone === "all" || origin?.zone === zone) &&
          (destination === "all" || placeById(item.to)?.kind === destination) &&
          (!term ||
            [
              placeLabel(item.from),
              placeLabel(item.to),
              ...item.crops.map((id) => commodityById(id)?.name),
            ].some((value) => value?.toLowerCase().includes(term)))
        );
      }),
    [
      search,
      zone,
      destination,
      CORRIDORS,
      placeById,
      placeLabel,
      commodityById,
    ],
  );
  const hasFilters = Boolean(search) || zone !== "all" || destination !== "all";

  function selectRoute(id: string, reveal = false) {
    const next = CORRIDORS.find((item) => item.id === id);
    if (!next) return;
    setSelectedId(id);
    setCrop(next.crops[0]);
    if (reveal && window.matchMedia("(max-width: 900px)").matches)
      plannerRef.current?.scrollIntoView({
        behavior: "instant",
        block: "start",
      });
  }
  function resetFilters() {
    setSearch("");
    setZone("all");
    setDestination("all");
  }

  if (!route)
    return (
      <div className={shared.page}>
        <section className={`${shared.container} ${shared.section}`}>
          <h1>Plan your delivery with us.</h1>
          <p className={shared.intro}>
            Contact our team to discuss your collection point and destination.
          </p>
          <Link href="/contact" className="logistics-button">
            Talk to our team
          </Link>
        </section>
      </div>
    );
  return (
    <div className={`${shared.page} ${styles.page}`}>
      <section className={styles.routesHero}>
        <div className={`${shared.container} ${shared.heroGrid}`}>
          <div className={shared.heroCopy}>
            <p className={shared.eyebrow}>FROM FARM TOWNS TO BUSY MARKETS</p>
            <h1 style={{ whiteSpace: "pre-line" }}>{settings.routesTitle}</h1>
            <p className={shared.intro}>{settings.routesDescription}</p>
            <div className={shared.actions}>
              <a href="#delivery-routes" className="logistics-button">
                Find a delivery route <ArrowRight size={18} />
              </a>
              <Link
                href="/contact?service=Custom+delivery+route"
                className="logistics-text-link"
              >
                Ask about another route <ArrowUpRight size={17} />
              </Link>
            </div>
            <p className={shared.heroNote}>
              <Check size={15} /> Collection, transport and delivery, handled by
              one team.
            </p>
          </div>
          <div className={styles.routeVisual}>
            <div className={styles.visualHeading}>
              <span>THE JOURNEY, CONNECTED</span>
              <Truck size={19} strokeWidth={1.5} />
            </div>
            {route.imageUrl || settings.routesImage ? (
              <Image
                src={route.imageUrl || settings.routesImage}
                alt="Produce transport across Nigeria"
                width={560}
                height={340}
                unoptimized
                className={styles.freightArt}
              />
            ) : (
              <HeroFreightArt className={styles.freightArt} />
            )}
            <div className={styles.visualStops}>
              <div>
                <span>COLLECTION</span>
                <strong>{placeById(route.from)?.name}</strong>
                <small>{placeById(route.from)?.state}</small>
              </div>
              <ArrowRight size={20} />
              <div>
                <span>DESTINATION</span>
                <strong>{placeById(route.to)?.name}</strong>
                <small>{placeById(route.to)?.state}</small>
              </div>
            </div>
            <p className={styles.visualNote}>
              {route.km.toLocaleString()} km listed road distance · Route
              illustration
            </p>
          </div>
        </div>
      </section>
      <div className={styles.networkStrip}>
        <div className={shared.container}>
          <span>
            <strong>{CORRIDORS.length}</strong> listed routes
          </span>
          <span>
            <strong>{ZONES.length}</strong> collection regions
          </span>
          <span>
            <strong>{PORTS}</strong> port destinations
          </span>
          <span>
            Markets and ports.
            <br />
            One connected service.
          </span>
        </div>
      </div>

      <section
        className={`${shared.container} ${shared.section} ${styles.directory}`}
        id="delivery-routes"
        aria-labelledby="routes-heading"
      >
        <div className={shared.sectionHeading}>
          <div>
            <p className={shared.eyebrow}>FIND YOUR JOURNEY</p>
            <h2 id="routes-heading">
              Where are you moving
              <br />
              your produce?
            </h2>
          </div>
          <p>
            Search by town, state or crop. Choose a route to explore the
            transport estimate and start your delivery request.
          </p>
        </div>
        <div className={shared.filterBar}>
          <label className={shared.search}>
            <Search size={18} />
            <span className={shared.srOnly}>Search town, state or produce</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search town, state or produce"
            />
          </label>
          <label className={shared.filterSelect}>
            <span className={shared.srOnly}>Collection region</span>
            <select
              value={zone}
              onChange={(event) => setZone(event.target.value)}
            >
              <option value="all">All regions</option>
              {ZONES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className={shared.filterSelect}>
            <span className={shared.srOnly}>Destination type</span>
            <select
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
            >
              <option value="all">Markets & ports</option>
              <option value="market">Markets</option>
              <option value="port">Ports</option>
            </select>
          </label>
        </div>
        <div className={styles.directoryLayout}>
          <div>
            <div className={styles.directoryMeta}>
              <p role="status">
                {routes.length} {routes.length === 1 ? "route" : "routes"} found
              </p>
              {hasFilters && (
                <button type="button" onClick={resetFilters}>
                  Clear filters <X size={13} />
                </button>
              )}
            </div>
            <div className={styles.routeListHeader} aria-hidden="true">
              <span>COLLECTION</span>
              <span>DESTINATION</span>
              <span>DISTANCE</span>
              <span />
            </div>
            <div className={styles.routeList}>
              {routes.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  aria-pressed={item.id === selectedId}
                  onClick={() => selectRoute(item.id, true)}
                  className={`${styles.routeRow} ${item.id === selectedId ? styles.selectedRoute : ""}`}
                  aria-label={`Plan delivery from ${placeLabel(item.from)} to ${placeLabel(item.to)}, ${item.km} kilometres`}
                >
                  <span className={styles.routeLocation}>
                    <span className={styles.mobileLabel}>Collection</span>
                    <strong>{placeById(item.from)?.name}</strong>
                    <small>{placeById(item.from)?.state}</small>
                  </span>
                  <span className={styles.routeLocation}>
                    <span className={styles.mobileLabel}>Destination</span>
                    <strong>{placeById(item.to)?.name}</strong>
                    <small>{placeById(item.to)?.state}</small>
                  </span>
                  <span className={styles.routeDistance}>
                    {item.km.toLocaleString()}
                    <small>km</small>
                  </span>
                  <ArrowUpRight size={18} />
                  <span className={styles.routeCrops}>
                    {item.crops
                      .map((id) => commodityById(id)?.name)
                      .join(" · ")}
                  </span>
                </button>
              ))}
            </div>
            {!routes.length && (
              <div className={shared.emptyState}>
                <Search size={27} />
                <h3>No routes match your search.</h3>
                <p>
                  Try a different place or crop. Our team can also help plan a
                  journey outside these listed routes.
                </p>
                <div className={shared.actions}>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="logistics-button"
                  >
                    Reset filters
                  </button>
                  <Link
                    href="/contact?service=Custom+delivery+route"
                    className="logistics-text-link"
                  >
                    Ask our team <ArrowUpRight size={16} />
                  </Link>
                </div>
              </div>
            )}
          </div>
          <div
            className={styles.routePlanner}
            ref={plannerRef}
            id="route-planner"
          >
            <p className={shared.overline}>PLAN THIS JOURNEY</p>
            <h3>Your delivery, arranged.</h3>
            <label htmlFor="selected-route">Delivery route</label>
            <select
              id="selected-route"
              value={selectedId}
              onChange={(event) => selectRoute(event.target.value)}
            >
              {CORRIDORS.map((item) => (
                <option value={item.id} key={item.id}>
                  {placeById(item.from)?.name} → {placeById(item.to)?.name}
                </option>
              ))}
            </select>
            <div className={styles.plannerStops} aria-live="polite">
              <div>
                <MapPin size={16} />
                <span>
                  <small>COLLECTION</small>
                  <strong>{placeLabel(route.from)}</strong>
                </span>
              </div>
              <div>
                {placeById(route.to)?.kind === "port" ? (
                  <Ship size={16} />
                ) : (
                  <MapPin size={16} />
                )}
                <span>
                  <small>DELIVERY</small>
                  <strong>{placeLabel(route.to)}</strong>
                </span>
              </div>
            </div>
            <div className={styles.routeFormGrid}>
              <label htmlFor="route-crop">
                Produce
                <select
                  id="route-crop"
                  value={crop}
                  onChange={(event) => setCrop(event.target.value)}
                >
                  {route.crops.map((id) => (
                    <option value={id} key={id}>
                      {commodityById(id)?.name}
                    </option>
                  ))}
                </select>
              </label>
              <label htmlFor="route-weight">
                Weight (tonnes)
                <input
                  id="route-weight"
                  type="number"
                  min="0.1"
                  max="500"
                  step="0.1"
                  value={weight}
                  onChange={(event) => setWeight(event.target.value)}
                  aria-invalid={!validWeight}
                  aria-describedby="route-estimate"
                />
              </label>
            </div>
            <div
              className={styles.routeEstimate}
              id="route-estimate"
              aria-live="polite"
            >
              <p>Sample transport estimate</p>
              <strong>
                {estimate
                  ? formatNaira(estimate.total)
                  : "Enter a valid weight"}
              </strong>
              <span>
                {estimate
                  ? `${route.km.toLocaleString()} km · ${estimate.trucks} ${estimate.trucks === 1 ? "truck" : "trucks"} at up to 30 tonnes each`
                  : "Choose a weight between 0.1 and 500 tonnes."}
              </span>
            </div>
            {validWeight ? (
              <Link
                href={`/book?${bookingParams.toString()}`}
                className="logistics-button"
              >
                Arrange this delivery <ArrowRight size={17} />
              </Link>
            ) : (
              <button disabled type="button" className="logistics-button">
                Enter a valid weight
              </button>
            )}
            <p className={styles.plannerNote}>
              The estimate is for transport only. Our team confirms the final
              price and collection arrangements.
            </p>
          </div>
        </div>
      </section>
      <section className={shared.softSection}>
        <div className={`${shared.container} ${shared.section}`}>
          <div className={shared.sectionHeading}>
            <div>
              <p className={shared.eyebrow}>WE BRING THE JOURNEY TOGETHER</p>
              <h2>
                A route is only the start.
                <br />
                We handle the rest.
              </h2>
            </div>
            <p>
              From the collection details to delivery at the other end, our team
              is your point of contact throughout.
            </p>
          </div>
          <ol className={shared.steps}>
            {[
              [
                "Choose your journey",
                "Tell us where the produce is, where it needs to go and when it will be ready.",
              ],
              [
                "We confirm the plan",
                "We agree the price and collection arrangements with you, then coordinate the transport.",
              ],
              [
                "We see it through",
                "Use your shipment reference to follow the journey and contact our team when you need help.",
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
      <section className={`${shared.container} ${shared.closing}`}>
        <div>
          <p className={shared.eyebrow}>GOING SOMEWHERE ELSE?</p>
          <h2>
            Your route doesn’t
            <br />
            have to be listed.
          </h2>
        </div>
        <div>
          <p>
            Share your collection point, destination and produce. Our team will
            help you explore transport options for the journey you need.
          </p>
          <Link
            href="/contact?service=Custom+delivery+route"
            className="logistics-button"
          >
            Plan a route with our team <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { useProduceCatalog } from "./CatalogProvider";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  MapPin,
  PackageCheck,
  Ship,
  Truck,
} from "lucide-react";
import {} from "@/lib/produce/catalog";
import { ExportJourneyArt } from "./ProduceArt";
import styles from "./CommercePages.module.css";

export function ExportBoard() {
  const {
    exportLanes: EXPORT_LANES,
    exportDocuments: EXPORT_DOCUMENTS,
    commodityById,
    placeLabel,
    settings,
  } = useProduceCatalog();
  const [laneId, setLaneId] = useState(EXPORT_LANES[0]?.id ?? "");
  const lane =
    EXPORT_LANES.find((item) => item.id === laneId) ?? EXPORT_LANES[0];
  const countries = lane?.countries.split(", ") ?? [];
  const [country, setCountry] = useState(countries?.[0] ?? "");
  const [crop, setCrop] = useState(lane?.crops[0] ?? "");
  const [quantity, setQuantity] = useState("30");
  const [origin, setOrigin] = useState("");

  function selectLane(id: string) {
    const next = EXPORT_LANES.find((item) => item.id === id);
    if (!next) return;
    setLaneId(id);
    setCrop(next.crops[0]);
    setCountry(next.countries.split(", ")[0]);
  }

  const message = `I would like to plan an export of ${quantity} tonnes of ${commodityById(crop)?.name ?? crop} from ${origin.trim()} to ${country}, through ${placeLabel(lane?.portId ?? "")}. Please help confirm collection, transport to port, documentation and onward shipping options.`;

  if (!lane)
    return (
      <div className={styles.page}>
        <section className={`${styles.container} ${styles.section}`}>
          <h1>Plan your export with us.</h1>
          <p className={styles.intro}>
            Tell our team your produce and destination to explore your options.
          </p>
          <Link href="/contact?service=Export" className="logistics-button">
            Talk to our team
          </Link>
        </section>
      </div>
    );
  return (
    <div className={styles.page}>
      <section className={styles.exportHero}>
        <div className={`${styles.container} ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              NIGERIAN PRODUCE. GLOBAL POSSIBILITIES.
            </p>
            <h1 style={{ whiteSpace: "pre-line" }}>{settings.exportTitle}</h1>
            <p className={styles.intro}>{settings.exportDescription}</p>
            <div className={styles.actions}>
              <a href="#export-plan" className="logistics-button">
                Plan your export <ArrowRight size={18} />
              </a>
              <Link
                href="/contact?service=Export+support"
                className="logistics-text-link"
              >
                Speak to our team <ArrowUpRight size={17} />
              </Link>
            </div>
            <p className={styles.heroNote}>
              <Check size={15} /> Collection, transport and export preparation.
            </p>
          </div>
          <div className={styles.exportVisual}>
            <div className={styles.exportVisualCaption}>
              <span>FROM ORIGIN TO OPPORTUNITY</span>
              <Ship size={20} />
            </div>
            {lane.imageUrl || settings.exportImage ? (
              <Image
                src={lane.imageUrl || settings.exportImage}
                alt="Produce export journey"
                width={560}
                height={350}
                unoptimized
                className={styles.exportPhoto}
              />
            ) : (
              <ExportJourneyArt />
            )}
            <div className={styles.portStrip}>
              <span>Apapa</span>
              <span>Tin Can Island</span>
              <span>Onne</span>
            </div>
          </div>
        </div>
      </section>
      <div className={styles.assuranceStrip}>
        <div className={styles.container}>
          {[
            { icon: Truck, label: "Transport to port" },
            { icon: PackageCheck, label: "Help with export preparation" },
            { icon: Ship, label: "Onward shipping coordination" },
          ].map(({ icon: Icon, label }) => (
            <span key={label}>
              <Icon size={17} strokeWidth={1.5} />
              {label}
            </span>
          ))}
        </div>
      </div>

      <section
        className={`${styles.container} ${styles.section}`}
        aria-labelledby="export-support-heading"
      >
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>ONE TEAM. A CONNECTED JOURNEY.</p>
            <h2 id="export-support-heading">
              You focus on the buyer.
              <br />
              We bring the move together.
            </h2>
          </div>
          <p>
            Share your produce, collection point and destination. We work
            through the transport and preparation with you, so each stage has a
            clear next step.
          </p>
        </div>
        <ol className={styles.steps}>
          {[
            [
              "Collection arranged",
              "We confirm your produce, weight and collection date, then arrange transport suited to the shipment.",
            ],
            [
              "Prepared for port",
              "We help you prepare shipment details and coordinate delivery to the agreed Nigerian port.",
            ],
            [
              "Ready for the next stage",
              "Our team helps clarify paperwork and onward shipping arrangements for your chosen destination.",
            ],
          ].map(([title, body], index) => (
            <li key={title}>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.softSection} id="export-plan">
        <div className={`${styles.container} ${styles.section}`}>
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>EXPLORE YOUR NEXT DESTINATION</p>
              <h2>
                Start with a market.
                <br />
                Build a plan with us.
              </h2>
            </div>
            <p>
              These example routes are a starting point for your enquiry. Our
              team confirms availability, timings and the services needed for
              your shipment.
            </p>
          </div>
          <div className={styles.exportPlanning}>
            <div className={styles.destinations}>
              <p className={styles.overline}>CHOOSE AN EXAMPLE ROUTE</p>
              <div className={styles.destinationList}>
                {EXPORT_LANES.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    aria-pressed={laneId === item.id}
                    onClick={() => selectLane(item.id)}
                    className={`${styles.destination} ${laneId === item.id ? styles.selectedDestination : ""}`}
                  >
                    <span className={styles.destinationIcon}>
                      <Ship size={22} strokeWidth={1.4} />
                    </span>
                    <span>
                      <strong>{item.region}</strong>
                      <span>Via {placeLabel(item.portId)}</span>
                    </span>
                    <ArrowUpRight size={20} />
                  </button>
                ))}
              </div>
              <div className={styles.routeDetail} aria-live="polite">
                <p className={styles.overline}>THE SELECTED ROUTE</p>
                <h3>
                  {placeLabel(lane.portId)} <ArrowRight size={20} />{" "}
                  {lane.region}
                </h3>
                <p>{lane.countries}</p>
                <div className={styles.cropTags}>
                  {lane.crops.map((id) => (
                    <span key={id}>{commodityById(id)?.name}</span>
                  ))}
                </div>
                <p className={styles.routeNote}>
                  Have another destination in mind?{" "}
                  <Link href="/contact?service=Custom+export+destination">
                    Talk to our team <ArrowUpRight size={13} />
                  </Link>
                </p>
              </div>
            </div>
            <form action="/contact" method="get" className={styles.planner}>
              <div className={styles.plannerHeading}>
                <span className={styles.plannerNumber}>01</span>
                <div>
                  <p className={styles.overline}>
                    LET’S START WITH THE DETAILS
                  </p>
                  <h3>Your export enquiry</h3>
                </div>
              </div>
              <input type="hidden" name="service" value="Export planning" />
              <input type="hidden" name="message" value={message} />
              <div className={styles.formGrid}>
                <label>
                  Produce
                  <select
                    value={crop}
                    onChange={(event) => setCrop(event.target.value)}
                  >
                    {lane.crops.map((id) => (
                      <option key={id} value={id}>
                        {commodityById(id)?.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Weight (tonnes)
                  <input
                    required
                    type="number"
                    min="0.1"
                    max="500"
                    step="any"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                  />
                </label>
                <label className={styles.fullWidth}>
                  Collection town or state
                  <input
                    required
                    type="text"
                    pattern=".*\S.*"
                    title="Enter a collection town or state."
                    maxLength={120}
                    placeholder="e.g. Akure, Ondo State"
                    value={origin}
                    onChange={(event) => setOrigin(event.target.value)}
                  />
                </label>
                <label className={styles.fullWidth}>
                  Destination country
                  <select
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                  >
                    {countries.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className={styles.planSummary}>
                <MapPin size={17} />
                <span>
                  Suggested port <strong>{placeLabel(lane.portId)}</strong>
                </span>
              </div>
              <button type="submit" className="logistics-button">
                Continue to our team <ArrowRight size={18} />
              </button>
              <p className={styles.formNote}>
                Your details will be added to our contact form. Add your contact
                information there to send the enquiry.
              </p>
            </form>
          </div>
        </div>
      </section>

      <section
        className={`${styles.container} ${styles.documentSection}`}
        aria-labelledby="documents-heading"
      >
        <div className={styles.documentIntro}>
          <p className={styles.eyebrow}>PREPARE WITH CONFIDENCE</p>
          <h2 id="documents-heading">
            The paperwork.
            <br />
            Made clearer.
          </h2>
          <p>
            We help you understand the documents to discuss and prepare. What
            your shipment needs depends on the produce, destination and shipping
            arrangements.
          </p>
          <Link
            href="/contact?service=Export+documents"
            className="logistics-text-link"
          >
            Ask about your documents <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className={styles.documents}>
          {EXPORT_DOCUMENTS.map((doc, index) => (
            <details key={doc.title}>
              <summary>
                <span className={styles.documentNumber}>0{index + 1}</span>
                <span>{doc.title}</span>
                <ChevronDown size={18} />
              </summary>
              <p>{doc.body}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={styles.exportClosing}>
        <div className={`${styles.container} ${styles.closing}`}>
          <div>
            <p className={styles.eyebrow}>YOUR NEXT EXPORT STARTS HERE</p>
            <h2>
              From Nigerian soil.
              <br />
              To your next buyer.
            </h2>
          </div>
          <div>
            <p>
              Whether this is your first export or your next regular shipment,
              tell us what you’re planning. We’ll work through the next steps
              with you.
            </p>
            <a href="#export-plan" className="logistics-button">
              Start your export plan <ArrowRight size={18} />
            </a>
            <Link href="/lots" className="logistics-text-link">
              Need produce first? Explore the collection{" "}
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Loader2,
  MapPin,
  Truck,
} from "lucide-react";
import { estimateFare, formatNaira, formatReady } from "@/lib/produce/catalog";
import type { Shipment } from "@/lib/produce/shipments";
import { useProduceCatalog } from "./CatalogProvider";
import shared from "./CommercePages.module.css";
import styles from "./JourneyPages.module.css";

export function BookClient() {
  const params = useSearchParams();
  const { lots, places, commodities, commodityById, placeLabel, routeKm } =
    useProduceCatalog();
  const lot = lots.find((item) => item.id === params.get("lot"));
  const initialWeight = Number(params.get("tonnes"));
  const [role, setRole] = useState<"farmer" | "trader" | "exporter">(
    lot && places.find((p) => p.id === lot.destinationId)?.kind === "port"
      ? "exporter"
      : "trader",
  );
  const [crop, setCrop] = useState(
    lot?.commodityId ??
      (commodities.some((c) => c.id === params.get("crop"))
        ? params.get("crop")!
        : (commodities[0]?.id ?? "")),
  );
  const [weight, setWeight] = useState(
    String(
      lot?.tonnes ??
        (Number.isFinite(initialWeight) &&
        initialWeight >= 0.1 &&
        initialWeight <= 500
          ? initialWeight
          : 30),
    ),
  );
  const [origin, setOrigin] = useState(
    lot?.originId ??
      (places.some((p) => p.id === params.get("from"))
        ? params.get("from")!
        : (places[0]?.id ?? "")),
  );
  const [destination, setDestination] = useState(
    lot?.destinationId ??
      (places.some((p) => p.id === params.get("to"))
        ? params.get("to")!
        : (places.find((p) => p.kind === "market")?.id ?? "")),
  );
  const [date, setDate] = useState(
    lot?.ready ?? new Date().toISOString().slice(0, 10),
  );
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [collectionAddress, setCollectionAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<Shipment | null>(null);
  const requestId = useRef<string | null>(null);
  const km = routeKm(origin, destination);
  const tonnes = Number(weight);
  const validWeight = Number.isFinite(tonnes) && tonnes >= 0.1 && tonnes <= 500;
  const estimate = km && validWeight ? estimateFare(km, tonnes) : null;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (origin === destination) {
      setError("Choose different collection and delivery locations.");
      return;
    }
    if (!validWeight) {
      setError("Enter a weight between 0.1 and 500 tonnes.");
      return;
    }
    if (!name.trim() || !contact.trim()) {
      setError(
        "Add your name and a phone number or email so our team can contact you.",
      );
      return;
    }
    if (!requestId.current) requestId.current = crypto.randomUUID();
    setBusy(true);
    try {
      const response = await fetch("/api/produce/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: requestId.current,
          role,
          commodityId: crop,
          tonnes,
          originId: origin,
          destinationId: destination,
          readyDate: date,
          contact: `${name.trim()} · ${contact.trim()}`,
          collectionAddress: collectionAddress.trim(),
          deliveryAddress: deliveryAddress.trim(),
          lotId: lot?.id,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "Your request could not be sent.");
      setSaved(data.shipment);
      window.scrollTo({ top: 0, behavior: "instant" });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (saved)
    return (
      <div className={`${shared.page} ${styles.page}`}>
        <section
          className={`${shared.container} ${styles.bookingConfirmation}`}
        >
          <span className={styles.confirmationIcon}>
            <CheckCircle2 size={34} strokeWidth={1.4} />
          </span>
          <p className={shared.eyebrow}>YOUR REQUEST IS WITH OUR TEAM</p>
          <h1>
            We’ll take it
            <br />
            from here.
          </h1>
          <p className={shared.intro}>
            Your delivery request has been sent. Our team will confirm the
            price, transport and collection arrangements with you.
          </p>
          <div className={styles.confirmationSummary}>
            <p className={shared.overline}>KEEP YOUR SHIPMENT REFERENCE</p>
            <strong className={styles.confirmationReference}>
              {saved.reference}
            </strong>
            <dl>
              <div>
                <dt>Produce</dt>
                <dd>
                  {commodityById(saved.commodityId)?.name} · {saved.tonnes}{" "}
                  tonnes
                </dd>
              </div>
              <div>
                <dt>Collection</dt>
                <dd>{placeLabel(saved.originId)}</dd>
              </div>
              <div>
                <dt>Delivery</dt>
                <dd>{placeLabel(saved.destinationId)}</dd>
              </div>
              <div>
                <dt>Ready date</dt>
                <dd>{formatReady(saved.readyDate)}</dd>
              </div>
            </dl>
          </div>
          <div className={shared.actions}>
            <Link
              href={`/track?ref=${saved.reference}`}
              className="logistics-button"
            >
              Track this request <ArrowRight size={18} />
            </Link>
            <button
              type="button"
              onClick={() => {
                setSaved(null);
                requestId.current = null;
              }}
              className="logistics-text-link"
            >
              Arrange another delivery <ArrowUpRight size={17} />
            </button>
          </div>
        </section>
      </div>
    );

  return (
    <div className={`${shared.page} ${styles.page}`}>
      <section className={styles.bookingHero}>
        <div className={shared.container}>
          <p className={shared.eyebrow}>YOUR PRODUCE. OUR RESPONSIBILITY.</p>
          <h1>
            Tell us what
            <br />
            needs moving.
          </h1>
          <p className={shared.intro}>
            Give us the details. We’ll confirm the plan and coordinate your
            collection, transport and delivery.
          </p>
        </div>
      </section>
      <div className={`${shared.container} ${styles.bookingLayout}`}>
        <form onSubmit={submit} className={styles.bookingForm}>
          {lot && (
            <p className={styles.prefilledNotice}>
              Details added from {lot.id}. The listed produce price is{" "}
              {formatNaira(lot.pricePerTonne)} per tonne; transport is quoted
              separately.
            </p>
          )}
          <fieldset className={styles.bookingFieldset}>
            <legend>
              <span>01</span>Your produce
            </legend>
            <p>What are we moving, and how much?</p>
            <div className={styles.rolePicker} aria-label="Your business type">
              {(["farmer", "trader", "exporter"] as const).map((item) => (
                <button
                  type="button"
                  key={item}
                  aria-pressed={role === item}
                  onClick={() => setRole(item)}
                  className={role === item ? styles.selectedRole : ""}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className={styles.bookingFields}>
              <label htmlFor="booking-produce">
                Produce
                <select
                  id="booking-produce"
                  value={crop}
                  onChange={(event) => setCrop(event.target.value)}
                  required
                >
                  {commodities.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <label htmlFor="booking-weight">
                Weight (tonnes)
                <input
                  id="booking-weight"
                  type="number"
                  min="0.1"
                  max="500"
                  step="any"
                  inputMode="decimal"
                  required
                  value={weight}
                  onChange={(event) => setWeight(event.target.value)}
                />
              </label>
            </div>
          </fieldset>
          <fieldset className={styles.bookingFieldset}>
            <legend>
              <span>02</span>The journey
            </legend>
            <p>Where is the produce, and where does it need to go?</p>
            <div className={styles.bookingFields}>
              <label htmlFor="booking-origin">
                Collection town or port
                <select
                  id="booking-origin"
                  required
                  value={origin}
                  onChange={(event) => setOrigin(event.target.value)}
                >
                  {places.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}, {item.state}
                    </option>
                  ))}
                </select>
              </label>
              <label htmlFor="booking-destination">
                Delivery town, market or port
                <select
                  id="booking-destination"
                  required
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                >
                  {places.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}, {item.state}
                    </option>
                  ))}
                </select>
              </label>
              <label htmlFor="booking-address">
                Collection address <span>(optional)</span>
                <input
                  id="booking-address"
                  maxLength={500}
                  value={collectionAddress}
                  onChange={(event) => setCollectionAddress(event.target.value)}
                  placeholder="Farm, warehouse or street address"
                />
              </label>
              <label htmlFor="booking-delivery-address">
                Delivery address <span>(optional)</span>
                <input
                  id="booking-delivery-address"
                  maxLength={500}
                  value={deliveryAddress}
                  onChange={(event) => setDeliveryAddress(event.target.value)}
                  placeholder="Receiving location or instructions"
                />
              </label>
              <label htmlFor="booking-date">
                When will it be ready?
                <input
                  id="booking-date"
                  required
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                />
              </label>
            </div>
          </fieldset>
          <fieldset className={styles.bookingFieldset}>
            <legend>
              <span>03</span>How to reach you
            </legend>
            <p>Our team will use these details to confirm the arrangements.</p>
            <div className={styles.bookingFields}>
              <label htmlFor="booking-name">
                Your name
                <input
                  id="booking-name"
                  required
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Full name"
                />
              </label>
              <label htmlFor="booking-contact">
                Phone number or email
                <input
                  id="booking-contact"
                  required
                  minLength={5}
                  maxLength={90}
                  value={contact}
                  onChange={(event) => setContact(event.target.value)}
                  placeholder="e.g. +234… or your email"
                />
              </label>
            </div>
          </fieldset>
          {error && (
            <p role="alert" className={styles.formError}>
              {error}
            </p>
          )}
          <div className={styles.bookingSubmit}>
            <button
              type="submit"
              disabled={busy || !commodities.length || !places.length}
              className="logistics-button"
            >
              {busy ? <Loader2 size={18} className={styles.spinner} /> : null}
              {busy ? "Sending your request…" : "Send delivery request"}
              {!busy && <ArrowRight size={18} />}
            </button>
            <p>
              No payment is taken here. Our team confirms pricing and
              availability before collection.
            </p>
          </div>
        </form>
        <aside className={styles.bookingAside}>
          <div className={styles.routePlanner}>
            <p className={shared.overline}>YOUR JOURNEY AT A GLANCE</p>
            <div className={styles.plannerStops}>
              <div>
                <MapPin size={17} />
                <span>
                  <small>COLLECTION</small>
                  <strong>{placeLabel(origin)}</strong>
                </span>
              </div>
              <div>
                <Truck size={17} />
                <span>
                  <small>DELIVERY</small>
                  <strong>{placeLabel(destination)}</strong>
                </span>
              </div>
            </div>
            <div className={styles.routeEstimate} aria-live="polite">
              <p>Sample transport estimate</p>
              <strong>
                {estimate ? formatNaira(estimate.total) : "Quote from our team"}
              </strong>
              <span>
                {estimate
                  ? `${km?.toLocaleString()} km · ${estimate.trucks} ${estimate.trucks === 1 ? "truck" : "trucks"}`
                  : origin === destination
                    ? "Choose different collection and delivery locations."
                    : "Our team will price journeys outside the listed routes."}
              </span>
            </div>
            <p className={styles.plannerNote}>
              {commodityById(crop)?.name ?? "Produce"} ·{" "}
              {validWeight ? `${tonnes} tonnes` : "Enter your weight"}
              <br />
              Produce purchase costs are separate from transport.
            </p>
          </div>
          <div className={styles.bookingHelp}>
            <h3>Need help planning?</h3>
            <p>
              Not sure about the weight, route or collection details? Talk it
              through with our team.
            </p>
            <Link
              href="/contact?service=Delivery+planning"
              className="logistics-text-link"
            >
              Ask us for help <ArrowUpRight size={16} />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

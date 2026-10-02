"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Copy,
  Loader2,
  MapPin,
  Package,
  Search,
  Truck,
} from "lucide-react";
import { formatNaira, formatReady } from "@/lib/produce/catalog";
import {
  DEMO_SHIPMENTS,
  STATUS_STEPS,
  findShipment,
  type Shipment,
} from "@/lib/produce/shipments";
import { useProduceCatalog } from "./CatalogProvider";
import shared from "./CommercePages.module.css";
import styles from "./JourneyPages.module.css";

const NEXT_STEP: Record<Shipment["status"], { title: string; body: string }> = {
  confirmed: {
    title: "Confirming the arrangements",
    body: "Our team reviews the request and confirms the price, transport and collection details with you.",
  },
  assigned: {
    title: "Getting ready for collection",
    body: "The next stage is collecting the produce at the agreed location. Our team coordinates the collection arrangements.",
  },
  loaded: {
    title: "Starting the road journey",
    body: "With the produce collected, the next stage is transport to your destination.",
  },
  transit: {
    title: "Delivery at your destination",
    body: "The next stage is arrival and confirmation that the produce has been received.",
  },
  delivered: {
    title: "The journey is complete",
    body: "Your shipment is marked as delivered. Contact our team if you need help with this delivery or your next one.",
  },
};

function ShipmentOverview({ shipment }: { shipment: Shipment }) {
  const { commodityById, placeLabel } = useProduceCatalog();
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const current = STATUS_STEPS.findIndex((step) => step.id === shipment.status);
  const sample = DEMO_SHIPMENTS.some(
    (item) =>
      item.reference === shipment.reference &&
      item.createdAt === shipment.createdAt,
  );
  const local = !sample && !/^EMZ-[A-F0-9]{20}$/.test(shipment.reference);
  const next = NEXT_STEP[shipment.status];
  const enquiry = new URLSearchParams({
    service: "Shipment support",
    message: `Please help me with shipment ${shipment.reference}, from ${placeLabel(shipment.originId)} to ${placeLabel(shipment.destinationId)}.`,
  });

  async function copyReference() {
    try {
      await navigator.clipboard.writeText(shipment.reference);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  }

  return (
    <article
      className={styles.shipmentOverview}
      aria-labelledby="shipment-heading"
    >
      <div className={styles.shipmentTop}>
        <div>
          <p className={shared.eyebrow}>
            {sample
              ? "EXAMPLE SHIPMENT"
              : local
                ? "SAVED ON THIS DEVICE"
                : "YOUR SHIPMENT"}
          </p>
          <h2 id="shipment-heading">
            {commodityById(shipment.commodityId)?.name ?? shipment.commodityId}
            <span> · {shipment.tonnes} tonnes</span>
          </h2>
          <div className={styles.referenceLine}>
            <span>{shipment.reference}</span>
            <button
              type="button"
              onClick={copyReference}
              aria-label="Copy shipment reference"
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          {copyError && (
            <p className={styles.smallNote} role="status">
              Select the reference above to copy it.
            </p>
          )}
        </div>
        <span className={styles.shipmentStatus}>
          {shipment.status === "delivered" ? (
            <CheckCircle2 size={16} />
          ) : (
            <Truck size={16} />
          )}
          {STATUS_STEPS[current]?.label}
        </span>
      </div>
      {(sample || local) && (
        <p className={styles.sampleNotice}>
          {sample
            ? "This is an example of how shipment tracking looks. These details are sample data."
            : "This request was saved in this browser. Contact our team to confirm the delivery arrangements."}
        </p>
      )}
      <div className={styles.shipmentRoute}>
        <div>
          <span className={styles.stopMarker}>
            <Package size={18} />
          </span>
          <div>
            <small>COLLECTION</small>
            <strong>{placeLabel(shipment.originId)}</strong>
          </div>
        </div>
        <span className={styles.routeConnection}>
          <ArrowRight size={19} />
        </span>
        <div>
          <span className={styles.stopMarker}>
            <MapPin size={18} />
          </span>
          <div>
            <small>DELIVERY</small>
            <strong>{placeLabel(shipment.destinationId)}</strong>
          </div>
        </div>
      </div>
      <div className={styles.shipmentBody}>
        <div>
          <div className={styles.timelineHeading}>
            <h3>The delivery journey</h3>
            <p>{sample ? "Example progress" : "Current shipment stage"}</p>
          </div>
          <ol className={styles.timeline}>
            {STATUS_STEPS.map((step, index) => (
              <li
                key={step.id}
                className={
                  index < current
                    ? styles.completedStep
                    : index === current
                      ? styles.currentStep
                      : ""
                }
                aria-current={index === current ? "step" : undefined}
              >
                <span className={styles.timelineMarker}>
                  {index < current ? <Check size={14} /> : index + 1}
                </span>
                <div>
                  <h4>
                    {step.label}
                    <span>
                      {index < current
                        ? "Complete"
                        : index === current
                          ? "Current stage"
                          : "Next"}
                    </span>
                  </h4>
                  <p>{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <aside className={styles.shipmentAside}>
          <p className={shared.overline}>WHAT HAPPENS NEXT</p>
          <h3>{next.title}</h3>
          <p>{next.body}</p>
          <dl>
            <div>
              <dt>Ready for collection</dt>
              <dd>{formatReady(shipment.readyDate)}</dd>
            </div>
            <div>
              <dt>Listed distance</dt>
              <dd>
                {shipment.km
                  ? `${shipment.km.toLocaleString()} km`
                  : "To be confirmed"}
              </dd>
            </div>
            <div>
              <dt>Transport estimate</dt>
              <dd>
                {shipment.fare != null
                  ? formatNaira(shipment.fare)
                  : "Awaiting a quote"}
              </dd>
            </div>
          </dl>
          <Link
            href={`/contact?${enquiry.toString()}`}
            className={styles.shipmentHelp}
          >
            Get help with this shipment <ArrowUpRight size={16} />
          </Link>
        </aside>
      </div>
    </article>
  );
}

function TrackingSearch({ initial }: { initial: string }) {
  const { settings } = useProduceCatalog();
  const [query, setQuery] = useState(initial);
  const [shipment, setShipment] = useState<Shipment | null>(
    () =>
      DEMO_SHIPMENTS.find((item) => item.reference === initial.toUpperCase()) ??
      null,
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [searched, setSearched] = useState(initial);
  const requestId = useRef(0);
  async function lookup(reference: string) {
    const key = ++requestId.current;
    const cleaned = reference.trim().toUpperCase();
    setSearched(cleaned);
    setError("");
    setShipment(null);
    if (!cleaned) {
      setError("Enter the shipment reference from your delivery request.");
      setBusy(false);
      return;
    }
    const local = findShipment(cleaned);
    if (local) {
      setShipment(local);
      setBusy(false);
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(
        `/api/produce/shipments/${encodeURIComponent(cleaned)}`,
        { cache: "no-store" },
      );
      const data = await response.json();
      if (key !== requestId.current) return;
      if (!response.ok) {
        setError(
          response.status === 404
            ? `We couldn’t find ${cleaned}. Check the reference or contact our team.`
            : (data.error ?? "Tracking is temporarily unavailable."),
        );
        return;
      }
      setShipment(data.shipment);
    } catch {
      if (key === requestId.current)
        setError(
          "We couldn’t load your shipment. Check your connection and try again.",
        );
    } finally {
      if (key === requestId.current) setBusy(false);
    }
  }
  useEffect(() => {
    if (!initial) return;
    const activeRequest = requestId;
    const frame = requestAnimationFrame(() => {
      void lookup(initial);
    });
    return () => {
      cancelAnimationFrame(frame);
      activeRequest.current++;
    };
    // The component is remounted when the URL reference changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void lookup(query);
  }

  return (
    <div className={`${shared.page} ${styles.page}`}>
      <section className={styles.trackingHero}>
        <div className={shared.container}>
          <p className={shared.eyebrow}>FROM COLLECTION TO DELIVERY</p>
          <h1 style={{ whiteSpace: "pre-line" }}>{settings.trackTitle}</h1>
          <p className={shared.intro}>{settings.trackDescription}</p>
          <form onSubmit={onSubmit} className={styles.trackingSearch}>
            <label htmlFor="shipment-reference" className={shared.srOnly}>
              Shipment reference
            </label>
            <Search size={20} />
            <input
              id="shipment-reference"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Enter your reference, e.g. EMZ-4821"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              maxLength={40}
              aria-describedby="tracking-help"
            />
            <button type="submit" className="logistics-button" disabled={busy}>
              {busy ? <Loader2 size={18} className={styles.spinner} /> : null}
              {busy ? "Looking up…" : "Track shipment"}
              {!busy && <ArrowRight size={17} />}
            </button>
          </form>
          <p id="tracking-help" className={styles.trackingNote}>
            Your reference is included in your delivery request confirmation.
          </p>
          <div className={styles.demoLinks}>
            <span>Explore an example</span>
            {DEMO_SHIPMENTS.map((demo) => (
              <button
                type="button"
                key={demo.reference}
                onClick={() => {
                  setQuery(demo.reference);
                  void lookup(demo.reference);
                }}
              >
                {demo.reference}
                <ArrowUpRight size={12} />
              </button>
            ))}
          </div>
        </div>
      </section>
      <section
        className={`${shared.container} ${styles.trackingResults}`}
        aria-live="polite"
        aria-busy={busy}
      >
        {busy && (
          <div className={styles.trackingEmpty}>
            <Loader2 size={28} className={styles.spinner} />
            <h3>Finding your shipment…</h3>
          </div>
        )}
        {error && (
          <div className={styles.trackingEmpty} role="alert">
            <Search size={30} strokeWidth={1.3} />
            <h3>Let’s check that reference.</h3>
            <p>{error}</p>
            <Link
              href={`/contact?${new URLSearchParams({ service: "Tracking help", message: `Please help me find shipment ${searched}.` })}`}
              className="logistics-text-link"
            >
              Ask our team for help <ArrowUpRight size={17} />
            </Link>
          </div>
        )}
        {!busy && !error && shipment && (
          <ShipmentOverview key={shipment.reference} shipment={shipment} />
        )}
        {!busy && !error && !shipment && (
          <div className={styles.trackingEmpty}>
            <Truck size={32} strokeWidth={1.3} />
            <h3>Every journey has a reference.</h3>
            <p>
              Enter yours above to see the shipment details, or choose an
              example to explore the delivery journey.
            </p>
          </div>
        )}
      </section>
      <section className={`${shared.container} ${styles.trackingSupport}`}>
        <div>
          <p className={shared.eyebrow}>ONE TEAM TO TURN TO</p>
          <h2>
            A question about
            <br />
            your delivery?
          </h2>
          <p>
            Share your shipment reference and tell us what you need. Our team
            will help you work through the next step.
          </p>
          <Link
            href="/contact?service=Delivery+support"
            className="logistics-button"
          >
            Talk to our team <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className={styles.trackingFaq}>
          {[
            [
              "Where do I find my reference?",
              "Your reference appears after you submit a delivery request. Keep it handy for tracking and for any conversation with our team.",
            ],
            [
              "Why can’t I see my shipment?",
              "Check the reference for typing errors. Older requests saved only in a browser can be viewed on that device. If you still need help, contact our team.",
            ],
            [
              "Is this a live vehicle location?",
              "This page shows shipment details and the stage recorded by our team. It does not display live vehicle coordinates.",
            ],
          ].map(([title, body]) => (
            <details key={title}>
              <summary>{title}</summary>
              <p>{body}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
export function TrackClient() {
  const params = useSearchParams();
  const initial = params.get("ref") ?? "";
  return <TrackingSearch key={initial} initial={initial} />;
}

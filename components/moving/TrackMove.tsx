"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  SERVICES,
  STATUSES,
  STATUS_LABELS,
  type Move,
} from "@/lib/moving/model";
import shared from "@/components/produce/CommercePages.module.css";
import styles from "@/components/produce/JourneyPages.module.css";
type PublicMove = Pick<
  Move,
  "reference" | "service" | "status" | "quote" | "crew" | "arrival" | "date"
>;
export function TrackMove() {
  const params = useSearchParams();
  const initial = params.get("ref") ?? "";
  const [query, setQuery] = useState(initial);
  const [move, setMove] = useState<PublicMove | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!initial) return;
    const controller = new AbortController();
    fetch(`/api/moves/${encodeURIComponent(initial.trim().toUpperCase())}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        setMove(d.move);
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      });
    return () => controller.abort();
  }, [initial]);
  async function lookup() {
    setBusy(true);
    setError("");
    setMove(null);
    try {
      const r = await fetch(
        `/api/moves/${encodeURIComponent(query.trim().toUpperCase())}`,
        { cache: "no-store" },
      );
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setMove(d.move);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load your move.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className={`${shared.page} ${styles.page}`}>
      <section className={styles.trackingHero}>
        <div className={shared.container}>
          <p className={shared.eyebrow}>FROM YOUR DOOR TO YOUR DESTINATION</p>
          <h1>
            Your move.
            <br />
            Every step.
          </h1>
          <p className={shared.intro}>
            Use the reference from your booking to see the confirmed price, the
            assigned crew and arrival updates.
          </p>
          <form
            className={styles.trackingSearch}
            onSubmit={(e) => {
              e.preventDefault();
              void lookup();
            }}
          >
            <label className={shared.srOnly} htmlFor="move-ref">
              Move reference
            </label>
            <input
              id="move-ref"
              required
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="EMZ-…"
            />
            <button className="logistics-button" disabled={busy}>
              {busy ? "Looking up…" : "Track my move"}
            </button>
          </form>
          {error && (
            <p role="alert" className={styles.formError}>
              {error}
            </p>
          )}
        </div>
      </section>
      <section className={`${shared.container} logistics-section`}>
        {move ? (
          <article className={styles.shipmentOverview}>
            <div className={styles.shipmentTop}>
              <div>
                <p className={shared.eyebrow}>YOUR MOVE</p>
                <h2>{SERVICES.find((s) => s.id === move.service)?.name}</h2>
                <p style={{ overflowWrap: "anywhere" }}>{move.reference}</p>
              </div>
              <span className={styles.shipmentStatus}>
                {STATUS_LABELS[STATUSES.indexOf(move.status)]}
              </span>
            </div>
            <div className={styles.shipmentBody}>
              <ol className={styles.timeline}>
                {STATUSES.map((s, i) => (
                  <li
                    key={s}
                    className={
                      i === STATUSES.indexOf(move.status)
                        ? styles.currentStep
                        : i < STATUSES.indexOf(move.status)
                          ? styles.completedStep
                          : ""
                    }
                    aria-current={s === move.status ? "step" : undefined}
                  >
                    <span className={styles.timelineMarker}>{i + 1}</span>
                    <div>
                      <h4>{STATUS_LABELS[i]}</h4>
                    </div>
                  </li>
                ))}
              </ol>
              <aside className={styles.shipmentAside}>
                <h3>Your arrangements</h3>
                <dl>
                  <div>
                    <dt>Requested date</dt>
                    <dd>{move.date}</dd>
                  </div>
                  <div>
                    <dt>Quote</dt>
                    <dd>
                      {move.quote === null
                        ? "Awaiting team review"
                        : new Intl.NumberFormat("en-NG", {
                            style: "currency",
                            currency: "NGN",
                            maximumFractionDigits: 0,
                          }).format(move.quote)}
                    </dd>
                  </div>
                  <div>
                    <dt>Crew</dt>
                    <dd>{move.crew || "To be assigned"}</dd>
                  </div>
                  <div>
                    <dt>Arrival update</dt>
                    <dd>{move.arrival || "To be confirmed"}</dd>
                  </div>
                </dl>
                <Link
                  href={`/contact?message=${encodeURIComponent(`Please help me with move ${move.reference}.`)}`}
                  className="logistics-text-link"
                >
                  Get help with this move
                </Link>
              </aside>
            </div>
          </article>
        ) : (
          <div className={styles.bookingHelp}>
            <h3>Keep your reference handy.</h3>
            <p>
              A booking confirms your price immediately. Crew and vehicle
              assignments show here once the team assigns them.
            </p>
            <Link href="/book" className="logistics-text-link">
              Plan a move
            </Link>
          </div>
        )}
        <p className={styles.smallNote}>
          Need to report damage? Contact support with your reference, item
          checklist and photos so our team can review it with the crew.
        </p>
      </section>
    </div>
  );
}

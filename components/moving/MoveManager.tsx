"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  SERVICES,
  STATUSES,
  STATUS_LABELS,
  type Move,
} from "@/lib/moving/model";
import shared from "@/components/produce/CommercePages.module.css";
import styles from "@/components/produce/JourneyPages.module.css";
function MoveEditor({
  move,
  onSaved,
}: {
  move: Move;
  onSaved: (move: Move) => void;
}) {
  const [status, setStatus] = useState(move.status);
  const [quote, setQuote] = useState(move.quote?.toString() ?? "");
  const [crew, setCrew] = useState(move.crew);
  const [arrival, setArrival] = useState(move.arrival);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  return (
    <article className={styles.shipmentOverview} style={{ marginBottom: 24 }}>
      <div className={styles.shipmentTop}>
        <div>
          <p className={shared.eyebrow}>
            {SERVICES.find((s) => s.id === move.service)?.name}
          </p>
          <h2>{move.name}</h2>
          <p style={{ overflowWrap: "anywhere" }}>{move.reference}</p>
        </div>
        <span className={styles.shipmentStatus}>
          {STATUS_LABELS[STATUSES.indexOf(move.status)]}
        </span>
      </div>
      <div className={styles.shipmentBody}>
        <div>
          <h3>
            {move.pickup} → {move.destination}
          </h3>
          <p>
            {move.date} · {move.size}
          </p>
          <p>
            <strong>Checklist:</strong> {move.inventory}
          </p>
          <p>
            <strong>Access:</strong> Pickup floor {move.pickupFloor},
            destination floor {move.destinationFloor}.{" "}
            {move.access || "No additional instructions."}
          </p>
          <p>
            <strong>Extras:</strong> {move.extras.join(", ") || "None"}
          </p>
          <p>
            {move.phone} · {move.email}
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 16,
            }}
          >
            {move.photos.map((photo, i) => (
              <a key={i} href={photo} target="_blank" rel="noreferrer">
                <Image
                  unoptimized
                  src={photo}
                  alt={`Inventory photo ${i + 1}`}
                  width={140}
                  height={110}
                  style={{ objectFit: "cover", borderRadius: 8 }}
                />
              </a>
            ))}
          </div>
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            setSaved(false);
            try {
              const r = await fetch("/api/admin/moves", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  reference: move.reference,
                  status,
                  quote: quote === "" ? null : Number(quote),
                  crew,
                  arrival,
                }),
              });
              const data = await r.json();
              if (!r.ok) throw new Error(data.error);
              onSaved(data.move);
              setSaved(true);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Could not save.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className={styles.bookingFields}>
            <label>
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Move["status"])}
              >
                {STATUSES.map((s, i) => (
                  <option value={s} key={s}>
                    {STATUS_LABELS[i]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Quote (₦)
              <input
                type="number"
                min={1}
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
              />
            </label>
            <label>
              Crew / customer contact
              <input
                maxLength={200}
                value={crew}
                onChange={(e) => setCrew(e.target.value)}
              />
            </label>
            <label>
              Arrival update
              <input
                maxLength={200}
                value={arrival}
                onChange={(e) => setArrival(e.target.value)}
                placeholder="e.g. Agreed arrival: 9–10 am"
              />
            </label>
          </div>
          <button
            disabled={busy}
            className="logistics-button"
            style={{ marginTop: 20 }}
          >
            {busy ? "Saving…" : "Save move update"}
          </button>
          {error && (
            <p role="alert" className={styles.formError}>
              {error}
            </p>
          )}
          {saved && <p role="status">Update saved.</p>}
        </form>
      </div>
    </article>
  );
}
export function MoveManager() {
  const [moves, setMoves] = useState<Move[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  const [search, setSearch] = useState("");
  async function load() {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/admin/moves", { cache: "no-store" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setMoves(d.moves);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load requests.");
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  return (
    <div className={`${shared.page} ${styles.page}`}>
      <div className={`${shared.container} logistics-section`}>
        <p className={shared.eyebrow}>MOVING OPERATIONS</p>
        <h1>
          Every move.
          <br />
          One workspace.
        </h1>
        <p className={shared.intro}>
          Review inventories and access, confirm quotes and keep customers
          updated on crews and arrivals.
        </p>
        <div className={shared.actions}>
          <button
            className="logistics-button"
            disabled={busy}
            onClick={() => void load()}
          >
            {busy ? "Loading…" : "Refresh requests"}
          </button>
          <Link href="/admin/users" className="logistics-text-link">
            Manage users
          </Link>
          <Link href="/admin/enquiries" className="logistics-text-link">
            Customer enquiries
          </Link>
        </div>
        <div className={styles.bookingFields} style={{ marginBlock: 28 }}>
          <label>
            Find a move
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, reference or address"
            />
          </label>
        </div>
        {error && (
          <p role="alert" className={styles.formError}>
            {error}
          </p>
        )}
        {!busy && !error && moves.length === 0 && (
          <p>No move requests yet. New quote requests appear here.</p>
        )}
        {moves
          .filter((m) =>
            `${m.name} ${m.reference} ${m.pickup} ${m.destination}`
              .toLowerCase()
              .includes(search.toLowerCase()),
          )
          .map((m) => (
            <MoveEditor
              key={m.reference}
              move={m}
              onSaved={(next) =>
                setMoves((prev) =>
                  prev.map((x) => (x.reference === next.reference ? next : x)),
                )
              }
            />
          ))}
      </div>
    </div>
  );
}

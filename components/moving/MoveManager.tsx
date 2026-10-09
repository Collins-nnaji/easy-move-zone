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
import type { Worker } from "@/lib/moving/workers";
import shared from "@/components/produce/CommercePages.module.css";
import styles from "@/components/produce/JourneyPages.module.css";
function MoveEditor({
  move,
  workers,
  onSaved,
}: {
  move: Move;
  workers: Worker[];
  onSaved: (move: Move) => void;
}) {
  const [status, setStatus] = useState(move.status);
  const [quote, setQuote] = useState(move.quote?.toString() ?? "");
  const [crew, setCrew] = useState(move.crew);
  const [arrival, setArrival] = useState(move.arrival);
  const [moverId, setMoverId] = useState(move.moverId ?? "");
  const [vehicleId, setVehicleId] = useState(move.vehicleId ?? "");
  const movers = workers.filter((worker) => worker.kind === "mover");
  const vehicles = workers.filter((worker) => worker.kind === "vehicle");
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
            <strong>Estimate:</strong> ₦
            {move.estimate?.low?.toLocaleString() ?? "—"}–₦
            {move.estimate?.high?.toLocaleString() ?? "—"} · paid ₦
            {(move.paidAmount ?? 0).toLocaleString()} · {move.city ?? "Lagos"},{" "}
            {move.distanceKm ?? 10} km
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
                  moverId: moverId || null,
                  vehicleId: vehicleId || null,
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
              Reviewed quote (₦)
              <input
                type="number"
                min={1}
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
              />
            </label>
            <label>
              Assign mover
              <select
                value={moverId}
                onChange={(e) => setMoverId(e.target.value)}
              >
                <option value="">Unassigned</option>
                {movers.map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name} · {worker.area} · crew of {worker.crewSize}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Assign vehicle
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
              >
                <option value="">Unassigned</option>
                {vehicles.map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name} · {worker.vehicleType} {worker.plate} ·{" "}
                    {worker.area}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Crew note shown to the customer
              <input
                maxLength={200}
                value={crew}
                onChange={(e) => setCrew(e.target.value)}
              />
              <small>
                Choosing a mover or vehicle replaces this with their names when
                you save.
              </small>
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
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  useEffect(() => {
    setStatusFilter(
      new URLSearchParams(window.location.search).get("status") ?? "",
    );
  }, []);
  async function load() {
    setBusy(true);
    setError("");
    try {
      const [movesResponse, workersResponse] = await Promise.all([
        fetch("/api/admin/moves", { cache: "no-store" }),
        fetch("/api/admin/workers", { cache: "no-store" }),
      ]);
      const movesData = await movesResponse.json();
      if (!movesResponse.ok) throw new Error(movesData.error);
      setMoves(movesData.moves);
      if (workersResponse.ok) {
        const workersData = await workersResponse.json();
        setWorkers(workersData.workers);
      }
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
          Review incoming requests and confirm a quote. Verified deposits secure
          bookings; assign verified partners and follow each job stage.
        </p>
        <div className={shared.actions}>
          <button
            className="logistics-button"
            disabled={busy}
            onClick={() => void load()}
          >
            {busy ? "Loading…" : "Refresh requests"}
          </button>
          <Link href="/admin/operations" className="logistics-text-link">
            Pricing, payments & claims
          </Link>
          <Link href="/admin/workers" className="logistics-text-link">
            Crew and vehicles
          </Link>
          <Link href="/admin/users" className="logistics-text-link">
            Manage users
          </Link>
          <Link href="/admin/enquiries" className="logistics-text-link">
            Customer enquiries
          </Link>
        </div>
        <div className={styles.bookingFields} style={{ marginBlock: 28 }}>
          <label>
            Pipeline stage
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All stages</option>
              {STATUSES.map((v, i) => (
                <option key={v} value={v}>
                  {STATUS_LABELS[i]}
                </option>
              ))}
            </select>
          </label>
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
          <p>
            No moves yet. New requests appear here as soon as a customer
            submits.
          </p>
        )}
        {moves
          .filter((m) => !statusFilter || m.status === statusFilter)
          .filter((m) =>
            `${m.name} ${m.reference} ${m.pickup} ${m.destination}`
              .toLowerCase()
              .includes(search.toLowerCase()),
          )
          .map((m) => (
            <MoveEditor
              key={m.reference}
              move={m}
              workers={workers}
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

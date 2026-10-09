"use client";
import { MovePlanPanel } from "@/components/moving/MovePlanPanel";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  AREAS,
  SERVICES,
  STATUSES,
  STATUS_LABELS,
  type Move,
} from "@/lib/moving/model";
import {
  VEHICLE_TYPES,
  WORKER_KINDS,
  WORKER_PROGRESS,
  type Worker,
  type WorkerKind,
} from "@/lib/moving/workers";
import { WorkerTools } from "@/components/marketplace/WorkerTools";
import { JobChecklists } from "@/components/marketplace/JobChecklists";
import { workerEarning } from "@/lib/marketplace/model";
import { formatMoney } from "@/lib/money";
import shared from "@/components/produce/CommercePages.module.css";
import styles from "@/components/produce/JourneyPages.module.css";

type Draft = {
  kind: WorkerKind;
  name: string;
  phone: string;
  area: string;
  crewSize: number;
  vehicleType: string;
  plate: string;
  capacity: string;
  notes: string;
};

function draftFrom(worker?: Worker | null): Draft {
  return {
    kind: worker?.kind ?? "mover",
    name: worker?.name ?? "",
    phone: worker?.phone ?? "",
    area: worker?.area ?? AREAS[0],
    crewSize: worker?.crewSize || 2,
    vehicleType: worker?.vehicleType || VEHICLE_TYPES[0],
    plate: worker?.plate ?? "",
    capacity: worker?.capacity ?? "",
    notes: worker?.notes ?? "",
  };
}

function payload(draft: Draft) {
  const vehicle = draft.kind === "vehicle";
  return {
    kind: draft.kind,
    name: draft.name,
    phone: draft.phone,
    area: draft.area,
    notes: draft.notes,
    crewSize: vehicle ? 0 : Number(draft.crewSize),
    vehicleType: vehicle ? draft.vehicleType : "",
    plate: vehicle ? draft.plate : "",
    capacity: vehicle ? draft.capacity : "",
  };
}

function ProfileForm({
  initial,
  submitLabel,
  onSaved,
}: {
  initial?: Worker | null;
  submitLabel: string;
  onSaved: (worker: Worker) => void;
}) {
  const [draft, setDraft] = useState<Draft>(draftFrom(initial));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/workers", {
        method: initial ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload(draft)),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      onSaved(data.worker);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className={styles.bookingForm}>
      <fieldset className={styles.bookingFieldset}>
        <legend>
          <span>01</span>How do you work?
        </legend>
        <div className={styles.rolePicker}>
          {WORKER_KINDS.map((kind) => (
            <button
              key={kind.id}
              type="button"
              aria-pressed={draft.kind === kind.id}
              className={draft.kind === kind.id ? styles.selectedRole : ""}
              onClick={() => set("kind", kind.id)}
            >
              {kind.name}
            </button>
          ))}
        </div>
        <p>
          {WORKER_KINDS.find((kind) => kind.id === draft.kind)?.detail} You can
          receive jobs as soon as this is saved.
        </p>
      </fieldset>
      <fieldset className={styles.bookingFieldset}>
        <legend>
          <span>02</span>Your details
        </legend>
        <div className={styles.bookingFields}>
          <label>
            Name
            <input
              required
              minLength={2}
              maxLength={120}
              value={draft.name}
              onChange={(event) => set("name", event.target.value)}
            />
          </label>
          <label>
            Phone / WhatsApp
            <input
              required
              type="tel"
              pattern="[+0-9 ()\-]{7,40}"
              maxLength={40}
              value={draft.phone}
              onChange={(event) => set("phone", event.target.value)}
              placeholder="+234…"
            />
          </label>
          <label>
            Main area
            <select
              value={draft.area}
              onChange={(event) => set("area", event.target.value)}
            >
              {AREAS.map((area) => (
                <option key={area}>{area}</option>
              ))}
            </select>
          </label>
          {draft.kind === "mover" ? (
            <label>
              Crew size
              <input
                required
                type="number"
                min={1}
                max={30}
                value={draft.crewSize}
                onChange={(event) =>
                  set("crewSize", Number(event.target.value))
                }
              />
            </label>
          ) : (
            <>
              <label>
                Vehicle
                <select
                  value={draft.vehicleType}
                  onChange={(event) => set("vehicleType", event.target.value)}
                >
                  {VEHICLE_TYPES.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </label>
              <label>
                Plate
                <input
                  required
                  minLength={2}
                  maxLength={20}
                  value={draft.plate}
                  onChange={(event) => set("plate", event.target.value)}
                  placeholder="ABC 123 YZ"
                />
              </label>
              <label>
                Capacity
                <input
                  required
                  minLength={2}
                  maxLength={80}
                  value={draft.capacity}
                  onChange={(event) => set("capacity", event.target.value)}
                  placeholder="e.g. 1.5 tonnes"
                />
              </label>
            </>
          )}
          <label>
            Notes
            <input
              maxLength={500}
              value={draft.notes}
              onChange={(event) => set("notes", event.target.value)}
              placeholder="Availability, equipment or areas you cover"
            />
          </label>
        </div>
      </fieldset>
      {error && (
        <p role="alert" className={styles.formError}>
          {error}
        </p>
      )}
      <button className="logistics-button" disabled={busy}>
        {busy ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}

function JobCard({
  job,
  onUpdated,
  workerId,
}: {
  workerId: string;
  job: Move;
  onUpdated: (job: Move) => void;
}) {
  const [arrival, setArrival] = useState(job.arrival);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function update(
    status?: (typeof WORKER_PROGRESS)[number],
    decision?: string,
  ) {
    if (status === "completed" && !window.confirm("Mark this move completed?"))
      return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/workers/jobs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: job.reference,
          status,
          arrival,
          decision,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      onUpdated(data.move);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <article className={styles.shipmentOverview} style={{ marginBottom: 24 }}>
      <div className={styles.shipmentTop}>
        <div>
          <p className={shared.eyebrow}>
            {SERVICES.find((service) => service.id === job.service)?.name}
          </p>
          <h2>{job.name}</h2>
          <p style={{ overflowWrap: "anywhere" }}>{job.reference}</p>
        </div>
        <span className={styles.shipmentStatus}>
          {STATUS_LABELS[STATUSES.indexOf(job.status)]}
        </span>
      </div>
      <div className={styles.shipmentBody}>
        <div>
          <h3>
            {job.pickup} → {job.destination}
          </h3>
          <p>
            {job.date} · {job.size}
          </p>
          <p>
            <strong>Job earnings pool:</strong>{" "}
            {formatMoney(workerEarning(job))} after{" "}
            {job.commissionPercent ?? 15}% commission. Your individual share is
            agreed with operations.
          </p>
          <p>
            <strong>Checklist:</strong> {job.inventory}
          </p>
          <MovePlanPanel move={job} role="crew" onUpdated={onUpdated} />
          <p>
            <strong>Access:</strong> Pickup floor {job.pickupFloor}, destination
            floor {job.destinationFloor}.{" "}
            {job.access || "No extra instructions."}
          </p>
          <p>
            <strong>Customer:</strong> {job.name} ·{" "}
            <a href={`tel:${job.phone}`}>{job.phone}</a>
          </p>
        </div>
        <div className={styles.bookingFields}>
          <div className={styles.rolePicker}>
            <button
              type="button"
              disabled={busy || ["completed", "cancelled"].includes(job.status)}
              onClick={() => void update(undefined, "accept")}
            >
              {job.acceptedBy?.includes(workerId) ? "Accepted" : "Accept job"}
            </button>
            <button
              type="button"
              disabled={busy || ["completed", "cancelled"].includes(job.status)}
              onClick={() => void update(undefined, "decline")}
            >
              {job.declinedBy?.includes(workerId) ? "Declined" : "Decline job"}
            </button>
          </div>
          <label>
            Arrival note
            <input
              maxLength={200}
              value={arrival}
              onChange={(event) => setArrival(event.target.value)}
              placeholder="e.g. On site by 9:30"
            />
          </label>
          <div className={styles.rolePicker} style={{ marginTop: 16 }}>
            {WORKER_PROGRESS.map((status) => (
              <button
                key={status}
                type="button"
                disabled={
                  busy ||
                  !job.acceptedBy?.includes(workerId) ||
                  STATUSES.indexOf(status) !== STATUSES.indexOf(job.status) + 1
                }
                aria-pressed={job.status === status}
                className={job.status === status ? styles.selectedRole : ""}
                onClick={() => void update(status)}
              >
                {STATUS_LABELS[STATUSES.indexOf(status)]}
              </button>
            ))}
          </div>
          {error && (
            <p role="alert" className={styles.formError}>
              {error}
            </p>
          )}
        </div>
      </div>
      <JobChecklists reference={job.reference} />
    </article>
  );
}

export function WorkerHub() {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [jobs, setJobs] = useState<Move[]>([]);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/workers", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        if (!cancelled) {
          setWorker(data.worker);
          setJobs(data.jobs);
        }
      })
      .catch((cause) => {
        if (!cancelled)
          setError(cause instanceof Error ? cause.message : "Could not load.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={`${shared.page} ${styles.page}`}>
      <section className={styles.bookingHero}>
        <div className={shared.container}>
          <p className={shared.eyebrow}>CREW HUB</p>
          <h1>
            Your jobs.
            <br />
            Assigned from admin.
          </h1>
          <p className={shared.intro}>
            Movers and vehicle owners join here. Submit your profile and
            verification documents. Once approved, assigned jobs show up here
            with inventory, addresses and the agreed pay arrangements.
          </p>
        </div>
      </section>
      <div className={`${shared.container} logistics-section`}>
        {loading && <p>Loading your hub…</p>}
        {error && (
          <p role="alert" className={styles.formError}>
            {error} <Link href="/auth?redirect=/hub">Sign in</Link>
          </p>
        )}
        {!loading && !error && !worker && (
          <ProfileForm
            submitLabel="Join and start receiving jobs"
            onSaved={setWorker}
          />
        )}
        {worker && (
          <>
            <div className={styles.confirmationSummary}>
              <p>
                {worker.kind === "mover" ? "Mover" : "Vehicle owner"} ·{" "}
                {worker.area}
              </p>
              <strong>{worker.name}</strong>
              <p>
                {worker.kind === "mover"
                  ? `Crew of ${worker.crewSize}`
                  : `${worker.vehicleType} ${worker.plate} · ${worker.capacity}`}
              </p>
              <button
                type="button"
                className="logistics-text-link"
                onClick={() => setEditing((open) => !open)}
              >
                {editing ? "Close profile" : "Update profile"}
              </button>
            </div>
            {editing && (
              <ProfileForm
                initial={worker}
                submitLabel="Save profile"
                onSaved={(next) => {
                  setWorker(next);
                  setEditing(false);
                }}
              />
            )}
            <WorkerTools jobs={jobs} />
            <h2 style={{ marginTop: 36 }}>Assigned jobs</h2>
            {jobs.length === 0 ? (
              <p>
                No jobs yet. When admin assigns a booked move to you, it appears
                here with the address, checklist and customer phone.
              </p>
            ) : (
              jobs.map((job) => (
                <JobCard
                  key={job.reference}
                  job={job}
                  workerId={worker.id}
                  onUpdated={(next) =>
                    setJobs((current) =>
                      current.map((item) =>
                        item.reference === next.reference ? next : item,
                      ),
                    )
                  }
                />
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}

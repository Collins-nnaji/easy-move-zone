"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { AREAS } from "@/lib/moving/model";
import {
  VEHICLE_TYPES,
  WORKER_KINDS,
  type Worker,
  type WorkerKind,
} from "@/lib/moving/workers";
import shared from "@/components/produce/CommercePages.module.css";
import styles from "@/components/produce/JourneyPages.module.css";

export function WorkersManager() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [kind, setKind] = useState<WorkerKind>("mover");

  async function load() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/workers", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setWorkers(data.workers);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load crew.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    const vehicle = kind === "vehicle";
    try {
      const response = await fetch("/api/admin/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          name: fields.name,
          email: fields.email,
          phone: fields.phone,
          area: fields.area,
          notes: fields.notes || "",
          crewSize: vehicle ? 0 : Number(fields.crewSize),
          vehicleType: vehicle ? fields.vehicleType : "",
          plate: vehicle ? fields.plate : "",
          capacity: vehicle ? fields.capacity : "",
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setWorkers((current) => [data.worker, ...current]);
      form.reset();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not add crew.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={`${shared.page} ${styles.page}`}>
      <div className={`${shared.container} logistics-section`}>
        <p className={shared.eyebrow}>CREW AND VEHICLES</p>
        <h1>
          People who
          <br />
          take the jobs.
        </h1>
        <p className={shared.intro}>
          Add a mover or vehicle owner here, or let them join at the crew hub.
          They submit documents for verification before assignment. When they sign in with
          the same email, their jobs are waiting.
        </p>
        <div className={shared.actions}>
          <Link href="/admin" className="logistics-text-link">
            Back to moves
          </Link>
          <Link href="/hub" className="logistics-text-link">
            Open the crew hub
          </Link>
        </div>
        <form onSubmit={add} className={styles.bookingForm} style={{ marginTop: 28 }}>
          <fieldset className={styles.bookingFieldset}>
            <legend>
              <span>01</span>Add someone now
            </legend>
            <div className={styles.rolePicker}>
              {WORKER_KINDS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={kind === option.id}
                  className={kind === option.id ? styles.selectedRole : ""}
                  onClick={() => setKind(option.id)}
                >
                  {option.name}
                </button>
              ))}
            </div>
            <div className={styles.bookingFields}>
              <label>
                Name
                <input name="name" required minLength={2} maxLength={120} />
              </label>
              <label>
                Email
                <input name="email" type="email" required maxLength={254} />
              </label>
              <label>
                Phone
                <input
                  name="phone"
                  required
                  type="tel"
                  pattern="[+0-9 ()\-]{7,40}"
                  placeholder="+234…"
                />
              </label>
              <label>
                Area
                <select name="area" defaultValue={AREAS[0]}>
                  {AREAS.map((area) => (
                    <option key={area}>{area}</option>
                  ))}
                </select>
              </label>
              {kind === "mover" ? (
                <label>
                  Crew size
                  <input name="crewSize" type="number" min={1} max={30} defaultValue={2} required />
                </label>
              ) : (
                <>
                  <label>
                    Vehicle
                    <select name="vehicleType" defaultValue={VEHICLE_TYPES[0]}>
                      {VEHICLE_TYPES.map((type) => (
                        <option key={type}>{type}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Plate
                    <input name="plate" required minLength={2} maxLength={20} />
                  </label>
                  <label>
                    Capacity
                    <input name="capacity" required minLength={2} maxLength={80} placeholder="1.5 tonnes" />
                  </label>
                </>
              )}
              <label>
                Notes
                <input name="notes" maxLength={500} />
              </label>
            </div>
          </fieldset>
          <button className="logistics-button" disabled={saving}>
            {saving ? "Adding…" : "Add to the crew list"}
          </button>
        </form>
        {error && (
          <p role="alert" className={styles.formError}>
            {error}
          </p>
        )}
        <h2 style={{ marginTop: 36 }}>{busy ? "Loading crew…" : "Crew directory"}</h2>
        {!busy && workers.length === 0 && (
          <p>No movers or vehicle owners yet. Add one above or share the crew hub.</p>
        )}
        {workers.map((worker) => (
          <article key={worker.id} className={styles.shipmentOverview} style={{ marginBottom: 16 }}>
            <div className={styles.shipmentTop}>
              <div>
                <p className={shared.eyebrow}>
                  {worker.kind === "mover" ? "MOVER" : "VEHICLE OWNER"}
                  {worker.userId ? " · SIGNED IN" : " · WAITING TO SIGN IN"}
                </p>
                <h2>{worker.name}</h2>
                <p>
                  {worker.email} · {worker.phone}
                </p>
              </div>
              <span className={styles.shipmentStatus}>{worker.area}</span>
            </div>
            <p>
              {worker.kind === "mover"
                ? `Crew of ${worker.crewSize}`
                : `${worker.vehicleType} ${worker.plate} · ${worker.capacity}`}
              {worker.notes ? ` · ${worker.notes}` : ""}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

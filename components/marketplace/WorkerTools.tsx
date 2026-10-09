"use client";
import { useCallback, useEffect, useState } from "react";
import type { Move } from "@/lib/moving/model";
import {
  type WorkerExtras,
  type Payout,
  workerEarning,
} from "@/lib/marketplace/model";
import { formatMoney } from "@/lib/money";
import { api, photo } from "./client";
import s from "./Marketplace.module.css";
export function WorkerTools({ jobs }: { jobs: Move[] }) {
  const [x, setX] = useState<WorkerExtras | null>(null),
    [payouts, setPayouts] = useState<Payout[]>([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState("");
  const load = useCallback(async () => {
    const r = await fetch("/api/marketplace?scope=worker", {
      cache: "no-store",
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error);
    setX(d.extras);
    setPayouts(d.payouts);
  }, []);
  useEffect(() => {
    void load().catch((e) => setError(e.message));
  }, [load]);
  async function save() {
    if (!x) return;
    setBusy(true);
    setError("");
    try {
      await api("worker", { ...x });
      await load();
      setNotice(
        "Saved. Document changes return your verification to pending review.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className={s.card}>
      <h2>Verification, fleet & earnings</h2>
      {error && (
        <p role="alert" className={s.error}>
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className={s.success}>
          {notice}
        </p>
      )}
      {x && (
        <>
          <span className={s.pill}>{x.verification.status}</span>
          <p>
            {x.verification.notes ||
              "Submit ID, a guarantor and applicable licence and vehicle papers for operations review."}
          </p>
          <div className={s.form}>
            <label>
              <span>
                <input
                  type="checkbox"
                  checked={x.available}
                  onChange={(e) => setX({ ...x, available: e.target.checked })}
                />{" "}
                Available for jobs
              </span>
            </label>
            {(["idPhoto", "licencePhoto", "vehiclePhoto"] as const).map((k) => (
              <label key={k}>
                {
                  {
                    idPhoto: "Government ID photo",
                    licencePhoto: "Driver’s licence (vehicle owners)",
                    vehiclePhoto: "Vehicle papers (vehicle owners)",
                  }[k]
                }
                <input
                  type="file"
                  disabled={busy}
                  accept="image/jpeg,image/png,image/webp"
                  onChange={async (e) => {
                    setBusy(true);
                    try {
                      const value = await photo(e.target.files?.[0]);
                      setX((prev) =>
                        prev
                          ? {
                              ...prev,
                              verification: {
                                ...prev.verification,
                                [k]: value,
                              },
                            }
                          : prev,
                      );
                    } catch (e) {
                      setError(String(e));
                    } finally {
                      setBusy(false);
                    }
                  }}
                />
                <span className={s.muted}>
                  {x.verification[k]
                    ? "Document selected / stored"
                    : "Not submitted"}
                </span>
              </label>
            ))}
            <label>
              Guarantor name
              <input
                maxLength={120}
                value={x.verification.guarantorName}
                onChange={(e) =>
                  setX({
                    ...x,
                    verification: {
                      ...x.verification,
                      guarantorName: e.target.value,
                    },
                  })
                }
              />
            </label>
            <label>
              Guarantor phone
              <input
                type="tel"
                maxLength={40}
                value={x.verification.guarantorPhone}
                onChange={(e) =>
                  setX({
                    ...x,
                    verification: {
                      ...x.verification,
                      guarantorPhone: e.target.value,
                    },
                  })
                }
              />
            </label>
            <h3>Additional fleet vehicles</h3>
            {x.fleet.map((v) => (
              <div className={s.card} key={v.id}>
                <label>
                  Vehicle type
                  <select
                    value={v.type}
                    onChange={(e) =>
                      setX({
                        ...x,
                        fleet: x.fleet.map((f) =>
                          f.id === v.id ? { ...f, type: e.target.value } : f,
                        ),
                      })
                    }
                  >
                    {[
                      "Van",
                      "Pickup",
                      "Truck",
                      "Flatbed",
                      "10-tonne truck",
                    ].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </label>
                {(["plate", "capacity", "areas"] as const).map((k) => (
                  <label key={k}>
                    {k}
                    <input
                      maxLength={
                        k === "plate" ? 20 : k === "capacity" ? 80 : 300
                      }
                      value={v[k]}
                      onChange={(e) =>
                        setX({
                          ...x,
                          fleet: x.fleet.map((f) =>
                            f.id === v.id ? { ...f, [k]: e.target.value } : f,
                          ),
                        })
                      }
                    />
                  </label>
                ))}
                <label>
                  <span>
                    <input
                      type="checkbox"
                      checked={v.available}
                      onChange={(e) =>
                        setX({
                          ...x,
                          fleet: x.fleet.map((f) =>
                            f.id === v.id
                              ? { ...f, available: e.target.checked }
                              : f,
                          ),
                        })
                      }
                    />{" "}
                    Available
                  </span>
                </label>
                <button
                  className={s.link}
                  type="button"
                  onClick={() =>
                    setX({ ...x, fleet: x.fleet.filter((f) => f.id !== v.id) })
                  }
                >
                  Remove vehicle
                </button>
              </div>
            ))}
            <div className={s.row}>
              <button
                type="button"
                className={s.link}
                disabled={x.fleet.length >= 20}
                onClick={() =>
                  setX({
                    ...x,
                    fleet: [
                      ...x.fleet,
                      {
                        id: crypto.randomUUID(),
                        type: "Van",
                        plate: "",
                        capacity: "",
                        areas: "",
                        available: true,
                      },
                    ],
                  })
                }
              >
                + Add vehicle
              </button>
              <button
                disabled={busy}
                type="button"
                className="logistics-button"
                onClick={() => void save()}
              >
                Save partner details
              </button>
            </div>
          </div>
        </>
      )}
      <h3>Earnings & commission statements</h3>
      <p>
        Total recorded payouts:{" "}
        <strong>
          {formatMoney(payouts.reduce((a, p) => a + p.amount, 0))}
        </strong>
      </p>
      <p className={s.muted}>
        The job earnings pool is shared by the crew and vehicle owner.
        Operations agrees each partner’s share and records completed bank
        transfers here.
      </p>
      {jobs
        .filter((j) => j.status === "completed")
        .map((j) => (
          <p key={j.reference}>
            {j.reference}
            <br />
            Quote {formatMoney(j.quote ?? 0)} · platform commission{" "}
            {j.commissionPercent ?? 15}% · shared job pool{" "}
            {formatMoney(workerEarning(j))}
          </p>
        ))}
      {payouts.length === 0 ? (
        <p>No payout transfers recorded yet.</p>
      ) : (
        payouts.map((p) => (
          <p key={p.id}>
            {formatMoney(p.amount)} · {p.reference}
            <br />
            Bank reference {p.bankReference} ·{" "}
            {new Date(p.createdAt).toLocaleDateString()}
          </p>
        ))
      )}
    </section>
  );
}

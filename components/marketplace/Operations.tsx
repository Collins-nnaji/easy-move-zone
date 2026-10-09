"use client";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { type Move, STATUSES, STATUS_LABELS } from "@/lib/moving/model";
import type { Worker } from "@/lib/moving/workers";
import {
  CITIES,
  TRUCKS,
  type PricingRules,
  type Review,
  type Claim,
  type Payout,
  type Payment,
  type WorkerExtras,
  workerEarning,
} from "@/lib/marketplace/model";
import type { Notification } from "@/lib/marketplace/notifications";
import { formatMoney } from "@/lib/money";
import { api } from "./client";
import s from "./Marketplace.module.css";
type Data = {
  moves: Move[];
  workers: Worker[];
  pricing: PricingRules;
  reviews: Review[];
  claims: Claim[];
  payouts: Payout[];
  payments: Payment[];
  notifications: Notification[];
  verifications: WorkerExtras[];
};
function PricingForm({
  initial,
  save,
  busy,
}: {
  initial: PricingRules;
  save: (rules: PricingRules) => void;
  busy: boolean;
}) {
  const [r, setR] = useState(initial),
    [areas, setAreas] = useState(
      Object.entries(initial.areaFees)
        .map(([k, v]) => `${k}|${v}`)
        .join("\n"),
    ),
    [error, setError] = useState("");
  function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const areaFees: Record<string, number> = {};
      for (const line of areas.split("\n").filter((l) => l.trim())) {
        const [key, value] = line.split("|");
        if (!key?.trim() || !value?.trim() || !Number.isFinite(Number(value)))
          throw new Error("Area rules use one line per area: name | fee");
        areaFees[key.trim()] = Number(value);
      }
      save({ ...r, areaFees });
    } catch (e) {
      setError(String(e));
    }
  }
  return (
    <form className={`${s.card} ${s.form}`} onSubmit={submit}>
      <h2>Pricing rules</h2>
      <p>
        New requests use these rules. Existing estimates and paid quotes keep
        the values recorded on the booking.
      </p>
      <div className={s.grid}>
        {(
          [
            "perKm",
            "includedKm",
            "floorMultiplier",
            "depositPercent",
            "commissionPercent",
          ] as const
        ).map((k) => (
          <label key={k}>
            {
              {
                perKm: "Fee per extra km (₦)",
                includedKm: "Included km",
                floorMultiplier: "Stairs fee multiplier",
                depositPercent: "Deposit (%)",
                commissionPercent: "Commission (%)",
              }[k]
            }
            <input
              type="number"
              min={k === "commissionPercent" || k === "depositPercent" ? 10 : 0}
              max={
                k === "commissionPercent"
                  ? 20
                  : k === "depositPercent"
                    ? 100
                    : undefined
              }
              step="any"
              required
              value={r[k]}
              onChange={(e) => setR({ ...r, [k]: Number(e.target.value) })}
            />
          </label>
        ))}
      </div>
      <h3>City multipliers</h3>
      <div className={s.grid}>
        {CITIES.map((c) => (
          <label key={c}>
            {c}
            <input
              type="number"
              min={0.1}
              max={10}
              step=".01"
              required
              value={r.cityMultipliers[c]}
              onChange={(e) =>
                setR({
                  ...r,
                  cityMultipliers: {
                    ...r.cityMultipliers,
                    [c]: Number(e.target.value),
                  },
                })
              }
            />
          </label>
        ))}
      </div>
      <h3>Vehicle supplements (₦)</h3>
      <div className={s.grid}>
        {TRUCKS.map((t) => (
          <label key={t}>
            {t}
            <input
              type="number"
              min={0}
              required
              value={r.truckFees[t]}
              onChange={(e) =>
                setR({
                  ...r,
                  truckFees: { ...r.truckFees, [t]: Number(e.target.value) },
                })
              }
            />
          </label>
        ))}
      </div>
      <label>
        Area supplements (one per line: area | fee)
        <textarea
          placeholder="Lekki | 10000"
          value={areas}
          onChange={(e) => setAreas(e.target.value)}
        />
      </label>
      {error && <p className={s.error}>{error}</p>}
      <button disabled={busy} className="logistics-button">
        Save pricing rules
      </button>
    </form>
  );
}
export function Operations() {
  const [data, setData] = useState<Data | null>(null),
    [tab, setTab] = useState("Overview"),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    const r = await fetch("/api/marketplace?scope=admin", {
      cache: "no-store",
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error);
    setData(d);
  }, []);
  useEffect(() => {
    void load().catch((e) => setError(e.message));
  }, [load]);
  async function act(action: string, values: Record<string, unknown> = {}) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await api(`admin:${action}`, values);
      setNotice(
        action === "notifications"
          ? `${result.sent} updates sent. Unconfigured channels remain queued.`
          : "Saved.",
      );
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }
  const paid =
      data?.payments
        .filter((p) => p.status === "paid")
        .reduce((a, p) => a + p.amount, 0) ?? 0,
    completed = data?.moves.filter((m) => m.status === "completed") ?? [],
    commission = completed.reduce(
      (a, m) => a + (m.quote ?? 0) - workerEarning(m),
      0,
    ),
    payouts = data?.payouts.reduce((a, p) => a + p.amount, 0) ?? 0;
  return (
    <div className={s.page}>
      <p className={s.eyebrow}>OPERATIONS & MARKETPLACE</p>
      <h1>See the whole move.</h1>
      <div className={s.row}>
        <Link href="/admin" className="logistics-button">
          Booking pipeline
        </Link>
        <Link href="/admin/workers" className={s.link}>
          Crew & vehicle directory
        </Link>
        <button
          className={s.link}
          disabled={busy}
          onClick={() => void load().catch((e) => setError(e.message))}
        >
          Refresh
        </button>
      </div>
      <div className={s.tabs}>
        {[
          "Overview",
          "Pricing",
          "Verification",
          "Claims",
          "Reviews",
          "Payouts",
          "Payments",
          "Updates",
        ].map((t) => (
          <button key={t} aria-pressed={tab === t} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
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
      {!data && !error && <p>Loading operations…</p>}
      {data && (
        <>
          {tab === "Overview" && (
            <>
              <div className={s.grid}>
                {[
                  ["Verified collections", formatMoney(paid)],
                  ["Completed job commissions", formatMoney(commission)],
                  ["Recorded partner payouts", formatMoney(payouts)],
                  [
                    "Open claims",
                    data.claims.filter((c) => c.status !== "resolved").length,
                  ],
                ].map(([label, v]) => (
                  <div className={s.card} key={label}>
                    <p>{label}</p>
                    <strong className={s.metric}>{v}</strong>
                  </div>
                ))}
              </div>
              <h2>Booking pipeline</h2>
              <div className={s.grid}>
                {STATUSES.map((status, i) => (
                  <Link
                    href={`/admin?status=${status}`}
                    className={s.card}
                    key={status}
                  >
                    <p>{STATUS_LABELS[i]}</p>
                    <strong className={s.metric}>
                      {data.moves.filter((m) => m.status === status).length}
                    </strong>
                  </Link>
                ))}
              </div>
              <h2>Jobs by city</h2>
              <div className={s.grid}>
                {CITIES.map((c) => (
                  <div className={s.card} key={c}>
                    <h3>{c}</h3>
                    <p>
                      {
                        data.moves.filter((m) => (m.city ?? "Lagos") === c)
                          .length
                      }{" "}
                      jobs ·{" "}
                      {formatMoney(
                        data.moves
                          .filter((m) => (m.city ?? "Lagos") === c)
                          .reduce((a, m) => a + (m.quote ?? 0), 0),
                      )}{" "}
                      quoted
                    </p>
                  </div>
                ))}
              </div>
              <h2>Crew performance</h2>
              <div className={s.scroll}>
                <table className={s.table}>
                  <thead>
                    <tr>
                      <th>Partner</th>
                      <th>Assigned</th>
                      <th>Completed</th>
                      <th>Declined</th>
                      <th>Payouts recorded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.workers.map((w) => (
                      <tr key={w.id}>
                        <td>{w.name}</td>
                        <td>
                          {
                            data.moves.filter((m) =>
                              [m.moverId, m.vehicleId].includes(w.id),
                            ).length
                          }
                        </td>
                        <td>
                          {
                            completed.filter((m) =>
                              [m.moverId, m.vehicleId].includes(w.id),
                            ).length
                          }
                        </td>
                        <td>
                          {
                            data.moves.filter((m) =>
                              m.declinedBy?.includes(w.id),
                            ).length
                          }
                        </td>
                        <td>
                          {formatMoney(
                            data.payouts
                              .filter((p) => p.workerId === w.id)
                              .reduce((a, p) => a + p.amount, 0),
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className={s.muted}>
                Reports cover up to the latest 100 moves and 500 ledger records.
                Collections are verified payments; commissions are calculated on
                completed quoted jobs.
              </p>
            </>
          )}
          {tab === "Pricing" && (
            <PricingForm
              key={JSON.stringify(data.pricing)}
              initial={data.pricing}
              busy={busy}
              save={(r) => void act("pricing", { pricing: r })}
            />
          )}
          {tab === "Verification" && (
            <>
              {data.workers.map((w) => {
                const x = data.verifications.find((v) => v.workerId === w.id);
                return (
                  <article className={s.card} key={w.id}>
                    <span className={s.pill}>
                      {x?.verification.status ?? "pending"}
                    </span>
                    <h2>{w.name}</h2>
                    <p>
                      {w.kind} · {w.area} · {w.phone}
                    </p>
                    <p>
                      Guarantor:{" "}
                      {x?.verification.guarantorName || "Not submitted"} ·{" "}
                      {x?.verification.guarantorPhone}
                    </p>
                    <div className={s.row}>
                      {x &&
                        (
                          ["idPhoto", "licencePhoto", "vehiclePhoto"] as const
                        ).map(
                          (k) =>
                            x.verification[k] && (
                              <a
                                key={k}
                                href={x.verification[k]}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <Image
                                  src={x.verification[k]}
                                  width={120}
                                  height={90}
                                  unoptimized
                                  alt={k}
                                />
                                <span className={s.photoLabel}>{k}</span>
                              </a>
                            ),
                        )}
                    </div>
                    {x?.fleet.map((v) => (
                      <p key={v.id}>
                        {v.type} · {v.plate} · {v.capacity} · {v.areas} ·{" "}
                        {v.available ? "available" : "unavailable"}
                      </p>
                    ))}
                    <form
                      className={s.form}
                      onSubmit={(e) => {
                        e.preventDefault();
                        const f = new FormData(e.currentTarget);
                        void act("verify", {
                          workerId: w.id,
                          status: f.get("status"),
                          notes: f.get("notes"),
                        });
                      }}
                    >
                      <label>
                        Review outcome
                        <select
                          name="status"
                          defaultValue={x?.verification.status ?? "pending"}
                        >
                          {["pending", "verified", "rejected"].map((v) => (
                            <option key={v}>{v}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Review notes
                        <input
                          name="notes"
                          maxLength={1000}
                          defaultValue={x?.verification.notes}
                        />
                      </label>
                      <button className="logistics-button" disabled={busy}>
                        Save verification review
                      </button>
                    </form>
                  </article>
                );
              })}
            </>
          )}
          {tab === "Claims" && (
            <>
              {data.claims.length === 0 && <p>No claims yet.</p>}
              {data.claims.map((c) => (
                <article className={s.card} key={c.id}>
                  <span className={s.pill}>{c.status}</span>
                  <h2>{c.reference}</h2>
                  <p>{c.description}</p>
                  <div className={s.row}>
                    {c.photos.map((p, i) => (
                      <a key={i} href={p} target="_blank" rel="noreferrer">
                        <Image
                          src={p}
                          width={120}
                          height={90}
                          unoptimized
                          alt={`Claim evidence ${i + 1}`}
                        />
                      </a>
                    ))}
                  </div>
                  <form
                    className={s.form}
                    onSubmit={(e) => {
                      e.preventDefault();
                      const f = new FormData(e.currentTarget);
                      void act("claim", {
                        id: c.id,
                        status: f.get("status"),
                        notes: f.get("notes"),
                      });
                    }}
                  >
                    <label>
                      Status
                      <select name="status" defaultValue={c.status}>
                        {["open", "reviewing", "resolved"].map((v) => (
                          <option key={v}>{v}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Outcome / customer-visible notes
                      <textarea
                        name="notes"
                        defaultValue={c.notes}
                        maxLength={2000}
                      />
                    </label>
                    <button className="logistics-button" disabled={busy}>
                      Save claim update
                    </button>
                  </form>
                </article>
              ))}
            </>
          )}
          {tab === "Reviews" && (
            <>
              {data.reviews.length === 0 && <p>No reviews yet.</p>}
              {data.reviews.map((r) => (
                <article className={s.card} key={r.reference}>
                  <h2>
                    {r.name} · {r.rating}/5
                  </h2>
                  <p>{r.text}</p>
                  <p>
                    {r.reference} ·{" "}
                    {r.published ? "Published" : "Awaiting review"}
                  </p>
                  <button
                    disabled={busy}
                    className="logistics-button"
                    onClick={() =>
                      void act("review", {
                        reference: r.reference,
                        published: !r.published,
                      })
                    }
                  >
                    {r.published ? "Unpublish" : "Publish review"}
                  </button>
                </article>
              ))}
            </>
          )}
          {tab === "Payouts" && (
            <>
              <p className={s.note}>
                Record bank transfers already made to partners. This ledger does
                not initiate a transfer. The net job earnings pool is shared
                between the assigned crew and vehicle owner; total recorded
                payouts cannot exceed that pool.
              </p>
              <form
                className={`${s.card} ${s.form}`}
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  void act("payout", {
                    reference: f.get("reference"),
                    workerId: f.get("workerId"),
                    amount: Number(f.get("amount")),
                    bankReference: f.get("bankReference"),
                  });
                }}
              >
                <label>
                  Completed job
                  <select required name="reference">
                    <option value="">Choose a fully paid move</option>
                    {completed
                      .filter(
                        (m) => (m.paidAmount ?? 0) >= (m.quote ?? Infinity),
                      )
                      .map((m) => (
                        <option key={m.reference} value={m.reference}>
                          {m.reference} · pool {formatMoney(workerEarning(m))}
                        </option>
                      ))}
                  </select>
                </label>
                <label>
                  Assigned partner
                  <select name="workerId" required>
                    <option value="">Choose a partner</option>
                    {data.workers.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Transferred amount (₦)
                  <input
                    name="amount"
                    type="number"
                    min={1}
                    step={1}
                    required
                  />
                </label>
                <label>
                  Bank transaction reference
                  <input name="bankReference" maxLength={120} required />
                </label>
                <button disabled={busy} className="logistics-button">
                  Record completed transfer
                </button>
              </form>
              <div className={s.scroll}>
                <table className={s.table}>
                  <thead>
                    <tr>
                      <th>Partner</th>
                      <th>Move</th>
                      <th>Amount</th>
                      <th>Bank reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.payouts.map((p) => (
                      <tr key={p.id}>
                        <td>
                          {data.workers.find((w) => w.id === p.workerId)?.name}
                        </td>
                        <td>{p.reference}</td>
                        <td>{formatMoney(p.amount)}</td>
                        <td>{p.bankReference}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {tab === "Payments" && (
            <>
              {data.payments.map((p) => (
                <article className={s.card} key={p.id}>
                  <h3>
                    {formatMoney(p.amount)} · {p.purpose}
                  </h3>
                  <p>
                    {p.id}
                    <br />
                    {p.reference} · {p.status}
                  </p>
                  {p.status === "pending" && (
                    <button
                      disabled={busy}
                      className="logistics-button"
                      onClick={() => void act("reconcile", { id: p.id })}
                    >
                      Verify provider status / reconcile
                    </button>
                  )}
                </article>
              ))}
            </>
          )}
          {tab === "Updates" && (
            <>
              <p>
                Consent-based job updates are queued automatically. Schedule the
                protected notification processor to deliver them regularly, or
                process the queue here.
              </p>
              <button
                disabled={busy}
                className="logistics-button"
                onClick={() => void act("notifications")}
              >
                Process queued updates
              </button>
              <div className={s.scroll}>
                <table className={s.table}>
                  <thead>
                    <tr>
                      <th>Move</th>
                      <th>Channel</th>
                      <th>Update</th>
                      <th>Status</th>
                      <th>Attempts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.notifications.map((n) => (
                      <tr key={n.id}>
                        <td>{n.reference}</td>
                        <td>{n.channel}</td>
                        <td>{n.label}</td>
                        <td>{n.status}</td>
                        <td>{n.attempts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

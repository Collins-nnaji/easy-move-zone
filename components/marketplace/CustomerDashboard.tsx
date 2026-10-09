"use client";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { STATUSES, STATUS_LABELS, type Move } from "@/lib/moving/model";
import {
  type Account,
  type Claim,
  type Payment,
  type Checklist,
  type Review,
  canChangeMove,
} from "@/lib/marketplace/model";
import { formatMoney } from "@/lib/money";
import { ChecklistEditor } from "./ChecklistEditor";
import { api, photo } from "./client";
import s from "./Marketplace.module.css";
type Data = {
  moves: Move[];
  profile: Account;
  claims: Claim[];
  payments: Payment[];
  reviews: Review[];
  checklists: Checklist[];
};
function MoveCard({
  move,
  data,
  reload,
}: {
  move: Move;
  data: Data;
  reload: () => void;
}) {
  const [open, setOpen] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState("");
  async function act(action: string, values: Record<string, unknown> = {}) {
    setBusy(true);
    setError("");
    try {
      const result = await api(action, {
        reference: move.reference,
        ...values,
      });
      setNotice(
        result.refundReview
          ? "Cancellation saved. Support will review your refund; no refund has been sent yet."
          : "Saved.",
      );
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }
  async function claim(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const files = form
        .getAll("photos")
        .filter((f) => f instanceof File && f.size > 0) as File[];
      if (files.length > 3) throw new Error("Use up to three photos.");
      await act("claim", {
        description: form.get("description"),
        photos: await Promise.all(files.map((f) => photo(f))),
      });
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <article className={s.card}>
      <span className={s.pill}>
        {STATUS_LABELS[STATUSES.indexOf(move.status)]}
      </span>
      <h2>
        {move.size} · {move.date}
      </h2>
      <p>
        {move.pickup} → {move.destination}
      </p>
      <p className={s.muted}>{move.reference}</p>
      <p>
        {move.quote ? (
          <>
            Reviewed quote <strong>{formatMoney(move.quote)}</strong> · paid{" "}
            {formatMoney(move.paidAmount ?? 0)}
          </>
        ) : (
          <>
            Estimate {formatMoney(move.estimate?.low ?? 0)}–
            {formatMoney(move.estimate?.high ?? 0)} · awaiting photo review
          </>
        )}
      </p>
      <div className={s.row}>
        <Link href={`/track?reference=${move.reference}`} className={s.link}>
          Track move
        </Link>
        {move.quote && move.status !== "cancelled" && (
          <Link href={`/checkout?move=${move.reference}`} className={s.link}>
            Payments & receipts
          </Link>
        )}
        <Link
          href={`/book?repeat=${move.reference}&service=${move.service}`}
          className={s.link}
        >
          Book again
        </Link>
        <button type="button" className={s.link} onClick={() => setOpen(!open)}>
          {open ? "Close details" : "Manage move"}
        </button>
      </div>
      {open && (
        <>
          <p>{move.inventory}</p>
          {canChangeMove(move) && (
            <>
              <form
                className={s.form}
                onSubmit={(e) => {
                  e.preventDefault();
                  void act("reschedule", {
                    date: new FormData(e.currentTarget).get("date"),
                  });
                }}
              >
                <label>
                  New date
                  <input name="date" type="date" required />
                </label>
                <button className="logistics-button" disabled={busy}>
                  Reschedule
                </button>
              </form>
              <div className={s.row}>
                <button
                  className={s.link}
                  disabled={busy}
                  onClick={() => {
                    if (
                      window.confirm(
                        "Cancel this move? Any paid amount will require a refund review by support.",
                      )
                    )
                      void act("cancel");
                  }}
                >
                  Cancel move
                </button>
              </div>
            </>
          )}
          <p className={s.muted}>
            Online cancellations and rescheduling close 48 hours before moving
            day. Later changes go through support.
          </p>
          {(["pickup", "delivery"] as const).map((phase) => (
            <ChecklistEditor
              key={`${phase}:${data.checklists.find((c) => c.reference === move.reference && c.phase === phase)?.signedAt ?? JSON.stringify(data.checklists.find((c) => c.reference === move.reference && c.phase === phase)?.items)}`}
              reference={move.reference}
              phase={phase}
              initial={data.checklists.find(
                (c) => c.reference === move.reference && c.phase === phase,
              )}
              onSaved={reload}
            />
          ))}
          {move.status === "completed" && (
            <form
              className={s.form}
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                void act("review", {
                  rating: Number(f.get("rating")),
                  text: f.get("text"),
                });
              }}
            >
              <h3>Review your move</h3>
              <label>
                Rating
                <select name="rating" defaultValue="5">
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} stars
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Your experience
                <textarea
                  name="text"
                  minLength={5}
                  maxLength={1500}
                  required
                  defaultValue={
                    data.reviews.find((r) => r.reference === move.reference)
                      ?.text
                  }
                />
              </label>
              <button className="logistics-button" disabled={busy}>
                Submit for publication
              </button>
            </form>
          )}
          <form className={s.form} onSubmit={claim}>
            <h3>Report damage or a dispute</h3>
            <label>
              What happened?
              <textarea
                name="description"
                minLength={10}
                maxLength={2000}
                required
              />
            </label>
            <label>
              Evidence (up to 3 photos)
              <input
                name="photos"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
              />
            </label>
            <button disabled={busy} className="logistics-button">
              Open claim
            </button>
          </form>
          {data.claims
            .filter((c) => c.reference === move.reference)
            .map((c) => (
              <p className={s.note} key={c.id}>
                {c.status} · {c.description}
                <br />
                {c.notes || "Awaiting operations review."}
              </p>
            ))}
        </>
      )}
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
    </article>
  );
}
export function CustomerDashboard({
  businessOnly = false,
}: {
  businessOnly?: boolean;
}) {
  const [data, setData] = useState<Data | null>(null),
    [error, setError] = useState(""),
    [tab, setTab] = useState(
      businessOnly ? "Addresses & business" : "My moves",
    ),
    [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/marketplace", { cache: "no-store" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setData(d);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load account.");
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      const addresses = String(f.get("addresses"))
        .split("\n")
        .filter((l) => l.trim())
        .map((l) => {
          const [label, ...address] = l.split("|");
          return { label: label.trim(), address: address.join("|").trim() };
        });
      await api("account", {
        addresses,
        business: f.get("businessName")
          ? {
              name: f.get("businessName"),
              kind: f.get("businessKind"),
              cac: f.get("cac"),
            }
          : null,
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className={s.page}>
      <p className={s.eyebrow}>
        {businessOnly ? "BUSINESS ACCOUNTS" : "YOUR ACCOUNT"}
      </p>
      <h1>
        {businessOnly
          ? "One account. Every delivery."
          : "Your next chapter, organised."}
      </h1>
      <p className={s.intro}>
        Keep moves, addresses, condition records and payment receipts together.
        Book while signed in to save each move here.
      </p>
      <div className={s.row}>
        <Link href="/book" className="logistics-button">
          Book a move
        </Link>
        <Link href="/contact" className={s.link}>
          Get help
        </Link>
      </div>
      <div className={s.tabs}>
        {["My moves", "Addresses & business"].map((t) => (
          <button key={t} aria-pressed={tab === t} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className={s.error}>
          {error} <Link href="/auth?redirect=/profile">Sign in</Link>
        </p>
      )}
      {!data && !error && <p>Loading your account…</p>}
      {data &&
        (tab === "My moves" ? (
          <>
            {data.moves.length === 0 && (
              <div className={s.empty}>Your booked moves will appear here.</div>
            )}
            {data.moves.map((m) => (
              <MoveCard
                key={m.reference}
                move={m}
                data={data}
                reload={() => void load()}
              />
            ))}
          </>
        ) : (
          <form className={`${s.card} ${s.form}`} onSubmit={save}>
            <h2>Saved addresses</h2>
            <label>
              One address per line: label | address
              <textarea
                name="addresses"
                placeholder="Home | 10 Example Road, Lekki, Lagos"
                defaultValue={data.profile.addresses
                  .map((a) => `${a.label} | ${a.address}`)
                  .join("\n")}
              />
            </label>
            <h2>Business profile</h2>
            <p>
              Offices, furniture stores and estate agencies can reuse addresses
              and book repeat deliveries. Corporate rates and service
              arrangements are agreed with our team.
            </p>
            <label>
              Business name
              <input
                name="businessName"
                maxLength={120}
                defaultValue={data.profile.business?.name}
              />
            </label>
            <label>
              Business type
              <select
                name="businessKind"
                defaultValue={data.profile.business?.kind ?? "Office"}
              >
                {["Office", "Furniture store", "Estate agency", "Other"].map(
                  (k) => (
                    <option key={k}>{k}</option>
                  ),
                )}
              </select>
            </label>
            <label>
              CAC number (optional)
              <input
                name="cac"
                maxLength={80}
                defaultValue={data.profile.business?.cac}
              />
            </label>
            <button disabled={busy} className="logistics-button">
              {busy ? "Saving…" : "Save account details"}
            </button>
          </form>
        ))}
    </div>
  );
}

"use client";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
import s from "./Marketplace.module.css";
type Summary = {
  reference: string;
  quote: number | null;
  paidAmount: number;
  status: string;
  depositPercent: number;
  payments: {
    id: string;
    amount: number;
    purpose: string;
    status: string;
    paidAt?: string;
  }[];
};
export function Checkout() {
  const params = useSearchParams(),
    ref = params.get("move") ?? "",
    id = params.get("reference"),
    [data, setData] = useState<Summary | null>(null),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    const r = await fetch(
      `/api/marketplace?scope=checkout&reference=${encodeURIComponent(ref)}`,
      { cache: "no-store" },
    );
    const d = await r.json();
    if (!r.ok) throw new Error(d.error);
    setData(d);
  }, [ref]);
  useEffect(() => {
    let active = true;
    async function init() {
      try {
        if (id) {
          const r = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          });
          const d = await r.json();
          if (!r.ok) throw new Error(d.error);
          if (active) setNotice("Payment verified. Your receipt is below.");
        }
        await load();
      } catch (e) {
        if (active)
          setError(e instanceof Error ? e.message : "Could not load checkout.");
      }
    }
    void init();
    return () => {
      active = false;
    };
  }, [id, load]);
  async function pay(purpose: string) {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: ref, purpose }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      window.location.assign(d.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start payment.");
      setBusy(false);
    }
  }
  const deposit = data?.quote
      ? Math.max(
          0,
          Math.round((data.quote * data.depositPercent) / 100) -
            data.paidAmount,
        )
      : 0,
    balance = data?.quote ? Math.max(0, data.quote - data.paidAmount) : 0;
  return (
    <div className={s.page}>
      <p className={s.eyebrow}>SECURE CHECKOUT</p>
      <h1>
        A deposit today.
        <br />
        The balance on delivery.
      </h1>
      <p className={s.intro}>
        Pay through Paystack after our team reviews your photos and confirms the
        quote. Keep your move reference private.
      </p>
      {notice && (
        <p role="status" className={s.success}>
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className={s.error}>
          {error}
        </p>
      )}
      {data && (
        <>
          <div className={s.card}>
            <p className={s.muted}>{data.reference}</p>
            <h2>
              {data.quote
                ? formatMoney(data.quote)
                : "Your quote is under review"}
            </h2>
            <p>
              Paid {formatMoney(data.paidAmount)} · balance{" "}
              {formatMoney(balance)}
            </p>
            {data.quote && data.status !== "cancelled" && (
              <div className={s.row}>
                {deposit > 0 && (
                  <button
                    className="logistics-button"
                    disabled={busy}
                    onClick={() => void pay("deposit")}
                  >
                    Pay {data.depositPercent}% deposit · {formatMoney(deposit)}
                  </button>
                )}
                {data.status === "completed" && balance > 0 && (
                  <button
                    className="logistics-button"
                    disabled={busy}
                    onClick={() => void pay("balance")}
                  >
                    Pay balance · {formatMoney(balance)}
                  </button>
                )}
              </div>
            )}
            <p className={s.muted}>
              Balance payment opens after delivery. Booking is secured when the
              deposit is verified; crew details follow in tracking.
            </p>
            <Link href={`/track?reference=${ref}`} className={s.link}>
              Track this move
            </Link>
          </div>
          <h2>Receipts</h2>
          {data.payments.filter((p) => p.status === "paid").length === 0 ? (
            <p>No verified payments yet.</p>
          ) : (
            data.payments
              .filter((p) => p.status === "paid")
              .map((p) => (
                <article className={s.card} key={p.id}>
                  <p className={s.eyebrow}>PAYMENT RECEIPT · NGN</p>
                  <h3>{formatMoney(p.amount)}</h3>
                  <p>
                    {p.purpose} ·{" "}
                    {p.paidAt && new Date(p.paidAt).toLocaleString()}
                  </p>
                  <p>
                    Move {ref}
                    <br />
                    Payment {p.id}
                  </p>
                  <p>Verified by Paystack. EasyMoveZone payment receipt.</p>
                  <button className={s.link} onClick={() => window.print()}>
                    Print / save PDF
                  </button>
                </article>
              ))
          )}
        </>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import type { CashoutRow } from "@/lib/admin/marketplace-ops";

export function AdminCashoutsClient() {
  const [items, setItems] = useState<CashoutRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"failed" | "succeeded" | "all">("failed");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/cashouts?status=${filter}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("failed");
        return (await res.json()) as { items: CashoutRow[] };
      })
      .then((data) => setItems(data.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [filter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading cashouts…
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-xl font-bold">Cashout monitor</h1>
      <p className="mt-1 text-sm text-white/50">
        Failed Stripe transfers are logged here for ops follow-up. Wallet balance is not debited on failure.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {(["failed", "succeeded", "all"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${
              filter === s ? "bg-white text-[#0f172a]" : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-10 text-center text-white/30">
            No cashout records in this view.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{item.driverName}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        item.status === "failed"
                          ? "bg-red-400/15 text-red-300"
                          : "bg-emerald-400/15 text-emerald-300"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-1 text-lg font-bold text-[#f3aa79]">
                    ${(item.amountCents / 100).toFixed(2)}
                  </p>
                  <div className="mt-1 space-y-0.5 text-xs text-white/45">
                    <p>User: {item.payeeUserId}</p>
                    <p>{new Date(item.createdAt).toLocaleString()}</p>
                    {item.stripeTransferId ? <p>Transfer: {item.stripeTransferId}</p> : null}
                    <p>
                      Payouts {item.payoutsEnabled ? "enabled" : "disabled"}
                      {item.stripeAccountId ? ` · ${item.stripeAccountId}` : ""}
                    </p>
                  </div>
                </div>
                {item.status === "failed" ? (
                  <AlertTriangle className="h-5 w-5 text-red-300" />
                ) : null}
              </div>
              {item.error ? (
                <div className="mt-3 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {item.error}
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

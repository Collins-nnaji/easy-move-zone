"use client";

import { useEffect, useState } from "react";
import { Loader2, Star } from "lucide-react";
import type { DisputeFlag } from "@/lib/admin/marketplace-ops";

export function AdminDisputesClient() {
  const [items, setItems] = useState<DisputeFlag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/disputes")
      .then(async (res) => {
        if (!res.ok) throw new Error("failed");
        return (await res.json()) as { items: DisputeFlag[] };
      })
      .then((data) => setItems(data.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading dispute flags…
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-xl font-bold">Dispute flags</h1>
      <p className="mt-1 text-sm text-white/50">
        Low ratings (1–2 stars) on completed loads. Use this as a triage queue until formal disputes ship.
      </p>

      <div className="mt-6 space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-10 text-center text-white/30">
            No low-star ratings yet.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.ratingId} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{item.shiftTitle}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
                      <Star className="h-3 w-3 fill-current" />
                      {item.stars}/5
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-white/70">
                    Rated by {item.fromRole} · about {item.counterpartyName}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/45">
                    <span>{item.zone}</span>
                    <span>${item.payout}</span>
                    <span>Shift {item.shiftId.slice(0, 8)}…</span>
                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              {item.comment ? (
                <blockquote className="mt-3 rounded-xl border border-white/10 bg-[#0b0f17] px-3 py-2 text-sm text-white/75">
                  “{item.comment}”
                </blockquote>
              ) : (
                <p className="mt-3 text-xs text-white/35">No comment left.</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

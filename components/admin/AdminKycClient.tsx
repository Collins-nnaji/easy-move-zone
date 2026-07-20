"use client";

import { useEffect, useState } from "react";
import { Check, ExternalLink, Loader2, X } from "lucide-react";
import type { KycQueueItem } from "@/lib/admin/marketplace-ops";

export function AdminKycClient() {
  const [items, setItems] = useState<KycQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "all">("pending");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = (status: "pending" | "all") => {
    setLoading(true);
    fetch(`/api/admin/kyc?status=${status}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("failed");
        return (await res.json()) as { items: KycQueueItem[] };
      })
      .then((data) => setItems(data.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(filter);
  }, [filter]);

  async function review(id: string, action: "approve" | "reject") {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/kyc/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notes: notes[id] || undefined }),
      });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading KYC queue…
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-xl font-bold">KYC review queue</h1>
      <p className="mt-1 text-sm text-white/50">
        Approve driver compliance uploads before they count toward the Verified badge.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {(["pending", "all"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              filter === s ? "bg-white text-[#0f172a]" : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            {s === "pending" ? "Pending review" : "All uploads"}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-10 text-center text-white/30">
            No documents in this queue.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{item.driverName}</span>
                    <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
                      {item.status}
                    </span>
                    {item.driverVerified ? (
                      <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                        Profile verified
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-white/70">{item.name}</p>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/45">
                    <span>{item.zone || "No zone"}</span>
                    <span>{item.vehicleType || "vehicle n/a"}</span>
                    {item.fileName ? <span>{item.fileName}</span> : null}
                    <span>{new Date(item.updatedAt).toLocaleString()}</span>
                  </div>
                </div>
                {item.fileName ? (
                  <a
                    href={`/api/admin/kyc/${item.id}/file`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
                  >
                    View file
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : null}
              </div>

              <textarea
                value={notes[item.id] ?? ""}
                onChange={(e) => setNotes((prev) => ({ ...prev, [item.id]: e.target.value }))}
                placeholder="Optional reviewer notes"
                rows={2}
                className="mt-3 w-full rounded-xl border border-white/10 bg-[#0b0f17] px-3 py-2 text-sm text-white placeholder:text-white/30"
              />

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() => void review(item.id, "approve")}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
                >
                  {busyId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  Approve
                </button>
                <button
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() => void review(item.id, "reject")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-300 disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" />
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

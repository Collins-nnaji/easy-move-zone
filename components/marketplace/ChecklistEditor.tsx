"use client";
import { useState } from "react";
import Image from "next/image";
import type { Checklist, EvidenceItem } from "@/lib/marketplace/model";
import { api, photo } from "./client";
import s from "./Marketplace.module.css";
export function ChecklistEditor({
  reference,
  phase,
  initial,
  canSign = true,
  onSaved,
}: {
  reference: string;
  phase: "pickup" | "delivery";
  initial?: Checklist;
  canSign?: boolean;
  onSaved: () => void;
}) {
  const [items, setItems] = useState<EvidenceItem[]>(initial?.items ?? []),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  function change(id: string, patch: Partial<EvidenceItem>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }
  async function save(sign = false) {
    setBusy(true);
    setError("");
    try {
      await api("checklist", { reference, phase, items, sign });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className={s.checklist}>
      <h3>{phase === "pickup" ? "Pickup" : "Delivery"} condition checklist</h3>
      {initial?.signedAt ? (
        <>
          <p className={s.success}>
            Signed by {initial.signedBy} ·{" "}
            {new Date(initial.signedAt).toLocaleString()}
          </p>
          {initial.items.map((i) => (
            <p key={i.id}>
              {i.name} — {i.condition}{" "}
              {i.photo && (
                <Image
                  src={i.photo}
                  width={100}
                  height={80}
                  unoptimized
                  className={s.photo}
                  alt={`${i.name} condition`}
                />
              )}
            </p>
          ))}
        </>
      ) : (
        <>
          <p className={s.muted}>
            Record each item and its condition. Save, review, then the customer
            signs the saved record. Signed records are locked.
          </p>
          <div className={s.form}>
            {items.map((i) => (
              <div className={s.card} key={i.id}>
                <label>
                  Item
                  <input
                    maxLength={200}
                    value={i.name}
                    onChange={(e) => change(i.id, { name: e.target.value })}
                  />
                </label>
                <label>
                  Condition
                  <textarea
                    maxLength={500}
                    value={i.condition}
                    onChange={(e) =>
                      change(i.id, { condition: e.target.value })
                    }
                  />
                </label>
                <label>
                  Condition photo
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={busy}
                    onChange={async (e) => {
                      setBusy(true);
                      try {
                        change(i.id, {
                          photo: await photo(e.target.files?.[0]),
                        });
                      } catch (e) {
                        setError(String(e));
                      } finally {
                        setBusy(false);
                      }
                    }}
                  />
                </label>
                {i.photo && (
                  <Image
                    src={i.photo}
                    width={100}
                    height={80}
                    unoptimized
                    className={s.photo}
                    alt={i.name || "Item photo"}
                  />
                )}
                <button
                  type="button"
                  className={s.link}
                  onClick={() => setItems(items.filter((x) => x.id !== i.id))}
                >
                  Remove item
                </button>
              </div>
            ))}
          </div>
          <div className={s.row}>
            <button
              type="button"
              className={s.link}
              disabled={busy || items.length >= 100}
              onClick={() =>
                setItems([
                  ...items,
                  {
                    id: crypto.randomUUID(),
                    name: "",
                    condition: "",
                    photo: "",
                  },
                ])
              }
            >
              + Add item
            </button>
            <button
              type="button"
              className="logistics-button"
              disabled={busy || !items.length}
              onClick={() => void save()}
            >
              Save checklist
            </button>
            {canSign && initial?.items.length && (
              <button
                type="button"
                className={s.link}
                disabled={
                  busy ||
                  JSON.stringify(items) !== JSON.stringify(initial.items)
                }
                onClick={() => void save(true)}
              >
                I confirm the saved condition record · sign
              </button>
            )}
          </div>
        </>
      )}
      {error && (
        <p role="alert" className={s.error}>
          {error}
        </p>
      )}
    </section>
  );
}

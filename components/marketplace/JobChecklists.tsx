"use client";
import { useCallback, useEffect, useState } from "react";
import type { Checklist } from "@/lib/marketplace/model";
import { ChecklistEditor } from "./ChecklistEditor";
export function JobChecklists({ reference }: { reference: string }) {
  const [data, setData] = useState<Checklist[]>([]),
    [error, setError] = useState("");
  const load = useCallback(async () => {
    try {
      const r = await fetch(
        `/api/marketplace?scope=job&reference=${reference}`,
        { cache: "no-store" },
      );
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setData(d.checklists);
    } catch (e) {
      setError(String(e));
    }
  }, [reference]);
  useEffect(() => {
    void load();
  }, [load]);
  return (
    <>
      {error && <p role="alert">{error}</p>}
      {(["pickup", "delivery"] as const).map((phase) => (
        <ChecklistEditor
          key={phase + JSON.stringify(data.find((c) => c.phase === phase))}
          reference={reference}
          phase={phase}
          initial={data.find((c) => c.phase === phase)}
          canSign={false}
          onSaved={() => void load()}
        />
      ))}
    </>
  );
}

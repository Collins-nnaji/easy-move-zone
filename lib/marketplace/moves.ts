import "server-only";
import { marketplaceDb } from "./store";
import type { Move } from "@/lib/moving/model";
import { InputError } from "./http";
export async function customerMoves(userId: string): Promise<Move[]> {
  const sql = await marketplaceDb();
  const rows =
    await sql`SELECT data FROM emz_moves WHERE data->>'userId'=${userId} ORDER BY updated_at DESC LIMIT 100`;
  return rows.map((r) => r.data as Move);
}
/** Serialize scheduling changes, compare the version read, and reject crew/date conflicts atomically. */
export async function changeMove(current: Move, patch: Partial<Move>) {
  const sql = await marketplaceDb();
  const next = { ...current, ...patch };
  const results = await sql.transaction([
    sql`SELECT pg_advisory_xact_lock(719260101)`,
    sql`UPDATE emz_moves SET data=data || ${JSON.stringify(patch)}::jsonb, updated_at=now()
      WHERE reference=${current.reference} AND data=${JSON.stringify(current)}::jsonb
      AND (${next.quote === current.quote} OR NOT EXISTS (SELECT 1 FROM emz_marketplace WHERE kind='payment' AND owner_id=${current.reference} AND data->>'status'='pending'))
      AND (${next.status === "cancelled" || next.status === "completed"} OR NOT EXISTS (
        SELECT 1 FROM emz_moves other WHERE other.reference<>${current.reference}
        AND other.data->>'date'=${next.date} AND other.data->>'status' NOT IN ('cancelled','completed')
        AND ((${next.moverId}::text IS NOT NULL AND other.data->>'moverId'=${next.moverId}) OR (${next.vehicleId}::text IS NOT NULL AND other.data->>'vehicleId'=${next.vehicleId}))
      )) RETURNING data`,
  ]);
  const updated = results[1][0]?.data as Move | undefined;
  if (!updated)
    throw new InputError(
      "Move changed or crew/vehicle already booked on this date. Refresh and try again.",
      409,
    );
  return updated;
}

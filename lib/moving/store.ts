import "server-only";
import { database, ensureMovingStore } from "@/lib/database";
import type { Move } from "./model";
function asMove(data: Move): Move {
  return {
    ...data,
    moverId: typeof data.moverId === "string" ? data.moverId : null,
    vehicleId: typeof data.vehicleId === "string" ? data.vehicleId : null,
  };
}
async function db() {
  await ensureMovingStore();
  return database();
}
export async function saveMove(move: Move) {
  const sql = await db();
  const rows =
    await sql`INSERT INTO emz_moves(reference,data) VALUES (${move.reference},${JSON.stringify(move)}::jsonb) ON CONFLICT (reference) DO NOTHING RETURNING data`;
  if (rows[0]) return asMove(rows[0].data as Move);
  const existing = await getMove(move.reference);
  const keys = [
    "service",
    "inventory",
    "size",
    "pickup",
    "destination",
    "date",
    "pickupFloor",
    "destinationFloor",
    "access",
    "extras",
    "name",
    "email",
    "phone",
    "photos",
    "city",
    "distanceKm",
    "truckSize",
    "notifications",
    "userId",
  ] as const;
  if (
    !existing ||
    keys.some(
      (key) => JSON.stringify(existing[key]) !== JSON.stringify(move[key]),
    )
  )
    throw new Error("Request ID already used.");
  return existing;
}
export async function getMove(reference: string) {
  const sql = await db();
  const rows =
    await sql`SELECT data FROM emz_moves WHERE reference=${reference}`;
  return rows[0] ? asMove(rows[0].data as Move) : undefined;
}
export async function listMoves() {
  const sql = await db();
  const rows =
    await sql`SELECT data FROM emz_moves ORDER BY updated_at DESC LIMIT 100`;
  return rows.map((r) => asMove(r.data as Move));
}
export async function updateMove(
  reference: string,
  patch: Pick<Move, "status" | "quote" | "crew" | "arrival"> &
    Partial<Pick<Move, "moverId" | "vehicleId">>,
) {
  const sql = await db();
  const rows =
    await sql`UPDATE emz_moves SET data=data || ${JSON.stringify(patch)}::jsonb, updated_at=now() WHERE reference=${reference} RETURNING data`;
  return rows[0] ? asMove(rows[0].data as Move) : undefined;
}
export async function listJobsForWorker(workerId: string) {
  const sql = await db();
  const rows =
    await sql`SELECT data FROM emz_moves WHERE data->>'moverId'=${workerId} OR data->>'vehicleId'=${workerId} ORDER BY updated_at DESC LIMIT 50`;
  return rows.map((r) => asMove(r.data as Move));
}
export async function updateAssignedJob(
  workerId: string,
  reference: string,
  patch: Pick<Move, "status" | "arrival">,
) {
  const sql = await db();
  const rows =
    await sql`UPDATE emz_moves SET data=data || ${JSON.stringify(patch)}::jsonb, updated_at=now() WHERE reference=${reference} AND (data->>'moverId'=${workerId} OR data->>'vehicleId'=${workerId}) RETURNING data`;
  return rows[0] ? asMove(rows[0].data as Move) : undefined;
}

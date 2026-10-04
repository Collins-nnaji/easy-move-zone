import "server-only";
import { database, ensureMovingStore } from "@/lib/database";
import type { Worker } from "./workers";

async function db() {
  await ensureMovingStore();
  return database();
}

function asWorker(data: Worker): Worker {
  return { ...data, userId: data.userId ?? null };
}

export async function saveWorker(worker: Worker) {
  const sql = await db();
  const rows =
    await sql`INSERT INTO emz_workers(id, user_id, data) VALUES (${worker.id}, ${worker.userId}, ${JSON.stringify(worker)}::jsonb) RETURNING data`;
  return asWorker(rows[0].data as Worker);
}

export async function replaceWorker(worker: Worker) {
  const sql = await db();
  const rows =
    await sql`UPDATE emz_workers SET user_id=${worker.userId}, data=${JSON.stringify(worker)}::jsonb, updated_at=now() WHERE id=${worker.id} RETURNING data`;
  return rows[0] ? asWorker(rows[0].data as Worker) : undefined;
}

export async function getWorker(id: string) {
  const sql = await db();
  const rows = await sql`SELECT data FROM emz_workers WHERE id=${id}`;
  return rows[0] ? asWorker(rows[0].data as Worker) : undefined;
}

export async function getWorkerByUser(userId: string) {
  const sql = await db();
  const rows =
    await sql`SELECT data FROM emz_workers WHERE user_id=${userId}`;
  return rows[0] ? asWorker(rows[0].data as Worker) : undefined;
}

export async function getWorkerByEmail(email: string) {
  const sql = await db();
  const rows =
    await sql`SELECT data FROM emz_workers WHERE lower(data->>'email')=${email.toLowerCase()}`;
  return rows[0] ? asWorker(rows[0].data as Worker) : undefined;
}

export async function listWorkers() {
  const sql = await db();
  const rows =
    await sql`SELECT data FROM emz_workers ORDER BY updated_at DESC LIMIT 200`;
  return rows.map((row) => asWorker(row.data as Worker));
}

export async function resolveWorkerForUser(user: {
  userId: string;
  email: string;
}) {
  const owned = await getWorkerByUser(user.userId);
  if (owned) return owned;
  const byEmail = await getWorkerByEmail(user.email);
  if (!byEmail || byEmail.userId) return null;
  return replaceWorker({ ...byEmail, userId: user.userId });
}

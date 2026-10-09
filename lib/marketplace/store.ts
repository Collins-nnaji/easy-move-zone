import "server-only";
import { database, ensureMovingStore } from "@/lib/database";
import {
  DEFAULT_PRICING,
  EMPTY_VERIFICATION,
  type PricingRules,
  type Account,
  type WorkerExtras,
} from "./model";
let ready: Promise<void> | null = null;
export async function marketplaceDb() {
  await ensureMovingStore();
  if (!ready)
    ready = (async () => {
      const sql = database();
      await sql`CREATE TABLE IF NOT EXISTS emz_marketplace (kind text NOT NULL, id text NOT NULL, owner_id text NOT NULL DEFAULT '', data jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(kind,id))`;
      await sql`CREATE INDEX IF NOT EXISTS emz_marketplace_owner ON emz_marketplace(kind,owner_id)`;
      await sql`CREATE INDEX IF NOT EXISTS emz_moves_owner ON emz_moves((data->>'userId'))`;
    })().catch((e) => {
      ready = null;
      throw e;
    });
  await ready;
  return database();
}
export async function getRecord<T>(
  kind: string,
  id: string,
): Promise<T | null> {
  const sql = await marketplaceDb();
  const rows =
    await sql`SELECT data FROM emz_marketplace WHERE kind=${kind} AND id=${id}`;
  return (rows[0]?.data as T) ?? null;
}
export async function putRecord<T>(
  kind: string,
  id: string,
  data: T,
  owner = "",
) {
  const sql = await marketplaceDb();
  await sql`INSERT INTO emz_marketplace(kind,id,owner_id,data) VALUES(${kind},${id},${owner},${JSON.stringify(data)}::jsonb) ON CONFLICT(kind,id) DO UPDATE SET data=excluded.data, owner_id=excluded.owner_id, updated_at=now()`;
  return data;
}
export async function listRecords<T>(
  kind: string,
  owner?: string,
): Promise<T[]> {
  const sql = await marketplaceDb();
  const rows =
    owner === undefined
      ? await sql`SELECT data FROM emz_marketplace WHERE kind=${kind} ORDER BY updated_at DESC LIMIT 500`
      : await sql`SELECT data FROM emz_marketplace WHERE kind=${kind} AND owner_id=${owner} ORDER BY updated_at DESC LIMIT 500`;
  return rows.map((r) => r.data as T);
}
export async function pricing() {
  return (
    (await getRecord<PricingRules>("settings", "pricing")) ?? DEFAULT_PRICING
  );
}
export async function account(userId: string) {
  return (
    (await getRecord<Account>("account", userId)) ?? {
      addresses: [],
      business: null,
    }
  );
}
export async function workerExtras(workerId: string): Promise<WorkerExtras> {
  return (
    (await getRecord<WorkerExtras>("worker", workerId)) ?? {
      workerId,
      available: true,
      verification: { ...EMPTY_VERIFICATION },
      fleet: [],
    }
  );
}

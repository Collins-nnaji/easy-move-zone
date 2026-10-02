import "server-only";
import { neon } from "@neondatabase/serverless";
import { DEFAULT_CATALOG, visibleCatalog, type ProduceCatalog } from "./model";
import type { Shipment } from "./shipments";
const url = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL;
const sql = url ? neon(url) : null;
let ready: Promise<void> | null = null;
export function database() {
  if (!sql) throw new Error("Database is not configured.");
  return sql;
}
export async function ensureProduceStore() {
  if (!ready)
    ready = (async () => {
      const db = database();
      await db`CREATE TABLE IF NOT EXISTS emz_produce_catalog (id integer PRIMARY KEY, content jsonb NOT NULL, revision integer NOT NULL DEFAULT 1, updated_at timestamptz NOT NULL DEFAULT now())`;
      await db`INSERT INTO emz_produce_catalog (id,content) VALUES (1,${JSON.stringify(DEFAULT_CATALOG)}::jsonb) ON CONFLICT DO NOTHING`;
      await db`CREATE TABLE IF NOT EXISTS emz_produce_shipments (reference text PRIMARY KEY, data jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())`;
      await db`CREATE TABLE IF NOT EXISTS emz_produce_media (id uuid PRIMARY KEY, name text NOT NULL, content_type text NOT NULL, data text NOT NULL, created_at timestamptz NOT NULL DEFAULT now())`;
      await db`CREATE INDEX IF NOT EXISTS emz_produce_shipments_updated_idx ON emz_produce_shipments(updated_at DESC)`;
      await db`CREATE TABLE IF NOT EXISTS contact_submissions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT, subject TEXT, message TEXT NOT NULL, page_context TEXT, status TEXT DEFAULT 'new' CHECK(status IN ('new','read','replied','archived')), created_at TIMESTAMPTZ DEFAULT now())`;
      await db`CREATE TABLE IF NOT EXISTS emz_enquiry_states (id text PRIMARY KEY, status text NOT NULL DEFAULT 'new', notes text NOT NULL DEFAULT '', updated_at timestamptz NOT NULL DEFAULT now())`;
    })().catch((err) => {
      ready = null;
      throw err;
    });
  await ready;
}
export async function readCatalog() {
  await ensureProduceStore();
  const rows =
    await database()`SELECT content,revision FROM emz_produce_catalog WHERE id=1`;
  return {
    catalog: {
      ...DEFAULT_CATALOG,
      ...rows[0].content,
      settings: { ...DEFAULT_CATALOG.settings, ...rows[0].content.settings },
    } as ProduceCatalog,
    revision: rows[0].revision as number,
  };
}
export async function publicCatalog() {
  try {
    return visibleCatalog((await readCatalog()).catalog);
  } catch {
    return visibleCatalog(DEFAULT_CATALOG);
  }
}
export async function writeCatalog(catalog: ProduceCatalog, revision: number) {
  await ensureProduceStore();
  const rows =
    await database()`UPDATE emz_produce_catalog SET content=${JSON.stringify(catalog)}::jsonb,revision=revision+1,updated_at=now() WHERE id=1 AND revision=${revision} RETURNING revision`;
  return rows[0]?.revision as number | undefined;
}
export type ManagedShipment = Shipment & {
  internalNotes?: string;
  updatedAt?: string;
};
export async function createShipment(shipment: Shipment) {
  await ensureProduceStore();
  const rows =
    await database()`INSERT INTO emz_produce_shipments (reference,data) VALUES (${shipment.reference},${JSON.stringify(shipment)}::jsonb) ON CONFLICT (reference) DO NOTHING RETURNING data`;
  if (rows[0]) return rows[0].data as Shipment;
  const existing = await readShipment(shipment.reference);
  if (
    !existing ||
    existing.contact !== shipment.contact ||
    existing.originId !== shipment.originId ||
    existing.destinationId !== shipment.destinationId ||
    existing.commodityId !== shipment.commodityId ||
    existing.tonnes !== shipment.tonnes ||
    existing.readyDate !== shipment.readyDate
  )
    throw new Error("Request ID already used for a different delivery.");
  return existing;
}
export async function readShipment(
  reference: string,
): Promise<ManagedShipment | null> {
  await ensureProduceStore();
  const rows =
    await database()`SELECT data,updated_at FROM emz_produce_shipments WHERE reference=${reference}`;
  return rows[0]
    ? {
        ...(rows[0].data as ManagedShipment),
        updatedAt: new Date(rows[0].updated_at).toISOString(),
      }
    : null;
}

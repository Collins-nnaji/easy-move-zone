import "server-only";
import { neon } from "@neondatabase/serverless";
const url = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL;
const sql = url ? neon(url) : null;
export function database() {
  if (!sql) throw new Error("Database is not configured.");
  return sql;
}
let ready: Promise<void> | null = null;
export async function ensureMovingStore() {
  if (!ready)
    ready = (async () => {
      const db = database();
      await db`CREATE TABLE IF NOT EXISTS public.emz_moves (reference text PRIMARY KEY, data jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())`;
      await db`CREATE INDEX IF NOT EXISTS emz_moves_updated_idx ON public.emz_moves(updated_at DESC)`;
      await db`CREATE TABLE IF NOT EXISTS public.contact_submissions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, email text NOT NULL, phone text, subject text, message text NOT NULL, page_context text, status text DEFAULT 'new' CHECK(status IN ('new','read','replied','archived')), created_at timestamptz DEFAULT now())`;
      await db`CREATE TABLE IF NOT EXISTS public.emz_enquiry_states (id text PRIMARY KEY, status text NOT NULL DEFAULT 'new', notes text NOT NULL DEFAULT '', updated_at timestamptz NOT NULL DEFAULT now())`;
      await db`CREATE TABLE IF NOT EXISTS public.emz_workers (id text PRIMARY KEY, user_id text UNIQUE, data jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())`;
    })().catch((error) => {
      ready = null;
      throw error;
    });
  await ready;
}

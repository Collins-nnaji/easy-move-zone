import { neon } from "@neondatabase/serverless"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

let ensured = false

export async function ensureFeaturedJobsTable() {
  if (!sql || ensured) return
  await sql`
    create table if not exists mobility_featured_jobs (
      external_job_id text primary key,
      featured boolean not null default true,
      note text,
      updated_at timestamptz not null default now(),
      updated_by text
    )
  `
  ensured = true
}

export async function listFeaturedJobIds(): Promise<string[]> {
  if (!sql) return []
  await ensureFeaturedJobsTable()
  const rows = await sql`
    select external_job_id
    from mobility_featured_jobs
    where featured = true
    order by updated_at desc
  `
  return rows.map((row) => String((row as { external_job_id: string }).external_job_id))
}

export async function listFeaturedJobMap(): Promise<Record<string, boolean>> {
  if (!sql) return {}
  await ensureFeaturedJobsTable()
  const rows = await sql`
    select external_job_id, featured
    from mobility_featured_jobs
  `
  const map: Record<string, boolean> = {}
  for (const row of rows as { external_job_id: string; featured: boolean }[]) {
    map[String(row.external_job_id)] = Boolean(row.featured)
  }
  return map
}

export async function setJobFeatured(opts: {
  externalJobId: string
  featured: boolean
  note?: string | null
  updatedBy?: string | null
}) {
  if (!sql) throw new Error("DATABASE_URL is not configured.")
  await ensureFeaturedJobsTable()
  await sql`
    insert into mobility_featured_jobs (external_job_id, featured, note, updated_at, updated_by)
    values (${opts.externalJobId}, ${opts.featured}, ${opts.note ?? null}, now(), ${opts.updatedBy ?? null})
    on conflict (external_job_id) do update set
      featured = excluded.featured,
      note = coalesce(excluded.note, mobility_featured_jobs.note),
      updated_at = now(),
      updated_by = excluded.updated_by
  `
}

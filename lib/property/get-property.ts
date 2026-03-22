import { neon } from "@neondatabase/serverless"
import type { PropertyRow } from "@/lib/property/db-row"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL

export async function getPropertyById(id: string, incrementViews = true): Promise<PropertyRow | null> {
  if (!DATABASE_URL) return null
  const sql = neon(DATABASE_URL)
  try {
    const rows = await sql`SELECT * FROM properties WHERE id = ${id} LIMIT 1`
    const row = rows[0] as PropertyRow | undefined
    if (!row) return null
    if (incrementViews) {
      await sql`UPDATE properties SET view_count = COALESCE(view_count, 0) + 1 WHERE id = ${id}`
    }
    return row
  } catch {
    return null
  }
}

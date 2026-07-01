import { neon } from "@neondatabase/serverless"
import { neonAuth } from "@neondatabase/auth/next/server"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

export async function POST(request: Request) {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })

    const authUserId = String(user.id)
    const body = (await request.json()) as {
      name?: string
      citySlug?: string
      budgetMin?: number | null
      budgetMax?: number | null
    }

    const name = String(body.name ?? "").trim()
    if (!name) return Response.json({ error: "Search name is required." }, { status: 400 })

    await sql.query(
      `insert into user_profiles (auth_user_id, role, preferred_contact_method)
       values ($1, 'buyer', 'email')
       on conflict (auth_user_id) do nothing`,
      [authUserId],
    )

    const rowsRaw = await sql.query(
      `insert into user_saved_searches (
         auth_user_id, name, city_slug, listing_type, budget_min, budget_max, bedrooms_min
       ) values ($1,$2,$3,null,$4,$5,null)
       returning id, name, city_slug, budget_min, budget_max, created_at`,
      [
        authUserId,
        name,
        body.citySlug?.trim() ? body.citySlug.trim() : null,
        body.budgetMin ?? null,
        body.budgetMax ?? null,
      ],
    )

    const row = (rowsRaw as Array<{
      id: string
      name: string
      city_slug: string | null
      budget_min: number | null
      budget_max: number | null
      created_at: string
    }>)[0]
    if (!row) return Response.json({ error: "Unable to create saved search." }, { status: 500 })

    return Response.json(
      {
        savedSearch: {
          id: row.id,
          name: row.name,
          citySlug: row.city_slug,
          budgetMin: row.budget_min,
          budgetMax: row.budget_max,
          createdAt: new Date(row.created_at).toISOString(),
        },
      },
      { status: 200 },
    )
  } catch {
    return Response.json({ error: "Unable to create saved search." }, { status: 500 })
  }
}

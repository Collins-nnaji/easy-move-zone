import { neon } from "@neondatabase/serverless"
import { neonAuth } from "@neondatabase/auth/next/server"
import type { WorkMode } from "@/lib/relocate/types"
import {
  EMPTY_PROFILE,
  type ContactMethod,
  type MoveStayPreference,
  type SavedSearch,
  type UserProfile,
} from "@/lib/profile/types"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

const WORK_MODES = new Set<WorkMode>(["onsite", "hybrid", "remote", "business_owner", "student"])
const STAY_PREFS = new Set<MoveStayPreference>(["trip", "nomad", "move"])

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean)
  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim()).filter(Boolean)
  }
  return []
}

function normalizeInput(input: Partial<UserProfile>): UserProfile {
  const preferredContactMethod: ContactMethod =
    input.preferredContactMethod === "phone" || input.preferredContactMethod === "whatsapp"
      ? input.preferredContactMethod
      : "email"
  const moveWorkMode = WORK_MODES.has(input.moveWorkMode as WorkMode) ? (input.moveWorkMode as WorkMode) : null
  const moveStayPreference = STAY_PREFS.has(input.moveStayPreference as MoveStayPreference)
    ? (input.moveStayPreference as MoveStayPreference)
    : null

  return {
    ...EMPTY_PROFILE,
    fullName: String(input.fullName ?? "").trim(),
    phone: String(input.phone ?? "").trim(),
    preferredContactMethod,
    nationality: String(input.nationality ?? "").trim(),
    movePreferredDestinations: toArray(input.movePreferredDestinations),
    moveWorkMode,
    moveStayPreference,
    moveNotes: String(input.moveNotes ?? "").trim(),
    isAgent: Boolean(input.isAgent ?? false),
    agentLicense: String(input.agentLicense ?? "").trim(),
    agentCompany: String(input.agentCompany ?? "").trim(),
    agentBio: String(input.agentBio ?? "").trim(),
  }
}

interface ProfileRow {
  role: "buyer" | "seller"
  full_name: string | null
  phone: string | null
  preferred_contact_method: ContactMethod
  nationality: string | null
  move_preferred_destinations: string[] | null
  move_work_mode: WorkMode | null
  move_stay_preference: MoveStayPreference | null
  move_notes: string | null
  is_agent: boolean | null
  agent_license: string | null
  agent_company: string | null
  agent_bio: string | null
  agent_verified: boolean | null
}

function mapRow(row: ProfileRow | undefined): UserProfile {
  if (!row) return { ...EMPTY_PROFILE }
  return {
    role: row.role,
    fullName: row.full_name ?? "",
    phone: row.phone ?? "",
    preferredContactMethod: row.preferred_contact_method ?? "email",
    nationality: row.nationality ?? "",
    movePreferredDestinations: row.move_preferred_destinations ?? [],
    moveWorkMode: row.move_work_mode,
    moveStayPreference: row.move_stay_preference,
    moveNotes: row.move_notes ?? "",
    isAgent: row.is_agent ?? false,
    agentLicense: row.agent_license ?? "",
    agentCompany: row.agent_company ?? "",
    agentBio: row.agent_bio ?? "",
    agentVerified: row.agent_verified ?? false,
  }
}

const PROFILE_COLUMNS = `role, full_name, phone, preferred_contact_method,
  nationality, move_preferred_destinations, move_work_mode, move_stay_preference, move_notes,
  is_agent, agent_license, agent_company, agent_bio, agent_verified`

const PROFILE_COLUMNS_LEGACY = `role, full_name, phone, preferred_contact_method,
  is_agent, agent_license, agent_company, agent_bio, agent_verified`

async function loadProfile(authUserId: string): Promise<UserProfile> {
  try {
    const profileRaw = await sql!.query(
      `select ${PROFILE_COLUMNS} from user_profiles where auth_user_id = $1 limit 1`,
      [authUserId],
    )
    return mapRow((profileRaw as ProfileRow[])[0])
  } catch {
    const profileRaw = await sql!.query(
      `select ${PROFILE_COLUMNS_LEGACY} from user_profiles where auth_user_id = $1 limit 1`,
      [authUserId],
    )
    const row = (profileRaw as ProfileRow[])[0]
    if (!row) return { ...EMPTY_PROFILE }
    return mapRow({ ...row, nationality: null, move_preferred_destinations: null, move_work_mode: null, move_stay_preference: null, move_notes: null })
  }
}

async function saveProfileRow(authUserId: string, profile: UserProfile): Promise<UserProfile> {
  try {
    const rowsRaw = await sql!.query(
      `insert into user_profiles (
         auth_user_id, role, preferred_contact_method, full_name, phone,
         nationality, move_preferred_destinations, move_work_mode, move_stay_preference, move_notes, updated_at
       ) values ($1, 'buyer', $2, $3, $4, $5, $6, $7, $8, $9, now())
       on conflict (auth_user_id) do update set
         full_name = excluded.full_name,
         phone = excluded.phone,
         preferred_contact_method = excluded.preferred_contact_method,
         nationality = excluded.nationality,
         move_preferred_destinations = excluded.move_preferred_destinations,
         move_work_mode = excluded.move_work_mode,
         move_stay_preference = excluded.move_stay_preference,
         move_notes = excluded.move_notes,
         updated_at = now()
       returning ${PROFILE_COLUMNS}`,
      [
        authUserId,
        profile.preferredContactMethod,
        profile.fullName || null,
        profile.phone || null,
        profile.nationality || null,
        profile.movePreferredDestinations,
        profile.moveWorkMode,
        profile.moveStayPreference,
        profile.moveNotes || null,
      ],
    )
    const row = (rowsRaw as ProfileRow[])[0]
    if (!row) throw new Error("save failed")
    return mapRow(row)
  } catch {
    const rowsRaw = await sql!.query(
      `insert into user_profiles (auth_user_id, role, preferred_contact_method, full_name, phone, updated_at)
       values ($1, 'buyer', $2, $3, $4, now())
       on conflict (auth_user_id) do update set
         full_name = excluded.full_name,
         phone = excluded.phone,
         preferred_contact_method = excluded.preferred_contact_method,
         updated_at = now()
       returning ${PROFILE_COLUMNS_LEGACY}`,
      [authUserId, profile.preferredContactMethod, profile.fullName || null, profile.phone || null],
    )
    const row = (rowsRaw as ProfileRow[])[0]
    if (!row) throw new Error("save failed")
    return mapRow({ ...row, nationality: null, move_preferred_destinations: null, move_work_mode: null, move_stay_preference: null, move_notes: null })
  }
}

async function loadSavedSearches(authUserId: string): Promise<SavedSearch[]> {
  if (!sql) return []
  const exists = await sql.query(
    `select table_name from information_schema.tables where table_name = 'user_saved_searches' limit 1`,
    [],
  )
  if (!Array.isArray(exists) || exists.length === 0) return []
  const rowsRaw = await sql.query(
    `select id, name, city_slug, budget_min, budget_max, created_at
     from user_saved_searches
     where auth_user_id = $1
     order by created_at desc
     limit 50`,
    [authUserId],
  )
  return (rowsRaw as Array<{
    id: string
    name: string
    city_slug: string | null
    budget_min: number | null
    budget_max: number | null
    created_at: string
  }>).map((item) => ({
    id: item.id,
    name: item.name,
    citySlug: item.city_slug,
    budgetMin: item.budget_min,
    budgetMax: item.budget_max,
    createdAt: new Date(item.created_at).toISOString(),
  }))
}

export async function GET() {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (!sql) return Response.json({ profile: EMPTY_PROFILE, savedSearches: [] }, { status: 200 })

    const authUserId = String(user.id)
    const [profile, savedSearches] = await Promise.all([
      loadProfile(authUserId),
      loadSavedSearches(authUserId),
    ])
    return Response.json({ profile, savedSearches }, { status: 200 })
  } catch {
    return Response.json({ error: "Unable to load profile." }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })

    const authUserId = String(user.id)
    const body = (await request.json()) as { profile?: Partial<UserProfile> }
    const profile = normalizeInput(body.profile ?? {})
    const saved = await saveProfileRow(authUserId, profile)
    return Response.json({ profile: saved }, { status: 200 })
  } catch {
    return Response.json({ error: "Unable to update profile." }, { status: 500 })
  }
}

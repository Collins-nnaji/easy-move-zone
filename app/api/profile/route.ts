import { neon } from "@neondatabase/serverless"
import { neonAuth } from "@neondatabase/auth/next/server"
import { EMPTY_PROFILE, type ContactMethod, type UserProfile } from "@/lib/profile/types"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

function normalizeInput(input: Partial<UserProfile>): UserProfile {
  const preferredContactMethod: ContactMethod =
    input.preferredContactMethod === "phone" || input.preferredContactMethod === "whatsapp"
      ? input.preferredContactMethod
      : "email"

  return {
    ...EMPTY_PROFILE,
    fullName: String(input.fullName ?? "").trim(),
    phone: String(input.phone ?? "").trim(),
    preferredContactMethod,
    nationality: String(input.nationality ?? "").trim(),
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
    isAgent: row.is_agent ?? false,
    agentLicense: row.agent_license ?? "",
    agentCompany: row.agent_company ?? "",
    agentBio: row.agent_bio ?? "",
    agentVerified: row.agent_verified ?? false,
  }
}

const PROFILE_COLUMNS = `role, full_name, phone, preferred_contact_method,
  nationality, is_agent, agent_license, agent_company, agent_bio, agent_verified`

async function loadProfile(authUserId: string): Promise<UserProfile> {
  const profileRaw = await sql!.query(
    `select ${PROFILE_COLUMNS} from user_profiles where auth_user_id = $1 limit 1`,
    [authUserId],
  )
  return mapRow((profileRaw as ProfileRow[])[0])
}

async function saveProfileRow(authUserId: string, profile: UserProfile): Promise<UserProfile> {
  const rowsRaw = await sql!.query(
    `insert into user_profiles (
       auth_user_id, role, preferred_contact_method, full_name, phone, nationality, updated_at
     ) values ($1, 'buyer', $2, $3, $4, $5, now())
     on conflict (auth_user_id) do update set
       full_name = excluded.full_name,
       phone = excluded.phone,
       preferred_contact_method = excluded.preferred_contact_method,
       nationality = excluded.nationality,
       updated_at = now()
     returning ${PROFILE_COLUMNS}`,
    [authUserId, profile.preferredContactMethod, profile.fullName || null, profile.phone || null, profile.nationality || null],
  )
  const row = (rowsRaw as ProfileRow[])[0]
  if (!row) throw new Error("save failed")
  return mapRow(row)
}

export async function GET() {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (!sql) return Response.json({ profile: EMPTY_PROFILE }, { status: 200 })

    const authUserId = String(user.id)
    const profile = await loadProfile(authUserId)
    return Response.json({ profile }, { status: 200 })
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

import { neon } from "@neondatabase/serverless"
import { neonAuth } from "@neondatabase/auth/next/server"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

type ContactMethod = "email" | "phone" | "whatsapp"
type ListingType = "rent" | "buy" | "commercial"
type ProfileRole = "buyer" | "seller"
const ownershipListingTypes = new Set<ListingType>(["buy", "commercial"])

interface ProfilePayload {
  role: ProfileRole
  fullName: string
  phone: string
  preferredContactMethod: ContactMethod
  buyerPreferredCities: string[]
  buyerListingTypes: ListingType[]
  buyerBudgetMin: number | null
  buyerBudgetMax: number | null
  buyerBedroomsMin: number | null
  buyerNotes: string
  sellerCompanyName: string
  sellerLicense: string
  sellerServiceCities: string[]
  sellerPropertyTypes: ListingType[]
  sellerNotes: string
  isAgent: boolean
  agentLicense: string
  agentCompany: string
  agentBio: string
  agentVerified: boolean
}

interface SavedSearchPayload {
  id: string
  name: string
  citySlug: string | null
  listingType: ListingType | null
  budgetMin: number | null
  budgetMax: number | null
  bedroomsMin: number | null
  createdAt: string
}

function normalizeProfileInput(input: Partial<ProfilePayload>): ProfilePayload {
  const toArray = (value: unknown): string[] =>
    Array.isArray(value) ? value.map(String).map((item) => item.trim()).filter(Boolean) : []
  const toNumber = (value: unknown): number | null => {
    if (value === null || value === undefined || value === "") return null
    const cast = Number(value)
    return Number.isFinite(cast) ? cast : null
  }
  const role = input.role === "seller" ? "seller" : "buyer"
  const preferredContactMethod: ContactMethod =
    input.preferredContactMethod === "phone" || input.preferredContactMethod === "whatsapp"
      ? input.preferredContactMethod
      : "email"
  const sanitizeTypes = (value: unknown): ListingType[] =>
    toArray(value).filter((item): item is ListingType => ownershipListingTypes.has(item as ListingType))

  return {
    role,
    fullName: String(input.fullName ?? "").trim(),
    phone: String(input.phone ?? "").trim(),
    preferredContactMethod,
    buyerPreferredCities: toArray(input.buyerPreferredCities),
    buyerListingTypes: sanitizeTypes(input.buyerListingTypes),
    buyerBudgetMin: toNumber(input.buyerBudgetMin),
    buyerBudgetMax: toNumber(input.buyerBudgetMax),
    buyerBedroomsMin: toNumber(input.buyerBedroomsMin),
    buyerNotes: String(input.buyerNotes ?? "").trim(),
    sellerCompanyName: String(input.sellerCompanyName ?? "").trim(),
    sellerLicense: String(input.sellerLicense ?? "").trim(),
    sellerServiceCities: toArray(input.sellerServiceCities),
    sellerPropertyTypes: sanitizeTypes(input.sellerPropertyTypes),
    sellerNotes: String(input.sellerNotes ?? "").trim(),
    isAgent: Boolean(input.isAgent ?? false),
    agentLicense: String(input.agentLicense ?? "").trim(),
    agentCompany: String(input.agentCompany ?? "").trim(),
    agentBio: String(input.agentBio ?? "").trim(),
    agentVerified: false,
  }
}

const emptyProfile: ProfilePayload = {
  role: "buyer",
  fullName: "",
  phone: "",
  preferredContactMethod: "email",
  buyerPreferredCities: [],
  buyerListingTypes: [],
  buyerBudgetMin: null,
  buyerBudgetMax: null,
  buyerBedroomsMin: null,
  buyerNotes: "",
  sellerCompanyName: "",
  sellerLicense: "",
  sellerServiceCities: [],
  sellerPropertyTypes: [],
  sellerNotes: "",
  isAgent: false,
  agentLicense: "",
  agentCompany: "",
  agentBio: "",
  agentVerified: false,
}

export async function GET() {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (!sql) return Response.json({ profile: emptyProfile, savedSearches: [] }, { status: 200 })
    const authUserId = String(user.id)

    const [profileRaw, searchesRaw] = await Promise.all([
      sql.query(
        `select
          role,
          full_name,
          phone,
          preferred_contact_method,
          buyer_preferred_cities,
          buyer_listing_types,
          buyer_budget_min,
          buyer_budget_max,
          buyer_bedrooms_min,
          buyer_notes,
          seller_company_name,
          seller_license,
          seller_service_cities,
          seller_property_types,
          seller_notes,
          is_agent,
          agent_license,
          agent_company,
          agent_bio,
          agent_verified
        from user_profiles
        where user_id = $1
        limit 1`,
        [authUserId],
      ),
      // user_saved_searches may not exist yet — graceful fallback
      sql.query(
        `select table_name from information_schema.tables
         where table_name = 'user_saved_searches' limit 1`,
        [],
      ).then(async (exists) => {
        if (!Array.isArray(exists) || exists.length === 0) return []
        return sql.query(
          `select id, name, city_slug, listing_type, budget_min, budget_max, bedrooms_min, created_at
           from user_saved_searches
           where user_id = $1
           order by created_at desc
           limit 50`,
          [authUserId],
        )
      }),
    ])

    const profileRows = profileRaw as Array<{
      role: ProfileRole
      full_name: string | null
      phone: string | null
      preferred_contact_method: ContactMethod
      buyer_preferred_cities: string[] | null
      buyer_listing_types: ListingType[] | null
      buyer_budget_min: number | null
      buyer_budget_max: number | null
      buyer_bedrooms_min: number | null
      buyer_notes: string | null
      seller_company_name: string | null
      seller_license: string | null
      seller_service_cities: string[] | null
      seller_property_types: ListingType[] | null
      seller_notes: string | null
      is_agent: boolean | null
      agent_license: string | null
      agent_company: string | null
      agent_bio: string | null
      agent_verified: boolean | null
    }>

    const row = profileRows[0]
    const sanitizeStoredTypes = (value: ListingType[] | null | undefined): ListingType[] =>
      (value ?? []).filter((item) => ownershipListingTypes.has(item))
    const profile: ProfilePayload = row
      ? {
          role: row.role,
          fullName: row.full_name ?? "",
          phone: row.phone ?? "",
          preferredContactMethod: row.preferred_contact_method ?? "email",
          buyerPreferredCities: row.buyer_preferred_cities ?? [],
          buyerListingTypes: sanitizeStoredTypes(row.buyer_listing_types),
          buyerBudgetMin: row.buyer_budget_min,
          buyerBudgetMax: row.buyer_budget_max,
          buyerBedroomsMin: row.buyer_bedrooms_min,
          buyerNotes: row.buyer_notes ?? "",
          sellerCompanyName: row.seller_company_name ?? "",
          sellerLicense: row.seller_license ?? "",
          sellerServiceCities: row.seller_service_cities ?? [],
          sellerPropertyTypes: sanitizeStoredTypes(row.seller_property_types),
          sellerNotes: row.seller_notes ?? "",
          isAgent: row.is_agent ?? false,
          agentLicense: row.agent_license ?? "",
          agentCompany: row.agent_company ?? "",
          agentBio: row.agent_bio ?? "",
          agentVerified: row.agent_verified ?? false,
        }
      : emptyProfile

    const searchRows = searchesRaw as Array<{
      id: string
      name: string
      city_slug: string | null
      listing_type: ListingType | null
      budget_min: number | null
      budget_max: number | null
      bedrooms_min: number | null
      created_at: string
    }>
    const savedSearches: SavedSearchPayload[] = searchRows.map((item) => ({
      id: item.id,
      name: item.name,
      citySlug: item.city_slug,
      listingType: item.listing_type === "rent" ? null : item.listing_type,
      budgetMin: item.budget_min,
      budgetMax: item.budget_max,
      bedroomsMin: item.bedrooms_min,
      createdAt: new Date(item.created_at).toISOString(),
    }))

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

    const body = (await request.json()) as { profile?: Partial<ProfilePayload> }
    const profile = normalizeProfileInput(body.profile ?? {})

    const rowsRaw = await sql.query(
      `insert into user_profiles (
        user_id,
        role,
        full_name,
        phone,
        preferred_contact_method,
        buyer_preferred_cities,
        buyer_listing_types,
        buyer_budget_min,
        buyer_budget_max,
        buyer_bedrooms_min,
        buyer_notes,
        seller_company_name,
        seller_license,
        seller_service_cities,
        seller_property_types,
        seller_notes,
        is_agent,
        agent_license,
        agent_company,
        agent_bio,
        updated_at
      ) values (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,now()
      )
      on conflict (user_id) do update set
        role = excluded.role,
        full_name = excluded.full_name,
        phone = excluded.phone,
        preferred_contact_method = excluded.preferred_contact_method,
        buyer_preferred_cities = excluded.buyer_preferred_cities,
        buyer_listing_types = excluded.buyer_listing_types,
        buyer_budget_min = excluded.buyer_budget_min,
        buyer_budget_max = excluded.buyer_budget_max,
        buyer_bedrooms_min = excluded.buyer_bedrooms_min,
        buyer_notes = excluded.buyer_notes,
        seller_company_name = excluded.seller_company_name,
        seller_license = excluded.seller_license,
        seller_service_cities = excluded.seller_service_cities,
        seller_property_types = excluded.seller_property_types,
        seller_notes = excluded.seller_notes,
        is_agent = excluded.is_agent,
        agent_license = excluded.agent_license,
        agent_company = excluded.agent_company,
        agent_bio = excluded.agent_bio,
        updated_at = now()
      returning
        role,
        full_name,
        phone,
        preferred_contact_method,
        buyer_preferred_cities,
        buyer_listing_types,
        buyer_budget_min,
        buyer_budget_max,
        buyer_bedrooms_min,
        buyer_notes,
        seller_company_name,
        seller_license,
        seller_service_cities,
        seller_property_types,
        seller_notes,
        is_agent,
        agent_license,
        agent_company,
        agent_bio,
        agent_verified`,
      [
        authUserId,
        profile.role,
        profile.fullName || null,
        profile.phone || null,
        profile.preferredContactMethod,
        profile.buyerPreferredCities,
        profile.buyerListingTypes,
        profile.buyerBudgetMin,
        profile.buyerBudgetMax,
        profile.buyerBedroomsMin,
        profile.buyerNotes || null,
        profile.sellerCompanyName || null,
        profile.sellerLicense || null,
        profile.sellerServiceCities,
        profile.sellerPropertyTypes,
        profile.sellerNotes || null,
        profile.isAgent,
        profile.agentLicense || null,
        profile.agentCompany || null,
        profile.agentBio || null,
      ],
    )

    const rows = rowsRaw as Array<{
      role: ProfileRole
      full_name: string | null
      phone: string | null
      preferred_contact_method: ContactMethod
      buyer_preferred_cities: string[] | null
      buyer_listing_types: ListingType[] | null
      buyer_budget_min: number | null
      buyer_budget_max: number | null
      buyer_bedrooms_min: number | null
      buyer_notes: string | null
      seller_company_name: string | null
      seller_license: string | null
      seller_service_cities: string[] | null
      seller_property_types: ListingType[] | null
      seller_notes: string | null
      is_agent: boolean | null
      agent_license: string | null
      agent_company: string | null
      agent_bio: string | null
      agent_verified: boolean | null
    }>
    const row = rows[0]
    if (!row) return Response.json({ error: "Unable to save profile." }, { status: 500 })

    const savedProfile: ProfilePayload = {
      role: row.role,
      fullName: row.full_name ?? "",
      phone: row.phone ?? "",
      preferredContactMethod: row.preferred_contact_method,
      buyerPreferredCities: row.buyer_preferred_cities ?? [],
      buyerListingTypes: row.buyer_listing_types ?? [],
      buyerBudgetMin: row.buyer_budget_min,
      buyerBudgetMax: row.buyer_budget_max,
      buyerBedroomsMin: row.buyer_bedrooms_min,
      buyerNotes: row.buyer_notes ?? "",
      sellerCompanyName: row.seller_company_name ?? "",
      sellerLicense: row.seller_license ?? "",
      sellerServiceCities: row.seller_service_cities ?? [],
      sellerPropertyTypes: row.seller_property_types ?? [],
      sellerNotes: row.seller_notes ?? "",
      isAgent: row.is_agent ?? false,
      agentLicense: row.agent_license ?? "",
      agentCompany: row.agent_company ?? "",
      agentBio: row.agent_bio ?? "",
      agentVerified: row.agent_verified ?? false,
    }

    return Response.json({ profile: savedProfile }, { status: 200 })
  } catch {
    return Response.json({ error: "Unable to update profile." }, { status: 500 })
  }
}

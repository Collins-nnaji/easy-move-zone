import { neon } from "@neondatabase/serverless"
import {
  DESTINATIONS,
  JOBS,
  SCHOOLS,
  STAYS,
  TRIPS,
  VISA_SERVICES,
  type Destination,
  type JobOption,
  type Mode,
  type SchoolOption,
  type StayOption,
  type TripOption,
  type VisaService,
} from "@/app/move/data"
import {
  groupJobs,
  groupSchools,
  groupStays,
  groupTrips,
  groupVisaServices,
  mapDestinationRow,
} from "@/lib/move/map-catalog"

export type MoveCatalogSource = "database" | "static"

export interface MoveInventory {
  trips: Record<string, TripOption[]>
  stays: Record<string, StayOption[]>
  visaServices: Record<Mode, VisaService[]>
  schools: Record<string, SchoolOption[]>
  jobs: Record<string, JobOption[]>
}

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL

/**
 * Runs one catalog query, returning null (not throwing) if that specific
 * table/column isn't ready. This keeps one lagging table (e.g. move_schools
 * before its migration has run) from taking down the whole catalog — each
 * slice falls back to static data independently.
 */
async function safeRows(run: () => Promise<unknown[]>): Promise<unknown[] | null> {
  try {
    return await run()
  } catch {
    return null
  }
}

async function queryCatalog() {
  if (!DATABASE_URL) return null
  const sql = neon(DATABASE_URL)

  // Destinations are the anchor — if this fails or is empty, use full static.
  let destRows: unknown[]
  try {
    destRows = await sql`
      select id, city, country, region, photo_label, image_url,
             match_scores, honest, stats, visa
      from move_destinations
      where active = true
      order by sort_order asc, city asc
    `
  } catch {
    return null
  }
  if (!Array.isArray(destRows) || destRows.length === 0) return null

  // Inventory tables load independently; a failing one becomes null and the
  // caller substitutes that slice's static data.
  const [tripRows, stayRows, visaRows, schoolRows, jobRows] = await Promise.all([
    safeRows(() => sql`
      select id, destination_id, provider, route, duration, price
      from move_trips where active = true order by destination_id, sort_order asc
    `),
    safeRows(() => sql`
      select id, destination_id, name, area, price, rating, for_modes
      from move_stays where active = true order by destination_id, sort_order asc
    `),
    safeRows(() => sql`
      select id, mode, title, detail, price
      from move_visa_services where active = true order by mode, sort_order asc
    `),
    safeRows(() => sql`
      select id, destination_id, institution, program, level, tag, price, residency_pathway
      from move_schools where active = true order by destination_id, sort_order asc
    `),
    safeRows(() => sql`
      select id, destination_id, company, role, industry, tag, price
      from move_jobs where active = true order by destination_id, sort_order asc
    `),
  ])

  return { destRows, tripRows, stayRows, visaRows, schoolRows, jobRows }
}

export async function getMoveDestinations(): Promise<{
  destinations: Destination[]
  source: MoveCatalogSource
}> {
  const raw = await queryCatalog()
  if (!raw) {
    return { destinations: DESTINATIONS, source: "static" }
  }
  return {
    destinations: (raw.destRows as Parameters<typeof mapDestinationRow>[0][]).map(mapDestinationRow),
    source: "database",
  }
}

export async function getMoveInventory(): Promise<{
  inventory: MoveInventory
  source: MoveCatalogSource
}> {
  const raw = await queryCatalog()
  if (!raw) {
    return {
      inventory: {
        trips: TRIPS,
        stays: STAYS,
        visaServices: VISA_SERVICES,
        schools: SCHOOLS,
        jobs: JOBS,
      },
      source: "static",
    }
  }
  return {
    inventory: {
      trips: raw.tripRows ? groupTrips(raw.tripRows as Parameters<typeof groupTrips>[0]) : TRIPS,
      stays: raw.stayRows ? groupStays(raw.stayRows as Parameters<typeof groupStays>[0]) : STAYS,
      visaServices: raw.visaRows ? groupVisaServices(raw.visaRows as Parameters<typeof groupVisaServices>[0]) : VISA_SERVICES,
      schools: raw.schoolRows ? groupSchools(raw.schoolRows as Parameters<typeof groupSchools>[0]) : SCHOOLS,
      jobs: raw.jobRows ? groupJobs(raw.jobRows as Parameters<typeof groupJobs>[0]) : JOBS,
    },
    source: "database",
  }
}

/** Used by mood search — destinations only, DB when seeded. */
export async function getDestinationsForSearch(): Promise<Destination[]> {
  const { destinations } = await getMoveDestinations()
  return destinations
}

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

async function queryCatalog() {
  if (!DATABASE_URL) return null
  const sql = neon(DATABASE_URL)
  try {
    const [destRows, tripRows, stayRows, visaRows, schoolRows, jobRows] = await Promise.all([
      sql`
        select id, city, country, region, photo_label, image_url,
               match_scores, honest, stats, visa
        from move_destinations
        where active = true
        order by sort_order asc, city asc
      `,
      sql`
        select id, destination_id, provider, route, duration, price
        from move_trips
        where active = true
        order by destination_id, sort_order asc
      `,
      sql`
        select id, destination_id, name, area, price, rating, for_modes
        from move_stays
        where active = true
        order by destination_id, sort_order asc
      `,
      sql`
        select id, mode, title, detail, price
        from move_visa_services
        where active = true
        order by mode, sort_order asc
      `,
      sql`
        select id, destination_id, institution, program, level, tag, price
        from move_schools
        where active = true
        order by destination_id, sort_order asc
      `,
      sql`
        select id, destination_id, company, role, industry, tag, price
        from move_jobs
        where active = true
        order by destination_id, sort_order asc
      `,
    ])
    if (!Array.isArray(destRows) || destRows.length === 0) return null
    return { destRows, tripRows, stayRows, visaRows, schoolRows, jobRows }
  } catch {
    return null
  }
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
      trips: groupTrips(raw.tripRows as Parameters<typeof groupTrips>[0]),
      stays: groupStays(raw.stayRows as Parameters<typeof groupStays>[0]),
      visaServices: groupVisaServices(raw.visaRows as Parameters<typeof groupVisaServices>[0]),
      schools: groupSchools(raw.schoolRows as Parameters<typeof groupSchools>[0]),
      jobs: groupJobs(raw.jobRows as Parameters<typeof groupJobs>[0]),
    },
    source: "database",
  }
}

/** Used by mood search — destinations only, DB when seeded. */
export async function getDestinationsForSearch(): Promise<Destination[]> {
  const { destinations } = await getMoveDestinations()
  return destinations
}

import { neon } from "@neondatabase/serverless"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

export type PublicShipmentEvent = {
  status: string
  label: string
  location: string | null
  at: string
}

export type PublicShipment = {
  reference: string
  direction: string
  mode: string
  origin: string
  destination: string
  cargoSummary: string | null
  currentStatus: string
  events: PublicShipmentEvent[]
}

/** Day-one demo shipments so /track works before the migration is applied. */
const DEMO: Record<string, PublicShipment> = {
  "EMZ-NG-1001": {
    reference: "EMZ-NG-1001",
    direction: "export",
    mode: "sea",
    origin: "Lagos, Nigeria",
    destination: "Rotterdam, Netherlands",
    cargoSummary: "2×40HC cocoa butter",
    currentStatus: "in_transit",
    events: [
      {
        status: "in_transit",
        label: "At sea",
        location: "Atlantic",
        at: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
      {
        status: "departed_port",
        label: "Vessel departed",
        location: "Tin Can Island",
        at: new Date(Date.now() - 8 * 86400000).toISOString(),
      },
      {
        status: "picked_up",
        label: "Cargo collected",
        location: "Apapa, Lagos",
        at: new Date(Date.now() - 10 * 86400000).toISOString(),
      },
      {
        status: "booked",
        label: "Booking confirmed",
        location: "Lagos",
        at: new Date(Date.now() - 12 * 86400000).toISOString(),
      },
    ],
  },
  "EMZ-NG-1002": {
    reference: "EMZ-NG-1002",
    direction: "import",
    mode: "air",
    origin: "Guangzhou, China",
    destination: "Lagos (LOS), Nigeria",
    cargoSummary: "Electronics — 180 kg",
    currentStatus: "customs_clearance",
    events: [
      {
        status: "customs_clearance",
        label: "Customs clearance in progress",
        location: "Lagos",
        at: new Date(Date.now() - 6 * 3600000).toISOString(),
      },
      {
        status: "arrived",
        label: "Arrived Lagos",
        location: "MMIA LOS",
        at: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
      {
        status: "departed",
        label: "Flight departed",
        location: "CAN",
        at: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        status: "booked",
        label: "Air booking confirmed",
        location: "Guangzhou",
        at: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
    ],
  },
}

export async function getShipmentByReference(reference: string): Promise<PublicShipment | null> {
  const ref = reference.trim().toUpperCase()
  if (!ref) return null

  if (sql) {
    try {
      const rows = (await sql`
        SELECT reference, direction, mode, origin, destination, cargo_summary, current_status
        FROM public_shipments
        WHERE upper(reference) = ${ref}
        LIMIT 1
      `) as Array<{
        reference: string
        direction: string
        mode: string
        origin: string
        destination: string
        cargo_summary: string | null
        current_status: string
      }>

      const ship = rows[0]
      if (ship) {
        const events = (await sql`
          SELECT status, label, location, occurred_at
          FROM public_shipment_events e
          JOIN public_shipments s ON s.id = e.shipment_id
          WHERE upper(s.reference) = ${ref}
          ORDER BY e.occurred_at DESC
        `) as Array<{
          status: string
          label: string
          location: string | null
          occurred_at: string
        }>

        return {
          reference: ship.reference,
          direction: ship.direction,
          mode: ship.mode,
          origin: ship.origin,
          destination: ship.destination,
          cargoSummary: ship.cargo_summary,
          currentStatus: ship.current_status,
          events: events.map((e) => ({
            status: e.status,
            label: e.label,
            location: e.location,
            at: e.occurred_at,
          })),
        }
      }
    } catch {
      // Fall through to demo data when table is missing.
    }
  }

  return DEMO[ref] ?? null
}

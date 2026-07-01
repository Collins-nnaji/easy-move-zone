import type { Embassy, MissionType } from "@/lib/visa/types"

export const ALLOWED_MISSION_TYPES = new Set<MissionType>([
  "embassy",
  "consulate",
  "consulate_general",
  "visa_application_center",
  "trade_office",
])

export const EMBASSY_SELECT = `
  id, country, located_in_country, mission_type, city, address, phone, email,
  website, appointment_booking_url, latitude, longitude, jurisdiction_notes,
  operating_hours, services, is_active, created_at, updated_at
`

export type EmbassyRow = {
  id: string
  country: string
  located_in_country: string
  mission_type: MissionType
  city: string
  address: string | null
  phone: string | null
  email: string | null
  website: string | null
  appointment_booking_url: string | null
  latitude: number | null
  longitude: number | null
  jurisdiction_notes: string | null
  operating_hours: string | null
  services: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export function mapEmbassyRow(row: EmbassyRow): Embassy {
  return {
    id: row.id,
    country: row.country,
    locatedInCountry: row.located_in_country,
    missionType: row.mission_type,
    city: row.city,
    address: row.address ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    website: row.website ?? "",
    appointmentBookingUrl: row.appointment_booking_url ?? "",
    latitude: row.latitude,
    longitude: row.longitude,
    jurisdictionNotes: row.jurisdiction_notes ?? "",
    operatingHours: row.operating_hours ?? "",
    services: Array.isArray(row.services) ? row.services : [],
    isActive: row.is_active,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  }
}

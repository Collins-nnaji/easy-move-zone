import type {
  Destination,
  JobOption,
  Mode,
  SchoolOption,
  StayOption,
  TripOption,
  VisaInfo,
  VisaService,
} from "@/app/move/data"

type DestinationRow = {
  id: string
  city: string
  country: string
  region: string
  photo_label: string
  image_url: string | null
  match_scores: Record<string, number>
  honest: Record<string, string>
  stats: Record<string, [string, string][]>
  visa: Record<string, VisaInfo>
}

type TripRow = {
  id: string
  destination_id: string
  provider: string
  route: string
  duration: string
  price: string
}

type StayRow = {
  id: string
  destination_id: string
  name: string
  area: string
  price: string
  rating: string
  for_modes: string[]
}

type VisaServiceRow = {
  id: string
  mode: Mode
  title: string
  detail: string
  price: string
}

type SchoolRow = {
  id: string
  destination_id: string
  institution: string
  program: string
  level: string
  tag: string
  price: string
  residency_pathway: string | null
}

type JobRow = {
  id: string
  destination_id: string
  company: string
  role: string
  industry: string
  tag: string
  price: string
}

function asModeRecord<T>(raw: Record<string, T>, fallback: T): Record<Mode, T> {
  return {
    trip: raw.trip ?? fallback,
    nomad: raw.nomad ?? fallback,
    move: raw.move ?? fallback,
  }
}

export function mapDestinationRow(row: DestinationRow): Destination {
  const emptyVisa: VisaInfo = { headline: "", body: "", tag: "" }
  return {
    id: row.id,
    city: row.city,
    country: row.country,
    region: row.region,
    photo: row.photo_label,
    imageUrl: row.image_url ?? undefined,
    match: asModeRecord(row.match_scores ?? {}, 0),
    honest: asModeRecord(row.honest ?? {}, ""),
    stats: asModeRecord(row.stats ?? {}, []),
    visa: asModeRecord(row.visa ?? {}, emptyVisa),
  }
}

export function groupTrips(rows: TripRow[]): Record<string, TripOption[]> {
  const out: Record<string, TripOption[]> = {}
  for (const row of rows) {
    const list = out[row.destination_id] ?? []
    list.push({
      id: row.id,
      provider: row.provider,
      route: row.route,
      duration: row.duration,
      price: row.price,
    })
    out[row.destination_id] = list
  }
  return out
}

export function groupStays(rows: StayRow[]): Record<string, StayOption[]> {
  const out: Record<string, StayOption[]> = {}
  for (const row of rows) {
    const list = out[row.destination_id] ?? []
    list.push({
      id: row.id,
      name: row.name,
      area: row.area,
      price: row.price,
      rating: row.rating,
      forModes: row.for_modes.filter((m): m is Mode => m === "trip" || m === "nomad" || m === "move"),
    })
    out[row.destination_id] = list
  }
  return out
}

export function groupVisaServices(rows: VisaServiceRow[]): Record<Mode, VisaService[]> {
  const out: Record<Mode, VisaService[]> = { trip: [], nomad: [], move: [] }
  for (const row of rows) {
    out[row.mode].push({
      id: row.id,
      title: row.title,
      detail: row.detail,
      price: row.price,
    })
  }
  return out
}

export function groupSchools(rows: SchoolRow[]): Record<string, SchoolOption[]> {
  const out: Record<string, SchoolOption[]> = {}
  for (const row of rows) {
    const list = out[row.destination_id] ?? []
    list.push({
      id: row.id,
      institution: row.institution,
      program: row.program,
      level: row.level,
      tag: row.tag,
      price: row.price,
      residencyPathway: row.residency_pathway ?? undefined,
    })
    out[row.destination_id] = list
  }
  return out
}

export function groupJobs(rows: JobRow[]): Record<string, JobOption[]> {
  const out: Record<string, JobOption[]> = {}
  for (const row of rows) {
    const list = out[row.destination_id] ?? []
    list.push({
      id: row.id,
      company: row.company,
      role: row.role,
      industry: row.industry,
      tag: row.tag,
      price: row.price,
    })
    out[row.destination_id] = list
  }
  return out
}

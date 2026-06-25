"use client"

import { useEffect, useState } from "react"
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
} from "./data"

export type CatalogSource = "static" | "database"

export interface MoveCatalogState {
  destinations: Destination[]
  trips: Record<string, TripOption[]>
  stays: Record<string, StayOption[]>
  visaServices: Record<Mode, VisaService[]>
  schools: Record<string, SchoolOption[]>
  jobs: Record<string, JobOption[]>
  source: CatalogSource
  loaded: boolean
}

const STATIC_CATALOG: MoveCatalogState = {
  destinations: DESTINATIONS,
  trips: TRIPS,
  stays: STAYS,
  visaServices: VISA_SERVICES,
  schools: SCHOOLS,
  jobs: JOBS,
  source: "static",
  loaded: true,
}

export function useMoveCatalog(): MoveCatalogState {
  const [catalog, setCatalog] = useState<MoveCatalogState>({
    ...STATIC_CATALOG,
    loaded: false,
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [destRes, invRes] = await Promise.all([
          fetch("/api/move/destinations"),
          fetch("/api/move/inventory"),
        ])

        if (!destRes.ok || !invRes.ok) return

        const destJson = (await destRes.json()) as {
          destinations?: Destination[]
          source?: CatalogSource
        }
        const invJson = (await invRes.json()) as {
          trips?: Record<string, TripOption[]>
          stays?: Record<string, StayOption[]>
          visaServices?: Record<Mode, VisaService[]>
          schools?: Record<string, SchoolOption[]>
          jobs?: Record<string, JobOption[]>
          source?: CatalogSource
        }

        if (cancelled || !destJson.destinations?.length) return

        setCatalog({
          destinations: destJson.destinations,
          trips: invJson.trips ?? TRIPS,
          stays: invJson.stays ?? STAYS,
          visaServices: invJson.visaServices ?? VISA_SERVICES,
          schools: invJson.schools ?? SCHOOLS,
          jobs: invJson.jobs ?? JOBS,
          source: destJson.source === "database" ? "database" : "static",
          loaded: true,
        })
      } catch {
        if (!cancelled) {
          setCatalog({ ...STATIC_CATALOG, loaded: true })
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  if (!catalog.loaded) {
    return { ...STATIC_CATALOG, loaded: false }
  }

  return catalog
}

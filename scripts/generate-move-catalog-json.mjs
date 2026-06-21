#!/usr/bin/env node
/** Regenerate db/seeds/move-catalog.json from app/move/data.ts */
import { writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"
import { DESTINATIONS, TRIPS, STAYS, VISA_SERVICES } from "../app/move/data.ts"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

const trips = []
for (const [destinationId, list] of Object.entries(TRIPS)) {
  for (const t of list) trips.push({ destinationId, ...t })
}

const stays = []
for (const [destinationId, list] of Object.entries(STAYS)) {
  for (const s of list) stays.push({ destinationId, ...s })
}

const visaServices = []
for (const [mode, list] of Object.entries(VISA_SERVICES)) {
  for (const v of list) visaServices.push({ mode, ...v })
}

writeFileSync(
  path.join(root, "db/seeds/move-catalog.json"),
  JSON.stringify({ destinations: DESTINATIONS, trips, stays, visaServices }, null, 2),
)

console.log(`Wrote db/seeds/move-catalog.json (${DESTINATIONS.length} destinations).`)

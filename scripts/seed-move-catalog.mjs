#!/usr/bin/env node
/**
 * Seed move_destinations, move_trips, move_stays, move_visa_services from
 * db/seeds/move-catalog.json (generated from app/move/data.ts).
 *
 * Regenerate JSON after editing data.ts:
 *   node --experimental-strip-types scripts/generate-move-catalog-json.mjs
 *
 * Usage: node scripts/seed-move-catalog.mjs
 */
import { readFileSync } from "node:fs"
import process from "node:process"
import { fileURLToPath } from "node:url"
import path from "node:path"
import { neon } from "@neondatabase/serverless"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")
const catalogPath = path.join(root, "db/seeds/move-catalog.json")

async function main() {
  const databaseUrl = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
  if (!databaseUrl) {
    console.error("Set DATABASE_URL or NEON_DATABASE_URL before seeding.")
    process.exit(1)
  }

  const catalog = JSON.parse(readFileSync(catalogPath, "utf8"))
  const sql = neon(databaseUrl)

  console.log("Seeding Move catalog…")

  for (const [index, d] of catalog.destinations.entries()) {
    await sql`
      insert into move_destinations (
        id, city, country, region, photo_label, image_url,
        match_scores, honest, stats, visa, sort_order, updated_at
      ) values (
        ${d.id},
        ${d.city},
        ${d.country},
        ${d.region},
        ${d.photo},
        ${d.imageUrl ?? null},
        ${d.match},
        ${d.honest},
        ${d.stats},
        ${d.visa},
        ${index},
        now()
      )
      on conflict (id) do update set
        city = excluded.city,
        country = excluded.country,
        region = excluded.region,
        photo_label = excluded.photo_label,
        image_url = excluded.image_url,
        match_scores = excluded.match_scores,
        honest = excluded.honest,
        stats = excluded.stats,
        visa = excluded.visa,
        sort_order = excluded.sort_order,
        updated_at = now()
    `
  }

  for (const [index, t] of catalog.trips.entries()) {
    await sql`
      insert into move_trips (id, destination_id, provider, route, duration, price, sort_order)
      values (${t.id}, ${t.destinationId}, ${t.provider}, ${t.route}, ${t.duration}, ${t.price}, ${index})
      on conflict (id) do update set
        destination_id = excluded.destination_id,
        provider = excluded.provider,
        route = excluded.route,
        duration = excluded.duration,
        price = excluded.price,
        sort_order = excluded.sort_order
    `
  }

  for (const [index, s] of catalog.stays.entries()) {
    await sql`
      insert into move_stays (id, destination_id, name, area, price, rating, for_modes, sort_order)
      values (${s.id}, ${s.destinationId}, ${s.name}, ${s.area}, ${s.price}, ${s.rating}, ${s.forModes}, ${index})
      on conflict (id) do update set
        destination_id = excluded.destination_id,
        name = excluded.name,
        area = excluded.area,
        price = excluded.price,
        rating = excluded.rating,
        for_modes = excluded.for_modes,
        sort_order = excluded.sort_order
    `
  }

  for (const [index, v] of catalog.visaServices.entries()) {
    await sql`
      insert into move_visa_services (id, mode, title, detail, price, sort_order)
      values (${v.id}, ${v.mode}, ${v.title}, ${v.detail}, ${v.price}, ${index})
      on conflict (id) do update set
        mode = excluded.mode,
        title = excluded.title,
        detail = excluded.detail,
        price = excluded.price,
        sort_order = excluded.sort_order
    `
  }

  console.log(
    `Done — ${catalog.destinations.length} destinations, ${catalog.trips.length} trips, ${catalog.stays.length} stays, ${catalog.visaServices.length} visa tiers.`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

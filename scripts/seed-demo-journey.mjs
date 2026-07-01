#!/usr/bin/env node
/**
 * Seed demo relocation plan, tasks, contacts, and bookings for a signed-up user.
 * Requires DATABASE_URL and an existing Neon Auth user (default: collinsnnaji1@gmail.com).
 *
 * Usage:
 *   npm run db:seed:demo
 *   DEMO_USER_EMAIL=you@example.com npm run db:seed:demo
 */
import { readFile } from "node:fs/promises"
import process from "node:process"
import { fileURLToPath } from "node:url"
import path from "node:path"
import { neon } from "@neondatabase/serverless"
import { splitSqlStatements } from "./sql-utils.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")
const seedFile = path.join(root, "db/seeds/20260626_demo_journey_seed.sql")

const databaseUrl = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
if (!databaseUrl) {
  console.error("Set DATABASE_URL or NEON_DATABASE_URL before seeding.")
  process.exit(1)
}

const demoEmail = process.env.DEMO_USER_EMAIL ?? "collinsnnaji1@gmail.com"
console.log(`Seeding demo journey for ${demoEmail}…\n`)

const raw = await readFile(seedFile, "utf8")
const patched = raw.replace("__DEMO_EMAIL__", demoEmail.replace(/'/g, "''"))
const statements = splitSqlStatements(patched)
const sql = neon(databaseUrl)

try {
  for (let idx = 0; idx < statements.length; idx += 1) {
    await sql.query(statements[idx])
  }
  console.log(`Executed ${statements.length} statements from demo seed.`)
  console.log("\nDemo seed complete. Open /move while signed in as that user.")
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(message)
  process.exit(1)
}

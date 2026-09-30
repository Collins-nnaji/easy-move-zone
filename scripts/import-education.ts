// Imports official course and institution lists into the education catalogue.
//
//   node --env-file=.env scripts/import-education.ts all
//   node --env-file=.env scripts/import-education.ts uk au --dry-run
//   node --env-file=.env scripts/import-education.ts ca --ca-file ./dli-full-list.json
//
// Sources: uk (Discover Uni + GOV.UK student sponsors), au (CRICOS), ie (TrustEd Ireland + ILEP),
// nl (DUO), ca (IRCC DLI list). Downloads are cached for 20 hours in --cache (default: OS temp dir).
import os from "node:os"
import path from "node:path"
import { neon } from "@neondatabase/serverless"
import { ensureEducationTables } from "../lib/education/store.ts"
import { writeBatch, type ImportBatch } from "./education-import/db.ts"
import { loadAu, loadCa, loadIe, loadNl, loadUk, type SourceOptions } from "./education-import/sources.ts"

const LOADERS: Record<string, (options: SourceOptions) => Promise<ImportBatch>> = { uk: loadUk, au: loadAu, ie: loadIe, nl: loadNl, ca: loadCa }

const args = process.argv.slice(2)
const flag = (name: string) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}
const dryRun = args.includes("--dry-run")
const flagValues = new Set(["--cache", "--ca-file", "--uk-zip", "--uk-sponsors", "--ie-trusted", "--ie-ilep"].map((name) => flag(name)))
const requested = args.filter((arg) => !arg.startsWith("--") && !flagValues.has(arg))
const sources = requested.includes("all") || !requested.length ? Object.keys(LOADERS) : requested

const unknown = sources.filter((source) => !LOADERS[source])
if (unknown.length) {
  console.error(`Unknown source: ${unknown.join(", ")}. Use one or more of: ${Object.keys(LOADERS).join(", ")}, all`)
  process.exit(1)
}

const databaseUrl = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
if (!databaseUrl && !dryRun) {
  console.error("DATABASE_URL is not set. Run with: node --env-file=.env scripts/import-education.ts …")
  process.exit(1)
}

const options: SourceOptions = {
  cacheDir: flag("--cache") ?? path.join(os.tmpdir(), "easy-move-education-data"),
  files: {
    caDli: flag("--ca-file"),
    ukZip: flag("--uk-zip"),
    ukSponsors: flag("--uk-sponsors"),
    ieTrusted: flag("--ie-trusted"),
    ieIlep: flag("--ie-ilep"),
  },
  log: (message) => console.log(message),
}

let failed = false
if (!dryRun) await ensureEducationTables()
const sql = databaseUrl ? neon(databaseUrl) : null
for (const source of sources) {
  const started = Date.now()
  console.log(`\n${source}: loading`)
  try {
    const batch = await LOADERS[source](options)
    const bySubject = new Map<string, number>()
    const byLevel = new Map<string, number>()
    for (const course of batch.courses) {
      bySubject.set(course.subject, (bySubject.get(course.subject) ?? 0) + 1)
      byLevel.set(course.level, (byLevel.get(course.level) ?? 0) + 1)
    }
    console.log(`  ${batch.universities.length} institutions, ${batch.courses.length} courses`)
    if (batch.courses.length) {
      console.log(`  levels: ${[...byLevel].map(([k, v]) => `${k} ${v}`).join(", ")}`)
      console.log(`  subjects: ${[...bySubject].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(", ")}`)
    }
    if (dryRun || !sql) console.log("  dry run: nothing written")
    else await writeBatch(sql, batch, options.log)
    console.log(`  done in ${((Date.now() - started) / 1000).toFixed(1)}s`)
  } catch (error) {
    failed = true
    console.error(`  ${source} failed: ${(error as Error).message}`)
  }
}
process.exit(failed ? 1 : 0)

#!/usr/bin/env node
/**
 * Run Move-product migrations and seeds in order.
 * Requires DATABASE_URL or NEON_DATABASE_URL in the environment.
 *
 * Usage: node scripts/run-move-setup.mjs
 */
import { spawn } from "node:child_process"
import process from "node:process"
import { fileURLToPath } from "node:url"
import path from "node:path"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")
const runner = path.join(root, "scripts/run-sql-file.mjs")

const steps = [
  "db/add-contact-submissions.sql",
  "db/migrations/20260309_user_profiles.sql",
  "db/migrations/20260310_agent_flag_and_admin.sql",
  "db/migrations/20260312_relocation_hub.sql",
  "db/migrations/20260312_relocation_guides.sql",
  "db/migrations/20260616_move_bookings.sql",
  "db/migrations/20260622_move_catalog.sql",
  "db/migrations/20260623_relocation_budget_monthly.sql",
  "db/migrations/20260624_profile_move_fields.sql",
  "db/migrations/20260625_settle_guide_enrichment.sql",
  "db/seeds/20260615_relocation_and_dashboard_seed.sql",
  "db/migrations/20260627_settle_guide_more_destinations.sql",
  "db/migrations/20260628_settle_guide_life_stage_cards.sql",
  "db/migrations/20260629_move_work_study.sql",
  "db/migrations/20260713_community.sql",
]

const postSeedSteps = [
  "node scripts/seed-move-catalog.mjs",
]

function runFile(relativePath) {
  return new Promise((resolve, reject) => {
    const abs = path.join(root, relativePath)
    const child = spawn(process.execPath, [runner, abs], {
      stdio: "inherit",
      env: process.env,
    })
    child.on("error", reject)
    child.on("close", (code) => {
      if (code === 0) resolve(undefined)
      else reject(new Error(`Failed: ${relativePath} (exit ${code})`))
    })
  })
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
  if (!databaseUrl) {
    console.error("Set DATABASE_URL or NEON_DATABASE_URL before running setup.")
    process.exit(1)
  }

  console.log("EasyMoveZone — Move product DB setup\n")

  for (const step of steps) {
    console.log(`→ ${step}`)
    await runFile(step)
  }

  for (const cmd of postSeedSteps) {
    console.log(`→ ${cmd}`)
    await new Promise((resolve, reject) => {
      const [bin, ...args] = cmd.split(" ")
      const child = spawn(bin, args, { stdio: "inherit", env: process.env, cwd: root })
      child.on("error", reject)
      child.on("close", (code) => {
        if (code === 0) resolve(undefined)
        else reject(new Error(`Failed: ${cmd} (exit ${code})`))
      })
    })
  }

  console.log("\nDone. Smoke test checklist:")
  console.log("  1. npm run dev")
  console.log("  2. Sign up at /auth")
  console.log("  3. npm run db:seed:demo   (optional — pre-fills demo plan data for /move)")
  console.log("  4. Complete /move → Save plan → Book something")
  console.log("  5. Open /move — plan, Settle tab, and bookings all in the app")
  console.log("  6. GET /api/move/destinations — source should be \"database\"")
  console.log("  7. Admin: add your email to admin_users, visit /admin/users")
}

main().catch((err) => {
  console.error(err.message ?? err)
  process.exit(1)
})

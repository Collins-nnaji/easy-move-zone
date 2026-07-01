#!/usr/bin/env node
/**
 * Run visa-product migrations and seeds in order.
 * Requires DATABASE_URL or NEON_DATABASE_URL in the environment.
 *
 * Usage: node scripts/run-visa-setup.mjs
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
  "db/migrations/20260701_visa_pivot.sql",
  "db/seeds/20260701_visa_requirement_templates_seed.sql",
  "db/seeds/20260701_embassies_seed.sql",
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

  console.log("EasyMoveZone — visa product DB setup\n")

  for (const step of steps) {
    console.log(`→ ${step}`)
    await runFile(step)
  }

  console.log("\nDone. Smoke test checklist:")
  console.log("  1. npm run dev")
  console.log("  2. Sign up at /auth")
  console.log("  3. Visit /visa — look up requirements for a nationality/destination/visa type")
  console.log("  4. Start tracking an application at /visa/applications/new")
  console.log("  5. Open /embassies — confirm the seeded embassy entries appear")
  console.log("  6. Admin: add your email to admin_users, visit /admin/visa-templates and /admin/embassies")
}

main().catch((err) => {
  console.error(err.message ?? err)
  process.exit(1)
})

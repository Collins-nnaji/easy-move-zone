#!/usr/bin/env node
/**
 * Driver platform DB setup — creates driver tables, seeds shifts,
 * drops old relocation product tables, and cleans legacy pivots.
 *
 * Usage: npm run db:setup
 */
import { spawn } from "node:child_process";
import process from "node:process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const runner = path.join(root, "scripts/run-sql-file.mjs");

const steps = [
  "db/add-contact-submissions.sql",
  "db/migrations/20260310_agent_flag_and_admin.sql",
  "db/migrations/20260720_driver_platform.sql",
  "db/migrations/20260721_marketplace.sql",
  "db/migrations/20260721_payments.sql",
  "db/migrations/20260721_booking_offers.sql",
  "db/migrations/20260721_escrow_seed_funded.sql",
  "db/migrations/20260721_trust_vault.sql",
  "db/migrations/20260722_ops_admin.sql",
  "db/migrations/20260723_phase5_platform.sql",
  "db/migrations/20260720_drop_relocation_product.sql",
  "db/seeds/20260720_driver_shifts_seed.sql",
  "db/seeds/20260721_marketplace_seed.sql",
  "db/seeds/20260721_nigeria_zones.sql",
  "db/cleanup-unneeded-tables.sql",
];

function runFile(relativePath) {
  return new Promise((resolve, reject) => {
    const abs = path.join(root, relativePath);
    const child = spawn(process.execPath, [runner, abs], {
      stdio: "inherit",
      env: process.env,
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(undefined);
      else reject(new Error(`Failed: ${relativePath} (exit ${code})`));
    });
  });
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL;
  if (!databaseUrl) {
    console.error("Set DATABASE_URL or NEON_DATABASE_URL before running setup.");
    process.exit(1);
  }

  console.log("EasyMoveZone — Marketplace platform DB setup\n");

  for (const step of steps) {
    console.log(`→ ${step}`);
    await runFile(step);
  }

  console.log("\nDone. Smoke test checklist:");
  console.log("  1. npm run dev");
  console.log("  2. Open /move — driver marketplace");
  console.log("  3. Open /fleet — fleet operator console");
  console.log("  4. Add Stripe keys (see SETUP.md) for real payouts");
  console.log("  5. Sign up at /auth, claim a load, complete, cash out");
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});

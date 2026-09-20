#!/usr/bin/env node
/**
 * Logistics platform DB setup — marketplace tables, freight quote/track,
 * drops unused legacy product tables.
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
  // Core + marketplace
  "db/add-contact-submissions.sql",
  // user_profiles already exists with a newer schema — skip 20260309_user_profiles.sql
  "db/migrations/20260310_agent_flag_and_admin.sql",
  "db/migrations/20260720_driver_platform.sql",
  "db/migrations/20260721_marketplace.sql",
  "db/migrations/20260721_payments.sql",
  "db/migrations/20260721_booking_offers.sql",
  "db/migrations/20260721_escrow_seed_funded.sql",
  "db/migrations/20260721_trust_vault.sql",
  "db/migrations/20260722_ops_admin.sql",
  "db/migrations/20260723_phase5_platform.sql",
  "db/migrations/20260722_escrow_milestones_disputes.sql",
  "db/migrations/20260724_native_push_tokens.sql",
  // Drop unused legacy product tables first
  "db/migrations/20260720_drop_relocation_product.sql",
  "db/cleanup-unneeded-tables.sql",
  // Logistics day-one tables (after cleanup so they are not dropped)
  "db/migrations/20260716_relocation_requests.sql",
  "db/migrations/20260920_freight_quotes_and_tracking.sql",
  // Seeds
  "db/seeds/20260720_driver_shifts_seed.sql",
  "db/seeds/20260721_marketplace_seed.sql",
  "db/seeds/20260721_nigeria_zones.sql",
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

  console.log("EasyMoveZone — Logistics platform DB setup\n");

  for (const step of steps) {
    console.log(`→ ${step}`);
    await runFile(step);
  }

  console.log("\nDone. Smoke test checklist:");
  console.log("  1. npm run dev");
  console.log("  2. Open / — marketing site");
  console.log("  3. Open /quote and /track");
  console.log("  4. Open /app — unified portal");
  console.log("  5. Add Paystack/Stripe keys (see SETUP.md) for payments");
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});

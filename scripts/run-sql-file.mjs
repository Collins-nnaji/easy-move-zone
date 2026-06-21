#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import process from "node:process";
import { neon } from "@neondatabase/serverless";
import { splitSqlStatements } from "./sql-utils.mjs";

async function main() {
  const [, , filePath] = process.argv;
  if (!filePath) {
    console.error("Usage: node scripts/run-sql-file.mjs <sql-file-path>");
    process.exit(1);
  }

  const databaseUrl = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL or NEON_DATABASE_URL is required.");
    process.exit(1);
  }

  const raw = await readFile(filePath, "utf8");
  const statements = splitSqlStatements(raw);
  const sql = neon(databaseUrl);

  for (let idx = 0; idx < statements.length; idx += 1) {
    const statement = statements[idx];
    try {
      await sql.query(statement);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Failed at statement ${idx + 1}/${statements.length}`);
      console.error(statement.slice(0, 400));
      console.error(message);
      process.exit(1);
    }
  }

  console.log(`Executed ${statements.length} statements from ${filePath}`);
}

main();

#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import process from "node:process";
import { neon } from "@neondatabase/serverless";

function splitSqlStatements(input) {
  const statements = [];
  let buf = "";
  let i = 0;
  let inSingle = false;
  let inDouble = false;
  let inLineComment = false;
  let inBlockComment = false;
  let dollarTag = null;

  while (i < input.length) {
    const ch = input[i];
    const next = input[i + 1];

    if (inLineComment) {
      buf += ch;
      if (ch === "\n") inLineComment = false;
      i += 1;
      continue;
    }

    if (inBlockComment) {
      buf += ch;
      if (ch === "*" && next === "/") {
        buf += next;
        i += 2;
        inBlockComment = false;
      } else {
        i += 1;
      }
      continue;
    }

    if (dollarTag) {
      if (input.startsWith(dollarTag, i)) {
        buf += dollarTag;
        i += dollarTag.length;
        dollarTag = null;
      } else {
        buf += ch;
        i += 1;
      }
      continue;
    }

    if (inSingle) {
      buf += ch;
      if (ch === "'") {
        if (next === "'") {
          buf += next;
          i += 2;
          continue;
        }
        inSingle = false;
      }
      i += 1;
      continue;
    }

    if (inDouble) {
      buf += ch;
      if (ch === '"') inDouble = false;
      i += 1;
      continue;
    }

    if (ch === "-" && next === "-") {
      buf += ch + next;
      i += 2;
      inLineComment = true;
      continue;
    }

    if (ch === "/" && next === "*") {
      buf += ch + next;
      i += 2;
      inBlockComment = true;
      continue;
    }

    if (ch === "'") {
      inSingle = true;
      buf += ch;
      i += 1;
      continue;
    }

    if (ch === '"') {
      inDouble = true;
      buf += ch;
      i += 1;
      continue;
    }

    if (ch === "$") {
      const rest = input.slice(i);
      const match = rest.match(/^\$[A-Za-z_0-9]*\$/);
      if (match) {
        dollarTag = match[0];
        buf += dollarTag;
        i += dollarTag.length;
        continue;
      }
    }

    if (ch === ";") {
      const stmt = buf.trim();
      if (stmt) statements.push(stmt);
      buf = "";
      i += 1;
      continue;
    }

    buf += ch;
    i += 1;
  }

  const tail = buf.trim();
  if (tail) statements.push(tail);

  return statements;
}

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

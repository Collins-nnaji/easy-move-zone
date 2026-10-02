#!/usr/bin/env node
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";
import { splitSqlStatements } from "./sql-utils.mjs";
const url = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL;
if (!url) throw new Error("Database is not configured.");
const sql = neon(url);
const apply = process.argv.includes("--apply");
const migration = await readFile(
  new URL(
    "../db/migrations/20261003_retire_legacy_tables.sql",
    import.meta.url,
  ),
  "utf8",
);
const targets = [...migration.matchAll(/^\s*public\.([a-z_]+)[,\n]/gm)].map(
  (m) => m[1],
);
const existing =
  await sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'`;
const tables = targets.filter((name) =>
  existing.some((t) => t.table_name === name),
);
const quoted = (name) => `"public"."${name}"`;
if (tables.length === 0) {
  console.log("No retired tables remain.");
  process.exit(0);
}
const columns =
  await sql`SELECT c.table_name,c.column_name,c.ordinal_position,format_type(a.atttypid,a.atttypmod) AS sql_type,pg_get_expr(d.adbin,d.adrelid) AS default_value,a.attnotnull,a.attidentity,a.attgenerated FROM information_schema.columns c JOIN pg_namespace n ON n.nspname=c.table_schema JOIN pg_class t ON t.relname=c.table_name AND t.relnamespace=n.oid JOIN pg_attribute a ON a.attrelid=t.oid AND a.attname=c.column_name LEFT JOIN pg_attrdef d ON d.adrelid=t.oid AND d.adnum=a.attnum WHERE c.table_schema='public' ORDER BY c.table_name,c.ordinal_position`;
const constraints =
  await sql`SELECT t.relname AS table_name,c.conname,c.contype,pg_get_constraintdef(c.oid) AS definition FROM pg_constraint c JOIN pg_class t ON t.oid=c.conrelid JOIN pg_namespace n ON n.oid=t.relnamespace WHERE n.nspname='public' ORDER BY c.contype,c.conname`;
const indexes =
  await sql`SELECT t.relname AS table_name,pg_get_indexdef(i.indexrelid) AS definition FROM pg_index i JOIN pg_class t ON t.oid=i.indrelid JOIN pg_namespace n ON n.oid=t.relnamespace WHERE n.nspname='public' AND NOT EXISTS(SELECT 1 FROM pg_constraint c WHERE c.conindid=i.indexrelid)`;
const triggers =
  await sql`SELECT c.relname AS table_name,pg_get_triggerdef(t.oid) AS definition FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND NOT t.tgisinternal`;
const sequenceMetadata =
  await sql`SELECT s.*, t.relname AS table_name,a.attname AS column_name FROM pg_sequences s JOIN pg_namespace n ON n.nspname=s.schemaname JOIN pg_class seq ON seq.relname=s.sequencename AND seq.relnamespace=n.oid JOIN pg_depend d ON d.objid=seq.oid AND d.deptype IN ('a','i') JOIN pg_class t ON t.oid=d.refobjid JOIN pg_attribute a ON a.attrelid=t.oid AND a.attnum=d.refobjsubid WHERE s.schemaname='public'`;
const sequences = [];
for (const sequence of sequenceMetadata.filter((s) =>
  tables.includes(s.table_name),
)) {
  if (!/^[a-z_]+$/.test(sequence.sequencename))
    throw new Error("Unexpected sequence name.");
  const values = await sql.query(
    `SELECT last_value,is_called FROM ${quoted(sequence.sequencename)}`,
  );
  sequences.push({ ...sequence, ...values[0] });
}
const rows = await sql.transaction(
  tables.map((name) =>
    sql.query(
      `SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY to_jsonb(t)::text),'[]'::jsonb) AS records, md5(coalesce(jsonb_agg(to_jsonb(t) ORDER BY to_jsonb(t)::text),'[]'::jsonb)::text) AS digest FROM ${quoted(name)} t`,
    ),
  ),
);
const directory = new URL(
  `../.local/database-backups/moving-retirement-${new Date().toISOString().replaceAll(":", "-")}/`,
  import.meta.url,
);
await mkdir(directory, { recursive: true, mode: 0o700 });
const snapshot = {
  createdAt: new Date().toISOString(),
  sequences,
  tables: tables.map((name, i) => ({
    name,
    ...rows[i][0],
    columns: columns.filter((c) => c.table_name === name),
    constraints: constraints.filter((c) => c.table_name === name),
    indexes: indexes.filter((c) => c.table_name === name),
    triggers: triggers.filter((c) => c.table_name === name),
  })),
};
await writeFile(
  new URL("snapshot.json", directory),
  JSON.stringify(snapshot, null, 2),
  { mode: 0o600 },
);
await writeFile(new URL("retirement.sql", directory), migration, {
  mode: 0o600,
});
const ident = (name) => '"' + name.replaceAll('"', '""') + '"';
const literal = (value) => "'" + value.replaceAll("'", "''") + "'";
const restore = [
  "-- Private restore file: run only to recover these retired tables.",
  "BEGIN;",
];
for (const seq of sequences)
  restore.push(
    `CREATE SEQUENCE ${quoted(seq.sequencename)} AS ${seq.data_type} INCREMENT BY ${seq.increment_by} MINVALUE ${seq.min_value} MAXVALUE ${seq.max_value} START WITH ${seq.start_value} CACHE ${seq.cache_size} ${seq.cycle ? "CYCLE" : "NO CYCLE"};`,
  );
for (const table of snapshot.tables) {
  if (table.columns.some((c) => c.attidentity || c.attgenerated))
    throw new Error(
      "Unsupported generated column: backup requires manual review.",
    );
  const definitions = table.columns.map(
    (c) =>
      `${ident(c.column_name)} ${c.sql_type}${c.default_value ? " DEFAULT " + c.default_value : ""}${c.attnotnull ? " NOT NULL" : ""}`,
  );
  restore.push(
    `CREATE TABLE ${quoted(table.name)} (${definitions.join(",\n")});`,
  );
}
for (const table of snapshot.tables) {
  if (table.records.length)
    restore.push(
      `INSERT INTO ${quoted(table.name)} SELECT * FROM jsonb_populate_recordset(NULL::${quoted(table.name)}, ${literal(JSON.stringify(table.records))}::jsonb);`,
    );
  for (const c of table.constraints.filter((c) => c.contype !== "f"))
    restore.push(
      `ALTER TABLE ${quoted(table.name)} ADD CONSTRAINT ${ident(c.conname)} ${c.definition};`,
    );
}
for (const table of snapshot.tables) {
  for (const c of table.constraints.filter((c) => c.contype === "f"))
    restore.push(
      `ALTER TABLE ${quoted(table.name)} ADD CONSTRAINT ${ident(c.conname)} ${c.definition};`,
    );
  for (const i of table.indexes) restore.push(i.definition + ";");
  for (const t of table.triggers) restore.push(t.definition + ";");
}
for (const seq of sequences) {
  restore.push(
    `ALTER SEQUENCE ${quoted(seq.sequencename)} OWNED BY ${quoted(seq.table_name)}.${ident(seq.column_name)};`,
  );
  restore.push(
    `SELECT setval(${literal("public." + seq.sequencename)}, ${seq.last_value}, ${seq.is_called});`,
  );
}
restore.push("COMMIT;");
await writeFile(new URL("restore.sql", directory), restore.join("\n\n"), {
  mode: 0o600,
});

console.log("Private backup:", decodeURIComponent(directory.pathname));
console.log(
  "Retired tables:",
  snapshot.tables.map((t) => `${t.name} (${t.records.length} rows)`).join(", "),
);
if (!apply) {
  console.log(
    "Backup complete. No tables removed. Use --apply to execute retirement.",
  );
  process.exit(0);
}
// Hold exclusive locks before comparing backups, so no write can slip between
// the change check and removal. Any changed data or outside dependency rolls
// the whole transaction back. Never use CASCADE.
const checks = snapshot.tables.map(
  (t) =>
    `DO $check$ BEGIN IF (SELECT md5(coalesce(jsonb_agg(to_jsonb(t) ORDER BY to_jsonb(t)::text),'[]'::jsonb)::text) FROM ${quoted(t.name)} t) <> '${t.digest}' THEN RAISE EXCEPTION 'Table ${t.name} changed after backup; retirement cancelled'; END IF; END $check$`,
);
await sql.transaction([
  sql.query("SET LOCAL lock_timeout='10s'"),
  sql.query(
    `LOCK TABLE ${tables.map(quoted).join(",")} IN ACCESS EXCLUSIVE MODE`,
  ),
  ...checks.map((q) => sql.query(q)),
  ...splitSqlStatements(migration).map((q) => sql.query(q)),
]);
console.log(`Removed ${tables.length} retired tables. Backup retained.`);

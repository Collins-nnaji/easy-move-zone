/**
 * One-way copy of Rekruuter job tables into the EasyMoveZone database.
 * Reads REKRUUTER_DATABASE_URL. Writes DATABASE_URL. Never updates Rekruuter.
 *
 *   node scripts/copy-rekruuter-job-tables.mjs
 */
import { readFileSync } from "node:fs"
import { Pool } from "@neondatabase/serverless"

function envValue(file, key) {
  const text = readFileSync(file, "utf8")
  const match = text.match(new RegExp(`^${key}=(.*)$`, "m"))
  if (!match) return ""
  return match[1].trim().replace(/^["']|["']$/g, "")
}

const sourceUrl = envValue(".env", "REKRUUTER_DATABASE_URL")
const destUrl = envValue(".env", "DATABASE_URL")
if (!sourceUrl || !destUrl) {
  console.error("REKRUUTER_DATABASE_URL and DATABASE_URL are required in .env")
  process.exit(1)
}
if (sourceUrl === destUrl) {
  console.error("Refusing to copy: source and destination are the same database.")
  process.exit(1)
}

const source = new Pool({ connectionString: sourceUrl })
const dest = new Pool({ connectionString: destUrl })

async function ensureSchema() {
  const sql = readFileSync("db/migrations/20260926_skilledjobs_copy.sql", "utf8")
  await dest.query(sql)
  console.log("schema ready")
}

const COLUMN_CASTS = {
  id: "int",
  company_id: "int",
  skills: "jsonb",
  posted_at: "timestamp",
  created_at: "timestamp",
  is_partner_job: "boolean",
  show_on_dashboard: "boolean",
  is_valid: "boolean",
  content_available: "boolean",
  check_count: "int",
  job_id: "int",
  last_checked: "timestamp",
  last_fetched_at: "timestamp",
  last_failed_at: "timestamp",
  updated_at: "timestamp",
}

function placeholders(rowCount, columns) {
  const rows = []
  let n = 1
  for (let r = 0; r < rowCount; r++) {
    const cols = []
    for (const column of columns) {
      const cast = COLUMN_CASTS[column] ? `::${COLUMN_CASTS[column]}` : ""
      cols.push(`$${n++}${cast}`)
    }
    rows.push(`(${cols.join(",")})`)
  }
  return rows.join(",")
}

async function countOf(pool, table) {
  const { rows } = await pool.query(`SELECT count(*)::int AS n FROM skilledjobs.${table}`)
  return rows[0].n
}

async function copySimple(table, columns, conflict) {
  const already = await countOf(dest, table)
  const sourceCount = await countOf(source, table)
  if (already >= sourceCount && sourceCount > 0) {
    console.log(`${table}: already copied (${already})`)
    return
  }
  let lastId = null
  let copied = 0
  const idCol = columns[0]
  for (;;) {
    const { rows } = await source.query(
      `SELECT ${columns.join(", ")} FROM skilledjobs.${table}
       WHERE ($${1}::int IS NULL OR ${idCol} > $1)
       ORDER BY ${idCol} ASC
       LIMIT 400`,
      [lastId],
    )
    if (rows.length === 0) break
    const values = []
    for (const row of rows) {
      for (const col of columns) values.push(row[col])
    }
    await dest.query(
      `INSERT INTO skilledjobs.${table} (${columns.join(", ")})
       VALUES ${placeholders(rows.length, columns)}
       ON CONFLICT ${conflict} DO NOTHING`,
      values,
    )
    lastId = rows[rows.length - 1][idCol]
    copied += rows.length
    process.stdout.write(`\r${table}: ${copied}`)
  }
  console.log(`\n${table}: ${copied} read`)
}

async function copyTextArrayTable(table, columns, conflict) {
  const already = await countOf(dest, table)
  const sourceCount = await countOf(source, table)
  if (already >= sourceCount && sourceCount > 0) {
    console.log(`${table}: already copied (${already})`)
    return
  }
  let lastId = null
  let copied = 0
  for (;;) {
    const { rows } = await source.query(
      `SELECT ${columns.join(", ")} FROM skilledjobs.${table}
       WHERE ($1::int IS NULL OR id > $1)
       ORDER BY id ASC
       LIMIT 80`,
      [lastId],
    )
    if (rows.length === 0) break
    const values = []
    for (const row of rows) {
      for (const col of columns) {
        if (col === "skills") values.push(JSON.stringify(row.skills ?? []))
        else values.push(row[col])
      }
    }
    const valueSql = placeholders(rows.length, columns)
    const selectCols = columns
      .map((col) => (col === "skills" ? `ARRAY(SELECT jsonb_array_elements_text(skills))` : col))
      .join(", ")
    await dest.query(
      `INSERT INTO skilledjobs.${table} (${columns.join(", ")})
       SELECT ${selectCols}
       FROM (VALUES ${valueSql}) AS v(${columns.join(", ")})
       ON CONFLICT ${conflict} DO NOTHING`,
      values,
    )
    lastId = rows[rows.length - 1].id
    copied += rows.length
    process.stdout.write(`\r${table}: ${copied}`)
  }
  console.log(`\n${table}: ${copied} read`)
}

async function copyOccupationCodes() {
  const already = await countOf(dest, "occupation_codes")
  if (already >= 270) {
    console.log(`occupation_codes: already copied (${already})`)
    return
  }
  const columns = ["code", "job_type", "related_job_titles", "standard_going_rate", "lower_going_rate", "created_at"]
  let last = ""
  let copied = 0
  for (;;) {
    const { rows } = await source.query(
      `SELECT ${columns.join(", ")} FROM skilledjobs.occupation_codes
       WHERE code > $1
       ORDER BY code ASC
       LIMIT 200`,
      [last],
    )
    if (rows.length === 0) break
    const values = []
    for (const row of rows) for (const col of columns) values.push(row[col])
    await dest.query(
      `INSERT INTO skilledjobs.occupation_codes (${columns.join(", ")})
       VALUES ${placeholders(rows.length, columns)}
       ON CONFLICT (code) DO NOTHING`,
      values,
    )
    last = rows[rows.length - 1].code
    copied += rows.length
  }
  console.log(`occupation_codes: ${copied} read`)
}

async function bumpSequences() {
  const tables = ["jobs", "sponsored_companies", "saved_job_urls", "staged_jobs", "staff_companies", "company_logos", "url_validation_history"]
  for (const table of tables) {
    await dest.query(
      `SELECT setval(
         pg_get_serial_sequence('skilledjobs.${table}', 'id'),
         GREATEST(COALESCE((SELECT MAX(id) FROM skilledjobs.${table}), 1), 1),
         true
       )`,
    )
  }
}

const jobColumns = [
  "id", "title", "company", "location", "description", "category", "experience_level",
  "job_type", "visa_type", "skills", "url", "logo_url", "posted_at", "expires_at",
  "external_id", "is_partner_job", "country",
]
const stagedColumns = [
  "id", "company_id", "title", "company", "location", "description", "category",
  "experience_level", "job_type", "visa_type", "skills", "url", "posted_at", "expires_at",
  "status", "reviewer_notes", "created_by", "created_at", "external_id", "is_partner_job", "country",
]

try {
  await ensureSchema()
  await copySimple(
    "sponsored_companies",
    ["id", "name", "city", "county", "type_and_rating", "route", "created_at"],
    "(id)",
  )
  await copyOccupationCodes()
  await copySimple(
    "saved_job_urls",
    ["id", "label", "url", "company", "category", "last_fetched_at", "created_at", "last_fetch_status", "last_fetch_error", "last_failed_at", "show_on_dashboard"],
    "(id)",
  )
  await copySimple(
    "company_logos",
    ["id", "company_name", "logo_url", "aliases", "created_at", "updated_at"],
    "(id)",
  )
  await copySimple(
    "url_validation_history",
    ["id", "job_id", "url", "status", "is_valid", "content_available", "last_checked", "check_count", "error_message"],
    "(id)",
  )
  await copyTextArrayTable("jobs", jobColumns, "(id)")
  await copyTextArrayTable("staged_jobs", stagedColumns, "(id)")
  await bumpSequences()

  const check = await dest.query(`
    SELECT
      (SELECT count(*) FROM skilledjobs.jobs) AS jobs,
      (SELECT count(*) FROM skilledjobs.sponsored_companies) AS sponsors,
      (SELECT count(*) FROM skilledjobs.occupation_codes) AS codes,
      (SELECT count(*) FROM skilledjobs.saved_job_urls) AS urls
  `)
  console.log("destination counts", check.rows[0])
} finally {
  await source.end()
  await dest.end()
}

import { existsSync, statSync } from "node:fs"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import JSZip from "jszip"

const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36"

export type Row = Record<string, string>

export async function download(url: string, dest: string, maxAgeHours = 20): Promise<string> {
  if (existsSync(dest) && Date.now() - statSync(dest).mtimeMs < maxAgeHours * 3600_000) return dest
  await mkdir(path.dirname(dest), { recursive: true })
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(180_000) })
  if (!res.ok) throw new Error(`Download failed (${res.status}) for ${url}`)
  await writeFile(dest, Buffer.from(await res.arrayBuffer()))
  return dest
}

export async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(60_000) })
  if (!res.ok) throw new Error(`Request failed (${res.status}) for ${url}`)
  return res.text()
}

/** RFC 4180 CSV: quoted fields may contain commas, quotes ("") and newlines. */
export function parseCsv(text: string, delimiter = ","): Row[] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let quoted = false
  let fieldStart = true
  const input = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text
  for (let i = 0; i < input.length; i++) {
    const ch = input[i]
    if (quoted) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          field += '"'
          i++
        } else quoted = false
      } else field += ch
    } else if (ch === '"' && fieldStart) {
      quoted = true
      fieldStart = false
    } else if (ch === delimiter) {
      row.push(field)
      field = ""
      fieldStart = true
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && input[i + 1] === "\n") i++
      row.push(field)
      rows.push(row)
      row = []
      field = ""
      fieldStart = true
    } else {
      field += ch
      fieldStart = false
    }
  }
  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }
  const [header, ...body] = rows
  if (!header) return []
  const keys = header.map((key) => key.trim())
  return body
    .filter((cells) => cells.some((cell) => cell.trim()))
    .map((cells) => Object.fromEntries(keys.map((key, i) => [key, (cells[i] ?? "").trim()])))
}

export async function readCsv(file: string, delimiter = ","): Promise<Row[]> {
  return parseCsv(await readFile(file, "utf8"), delimiter)
}

export async function readZipCsvs(file: string, names: string[]): Promise<Record<string, Row[]>> {
  const zip = await JSZip.loadAsync(await readFile(file))
  const out: Record<string, Row[]> = {}
  for (const name of names) {
    const entry = Object.values(zip.files).find((f) => !f.dir && path.basename(f.name).toUpperCase() === name.toUpperCase())
    if (!entry) throw new Error(`${name} not found in ${path.basename(file)}`)
    out[name] = parseCsv(await entry.async("string"))
  }
  return out
}

const XML_ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" }
const decodeXml = (value: string) =>
  value.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (match, entity: string) => {
    if (entity[0] === "#") return String.fromCodePoint(entity[1].toLowerCase() === "x" ? parseInt(entity.slice(2), 16) : Number(entity.slice(1)))
    return XML_ENTITIES[entity] ?? match
  })
const textRuns = (xml: string) => [...xml.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map((m) => decodeXml(m[1])).join("")

/** Reads the first worksheet of an .xlsx file into rows keyed by column letter (A, B, …). */
export async function readXlsx(file: string): Promise<Array<Record<string, string>>> {
  const zip = await JSZip.loadAsync(await readFile(file))
  const shared = zip.file("xl/sharedStrings.xml")
  const strings = shared ? [...(await shared.async("string")).matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => textRuns(m[1])) : []
  const sheet = zip.file("xl/worksheets/sheet1.xml")
  if (!sheet) throw new Error(`No worksheet in ${path.basename(file)}`)
  const xml = await sheet.async("string")
  const rows: Array<Record<string, string>> = []
  for (const rowMatch of xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
    const row: Record<string, string> = {}
    for (const cell of rowMatch[1].matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attrs = cell[1]
      const col = attrs.match(/\br="([A-Z]+)\d+"/)?.[1]
      if (!col) continue
      const type = attrs.match(/\bt="(\w+)"/)?.[1]
      const body = cell[2] ?? ""
      const raw = body.match(/<v>([\s\S]*?)<\/v>/)?.[1]
      const value = type === "s" ? strings[Number(raw)] ?? "" : type === "inlineStr" ? textRuns(body) : decodeXml(raw ?? "")
      row[col] = value.trim()
    }
    rows.push(row)
  }
  return rows
}

export function titleCase(value: string) {
  return value
    .toLowerCase()
    .replace(/\b([a-z])/g, (ch) => ch.toUpperCase())
    .replace(/\b(Of|And|The|Upon|On|In|De|Den|Der|Aan)\b/g, (word, _w, offset) => (offset === 0 ? word : word.toLowerCase()))
}

export function normaliseName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\b(the|limited|ltd|plc|stichting|trading as|t\/a)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

export function websiteUrl(value: string | null | undefined): string | null {
  const raw = (value ?? "").trim()
  if (!raw || !/[a-z0-9-]+\.[a-z]{2,}/i.test(raw)) return null
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`)
    return url.origin
  } catch {
    return null
  }
}

export function mode<T>(values: T[]): T | undefined {
  const counts = new Map<T, number>()
  let best: T | undefined
  let bestCount = 0
  for (const value of values) {
    const n = (counts.get(value) ?? 0) + 1
    counts.set(value, n)
    if (n > bestCount) {
      best = value
      bestCount = n
    }
  }
  return best
}

import { neon } from "@neondatabase/serverless"
import { excerptFromText, extractDocumentText } from "./extract-text"
import type { CheckDocumentKind, CheckDocumentMeta } from "./types"
import {
  deleteObject,
  isObjectStorageConfigured,
  storeAppFile,
  vaultBucket,
} from "@/lib/storage/s3"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

let ensured = false

export async function ensureCheckTables() {
  if (!sql || ensured) return
  await sql`
    create table if not exists mobility_check_documents (
      id uuid primary key default gen_random_uuid(),
      session_id text not null,
      auth_user_id text,
      kind text not null default 'other',
      file_name text not null,
      file_mime text,
      storage_bucket text,
      storage_key text,
      extracted_text text,
      extracted_data jsonb,
      excerpt text,
      bytes integer not null default 0,
      created_at timestamptz not null default now()
    )
  `
  await sql`alter table mobility_check_documents add column if not exists extracted_data jsonb`
  await sql`
    create table if not exists mobility_check_runs (
      id uuid primary key default gen_random_uuid(),
      session_id text not null,
      auth_user_id text,
      input jsonb not null,
      result jsonb not null,
      sources jsonb,
      created_at timestamptz not null default now()
    )
  `
  ensured = true
}

const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
])

const IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp"])

export function isAllowedCheckUpload(mime: string | null | undefined, fileName: string, allowImages = false) {
  const name = fileName.toLowerCase()
  if (mime && ALLOWED_MIME.has(mime)) return true
  if (allowImages && mime && IMAGE_MIME.has(mime)) return true
  if (allowImages && /\.(jpe?g|png|webp)$/i.test(name)) return true
  return /\.(pdf|docx|doc|txt|md)$/i.test(name)
}

export async function saveCheckDocument(input: {
  sessionId: string
  authUserId?: string | null
  kind: CheckDocumentKind
  fileName: string
  fileMime?: string | null
  base64: string
  extractedText?: string
  extractedData?: unknown
  /** Profile vault uploads can be scans or photos; they only need the original file kept. */
  requireText?: boolean
  allowImages?: boolean
}): Promise<CheckDocumentMeta> {
  if (!sql) throw new Error("Database is not configured")
  await ensureCheckTables()
  const requireText = input.requireText ?? true

  if (!isAllowedCheckUpload(input.fileMime, input.fileName, input.allowImages)) {
    throw new Error(input.allowImages
      ? "Upload a PDF, Word, text, or image (JPG, PNG, WebP) file."
      : "Upload a PDF, Word (.docx), or text file.")
  }

  const buffer = Buffer.from(input.base64, "base64")
  if (buffer.byteLength > 10 * 1024 * 1024) {
    throw new Error("Each file must be 10MB or smaller.")
  }

  const text = input.extractedText ?? (requireText
    ? await extractDocumentText({ buffer, mime: input.fileMime, fileName: input.fileName })
    : "")
  if (requireText && text.length < 40) {
    throw new Error("We could not extract enough text from that file.")
  }
  if (!requireText && !text && !isObjectStorageConfigured()) {
    throw new Error("Document storage is not configured, and no text could be read from this file.")
  }

  let storageBucket: string | null = null
  let storageKey: string | null = null
  if (isObjectStorageConfigured()) {
    const stored = await storeAppFile({
      prefix: `check/${input.kind}`,
      userId: input.authUserId || input.sessionId,
      mime: input.fileMime || "application/octet-stream",
      base64: input.base64,
      bucket: vaultBucket(),
      maxBytes: 10 * 1024 * 1024,
    })
    storageBucket = stored.bucket
    storageKey = stored.key
  }

  const rows = await sql`
    insert into mobility_check_documents (
      session_id, auth_user_id, kind, file_name, file_mime,
      storage_bucket, storage_key, extracted_text, extracted_data, excerpt, bytes
    )
    values (
      ${input.sessionId},
      ${input.authUserId ?? null},
      ${input.kind},
      ${input.fileName},
      ${input.fileMime ?? null},
      ${storageBucket},
      ${storageKey},
      ${text},
      ${input.extractedData == null ? null : JSON.stringify(input.extractedData)}::jsonb,
      ${excerptFromText(text)},
      ${buffer.byteLength}
    )
    returning id, kind, file_name, file_mime, bytes, excerpt, created_at, storage_key
  `

  const row = rows[0]
  return {
    id: String(row.id),
    kind: row.kind as CheckDocumentKind,
    fileName: String(row.file_name),
    fileMime: row.file_mime ? String(row.file_mime) : null,
    bytes: Number(row.bytes ?? 0),
    excerpt: row.excerpt ? String(row.excerpt) : null,
    createdAt: String(row.created_at),
    hasFile: Boolean(row.storage_key),
  }
}

export async function listCheckDocuments(sessionId: string): Promise<CheckDocumentMeta[]> {
  if (!sql) return []
  await ensureCheckTables()
  const rows = await sql`
    select id, kind, file_name, file_mime, bytes, excerpt, created_at
    from mobility_check_documents
    where session_id = ${sessionId}
    order by created_at desc
    limit 20
  `
  return rows.map((row) => ({
    id: String(row.id),
    kind: row.kind as CheckDocumentKind,
    fileName: String(row.file_name),
    fileMime: row.file_mime ? String(row.file_mime) : null,
    bytes: Number(row.bytes ?? 0),
    excerpt: row.excerpt ? String(row.excerpt) : null,
    createdAt: String(row.created_at),
  }))
}

export async function loadDocumentTexts(ids: string[], sessionId: string) {
  if (!sql || ids.length === 0) return []
  await ensureCheckTables()
  const rows = await sql`
    select id, kind, file_name, extracted_text
    from mobility_check_documents
    where session_id = ${sessionId}
      and id = any(${ids}::uuid[])
  `
  return rows.map((row) => ({
    id: String(row.id),
    kind: String(row.kind),
    fileName: String(row.file_name),
    text: String(row.extracted_text ?? ""),
  }))
}

export async function deleteCheckDocument(id: string, sessionId: string) {
  if (!sql) return
  await ensureCheckTables()
  const rows = await sql`
    delete from mobility_check_documents
    where id = ${id}::uuid and session_id = ${sessionId}
    returning storage_bucket, storage_key
  `
  const row = rows[0]
  if (row?.storage_bucket && row?.storage_key) {
    await deleteObject(String(row.storage_bucket), String(row.storage_key)).catch(() => undefined)
  }
}

export function profileVaultSessionId(authUserId: string) {
  return `profile:${authUserId}`
}

export async function listProfileDocuments(authUserId: string): Promise<CheckDocumentMeta[]> {
  if (!sql) return []
  await ensureCheckTables()
  const sessionId = profileVaultSessionId(authUserId)
  const rows = await sql`
    select id, kind, file_name, file_mime, bytes, excerpt, created_at, storage_key
    from mobility_check_documents
    where auth_user_id = ${authUserId}
       or session_id = ${sessionId}
    order by created_at desc
    limit 50
  `
  return rows.map((row) => ({
    id: String(row.id),
    kind: row.kind as CheckDocumentKind,
    fileName: String(row.file_name),
    fileMime: row.file_mime ? String(row.file_mime) : null,
    bytes: Number(row.bytes ?? 0),
    excerpt: row.excerpt ? String(row.excerpt) : null,
    createdAt: String(row.created_at),
    hasFile: Boolean(row.storage_key),
  }))
}

export async function getProfileDocumentFile(id: string, authUserId: string) {
  if (!sql) return null
  await ensureCheckTables()
  const sessionId = profileVaultSessionId(authUserId)
  const rows = await sql`
    select file_name, file_mime, storage_bucket, storage_key, extracted_text
    from mobility_check_documents
    where id = ${id}::uuid
      and (auth_user_id = ${authUserId} or session_id = ${sessionId})
    limit 1
  `
  const row = rows[0]
  if (!row) return null
  return {
    fileName: String(row.file_name),
    fileMime: row.file_mime ? String(row.file_mime) : null,
    bucket: row.storage_bucket ? String(row.storage_bucket) : null,
    key: row.storage_key ? String(row.storage_key) : null,
    text: String(row.extracted_text ?? ""),
  }
}

export async function getProfileDocument(id: string, authUserId: string) {
  if (!sql) return null
  await ensureCheckTables()
  const sessionId = profileVaultSessionId(authUserId)
  const rows = await sql`
    select id, kind, file_name, file_mime, bytes, excerpt, extracted_text, extracted_data, created_at
    from mobility_check_documents
    where id = ${id}::uuid
      and (auth_user_id = ${authUserId} or session_id = ${sessionId})
    limit 1
  `
  const row = rows[0]
  if (!row) return null
  return {
    id: String(row.id), kind: String(row.kind), fileName: String(row.file_name),
    fileMime: row.file_mime ? String(row.file_mime) : null, bytes: Number(row.bytes ?? 0),
    excerpt: row.excerpt ? String(row.excerpt) : null, text: String(row.extracted_text ?? ""),
    data: row.extracted_data ?? null, createdAt: String(row.created_at),
  }
}

export async function loadLatestProfileCvText(authUserId: string): Promise<string> {
  if (!sql) return ""
  await ensureCheckTables()
  const sessionId = profileVaultSessionId(authUserId)
  const rows = await sql`
    select extracted_text
    from mobility_check_documents
    where kind = 'cv'
      and (auth_user_id = ${authUserId} or session_id = ${sessionId})
      and coalesce(extracted_text, '') <> ''
    order by created_at desc
    limit 1
  `
  return String(rows[0]?.extracted_text ?? "")
}

export async function loadLatestProfileCv(authUserId: string): Promise<{ text: string; data: unknown | null }> {
  if (!sql) return { text: "", data: null }
  await ensureCheckTables()
  const sessionId = profileVaultSessionId(authUserId)
  const rows = await sql`
    select extracted_text, extracted_data
    from mobility_check_documents
    where kind = 'cv'
      and (auth_user_id = ${authUserId} or session_id = ${sessionId})
      and coalesce(extracted_text, '') <> ''
    order by created_at desc
    limit 1
  `
  return {
    text: String(rows[0]?.extracted_text ?? ""),
    data: rows[0]?.extracted_data ?? null,
  }
}

export async function deleteProfileDocument(id: string, authUserId: string) {
  if (!sql) return
  await ensureCheckTables()
  const sessionId = profileVaultSessionId(authUserId)
  const rows = await sql`
    delete from mobility_check_documents
    where id = ${id}::uuid
      and (auth_user_id = ${authUserId} or session_id = ${sessionId})
    returning storage_bucket, storage_key
  `
  const row = rows[0]
  if (row?.storage_bucket && row?.storage_key) {
    await deleteObject(String(row.storage_bucket), String(row.storage_key)).catch(() => undefined)
  }
}

export async function saveCheckRun(input: {
  sessionId: string
  authUserId?: string | null
  payload: unknown
  result: unknown
  sources: unknown
}) {
  if (!sql) return null
  await ensureCheckTables()
  const rows = await sql`
    insert into mobility_check_runs (session_id, auth_user_id, input, result, sources)
    values (
      ${input.sessionId},
      ${input.authUserId ?? null},
      ${JSON.stringify(input.payload)}::jsonb,
      ${JSON.stringify(input.result)}::jsonb,
      ${JSON.stringify(input.sources)}::jsonb
    )
    returning id
  `
  return rows[0]?.id ? String(rows[0].id) : null
}

import { neon } from "@neondatabase/serverless"
import { neonAuth } from "@neondatabase/auth/next/server"
import { deleteFileFromIdrive, getPresignedDownloadUrl } from "@/lib/storage/idrive"
import {
  ALLOWED_DOCUMENT_STATUSES,
  ALLOWED_DOCUMENT_TYPES,
  DOCUMENT_SELECT,
  mapDocumentRow,
  type DocumentRow,
} from "@/lib/visa/map-document"
import { safeDate } from "@/lib/visa/map-application"
import type { DocumentStatus, DocumentType } from "@/lib/visa/types"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })
    const authUserId = String(user.id)
    const { id } = await context.params

    const body = (await request.json()) as {
      label?: string
      documentType?: DocumentType
      status?: DocumentStatus
      expiryDate?: string | null
    }

    const existingRaw = await sql.query(
      `select ${DOCUMENT_SELECT} from visa_documents where id = $1 and auth_user_id = $2 limit 1`,
      [id, authUserId],
    )
    const current = (existingRaw as DocumentRow[])[0]
    if (!current) return Response.json({ error: "Document not found." }, { status: 404 })

    const label = body.label === undefined ? current.label : String(body.label).trim() || current.label
    const documentType = ALLOWED_DOCUMENT_TYPES.has(body.documentType as DocumentType)
      ? (body.documentType as DocumentType)
      : current.document_type
    const status = ALLOWED_DOCUMENT_STATUSES.has(body.status as DocumentStatus)
      ? (body.status as DocumentStatus)
      : current.status
    const expiryDate = body.expiryDate === undefined ? current.expiry_date : safeDate(body.expiryDate)

    const rowsRaw = await sql.query(
      `update visa_documents set
        label = $1, document_type = $2, status = $3, expiry_date = $4, updated_at = now()
       where id = $5 and auth_user_id = $6
       returning ${DOCUMENT_SELECT}`,
      [label, documentType, status, expiryDate, id, authUserId],
    )

    const row = (rowsRaw as DocumentRow[])[0]
    if (!row) return Response.json({ error: "Unable to update document." }, { status: 500 })

    let viewUrl: string | undefined
    try {
      viewUrl = await getPresignedDownloadUrl(row.file_key)
    } catch {
      viewUrl = undefined
    }
    return Response.json({ document: mapDocumentRow(row, viewUrl) }, { status: 200 })
  } catch {
    return Response.json({ error: "Unable to update document." }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })
    const authUserId = String(user.id)
    const { id } = await context.params

    const result = await sql.query(
      `delete from visa_documents where id = $1 and auth_user_id = $2 returning file_key`,
      [id, authUserId],
    )
    const rows = result as Array<{ file_key: string }>
    const deleted = rows[0]
    if (!deleted) return Response.json({ error: "Document not found." }, { status: 404 })

    try {
      await deleteFileFromIdrive(deleted.file_key)
    } catch {
      // DB row is already gone; storage cleanup failure shouldn't fail the request.
    }

    return Response.json({ ok: true }, { status: 200 })
  } catch {
    return Response.json({ error: "Unable to delete document." }, { status: 500 })
  }
}

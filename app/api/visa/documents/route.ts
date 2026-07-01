import { neon } from "@neondatabase/serverless"
import { neonAuth } from "@neondatabase/auth/next/server"
import { getPresignedDownloadUrl } from "@/lib/storage/idrive"
import {
  ALLOWED_DOCUMENT_TYPES,
  DOCUMENT_SELECT,
  mapDocumentRow,
  type DocumentRow,
} from "@/lib/visa/map-document"
import { safeDate } from "@/lib/visa/map-application"
import type { DocumentType } from "@/lib/visa/types"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

async function ownsApplication(authUserId: string, applicationId: string): Promise<boolean> {
  const rowsRaw = await sql!.query(
    `select id from visa_applications where id = $1 and auth_user_id = $2 limit 1`,
    [applicationId, authUserId],
  )
  return (rowsRaw as Array<{ id: string }>).length > 0
}

export async function GET(request: Request) {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })
    const authUserId = String(user.id)

    const { searchParams } = new URL(request.url)
    const applicationId = String(searchParams.get("applicationId") ?? "").trim()
    if (!applicationId) return Response.json({ error: "applicationId is required." }, { status: 400 })

    const rowsRaw = await sql.query(
      `select ${DOCUMENT_SELECT} from visa_documents
       where auth_user_id = $1 and application_id = $2
       order by uploaded_at desc`,
      [authUserId, applicationId],
    )
    const rows = rowsRaw as DocumentRow[]
    const documents = await Promise.all(
      rows.map(async (row) => {
        try {
          const viewUrl = await getPresignedDownloadUrl(row.file_key)
          return mapDocumentRow(row, viewUrl)
        } catch {
          return mapDocumentRow(row)
        }
      }),
    )
    return Response.json({ documents }, { status: 200 })
  } catch {
    return Response.json({ error: "Unable to load documents." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })
    const authUserId = String(user.id)

    const body = (await request.json()) as {
      applicationId?: string
      documentType?: DocumentType
      label?: string
      fileKey?: string
      mimeType?: string
      fileSizeBytes?: number
      expiryDate?: string | null
    }

    const applicationId = String(body.applicationId ?? "").trim()
    const fileKey = String(body.fileKey ?? "").trim()
    const mimeType = String(body.mimeType ?? "").trim()
    const label = String(body.label ?? "").trim()
    if (!applicationId || !fileKey || !mimeType || !label) {
      return Response.json({ error: "applicationId, fileKey, mimeType, and label are required." }, { status: 400 })
    }
    if (!(await ownsApplication(authUserId, applicationId))) {
      return Response.json({ error: "Application not found." }, { status: 404 })
    }

    const documentType = ALLOWED_DOCUMENT_TYPES.has(body.documentType as DocumentType)
      ? (body.documentType as DocumentType)
      : "other"
    const fileSizeBytes = Number.isFinite(body.fileSizeBytes) ? Number(body.fileSizeBytes) : 0
    const expiryDate = safeDate(body.expiryDate)

    // file_url is not the canonical access URL for private documents — the GET
    // endpoint always issues a fresh presigned URL from file_key instead.
    const rowsRaw = await sql.query(
      `insert into visa_documents (
        application_id, auth_user_id, document_type, label, file_key, file_url,
        mime_type, file_size_bytes, expiry_date
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      returning ${DOCUMENT_SELECT}`,
      [applicationId, authUserId, documentType, label, fileKey, fileKey, mimeType, fileSizeBytes, expiryDate],
    )

    const row = (rowsRaw as DocumentRow[])[0]
    if (!row) return Response.json({ error: "Unable to register document." }, { status: 500 })

    let viewUrl: string | undefined
    try {
      viewUrl = await getPresignedDownloadUrl(row.file_key)
    } catch {
      viewUrl = undefined
    }
    return Response.json({ document: mapDocumentRow(row, viewUrl) }, { status: 200 })
  } catch {
    return Response.json({ error: "Unable to register document." }, { status: 500 })
  }
}

import { driverSql } from "@/lib/driver/db";

const REQUIRED_DOC_KEYS = ["cdl", "background", "medical", "insurance"] as const;
const MAX_FILE_BYTES = 1_500_000; // ~1.5MB base64 payload safety

export async function refreshDriverVerifiedBadge(authUserId: string) {
  if (!driverSql) return false;

  const rows = (await driverSql.query(
    `select count(*)::int as cnt
     from driver_compliance_docs
     where auth_user_id = $1
       and doc_key = any($2::text[])
       and status = 'verified'`,
    [authUserId, [...REQUIRED_DOC_KEYS]],
  )) as Array<{ cnt: number }>;

  const verified = (rows[0]?.cnt ?? 0) >= REQUIRED_DOC_KEYS.length;
  await driverSql.query(
    `update driver_profiles set verified = $2, updated_at = now() where auth_user_id = $1`,
    [authUserId, verified],
  );
  return verified;
}

export async function uploadComplianceDocument(input: {
  authUserId: string;
  docKey: string;
  fileName?: string;
  fileMime?: string;
  fileBase64?: string;
}) {
  if (!driverSql) throw new Error("Database not configured.");

  const docKey = input.docKey.trim();
  if (!docKey) throw new Error("Document type required.");

  if (input.fileBase64) {
    const approxBytes = Math.floor((input.fileBase64.length * 3) / 4);
    if (approxBytes > MAX_FILE_BYTES) {
      throw new Error("File too large. Max upload size is about 1.5MB.");
    }
  }

  // Uploads enter the ops review queue; admins approve in /admin/kyc.
  const nextStatus = "pending";

  const rows = (await driverSql.query(
    `update driver_compliance_docs
     set status = $3,
         detail = coalesce(detail, ''),
         file_name = coalesce($4, file_name),
         file_mime = coalesce($5, file_mime),
         file_data = coalesce($6, file_data),
         file_url = case when $6 is not null then '/api/driver/vault/file/' || id::text else file_url end,
         reviewed_at = case when $6 is not null then null else reviewed_at end,
         reviewed_by = case when $6 is not null then null else reviewed_by end,
         reviewer_notes = case when $6 is not null then null else reviewer_notes end,
         updated_at = now()
     where auth_user_id = $1 and doc_key = $2
     returning id, status, file_name`,
    [
      input.authUserId,
      docKey,
      nextStatus,
      input.fileName ?? null,
      input.fileMime ?? null,
      input.fileBase64 ?? null,
    ],
  )) as Array<{ id: string; status: string; file_name: string | null }>;

  if (!rows[0]) throw new Error("Document type not found.");

  // Fix file_url now that we know id
  if (input.fileBase64) {
    await driverSql.query(
      `update driver_compliance_docs
       set file_url = $2, updated_at = now()
       where id = $1`,
      [rows[0].id, `/api/driver/vault/file/${rows[0].id}`],
    );
  }

  const verified = await refreshDriverVerifiedBadge(input.authUserId);
  return { id: rows[0].id, status: rows[0].status, verified };
}

export async function getComplianceFile(authUserId: string, docId: string) {
  if (!driverSql) return null;
  const rows = (await driverSql.query(
    `select id, file_name, file_mime, file_data, auth_user_id
     from driver_compliance_docs
     where id = $1`,
    [docId],
  )) as Array<{
    id: string;
    file_name: string | null;
    file_mime: string | null;
    file_data: string | null;
    auth_user_id: string;
  }>;

  const row = rows[0];
  if (!row?.file_data) return null;
  // Owner can always fetch; others get metadata-only denial for privacy
  if (row.auth_user_id !== authUserId) return null;
  return row;
}

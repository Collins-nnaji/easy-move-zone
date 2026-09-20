import { driverSql } from "@/lib/driver/db";
import {
  getObjectBuffer,
  isObjectStorageConfigured,
  storeAppFile,
  vaultBucket,
} from "@/lib/storage/s3";

const REQUIRED_DOC_KEYS = ["cdl", "background", "medical", "insurance"] as const;
const MAX_PG_FILE_BYTES = 1_500_000;
const MAX_S3_FILE_BYTES = 10 * 1024 * 1024;

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

  let storageBucket: string | null = null;
  let storageKey: string | null = null;
  let fileData: string | null = input.fileBase64 ?? null;

  if (input.fileBase64) {
    const approxBytes = Math.floor((input.fileBase64.length * 3) / 4);
    if (isObjectStorageConfigured()) {
      if (approxBytes > MAX_S3_FILE_BYTES) {
        throw new Error("File too large. Max upload size is 10MB.");
      }
      const stored = await storeAppFile({
        prefix: `vault/${docKey}`,
        userId: input.authUserId,
        mime: input.fileMime,
        base64: input.fileBase64,
        bucket: vaultBucket(),
        maxBytes: MAX_S3_FILE_BYTES,
      });
      storageBucket = stored.bucket;
      storageKey = stored.key;
      fileData = null;
    } else if (approxBytes > MAX_PG_FILE_BYTES) {
      throw new Error("File too large. Max upload size is about 1.5MB.");
    }
  }

  const nextStatus = "pending";
  const hasNewFile = Boolean(input.fileBase64);

  const rows = (await driverSql.query(
    `update driver_compliance_docs
     set status = $3,
         detail = coalesce(detail, ''),
         file_name = coalesce($4, file_name),
         file_mime = coalesce($5, file_mime),
         file_data = case when $6::boolean then $7 else file_data end,
         storage_bucket = case when $6::boolean then $8 else storage_bucket end,
         storage_key = case when $6::boolean then $9 else storage_key end,
         file_url = case when $6::boolean then '/api/driver/vault/file/' || id::text else file_url end,
         reviewed_at = case when $6::boolean then null else reviewed_at end,
         reviewed_by = case when $6::boolean then null else reviewed_by end,
         reviewer_notes = case when $6::boolean then null else reviewer_notes end,
         updated_at = now()
     where auth_user_id = $1 and doc_key = $2
     returning id, status, file_name`,
    [
      input.authUserId,
      docKey,
      nextStatus,
      input.fileName ?? null,
      input.fileMime ?? null,
      hasNewFile,
      fileData,
      storageBucket,
      storageKey,
    ],
  )) as Array<{ id: string; status: string; file_name: string | null }>;

  if (!rows[0]) throw new Error("Document type not found.");

  if (hasNewFile) {
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

export type ComplianceFile = {
  id: string;
  file_name: string | null;
  file_mime: string | null;
  bytes: Buffer;
  auth_user_id: string;
};

export async function resolveStoredBytes(row: {
  file_data: string | null;
  storage_bucket: string | null;
  storage_key: string | null;
}) {
  if (row.storage_key) {
    const buf = await getObjectBuffer(row.storage_bucket || vaultBucket(), row.storage_key);
    return buf;
  }
  if (row.file_data) return Buffer.from(row.file_data, "base64");
  return null;
}

export async function getComplianceFile(authUserId: string, docId: string): Promise<ComplianceFile | null> {
  if (!driverSql) return null;
  const rows = (await driverSql.query(
    `select id, file_name, file_mime, file_data, storage_bucket, storage_key, auth_user_id
     from driver_compliance_docs
     where id = $1`,
    [docId],
  )) as Array<{
    id: string;
    file_name: string | null;
    file_mime: string | null;
    file_data: string | null;
    storage_bucket: string | null;
    storage_key: string | null;
    auth_user_id: string;
  }>;

  const row = rows[0];
  if (!row) return null;
  if (row.auth_user_id !== authUserId) return null;
  const bytes = await resolveStoredBytes(row);
  if (!bytes) return null;
  return {
    id: row.id,
    file_name: row.file_name,
    file_mime: row.file_mime,
    bytes,
    auth_user_id: row.auth_user_id,
  };
}

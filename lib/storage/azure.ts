/**
 * Azure Blob Storage utility for property image and document uploads.
 * Requires env vars: AZURE_STORAGE_CONNECTION_STRING, AZURE_STORAGE_CONTAINER
 *
 * Falls back to IDrive E2 if Azure is not configured.
 */

const AZURE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING ?? ""
const AZURE_CONTAINER = process.env.AZURE_STORAGE_CONTAINER ?? "properties"
/** Optional public base (no trailing slash). If unset, SDK blob URL is used. */
const AZURE_STORAGE_URL = (process.env.AZURE_STORAGE_URL ?? "").replace(/\/+$/, "")

export type UploadedFile = {
  key: string
  url: string
}

export type AllowedFileType = "image" | "document"

const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
])

const DOCUMENT_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
])

const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024

export function validateFileType(mimeType: string, type: AllowedFileType): boolean {
  if (type === "image") return IMAGE_MIME_TYPES.has(mimeType)
  if (type === "document") return DOCUMENT_MIME_TYPES.has(mimeType)
  return false
}

export function validateFileSize(sizeBytes: number, type: AllowedFileType): boolean {
  if (type === "image") return sizeBytes <= MAX_IMAGE_BYTES
  if (type === "document") return sizeBytes <= MAX_DOCUMENT_BYTES
  return false
}

function buildKey(folder: string, filename: string): string {
  const timestamp = Date.now()
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_")
  return `${folder}/${timestamp}_${safe}`
}

export function isAzureConfigured(): boolean {
  return !!(AZURE_CONNECTION_STRING && AZURE_CONTAINER)
}

/**
 * Upload a file buffer to Azure Blob Storage.
 * The Azure SDK is dynamically imported to avoid bundling issues
 * when Azure is not configured.
 */
export async function uploadToAzure(
  buffer: Buffer,
  originalFilename: string,
  mimeType: string,
  type: AllowedFileType,
  propertyId: string,
): Promise<UploadedFile> {
  const folder = type === "document"
    ? `properties/${propertyId}/documents`
    : `properties/${propertyId}/images`
  const key = buildKey(folder, originalFilename)

  if (!isAzureConfigured()) {
    throw new Error("Azure Storage is not configured. Set AZURE_STORAGE_CONNECTION_STRING and AZURE_STORAGE_CONTAINER.")
  }

  const { BlobServiceClient } = await import("@azure/storage-blob")
  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_CONNECTION_STRING)
  const containerClient = blobServiceClient.getContainerClient(AZURE_CONTAINER)

  await containerClient.createIfNotExists()

  const blockBlobClient = containerClient.getBlockBlobClient(key)

  await blockBlobClient.upload(buffer, buffer.length, {
    blobHTTPHeaders: { blobContentType: mimeType },
  })

  // Prefer SDK URL (correct encoding). Optional custom base for CDN / vanity domain.
  const url = AZURE_STORAGE_URL
    ? `${AZURE_STORAGE_URL}/${AZURE_CONTAINER}/${key}`
    : blockBlobClient.url

  return { key, url }
}

export async function deleteFromAzure(key: string): Promise<void> {
  if (!isAzureConfigured()) return

  const { BlobServiceClient } = await import("@azure/storage-blob")
  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_CONNECTION_STRING)
  const containerClient = blobServiceClient.getContainerClient(AZURE_CONTAINER)
  const blockBlobClient = containerClient.getBlockBlobClient(key)

  await blockBlobClient.deleteIfExists()
}

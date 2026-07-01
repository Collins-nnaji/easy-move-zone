import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const ENDPOINT = process.env.IDRIVE_E2_ENDPOINT!
const REGION = process.env.IDRIVE_E2_REGION!
const ACCESS_KEY = process.env.IDRIVE_E2_ACCESS_KEY!
const SECRET_KEY = process.env.IDRIVE_E2_SECRET_KEY!
const BUCKET = process.env.IDRIVE_E2_BUCKET!
const PUBLIC_URL = process.env.IDRIVE_E2_PUBLIC_URL!

function getClient(): S3Client {
  return new S3Client({
    endpoint: ENDPOINT,
    region: REGION,
    credentials: {
      accessKeyId: ACCESS_KEY,
      secretAccessKey: SECRET_KEY,
    },
    forcePathStyle: true,
  })
}

export type UploadedFile = {
  key: string
  url: string
}

export type AllowedFileType = "image" | "video"

const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
])

const VIDEO_MIME_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
])

const MAX_IMAGE_BYTES = 10 * 1024 * 1024   // 10 MB
const MAX_VIDEO_BYTES = 500 * 1024 * 1024  // 500 MB

export function validateFileType(mimeType: string, type: AllowedFileType): boolean {
  if (type === "image") return IMAGE_MIME_TYPES.has(mimeType)
  if (type === "video") return VIDEO_MIME_TYPES.has(mimeType)
  return false
}

export function validateFileSize(sizeBytes: number, type: AllowedFileType): boolean {
  if (type === "image") return sizeBytes <= MAX_IMAGE_BYTES
  if (type === "video") return sizeBytes <= MAX_VIDEO_BYTES
  return false
}

function buildKey(folder: string, filename: string): string {
  const timestamp = Date.now()
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_")
  return `${folder}/${timestamp}_${safe}`
}

export async function uploadFileToIdrive(
  buffer: Buffer,
  originalFilename: string,
  mimeType: string,
  type: AllowedFileType,
  listingId: string,
): Promise<UploadedFile> {
  const folder = type === "video" ? `listings/${listingId}/videos` : `listings/${listingId}/images`
  const key = buildKey(folder, originalFilename)

  const client = getClient()
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
    ACL: "public-read",
  })

  await client.send(command)

  return {
    key,
    url: `${PUBLIC_URL}/${key}`,
  }
}

export async function deleteFileFromIdrive(key: string): Promise<void> {
  const client = getClient()
  const command = new DeleteObjectCommand({ Bucket: BUCKET, Key: key })
  await client.send(command)
}

/**
 * Generate a presigned URL for direct browser → iDrive upload (optional future use)
 */
export async function getPresignedUploadUrl(
  key: string,
  mimeType: string,
  expiresInSeconds = 300,
): Promise<string> {
  const client = getClient()
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: mimeType,
    ACL: "public-read",
  })
  return getSignedUrl(client, command, { expiresIn: expiresInSeconds })
}

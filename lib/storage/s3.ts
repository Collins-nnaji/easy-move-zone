import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"

let client: S3Client | null | undefined

export function mediaBucket() {
  return process.env.AWS_S3_BUCKET?.trim() || "easymovesone-media"
}

export function isObjectStorageConfigured() {
  return Boolean(
    process.env.AWS_ENDPOINT_URL_S3?.trim() &&
      process.env.AWS_ACCESS_KEY_ID?.trim() &&
      process.env.AWS_SECRET_ACCESS_KEY?.trim(),
  )
}

export function getS3Client() {
  if (client !== undefined) return client
  const endpoint = process.env.AWS_ENDPOINT_URL_S3?.trim()
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim()
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim()
  const region = process.env.AWS_REGION?.trim() || "us-east-1"
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    client = null
    return client
  }
  client = new S3Client({
    region,
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  })
  return client
}

export function publicObjectUrl(key: string) {
  const endpoint = (process.env.AWS_ENDPOINT_URL_S3 || "").replace(/\/$/, "")
  return `${endpoint}/${mediaBucket()}/${key}`
}

export function isListingPhotoUrl(url: string) {
  try {
    const parsed = new URL(url)
    if (!parsed.hostname.endsWith(".neon.tech") && !parsed.hostname.includes("amazonaws.com")) return false
    return parsed.pathname.includes(`/${mediaBucket()}/`)
  } catch {
    return false
  }
}

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

export const MAX_LISTING_PHOTO_BYTES = 8 * 1024 * 1024

export async function uploadListingPhoto(userId: string, file: File) {
  const s3 = getS3Client()
  if (!s3) throw new Error("Object storage is not configured")
  if (file.size > MAX_LISTING_PHOTO_BYTES) throw new Error("Photo must be 8MB or smaller")
  const ext = ALLOWED_TYPES[file.type]
  if (!ext) throw new Error("Use a JPEG, PNG, or WebP photo")
  const key = `listings/${userId}/${crypto.randomUUID()}.${ext}`
  const body = Buffer.from(await file.arrayBuffer())
  await s3.send(
    new PutObjectCommand({
      Bucket: mediaBucket(),
      Key: key,
      Body: body,
      ContentType: file.type,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  )
  return { key, url: publicObjectUrl(key) }
}

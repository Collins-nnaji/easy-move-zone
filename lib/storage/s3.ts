import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"

let client: S3Client | null | undefined

export function publicMediaBucket() {
  return process.env.AWS_S3_BUCKET?.trim() || "easymovesone-media"
}

export function vaultBucket() {
  return process.env.AWS_S3_VAULT_BUCKET?.trim() || "easymovezone-vault"
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

export function publicObjectUrl(key: string, bucket = publicMediaBucket()) {
  const endpoint = (process.env.AWS_ENDPOINT_URL_S3 || "").replace(/\/$/, "")
  return `${endpoint}/${bucket}/${key}`
}

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "text/plain": "txt",
  "text/markdown": "md",
}

export function extensionForMime(mime?: string | null) {
  if (!mime) return "bin"
  return EXT_BY_MIME[mime.toLowerCase()] || "bin"
}

export async function putObject(input: {
  bucket: string
  key: string
  body: Buffer
  contentType: string
  cacheControl?: string
}) {
  const s3 = getS3Client()
  if (!s3) throw new Error("Object storage is not configured")
  await s3.send(
    new PutObjectCommand({
      Bucket: input.bucket,
      Key: input.key,
      Body: input.body,
      ContentType: input.contentType,
      CacheControl: input.cacheControl,
    }),
  )
  return { bucket: input.bucket, key: input.key, url: publicObjectUrl(input.key, input.bucket) }
}

export async function getObjectBuffer(bucket: string, key: string) {
  const s3 = getS3Client()
  if (!s3) return null
  const res = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }))
  if (!res.Body) return null
  return Buffer.from(await res.Body.transformToByteArray())
}

export async function storeAppFile(input: {
  prefix: string
  userId: string
  mime?: string | null
  base64: string
  bucket?: string
  maxBytes?: number
}) {
  const body = Buffer.from(input.base64, "base64")
  const maxBytes = input.maxBytes ?? 10 * 1024 * 1024
  if (body.length > maxBytes) {
    throw new Error(`File must be ${Math.round(maxBytes / (1024 * 1024))}MB or smaller`)
  }
  const ext = extensionForMime(input.mime)
  const key = `${input.prefix}/${input.userId}/${crypto.randomUUID()}.${ext}`
  const bucket = input.bucket || vaultBucket()
  await putObject({
    bucket,
    key,
    body,
    contentType: input.mime || "application/octet-stream",
    cacheControl: "private, max-age=60",
  })
  return { bucket, key, bytes: body.length }
}

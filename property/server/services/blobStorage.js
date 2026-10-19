/**
 * Property media (photos, video, title documents) in EasyMoveZone's object
 * storage — the same S3-compatible bucket the rest of the app uses
 * (AWS_ENDPOINT_URL_S3, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY,
 * AWS_S3_VAULT_BUCKET). Files are private: the browser uploads directly with a
 * short-lived presigned PUT URL, and reads go through presigned GET URLs that
 * only the API hands out.
 *
 * A stored file is referenced as `s3://<bucket>/<key>` in the database.
 */
const {
  S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');

const env = (k) => (process.env[k] || '').trim();
const BUCKET = env('PROPERTY_MEDIA_BUCKET') || env('AWS_S3_VAULT_BUCKET') || 'easymovezone-vault';
const PREFIX = 'property';

const ALLOWED = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'application/pdf': 'pdf', // scanned title documents (C of O, deed, survey plan, etc.)
};

const MAX_BYTES = 200 * 1024 * 1024; // 200 MB per file
const URL_TTL_SECONDS = 15 * 60;

let _client;

function isConfigured() {
  return Boolean(env('AWS_ENDPOINT_URL_S3') && env('AWS_ACCESS_KEY_ID') && env('AWS_SECRET_ACCESS_KEY'));
}

function client() {
  if (!isConfigured()) {
    const e = new Error('Object storage is not configured (set AWS_ENDPOINT_URL_S3 and the access keys).');
    e.status = 503;
    throw e;
  }
  if (!_client) {
    _client = new S3Client({
      region: env('AWS_REGION') || 'us-east-1',
      endpoint: env('AWS_ENDPOINT_URL_S3'),
      credentials: { accessKeyId: env('AWS_ACCESS_KEY_ID'), secretAccessKey: env('AWS_SECRET_ACCESS_KEY') },
      forcePathStyle: true,
    });
  }
  return _client;
}

function safeName(name = '') {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-60);
}

const refFor = (key) => `s3://${BUCKET}/${key}`;

function notOurs() {
  const e = new Error('Not a file in this store');
  e.status = 400;
  return e;
}

/** Resolve an object key from a bare key or an `s3://bucket/key` reference. */
function resolveBlobName(blobRef) {
  if (!blobRef || typeof blobRef !== 'string') { const e = new Error('blobRef is required'); e.status = 400; throw e; }
  let key = blobRef;
  if (blobRef.startsWith('s3://')) {
    const rest = blobRef.slice(5);
    const slash = rest.indexOf('/');
    if (slash === -1 || rest.slice(0, slash) !== BUCKET) throw notOurs();
    key = rest.slice(slash + 1);
  } else if (/^[a-z]+:\/\//i.test(blobRef)) {
    throw notOurs();
  }
  if (!key.startsWith(`${PREFIX}/`) || key.includes('..')) throw notOurs();
  return key;
}

/**
 * A presigned PUT URL for one new object.
 * @returns { uploadUrl, blobUrl, blobName, expiresAt }
 */
async function createUploadSas({ contentType, fileName, prefix = 'sell' }) {
  if (!ALLOWED[contentType]) {
    const err = new Error(`Unsupported file type: ${contentType}`);
    err.status = 400;
    throw err;
  }
  const ext = ALLOWED[contentType];
  const id = crypto.randomBytes(8).toString('hex');
  const base = fileName ? safeName(fileName.replace(/\.[^.]+$/, '')) : 'media';
  const blobName = `${PREFIX}/${prefix}/${Date.now()}-${id}-${base}.${ext}`;

  const uploadUrl = await getSignedUrl(
    client(),
    new PutObjectCommand({ Bucket: BUCKET, Key: blobName, ContentType: contentType }),
    { expiresIn: URL_TTL_SECONDS },
  );
  const expiresAt = new Date(Date.now() + URL_TTL_SECONDS * 1000).toISOString();
  return { uploadUrl, blobUrl: refFor(blobName), blobName, expiresAt };
}

/** A short-lived read URL for a private file. */
async function createReadSas(blobRef, { ttl = URL_TTL_SECONDS } = {}) {
  const key = resolveBlobName(blobRef);
  const url = await getSignedUrl(client(), new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn: ttl });
  return { url, expiresAt: new Date(Date.now() + ttl * 1000).toISOString() };
}

/** Delete a file by key or reference. */
async function deleteBlob(blobRef) {
  await client().send(new DeleteObjectCommand({ Bucket: BUCKET, Key: resolveBlobName(blobRef) }));
  return true;
}

module.exports = {
  resolveBlobName, createUploadSas, createReadSas, deleteBlob, isConfigured, ALLOWED, MAX_BYTES,
};

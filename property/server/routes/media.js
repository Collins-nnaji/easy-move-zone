const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { pool } = require('../db');
const {
  createUploadSas, createReadSas, deleteBlob, resolveBlobName, isConfigured, ALLOWED, MAX_BYTES,
} = require('../services/blobStorage');

const { isAdmin, ADMIN_KEY } = require('../auth');

/*
 * The container is private. Three ways a file is read back:
 *   - GET  /public  — anyone, but only photos/videos of a *live* listing;
 *   - POST /read    — admin, a 15-minute signed URL for one file;
 *   - POST /read-many — admin, the same for a batch (admin media grids).
 * And one way it is deleted: by whoever uploaded it (the delete token handed
 * out with the upload URL) or by an admin. Nothing else can reach a blob.
 */
// Signs the per-upload delete tokens. Without MEDIA_TOKEN_SECRET or ADMIN_KEY
// a per-process secret is used, so tokens stop working after a restart.
const TOKEN_SECRET = process.env.MEDIA_TOKEN_SECRET || ADMIN_KEY || crypto.randomBytes(32).toString('hex');
const deleteToken = (blobName) => crypto.createHmac('sha256', TOKEN_SECRET).update(`delete:${blobName}`).digest('hex');
const safeEqual = (a, b) => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
};

/* GET /api/media/config — is upload available? (lets the UI degrade gracefully) */
router.get('/config', (req, res) => {
  res.json({
    enabled: isConfigured(),
    accept: Object.keys(ALLOWED),
    maxBytes: MAX_BYTES,
  });
});

/* POST /api/media/sas — mint a short-lived direct-upload URL for one file.
   Body: { contentType, fileName, size?, prefix? } */
router.post('/sas', async (req, res) => {
  try {
    if (!isConfigured()) {
      return res.status(503).json({ error: 'Media upload is not configured.' });
    }
    const { contentType, fileName, size, prefix } = req.body || {};
    if (!contentType) return res.status(400).json({ error: 'contentType is required' });
    if (size != null && Number(size) > MAX_BYTES) {
      return res.status(400).json({ error: `File exceeds ${Math.round(MAX_BYTES / 1024 / 1024)}MB limit.` });
    }

    const safePrefix = /^[a-z0-9_-]{1,20}$/i.test(prefix || '') ? prefix : 'sell';
    const out = await createUploadSas({ contentType, fileName, prefix: safePrefix });
    res.json({ ...out, deleteToken: deleteToken(out.blobName) });
  } catch (err) {
    console.error('POST /media/sas error:', err.message);
    res.status(err.status || 500).json({ error: err.message || 'Failed to create upload URL' });
  }
});

/* GET /api/media/public?u=<s3:// reference> — a live listing's photo or video.
   Checks the file belongs to a live listing, then redirects to a short-lived
   signed URL, so the bucket stays private and video range requests go straight
   to storage. Anything not attached to a live listing is a 404. */
router.get('/public', async (req, res) => {
  try {
    if (!isConfigured()) return res.status(503).end();
    const ref = String(req.query.u || '');
    const blobName = resolveBlobName(ref);
    const { rows } = await pool.query(
      `SELECT 1 FROM listings
        WHERE status = 'live'
          AND EXISTS (SELECT 1 FROM jsonb_array_elements(media) m
                       WHERE m->>'url' = $1 OR m->>'url' LIKE '%/' || $2)
        LIMIT 1`,
      [ref, blobName]
    );
    if (!rows.length) return res.status(404).end();
    const { url } = await createReadSas(blobName, { ttl: 60 * 60 });
    res.set('Cache-Control', 'public, max-age=1800');
    res.redirect(302, url);
  } catch (err) {
    if (err.status === 400) return res.status(400).end();
    console.error('GET /media/public error:', err.message);
    res.status(404).end();
  }
});

/* POST /api/media/read-many — admin: signed read URLs for a batch of blobs. */
router.post('/read-many', async (req, res) => {
  if (!(await isAdmin(req))) return res.status(401).json({ error: 'Unauthorized. Staff sign-in required.' });
  if (!isConfigured()) return res.status(503).json({ error: 'Media storage is not configured.' });
  const blobs = Array.isArray(req.body?.blobs) ? req.body.blobs.slice(0, 60) : [];
  const urls = {};
  await Promise.all(blobs.map(async (b) => {
    try { urls[b] = (await createReadSas(b)).url; } catch { /* not ours, or gone */ }
  }));
  res.json({ urls });
});

/* POST /api/media/read — admin-only, short-lived access to a private document. */
router.post('/read', async (req, res) => {
  if (!(await isAdmin(req))) return res.status(401).json({ error: 'Unauthorized. Staff sign-in required.' });
  try {
    if (!isConfigured()) return res.status(503).json({ error: 'Media storage is not configured.' });
    if (!req.body?.blob) return res.status(400).json({ error: 'blob is required' });
    res.json(await createReadSas(req.body.blob));
  } catch (err) {
    console.error('POST /media/read error:', err.message);
    res.status(err.status || 500).json({ error: err.message || 'Could not open document.' });
  }
});

/* DELETE /api/media — remove a blob. Body: { blob, token } — the token handed
   out with that blob's upload URL (so only the uploader can remove it), or
   the admin key. */
router.delete('/', async (req, res) => {
  try {
    if (!isConfigured()) {
      return res.status(503).json({ error: 'Media storage is not configured.' });
    }
    const { blob, token } = req.body || {};
    if (!blob) return res.status(400).json({ error: 'blob (name or URL) is required' });
    if (!(await isAdmin(req))) {
      const name = resolveBlobName(blob);
      if (typeof token !== 'string' || !safeEqual(token, deleteToken(name))) {
        return res.status(403).json({ error: 'You can only remove files you uploaded.' });
      }
    }

    const deleted = await deleteBlob(blob);
    res.json({ deleted });
  } catch (err) {
    console.error('DELETE /media error:', err.message);
    res.status(err.status || 500).json({ error: err.message || 'Failed to delete' });
  }
});

module.exports = router;

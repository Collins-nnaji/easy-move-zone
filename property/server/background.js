/**
 * Work that should not hold up a response — notices, the staff audit row —
 * but must not be lost either.
 *
 * On a long-running server, a promise started after the reply simply
 * finishes. On Netlify (serverless) the function can be frozen the moment its
 * handler returns, killing anything still in flight. So every such job is
 * tracked here, and the Netlify handler awaits `flush()` before returning
 * (netlify/functions/api.js). Locally `flush()` is never needed.
 */
const pending = new Set();

/** Run `fn` after the current work, without letting it fail the caller. */
function later(fn) {
  const p = Promise.resolve()
    .then(fn)
    .catch((err) => console.error('background job failed:', err.message))
    .finally(() => pending.delete(p));
  pending.add(p);
  return p;
}

/** Wait for everything queued so far (and anything it queues), up to `timeoutMs`. */
async function flush(timeoutMs = 8000) {
  const deadline = Date.now() + timeoutMs;
  while (pending.size && Date.now() < deadline) {
    // eslint-disable-next-line no-await-in-loop
    await Promise.race([
      Promise.allSettled([...pending]),
      new Promise((r) => setTimeout(r, Math.max(0, deadline - Date.now()))),
    ]);
  }
  if (pending.size) console.warn(`background: ${pending.size} job(s) still running at the deadline`);
}

module.exports = { later, flush, pendingCount: () => pending.size };

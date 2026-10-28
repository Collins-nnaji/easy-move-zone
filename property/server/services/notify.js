const { pool } = require('../db');
const { later } = require('../background');
const { normalisePhone } = require('../markets');

/**
 * Telling people things.
 *
 * Every notice is written to `notifications`, which is the recipient's in-app
 * inbox (the bell in both portals) — so nothing depends on a provider being
 * set up. On top of that:
 *
 *   - email goes out through Resend when RESEND_API_KEY and NOTIFY_FROM are
 *     set (e.g. NOTIFY_FROM="EasyMoveZone <hello@easymovezone.com>");
 *   - SMS goes out through Termii when TERMII_API_KEY and TERMII_SENDER_ID
 *     are set and we have a phone number;
 *   - staff notices go to NOTIFY_STAFF_EMAIL (comma-separated) by email only.
 *
 * The row records 'sent', 'failed' or 'skipped' for each channel. A failure
 * to send never fails the request that triggered it.
 */

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://easymovezone.com').replace(/\/$/, '');
const RESEND_KEY = process.env.RESEND_API_KEY || '';
const FROM = process.env.NOTIFY_FROM || '';
const TERMII_KEY = process.env.TERMII_API_KEY || '';
const TERMII_SENDER = process.env.TERMII_SENDER_ID || '';
const STAFF = (process.env.NOTIFY_STAFF_EMAIL || '').split(',').map((e) => e.trim()).filter(Boolean);

const emailConfigured = () => Boolean(RESEND_KEY && FROM);
const smsConfigured = () => Boolean(TERMII_KEY && TERMII_SENDER);

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}


async function sendEmail(to, subject, text, link) {
  if (!emailConfigured()) return 'skipped';
  const url = link ? `${APP_URL}${link}` : APP_URL;
  const html = `<div style="font-family:Inter,Arial,sans-serif;font-size:15px;line-height:1.55;color:#101218">
<p>${escapeHtml(text).replace(/\n/g, '<br>')}</p>
<p><a href="${escapeHtml(url)}" style="display:inline-block;background:#b85a30;color:#fff;padding:10px 16px;border-radius:999px;text-decoration:none;font-weight:600">Open EasyMoveZone</a></p>
<p style="color:#8a9990;font-size:12px">You are getting this because you have a property or a tenancy with EasyMoveZone.</p></div>`;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${RESEND_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [to], subject, text: `${text}\n\n${url}`, html }),
    });
    if (!res.ok) {
      console.error('Resend error', res.status, (await res.text()).slice(0, 200));
      return 'failed';
    }
    return 'sent';
  } catch (err) {
    console.error('Resend error', err.message);
    return 'failed';
  }
}

async function sendSms(phone, text, country) {
  // Termii is the SMS provider for Nigeria (server/markets.js → sms).
  const to = normalisePhone(phone, country);
  if (!smsConfigured() || !to) return 'skipped';
  try {
    const res = await fetch('https://api.ng.termii.com/api/sms/send', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ api_key: TERMII_KEY, to, from: TERMII_SENDER, sms: text.slice(0, 300), type: 'plain', channel: 'generic' }),
    });
    if (!res.ok) {
      console.error('Termii error', res.status, (await res.text()).slice(0, 200));
      return 'failed';
    }
    return 'sent';
  } catch (err) {
    console.error('Termii error', err.message);
    return 'failed';
  }
}

/**
 * Notify one person. `to` is { email, phone? }; `audience` is 'owner' or
 * 'tenant' (which portal the link opens). `sms: true` also texts them.
 */
async function notify({ to, audience = 'owner', kind, title, body = '', link = null, sms = false }) {
  const email = String(to?.email || '').trim().toLowerCase();
  if (!email) return null;
  try {
    const { rows } = await pool.query(
      `INSERT INTO notifications (recipient_email, audience, kind, title, body, link)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [email, audience, kind, String(title).slice(0, 255), body || null, link]
    );
    const id = rows[0].id;
    const [emailStatus, smsStatus] = await Promise.all([
      sendEmail(email, title, body ? `${title}\n\n${body}` : title, link),
      sms ? sendSms(to.phone, `EasyMoveZone: ${title}${link ? ` ${APP_URL}${link}` : ''}`, to.country) : Promise.resolve('skipped'),
    ]);
    await pool.query('UPDATE notifications SET email_status = $2, sms_status = $3 WHERE id = $1', [id, emailStatus, smsStatus]);
    return id;
  } catch (err) {
    console.error('notify error:', err.message);
    return null;
  }
}

/** Tell the desk (NOTIFY_STAFF_EMAIL). In-app rows are kept for the admin Overview. */
async function notifyStaff({ kind, title, body = '', link = '/admin' }) {
  if (!STAFF.length) return;
  await Promise.all(STAFF.map((email) => notify({ to: { email }, audience: 'staff', kind, title, body, link })));
}

/*
 * `later` (server/background.js): a notice must never hold up, or fail, the
 * request behind it — and on Netlify it is flushed before the function ends.
 */

module.exports = {
  notify, notifyStaff, later, emailConfigured, smsConfigured, normalisePhone, APP_URL,
};

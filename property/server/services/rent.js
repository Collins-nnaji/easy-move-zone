const { pool } = require('../db');
const { notify, notifyStaff, later } = require('./notify');
const { formatMoney, DEFAULT_CURRENCY } = require('../markets');

/**
 * Rent: crediting what was paid, building a tenancy's schedule, and the
 * daily job that marks overdue charges and sends reminders.
 *
 * Every path that records money received (an admin receipt, a Paystack
 * payment) goes through creditCharge, so the tenant is told the same way and
 * a charge is never credited past what it asked for.
 */

const MONTHS_PER = { annual: 12, biannual: 6, quarterly: 3, monthly: 1 };
const DAY = 86400000;
/** How far ahead of the due date the first reminder goes. */
const REMIND_DAYS_BEFORE = 7;

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

const money = (amount, currency) => formatMoney(amount, currency);

function ymd(d) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).toISOString().slice(0, 10);
}

function parseDate(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(`${String(value).slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Add whole months, clamping to the end of a shorter month (31 Jan + 1 → 28/29 Feb). */
function addMonths(date, months) {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + months;
  const day = date.getUTCDate();
  const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return new Date(Date.UTC(y, m, Math.min(day, last)));
}

const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthLabel = (d) => `${MONTH[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
/** "1 Dec 2026" — how a date reads in a notice. */
const dayLabel = (value) => {
  const d = parseDate(value);
  return d ? `${d.getUTCDate()} ${monthLabel(d)}` : '';
};

/**
 * The rent periods of a tenancy, each due on its first day: from start_date,
 * every 12/6/3/1 months by frequency, until end_date (or one year if the
 * tenancy has no end). Pure — no database.
 */
function buildSchedule({ start_date: start, end_date: end, rent_amount: amount, rent_frequency: frequency }) {
  const first = parseDate(start);
  if (!first || !(num(amount) > 0)) return [];
  const step = MONTHS_PER[frequency] || 12;
  const stop = parseDate(end) || addMonths(first, 12);
  const out = [];
  for (let from = first, i = 0; from < stop && i < 120; i += 1) {
    const next = addMonths(first, step * (i + 1));
    const lastDay = new Date(Math.min(next.getTime(), stop.getTime() + DAY) - DAY);
    out.push({
      due_date: ymd(from),
      amount: num(amount),
      period_label: step === 1 ? `Rent ${monthLabel(from)}` : `Rent ${monthLabel(from)} – ${monthLabel(lastDay)}`,
    });
    from = next;
  }
  return out;
}

/** Raise every scheduled period that has no charge yet. Returns the new rows. */
async function generateSchedule(tenancyId) {
  const { rows } = await pool.query('SELECT * FROM management_tenancies WHERE id = $1', [tenancyId]);
  const tenancy = rows[0];
  if (!tenancy) {
    const e = new Error('Tenancy not found.'); e.status = 404; throw e;
  }
  if (!tenancy.start_date) {
    const e = new Error('Set the tenancy start date first.'); e.status = 400; throw e;
  }
  const { rows: existing } = await pool.query(
    'SELECT due_date FROM management_rent_charges WHERE tenancy_id = $1',
    [tenancyId]
  );
  const have = new Set(existing.map((c) => ymd(parseDate(c.due_date))));
  const created = [];
  for (const p of buildSchedule(tenancy)) {
    if (!have.has(p.due_date)) {
      // eslint-disable-next-line no-await-in-loop
      const { rows: ins } = await pool.query(
        `INSERT INTO management_rent_charges (request_id, tenancy_id, period_label, due_date, amount, currency)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [tenancy.request_id, tenancy.id, p.period_label, p.due_date, p.amount, tenancy.currency || DEFAULT_CURRENCY]
      );
      created.push(ins[0]);
    }
  }
  return created;
}

/** Who to tell about a charge: the tenant on its tenancy, and the property. */
async function chargeContext(chargeId) {
  const { rows } = await pool.query(
    `SELECT c.*, t.tenant_email, t.tenant_phone, t.tenant_name, t.unit_label,
            r.title AS property_title, r.contact_email AS owner_email
       FROM management_rent_charges c
       LEFT JOIN management_tenancies t ON t.id = c.tenancy_id
       JOIN management_requests r ON r.id = c.request_id
      WHERE c.id = $1`,
    [chargeId]
  );
  return rows[0] || null;
}

/**
 * Record money received against a charge. Never credits more than is
 * outstanding (an overpayment is reported back as `excess`).
 */
async function creditCharge({ chargeId, amount, receivedOn = null, source = 'desk' }, client = pool) {
  const received = num(amount);
  if (!(received > 0)) {
    const e = new Error('A received amount is required.'); e.status = 400; throw e;
  }
  const { rows } = await client.query('SELECT * FROM management_rent_charges WHERE id = $1 FOR UPDATE', [chargeId]);
  const charge = rows[0];
  if (!charge) {
    const e = new Error('Charge not found.'); e.status = 404; throw e;
  }
  const owing = Math.max(0, num(charge.amount) - num(charge.amount_received));
  const credit = Math.min(received, owing);
  const total = num(charge.amount_received) + credit;
  const status = total >= num(charge.amount) ? 'received' : 'part';
  const { rows: updated } = await client.query(
    `UPDATE management_rent_charges
        SET amount_received = $2, status = $3, received_on = COALESCE($4::date, CURRENT_DATE)
      WHERE id = $1 RETURNING *`,
    [chargeId, total, status, receivedOn]
  );
  // The figures come from the row we just wrote: inside a caller's
  // transaction, another connection would still see the old balance.
  const left = Math.max(0, num(charge.amount) - total);
  later(async () => {
    const ctx = await chargeContext(chargeId);
    if (ctx?.tenant_email && credit > 0) {
      await notify({
        to: { email: ctx.tenant_email, phone: ctx.tenant_phone },
        audience: 'tenant',
        kind: 'rent_received',
        title: `Payment received: ${money(credit, charge.currency)}`,
        body: `${charge.period_label || 'Rent'} for ${ctx.property_title} is now ${status === 'received' ? 'paid in full' : `part paid (${money(left, charge.currency)} left)`}.${source === 'paystack' ? ' Paid online.' : ''}`,
        link: '/tenant/rent',
      });
    }
  });
  return { charge: updated[0], credited: credit, excess: Math.max(0, received - credit) };
}

/** Tell the tenant a new charge is on their schedule. */
function announceCharge(charge) {
  later(async () => {
    const ctx = await chargeContext(charge.id);
    if (!ctx?.tenant_email) return;
    await notify({
      to: { email: ctx.tenant_email, phone: ctx.tenant_phone },
      audience: 'tenant',
      kind: 'rent_charge',
      title: `${ctx.period_label || 'Rent'}: ${money(ctx.amount, ctx.currency)} due ${dayLabel(ctx.due_date)}`,
      body: `This is now on your rent schedule for ${ctx.property_title}.`,
      link: '/tenant/rent',
    });
  });
}

/**
 * The daily job. Marks unpaid charges past their due date 'overdue', reminds
 * each tenant once a week before a due date and once when it becomes overdue,
 * and tells the desk about new arrears. Safe to run as often as you like.
 */
async function runRentReminders(now = new Date()) {
  const today = ymd(now);
  const soon = ymd(new Date(now.getTime() + REMIND_DAYS_BEFORE * DAY));
  const marked = await pool.query(
    `UPDATE management_rent_charges SET status = 'overdue'
      WHERE status IN ('due','part') AND due_date < $1 AND amount_received < amount
      RETURNING id`,
    [today]
  );

  const { rows: dueSoon } = await pool.query(
    `SELECT c.id FROM management_rent_charges c
       JOIN management_tenancies t ON t.id = c.tenancy_id
      WHERE c.status IN ('due','part') AND c.due_date BETWEEN $1 AND $2
        AND c.reminded_due_at IS NULL AND t.tenant_email IS NOT NULL AND t.status IN ('active','notice')`,
    [today, soon]
  );
  const { rows: overdue } = await pool.query(
    `SELECT c.id FROM management_rent_charges c
       JOIN management_tenancies t ON t.id = c.tenancy_id
      WHERE c.status = 'overdue' AND c.reminded_overdue_at IS NULL
        AND t.tenant_email IS NOT NULL AND t.status IN ('active','notice')`
  );

  for (const { id } of dueSoon) {
    // eslint-disable-next-line no-await-in-loop
    const ctx = await chargeContext(id);
    const left = num(ctx.amount) - num(ctx.amount_received);
    // eslint-disable-next-line no-await-in-loop
    await notify({
      to: { email: ctx.tenant_email, phone: ctx.tenant_phone },
      audience: 'tenant',
      kind: 'rent_due_soon',
      title: `Rent due ${dayLabel(ctx.due_date)}: ${money(left, ctx.currency)}`,
      body: `${ctx.period_label || 'Rent'} for ${ctx.property_title}. Pay online or tell us once you have paid by transfer.`,
      link: '/tenant/rent',
      sms: true,
    });
    // eslint-disable-next-line no-await-in-loop
    await pool.query('UPDATE management_rent_charges SET reminded_due_at = NOW() WHERE id = $1', [id]);
  }

  for (const { id } of overdue) {
    // eslint-disable-next-line no-await-in-loop
    const ctx = await chargeContext(id);
    const left = num(ctx.amount) - num(ctx.amount_received);
    // eslint-disable-next-line no-await-in-loop
    await notify({
      to: { email: ctx.tenant_email, phone: ctx.tenant_phone },
      audience: 'tenant',
      kind: 'rent_overdue',
      title: `Overdue: ${money(left, ctx.currency)} for ${ctx.period_label || 'rent'}`,
      body: `This was due on ${dayLabel(ctx.due_date)}. If you have already paid, tell us in your portal so we can match it.`,
      link: '/tenant/rent',
      sms: true,
    });
    // eslint-disable-next-line no-await-in-loop
    await pool.query('UPDATE management_rent_charges SET reminded_overdue_at = NOW() WHERE id = $1', [id]);
  }
  if (overdue.length) {
    await notifyStaff({
      kind: 'arrears',
      title: `${overdue.length} rent charge${overdue.length === 1 ? '' : 's'} went overdue`,
      body: 'Tenants have been reminded. See Management for the arrears.',
    });
  }
  return { markedOverdue: marked.rowCount, remindedDue: dueSoon.length, remindedOverdue: overdue.length };
}

/** Run the reminder job every six hours (and shortly after start). RENT_JOBS=off disables it. */
function startRentJobs() {
  if (process.env.RENT_JOBS === 'off') return;
  const run = () => runRentReminders().then((r) => {
    if (r.markedOverdue || r.remindedDue || r.remindedOverdue) console.log('Rent reminders:', r);
  }).catch((err) => console.error('Rent reminders failed:', err.message));
  setTimeout(run, 30 * 1000).unref();
  setInterval(run, 6 * 60 * 60 * 1000).unref();
}

module.exports = {
  buildSchedule, generateSchedule, creditCharge, announceCharge, runRentReminders, startRentJobs,
  addMonths, money,
};

/**
 * Agent marketplace: unverified cannot post, quota, enquiry routing,
 * public columns hide owner email, SAS requires a session.
 */
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { enabled, start, stop, call, q, uid } = require('./helpers');

const agent = `agent-${uid()}@test.easymovezone`;
const buyer = `buyer-${uid()}@test.easymovezone`;

async function seedVerifiedAgency({ email = agent, quota = 5, plan = 'starter' } = {}) {
  const slug = `agency-${uid()}`;
  const { rows: [a] } = await q(
    `INSERT INTO agencies (ref, slug, name, email, verification_status, plan, listing_quota)
     VALUES ($1,$2,$3,$4,'verified',$5,$6) RETURNING *`,
    [`AG-${uid().toUpperCase()}`, slug, 'Test Agency', email, plan, quota]
  );
  await q(
    `INSERT INTO agency_members (agency_id, user_id, email, role, status)
     VALUES ($1,$2,$3,'owner','active')`,
    [a.id, email, email]
  );
  return a;
}

(enabled ? describe : describe.skip)('agent marketplace', () => {
  before(start);
  after(stop);

  it('rejects an unauthenticated media SAS', async () => {
    const res = await call('/media/sas', {
      method: 'POST',
      body: { contentType: 'image/jpeg', fileName: 'x.jpg' },
    });
    assert.equal(res.status, 401);
  });

  it('rejects listing create from an unverified user', async () => {
    const res = await call('/agent/listings', {
      method: 'POST',
      user: `pending-${uid()}@test.easymovezone`,
      body: { title: 'Duplex', address: '1 Test Rd', price: 10000000 },
    });
    assert.equal(res.status, 403);
    assert.match(res.body.error, /agency|verified|Apply/i);
  });

  it('enforces quota before submit', async () => {
    const email = `quota-${uid()}@test.easymovezone`;
    await seedVerifiedAgency({ email, quota: 0, plan: 'none' });
    const create = await call('/agent/listings', {
      method: 'POST',
      user: email,
      body: { title: 'Flat in Yaba', address: '2 Test Rd', city: 'Yaba', state: 'Lagos', price: 40000000 },
    });
    assert.equal(create.status, 200);
    const submit = await call(`/agent/listings/${create.body.listing.id}/submit`, {
      method: 'POST',
      user: email,
      body: {},
    });
    assert.equal(submit.status, 402);
  });

  it('routes an enquiry on an agent listing to the agency and hides owner email', async () => {
    const email = `live-${uid()}@test.easymovezone`;
    const agency = await seedVerifiedAgency({ email, quota: 5 });
    const created = await call('/agent/listings', {
      method: 'POST',
      user: email,
      body: { title: '4-bed Lekki', address: '12 Admiralty', city: 'Lekki', state: 'Lagos', price: 120000000 },
    });
    assert.equal(created.status, 200);
    await q(
      `UPDATE listings SET status = 'live', published_at = NOW() WHERE id = $1`,
      [created.body.listing.id]
    );

    const publicGet = await call(`/listings/${created.body.listing.slug}`);
    assert.equal(publicGet.status, 200);
    assert.equal(publicGet.body.listing.agency_name, 'Test Agency');
    assert.equal(publicGet.body.listing.owner_email, undefined);

    const enquiry = await call(`/listings/${created.body.listing.id}/enquiry`, {
      method: 'POST',
      user: buyer,
      body: { name: 'Ada Buyer', email: buyer, phone: '08030000000', message: 'Can I view Saturday?', viewing: true },
    });
    assert.equal(enquiry.status, 200);

    const inbox = await call('/agent/inbox', { user: email });
    assert.equal(inbox.status, 200);
    assert.ok(inbox.body.enquiries.some((e) => e.email === buyer && e.agency_id === agency.id));
    assert.ok(inbox.body.viewings.some((v) => v.email === buyer));
  });

  it('lists a verified agency in the public directory', async () => {
    const email = `dir-${uid()}@test.easymovezone`;
    const agency = await seedVerifiedAgency({ email });
    const res = await call(`/agents/${agency.slug}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.agency.name, 'Test Agency');
    assert.equal(res.body.agency.license_docs, undefined);
  });
});

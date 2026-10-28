const test = require('node:test');
const assert = require('node:assert/strict');
const h = require('./helpers');

const skip = !h.enabled && 'set TEST_DATABASE_URL to run the API tests';

test('API', { skip }, async (t) => {
  await h.start();
  t.after(h.stop);
  const id = h.uid();
  const owner = `owner-${id}@test.easymovezone`;
  const tenant = `tenant-${id}@test.easymovezone`;
  const stranger = `stranger-${id}@test.easymovezone`;
  const { property, tenancy } = await h.seedTenancy({ owner, tenant });

  await t.test('personal routes need a session and ignore ?email=', async () => {
    assert.equal((await h.call(`/management/portal?email=${owner}`)).status, 401);
    assert.equal((await h.call(`/tenant/portal?email=${tenant}`)).status, 401);
    const asStranger = await h.call(`/management/portal?email=${owner}`, { user: stranger });
    assert.equal(asStranger.status, 200);
    assert.equal(asStranger.body.properties.length, 0, 'a stranger must not see the owner\'s properties');
    const asOwner = await h.call('/management/portal', { user: owner });
    assert.equal(asOwner.body.properties[0].id, property.id);
  });

  await t.test('owners see who lives there, never how to reach them', async () => {
    const tenancyRow = (await h.call('/management/portal', { user: owner })).body.tenancies[0];
    assert.equal(tenancyRow.tenant_name, 'Tolu', 'first name only');
    assert.equal(tenancyRow.tenant_email, undefined);
    assert.equal(tenancyRow.tenant_phone, undefined);
  });

  await t.test('verifications: sign in to submit, then they are listed on the account', async () => {
    const body = { propertyLabel: '3-bed in Ikeja', country: 'Nigeria', currency: 'NGN', address: 'Ikeja', contactName: 'Ada', contactEmail: 'someone-else@x.co', verificationType: 'document' };
    assert.equal((await h.call('/passport-requests', { method: 'POST', body })).status, 401);
    const made = await h.call('/passport-requests', { method: 'POST', user: owner, body });
    assert.equal(made.status, 200, made.text);
    assert.equal(made.body.request.contact_email, owner, 'the account email, not the typed one');
    assert.equal(made.body.request.access_token, undefined, 'no device token handed back');
    const mine = await h.call('/passport-requests/mine', { user: owner });
    assert.ok(mine.body.requests.some((r) => r.reference === made.body.request.reference));
    assert.equal((await h.call('/passport-requests/mine', { user: stranger })).body.requests.length, 0);
    assert.equal((await h.call('/passport-requests/mine')).status, 401);
  });

  await t.test('admin: only the internal key the app route adds for staff, never a guessed or query key', async () => {
    assert.equal((await h.call('/admin/summary', { headers: { 'x-admin-key': 'bloomvest-admin' } })).status, 401);
    assert.equal((await h.call('/admin/summary?key=test-admin-secret')).status, 401);
    assert.equal((await h.call('/admin/whoami', { user: owner })).status, 401);
    assert.equal((await h.call('/admin/whoami', { user: 'staff@test.easymovezone' })).body.actor, 'staff@test.easymovezone');
    assert.equal((await h.call('/admin/summary', { admin: true })).status, 200);
  });

  await t.test('roles say which portal each person has', async () => {
    assert.deepEqual((await h.call('/tenant/roles', { user: tenant })).body, { owner: 0, tenant: 1, applicant: 0 });
    assert.equal((await h.call('/tenant/roles', { user: owner })).body.owner, 1);
  });

  let charges;
  await t.test('the schedule is raised from the tenancy and only once', async () => {
    const first = await h.call(`/management/tenancies/${tenancy.id}/schedule`, { method: 'POST', admin: true });
    assert.equal(first.status, 200);
    assert.equal(first.body.created.length, 1);
    const again = await h.call(`/management/tenancies/${tenancy.id}/schedule`, { method: 'POST', admin: true });
    assert.equal(again.body.created.length, 0);
    charges = (await h.call('/tenant/portal', { user: tenant })).body.rentCharges;
    assert.equal(charges.length, 1);
  });

  await t.test('reminders mark overdue charges and remind once', async () => {
    const run1 = await h.call('/management/rent-reminders/run', { method: 'POST', admin: true });
    assert.ok(run1.body.markedOverdue >= 1);
    const { rows } = await h.q('SELECT status, reminded_overdue_at FROM management_rent_charges WHERE id = $1', [charges[0].id]);
    assert.equal(rows[0].status, 'overdue');
    assert.ok(rows[0].reminded_overdue_at);
    await h.call('/management/rent-reminders/run', { method: 'POST', admin: true });
    const { rows: notes } = await h.q(`SELECT COUNT(*)::int AS n FROM notifications WHERE recipient_email = $1 AND kind = 'rent_overdue'`, [tenant]);
    assert.equal(notes[0].n, 1, 'the overdue reminder goes out once');
  });

  await t.test('Paystack: start, verify, credit once, and the webhook is a no-op after', async () => {
    assert.equal((await h.call('/tenant/pay', { method: 'POST', user: stranger, body: { chargeId: charges[0].id } })).status, 404);
    const started = await h.call('/tenant/pay', { method: 'POST', user: tenant, body: { chargeId: charges[0].id } });
    assert.equal(started.status, 200, started.text);
    const ref = started.body.reference;
    assert.equal(h.paystackTx.get(ref).amount, 1200000 * 100);

    h.paystackTx.get(ref).status = 'abandoned';
    assert.equal((await h.call(`/tenant/pay/verify?reference=${ref}`, { user: tenant })).body.state, 'abandoned');

    h.paystackTx.get(ref).status = 'success';
    const verified = await h.call(`/tenant/pay/verify?reference=${ref}`, { user: tenant });
    assert.equal(verified.body.state, 'success');
    const raw = JSON.stringify({ event: 'charge.success', data: { reference: ref } });
    assert.equal((await h.call('/tenant/pay/webhook', { method: 'POST', body: raw, headers: { 'x-paystack-signature': 'bad' } })).status, 401);
    assert.equal((await h.call('/tenant/pay/webhook', { method: 'POST', body: raw, headers: { 'x-paystack-signature': h.paystackSign(raw) } })).status, 200);
    const { rows } = await h.q('SELECT amount_received, status FROM management_rent_charges WHERE id = $1', [charges[0].id]);
    assert.equal(Number(rows[0].amount_received), 1200000, 'credited exactly once');
    assert.equal(rows[0].status, 'received');
    assert.equal((await h.call('/tenant/pay', { method: 'POST', user: tenant, body: { chargeId: charges[0].id } })).status, 409);
  });

  let requestId;
  await t.test('a repair reaches the desk and the owner, and the thread stays scoped', async () => {
    const made = await h.call('/tenant/requests', { method: 'POST', user: tenant, body: { tenancyId: tenancy.id, category: 'repair', title: 'Leak', urgency: 'urgent' } });
    assert.equal(made.status, 200);
    requestId = made.body.request.id;
    assert.equal((await h.call('/tenant/requests', { method: 'POST', user: stranger, body: { tenancyId: tenancy.id, category: 'repair', title: 'x' } })).status, 404);

    assert.equal((await h.call(`/management/tenant-requests/${requestId}/messages`, { method: 'POST', user: owner, body: { body: 'Use Ade the plumber' } })).status, 200);
    assert.equal((await h.call(`/management/tenant-requests/${requestId}/messages`, { method: 'POST', user: stranger, body: { body: 'x' } })).status, 404);
    assert.equal((await h.call(`/tenant/admin/requests/${requestId}/messages`, { method: 'POST', admin: true, body: { body: 'Plumber Tuesday' } })).status, 200);
    assert.equal((await h.call(`/tenant/requests/${requestId}/messages`, { method: 'POST', user: tenant, body: { body: 'Thanks' } })).status, 200);

    const tenantView = (await h.call('/tenant/portal', { user: tenant })).body.requests.find((r) => r.id === requestId);
    assert.deepEqual(tenantView.messages.map((m) => m.sender), ['admin', 'tenant'], 'the owner\'s note is not shown to the tenant');
    const ownerView = (await h.call('/management/portal', { user: owner })).body.tenantRequests.find((r) => r.id === requestId);
    assert.deepEqual(ownerView.messages.map((m) => m.sender), ['owner', 'admin', 'tenant']);
    assert.equal(ownerView.tenant_email, undefined, 'the owner never gets the tenant\'s contact details');

    await new Promise((r) => setTimeout(r, 300)); // notices are sent after the response
    const { rows } = await h.q(
      `SELECT recipient_email, kind FROM notifications WHERE recipient_email = ANY($1) ORDER BY id`,
      [[owner, tenant, 'desk@test.easymovezone']]
    );
    const kinds = rows.map((r) => `${r.recipient_email.split('@')[0].split('-')[0]}:${r.kind}`);
    assert.ok(kinds.includes('owner:tenant_repair'));
    assert.ok(kinds.includes('tenant:request_update'));
    assert.ok(kinds.includes('desk:tenant_repair'));
  });

  await t.test('the inbox is per person and per portal', async () => {
    const inbox = await h.call('/notifications?audience=tenant', { user: tenant });
    assert.ok(inbox.body.unread > 0);
    assert.equal((await h.call('/notifications?audience=tenant', { user: stranger })).body.notifications.length, 0);
    await h.call('/notifications/read', { method: 'POST', user: tenant, body: { audience: 'tenant' } });
    assert.equal((await h.call('/notifications?audience=tenant', { user: tenant })).body.unread, 0);
  });

  await t.test('invite links: single use, newest wins, attach to the signed-in email', async () => {
    const first = await h.call(`/tenant/admin/tenancies/${tenancy.id}/invite`, { method: 'POST', admin: true, body: { send: false } });
    const second = await h.call(`/tenant/admin/tenancies/${tenancy.id}/invite`, { method: 'POST', admin: true, body: { send: false } });
    const tok1 = first.body.url.split('/').pop();
    const tok2 = second.body.url.split('/').pop();
    assert.equal((await h.call(`/tenant/invites/${tok1}`)).body.state, 'revoked');
    assert.equal((await h.call(`/tenant/invites/${tok2}`)).body.state, 'ok');
    assert.equal((await h.call(`/tenant/invites/${tok2}/accept`, { method: 'POST' })).status, 401);
    const newEmail = `newtenant-${id}@test.easymovezone`;
    assert.equal((await h.call(`/tenant/invites/${tok2}/accept`, { method: 'POST', user: newEmail })).status, 200);
    assert.equal((await h.call(`/tenant/invites/${tok2}/accept`, { method: 'POST', user: stranger })).status, 410);
    assert.equal((await h.call('/tenant/roles', { user: newEmail })).body.tenant, 1);
  });

  await t.test('owner documents open only for their owner', async () => {
    const { rows: [d] } = await h.q(
      `INSERT INTO management_documents (request_id, kind, name, url) VALUES ($1,'statement','S','https://example.com/s.pdf') RETURNING id`,
      [property.id]
    );
    assert.equal((await h.call(`/management/documents/${d.id}`, { user: owner })).body.url, 'https://example.com/s.pdf');
    assert.equal((await h.call(`/management/documents/${d.id}`, { user: stranger })).status, 404);
    assert.equal((await h.call(`/management/documents/${d.id}`)).status, 401);
  });

  await t.test('inspections: staff record them, the owner sees them all, the tenant sees their own', async () => {
    const made = await h.call(`/management/requests/${property.id}/inspections`, {
      method: 'POST', admin: true, body: { kind: 'move_in', scheduledFor: '2026-11-02', tenancyId: tenancy.id },
    });
    assert.equal(made.status, 200, made.text);
    assert.equal((await h.call(`/management/requests/${property.id}/inspections`, { method: 'POST', user: owner, body: { kind: 'routine' } })).status, 401,
      'owners cannot book inspections themselves');
    assert.equal((await h.call(`/management/requests/${property.id}/inspections`, { method: 'POST', admin: true, body: { kind: 'party' } })).status, 400);

    const done = await h.call(`/management/inspections/${made.body.inspection.id}`, {
      method: 'PATCH', admin: true, body: { status: 'completed', condition: 'good', summary: 'Clean, all keys handed over', reportUrl: 'https://example.com/r.pdf' },
    });
    assert.equal(done.status, 200, done.text);
    assert.ok(done.body.inspection.completed_at, 'completing stamps the date');

    const ownerView = (await h.call('/management/portal', { user: owner })).body.inspections;
    assert.ok(ownerView.some((i) => i.kind === 'move_in' && i.condition === 'good'));
    // An earlier test hands the tenancy over by invite, so ask as whoever holds it now.
    const { rows: [holder] } = await h.q('SELECT tenant_email FROM management_tenancies WHERE id = $1', [tenancy.id]);
    const tenantView = (await h.call('/tenant/portal', { user: holder.tenant_email })).body.inspections;
    assert.ok(tenantView.some((i) => i.kind === 'move_in' && i.summary === 'Clean, all keys handed over'));
    assert.equal((await h.call('/tenant/portal', { user: stranger })).body.inspections.length, 0);
  });

  await t.test('owners see applicants\' screening, never who they are', async () => {
    const { rows: [l] } = await h.q(
      `INSERT INTO listings (ref, slug, title, listing_type, status, route, management_request_id, list_price, currency, owner_email)
       VALUES ($1, $2, 'Flat 2, Yaba', 'rent', 'live', 'owner_listed', $3, 900000, 'NGN', $4) RETURNING id`,
      [`BVL-${id}`, `flat-2-yaba-${id}`, property.id, owner]
    );
    const { rows: [a] } = await h.q(
      `INSERT INTO rental_applications (ref, listing_id, full_name, email, phone, screening_consent)
       VALUES ($1, $2, 'Chidi Okafor', 'chidi@test.easymovezone', '08032222222', true) RETURNING id`,
      [`BVR-${id}`, l.id]
    );
    const patched = await h.call(`/listings/admin/applications/${a.id}`, {
      method: 'PATCH', admin: true, body: { status: 'vetting', screening: { identity: 'passed', income: 'passed', landlord: 'waived' } },
    });
    assert.equal(patched.status, 200, patched.text);
    const row = (await h.call('/management/portal', { user: owner })).body.applicants.find((x) => x.id === a.id);
    assert.ok(row, 'the owner sees the applicant');
    assert.deepEqual(row.screening, { identity: 'passed', income: 'passed', landlord: 'waived' });
    assert.equal(row.full_name, undefined);
    assert.equal(row.email, undefined);
    assert.equal(row.phone, undefined);
  });

  await t.test('staff changes are audited with who made them', async () => {
    await h.call(`/tenant/admin/requests/${requestId}`, { method: 'PATCH', user: 'staff@test.easymovezone', body: { status: 'resolved' } });
    await new Promise((r) => setTimeout(r, 200));
    const audit = await h.call('/admin/audit?limit=50', { admin: true });
    assert.ok(audit.body.entries.some((e) => e.actor === 'staff@test.easymovezone' && e.path === `/api/tenant/admin/requests/${requestId}`));
    assert.ok(audit.body.entries.some((e) => e.actor === 'admin-key' && e.path.endsWith('/schedule')));
    assert.ok(!audit.body.entries.some((e) => e.actor === tenant), 'tenants are not staff');
  });
});

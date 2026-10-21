const test = require('node:test');
const assert = require('node:assert/strict');
const h = require('./helpers');
const { screenText } = require('../services/moderation');
const {
  matchPlace, slugify, annualRent, displayName,
} = require('../areaCatalog');
const { NIGERIAN_STATES } = require('../markets');
const SEED = require('../data/areas.json');

test('moderation refuses contact details and holds posts about people', () => {
  assert.ok(screenText('Call the caretaker on 0803 123 4567').refuse);
  assert.ok(screenText('Call +2348031234567 for viewing').refuse);
  assert.ok(screenText('email me at ada@example.com').refuse);
  assert.equal(screenText('The compound floods every July and the gutter is blocked.').status, 'published');
  assert.equal(screenText('Light is about 16 hours a day on Herbert Macaulay.').status, 'published');
  assert.equal(screenText('Mr Okafor in block C is a fraudster').status, 'held');
  assert.equal(screenText('the agent was a scammer').status, 'held');
  assert.equal(screenText('Alhaji Musa owns the building').status, 'held');
  assert.equal(screenText('Is Ogba good for someone working on the Island?').status, 'published');
});

test('places map to their area, and the city or state must agree', () => {
  const at = (place) => matchPlace(SEED, place)?.slug || null;
  assert.equal(at({ area: 'Yaba', city: 'Lagos', state: 'Lagos' }), 'yaba-lagos');
  assert.equal(at({ city: 'Yaba', state: 'Lagos' }), 'yaba-lagos');
  assert.equal(at({ area: 'GRA', city: 'Port Harcourt', state: 'Rivers' }), 'gra-port-harcourt');
  assert.equal(at({ area: 'GRA', city: 'Enugu', state: 'Enugu' }), 'gra-enugu');
  assert.equal(at({ area: 'GRA', city: 'Benin City', state: 'Edo' }), 'gra-benin');
  assert.equal(at({ area: 'GRA', city: 'Kano', state: 'Kano' }), null);
  assert.equal(at({ area: 'Mowe', city: 'Mowe', state: 'Ogun' }), 'mowe-ibafo-ogun');
  assert.equal(at({ area: 'Somewhere else', city: 'Lagos' }), null);
  assert.equal(slugify('Wuse 2', 'Abuja'), 'wuse-2-abuja');
});

test('the starter areas are all in Nigeria, with unique slugs and spellings', () => {
  assert.ok(SEED.length >= 40);
  assert.equal(new Set(SEED.map((a) => a.slug)).size, SEED.length, 'slugs are unique');
  for (const a of SEED) {
    assert.ok(NIGERIAN_STATES.includes(a.state), `${a.slug}: ${a.state} is a Nigerian state`);
    const [lat, lng] = a.center;
    assert.ok(lat >= 4 && lat <= 14 && lng >= 2.6 && lng <= 14.7, `${a.slug} is on the map of Nigeria`);
    assert.equal(slugify(a.slug), a.slug);
    assert.ok(a.match.every((m) => m === m.toLowerCase()), `${a.slug} spellings are lower case`);
  }
  // No spelling may point at two areas in the same state, or a listing could land in either.
  const seen = new Map();
  for (const a of SEED) {
    for (const m of a.match) {
      const key = `${a.state}|${m}`;
      assert.ok(!seen.has(key), `"${m}" is used by both ${seen.get(key)} and ${a.slug}`);
      seen.set(key, a.slug);
    }
  }
});

test('rents are compared as yearly figures and authors by first name and initial', () => {
  assert.equal(annualRent(100000, 'monthly'), 1200000);
  assert.equal(annualRent(600000, 'biannual'), 1200000);
  assert.equal(annualRent(1200000, 'annual'), 1200000);
  assert.equal(annualRent(0, 'annual'), null);
  assert.equal(displayName({ name: 'Ada Chioma Okafor' }, true), 'Ada O.');
  assert.equal(displayName({ name: 'Ada' }, true), 'Ada');
  assert.equal(displayName({ name: 'Ada Okafor' }, false), null);
  assert.equal(displayName({ name: null }, true), null);
});

const skip = !h.enabled && 'set TEST_DATABASE_URL to run the API tests';

test('Neighbourhoods API', { skip }, async (t) => {
  await h.start();
  t.after(h.stop);
  const id = h.uid();
  const owner = `owner-${id}@test.easymovezone`;
  const tenant = `tenant-${id}@test.easymovezone`;
  const visitor = `visitor-${id}@test.easymovezone`;
  const others = [1, 2, 3].map((n) => `other${n}-${id}@test.easymovezone`);
  // seedTenancy puts the tenant in a managed flat in Yaba, Lagos.
  await h.seedTenancy({ owner, tenant });
  const slug = 'yaba-lagos';
  await h.q(`DELETE FROM area_posts WHERE area_slug = $1`, [slug]);
  await h.q(`DELETE FROM area_ratings WHERE area_slug = $1`, [slug]);

  await t.test('areas are public; unknown ones are 404', async () => {
    const list = await h.call('/areas');
    assert.equal(list.status, 200);
    assert.ok(list.body.areas.some((a) => a.slug === slug));
    const one = await h.call(`/areas/${slug}`);
    assert.equal(one.body.area.name, 'Yaba');
    assert.equal(one.body.viewer.signedIn, false);
    assert.equal((await h.call('/areas/atlantis')).status, 404);
  });

  let post;
  await t.test('posting needs a sign-in; a managed tenant is a verified resident', async () => {
    const body = { category: 'utilities', place: 'Herbert Macaulay Way', body: 'Light is about 16 hours a day here, water is steady.' };
    assert.equal((await h.call(`/areas/${slug}/posts`, { method: 'POST', body })).status, 401);
    const made = await h.call(`/areas/${slug}/posts`, { method: 'POST', user: tenant, body });
    assert.equal(made.status, 200, made.text);
    post = made.body.post;
    assert.equal(post.status, 'published');
    assert.equal(post.verified_resident, true);
    const byVisitor = await h.call(`/areas/${slug}/posts`, { method: 'POST', user: visitor, body: { ...body, body: 'Traffic at Sabo is bad from 7am to 10am.' } });
    assert.equal(byVisitor.body.post.verified_resident, false);
  });

  await t.test('the board never shows an email, and contact details are refused', async () => {
    const board = await h.call(`/areas/${slug}/posts`);
    assert.equal(board.status, 200);
    assert.ok(board.body.posts.length >= 2);
    assert.ok(!board.text.includes('@test.easymovezone'), 'no author email on the public board');
    const phone = await h.call(`/areas/${slug}/posts`, { method: 'POST', user: visitor, body: { category: 'building', body: 'Call the agent on 08031234567 for this flat' } });
    assert.equal(phone.status, 400);
  });

  await t.test('a post naming or accusing a person is held: only its author sees it', async () => {
    const held = await h.call(`/areas/${slug}/posts`, { method: 'POST', user: visitor, body: { category: 'building', body: 'Mr Okafor the agent is a fraudster, avoid him.' } });
    assert.equal(held.body.post.status, 'held');
    const pub = await h.call(`/areas/${slug}/posts`);
    assert.ok(!pub.body.posts.some((p) => p.id === held.body.post.id));
    const own = await h.call(`/areas/${slug}/posts`, { user: visitor });
    assert.ok(own.body.posts.some((p) => p.id === held.body.post.id && p.mine));
    const queue = await h.call('/areas/admin/queue?view=held', { admin: true });
    assert.ok(queue.body.posts.some((p) => p.id === held.body.post.id));
    assert.equal((await h.call('/areas/admin/queue', { user: visitor })).status, 401);
  });

  await t.test('helpful toggles once per person, never on your own post', async () => {
    const on = await h.call(`/areas/posts/${post.id}/helpful`, { method: 'POST', user: visitor });
    assert.deepEqual(on.body, { helpful: true, helpful_count: 1 });
    const off = await h.call(`/areas/posts/${post.id}/helpful`, { method: 'POST', user: visitor });
    assert.deepEqual(off.body, { helpful: false, helpful_count: 0 });
    assert.equal((await h.call(`/areas/posts/${post.id}/helpful`, { method: 'POST', user: tenant })).status, 400);
  });

  await t.test('replies show under the post', async () => {
    const r = await h.call(`/areas/posts/${post.id}/replies`, { method: 'POST', user: visitor, body: { body: 'Same on my street, thanks.' } });
    assert.equal(r.status, 200, r.text);
    const board = await h.call(`/areas/${slug}/posts`);
    assert.equal(board.body.posts.find((p) => p.id === post.id).replies.length, 1);
  });

  await t.test('three reports from different people hide a post until staff publish it again', async () => {
    for (const who of others) {
      const rep = await h.call(`/areas/posts/${post.id}/report`, { method: 'POST', user: who, body: { reason: 'false' } });
      assert.equal(rep.status, 200, rep.text);
    }
    // The same person reporting twice counts once.
    await h.call(`/areas/posts/${post.id}/report`, { method: 'POST', user: others[0], body: { reason: 'false' } });
    const { rows: [row] } = await h.q('SELECT status, report_count FROM area_posts WHERE id = $1', [post.id]);
    assert.equal(row.status, 'held');
    assert.equal(row.report_count, 3);
    const restored = await h.call(`/areas/admin/posts/${post.id}`, { method: 'PATCH', admin: true, body: { status: 'published' } });
    assert.equal(restored.body.status, 'published');
    const { rows: [after] } = await h.q('SELECT report_count FROM area_posts WHERE id = $1', [post.id]);
    assert.equal(after.report_count, 0);
  });

  await t.test('authors delete their own posts, not anyone else\'s', async () => {
    assert.equal((await h.call(`/areas/posts/${post.id}`, { method: 'DELETE', user: visitor })).status, 404);
    assert.equal((await h.call(`/areas/posts/${post.id}`, { method: 'DELETE', user: tenant })).status, 200);
    const board = await h.call(`/areas/${slug}/posts`);
    assert.ok(!board.body.posts.some((p) => p.id === post.id));
  });

  await t.test('ratings: one set per person, averaged, kept up to date', async () => {
    assert.equal((await h.call(`/areas/${slug}/rating`, { method: 'PUT', user: tenant, body: {} })).status, 400);
    await h.call(`/areas/${slug}/rating`, { method: 'PUT', user: tenant, body: { power: 2, water: 4 } });
    const second = await h.call(`/areas/${slug}/rating`, { method: 'PUT', user: visitor, body: { power: 4, water: 5, noise: 3 } });
    assert.equal(second.body.ratings.count, 2);
    assert.equal(second.body.ratings.verifiedCount, 1);
    assert.equal(second.body.ratings.averages.power, 3);
    const again = await h.call(`/areas/${slug}/rating`, { method: 'PUT', user: visitor, body: { power: 2 } });
    assert.equal(again.body.ratings.count, 2);
    assert.equal(again.body.ratings.averages.power, 2);
    const mine = await h.call(`/areas/${slug}`, { user: visitor });
    assert.equal(mine.body.myRating.power, 2);
    assert.equal(mine.body.viewer.verifiedResident, false);
    assert.equal((await h.call(`/areas/${slug}`, { user: tenant })).body.viewer.verifiedResident, true);
  });

  await t.test('the rent snapshot uses live rentals in the area, as yearly rents; listings link to their area', async () => {
    // Earlier runs against the same database leave their rentals behind.
    await h.q(`DELETE FROM listings WHERE owner_email LIKE '%@test.easymovezone' AND listing_type = 'rent'`);
    const ref = `T-${id}`.toUpperCase();
    await h.q(
      `INSERT INTO listings (ref, slug, owner_email, title, area, city, state, beds, currency, list_price, listing_type, rent_frequency, status)
       VALUES ($1,$4,$2,'2-bed flat, Yaba','Yaba','Lagos','Lagos','2','NGN',150000,'rent','monthly','live'),
              ($3,NULL,$2,'2-bed flat, Akoka','Akoka','Lagos','Lagos','2','NGN',2400000,'rent','annual','live')`,
      [`${ref}A`, owner, `${ref}B`, `flat-${id}`]
    );
    const one = await h.call(`/areas/${slug}`);
    const twoBed = one.body.rents.find((r) => r.beds === '2');
    assert.equal(twoBed.count, 2);
    assert.equal(twoBed.low, 1800000);
    assert.equal(twoBed.high, 2400000);
    assert.equal(one.body.rentals, 2);
    assert.equal((await h.call(`/listings/flat-${id}`)).body.listing.area_slug, slug);
  });

  await t.test('the moving link is offered only where we move homes', async () => {
    assert.equal((await h.call(`/areas/${slug}`)).body.area.movingCity, 'Lagos');
    assert.equal((await h.call('/areas/bodija-ibadan')).body.area.movingCity, null);
  });

  await t.test('authors are told about replies and about decisions on held posts', async () => {
    const mine = await h.call(`/areas/${slug}/posts`, { method: 'POST', user: tenant, body: { category: 'transport', body: 'BRT from Yaba to CMS takes about 40 minutes off-peak.' } });
    await h.call(`/areas/posts/${mine.body.post.id}/replies`, { method: 'POST', user: visitor, body: { body: 'Same for me, thanks.' } });
    // Replying to your own post does not notify you.
    await h.call(`/areas/posts/${mine.body.post.id}/replies`, { method: 'POST', user: tenant, body: { body: 'Evenings take longer.' } });
    await require('../background').flush();
    const link = `/areas/${slug}#post-${mine.body.post.id}`;
    const { rows: replies } = await h.q(`SELECT title, audience FROM notifications WHERE recipient_email = $1 AND link = $2`, [tenant, link]);
    assert.deepEqual(replies, [{ title: 'Someone replied to your post', audience: 'community' }]);

    const held = await h.call(`/areas/${slug}/posts`, { method: 'POST', user: others[0], body: { category: 'building', body: 'Chief Adewale never returns the caution fee.' } });
    assert.equal(held.body.post.status, 'held');
    await h.call(`/areas/admin/posts/${held.body.post.id}`, { method: 'PATCH', admin: true, body: { status: 'removed', note: 'Names a person' } });
    await require('../background').flush();
    const { rows: removed } = await h.q(`SELECT title FROM notifications WHERE recipient_email = $1 AND kind = 'area_post'`, [others[0]]);
    assert.deepEqual(removed.map((r) => r.title), ['We removed your post']);
  });

  await t.test('staff open, edit and hide areas; requests are answered by opening one', async () => {
    const name = `Testville ${id}`;
    assert.equal((await h.call('/areas/admin/areas', { method: 'POST', user: visitor, body: { name, city: 'Ibadan', state: 'Oyo' } })).status, 401);
    await h.call('/leads', { method: 'POST', body: { type: 'general', name: 'Ada', email: visitor, service: 'Neighbourhood request', message: `Please open ${name}` } });
    const listing = await h.call('/areas/admin/areas', { admin: true });
    const request = listing.body.requests.find((r) => r.message.includes(name));
    assert.ok(request, 'the request shows in the admin list');
    assert.ok(listing.body.states.includes('FCT - Abuja'));

    assert.equal((await h.call('/areas/admin/areas', { method: 'POST', admin: true, body: { name, city: 'Ibadan', state: 'Texas' } })).status, 400);
    assert.equal((await h.call('/areas/admin/areas', { method: 'POST', admin: true, body: { name, city: 'Ibadan', state: 'Oyo', lat: 51.5, lng: -0.1 } })).status, 400, 'a map point outside Nigeria');
    const made = await h.call('/areas/admin/areas', { method: 'POST', admin: true, body: { name, city: 'Ibadan', state: 'Oyo', lat: 7.4, lng: 3.9, match: 'testville east, Testville West', requestId: request.id } });
    assert.equal(made.status, 200, made.text);
    const newSlug = made.body.area.slug;
    assert.equal(newSlug, `testville-${id}-ibadan`);
    assert.deepEqual(made.body.area.match, [name.toLowerCase(), 'testville east', 'testville west']);
    assert.equal((await h.call('/areas/admin/areas', { method: 'POST', admin: true, body: { name, city: 'Ibadan', state: 'Oyo' } })).status, 409);
    const { rows: [lead] } = await h.q('SELECT status FROM leads WHERE id = $1', [request.id]);
    assert.equal(lead.status, 'replied');

    assert.equal((await h.call(`/areas/${newSlug}`)).status, 200, 'a new area is live at once');
    assert.ok((await h.call('/areas')).body.areas.some((a) => a.slug === newSlug));
    const edited = await h.call(`/areas/admin/areas/${newSlug}`, { method: 'PATCH', admin: true, body: { blurb: 'Quiet streets.', lat: '', lng: '' } });
    assert.equal(edited.body.area.blurb, 'Quiet streets.');
    assert.equal(edited.body.area.center, null);
    await h.call(`/areas/admin/areas/${newSlug}`, { method: 'PATCH', admin: true, body: { status: 'hidden' } });
    assert.equal((await h.call(`/areas/${newSlug}`)).status, 404, 'a hidden area has no page');
    assert.ok(!(await h.call('/areas')).body.areas.some((a) => a.slug === newSlug));
    assert.ok((await h.call('/areas/admin/areas', { admin: true })).body.areas.some((a) => a.slug === newSlug && a.status === 'hidden'));
  });
});

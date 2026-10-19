/**
 * The property API lives in this app at /api/property (see
 * app/api/property/[...path]/route.ts, which runs property/server).
 */
const API_BASE = '/api/property';

export async function ensureApiBase() {
  return API_BASE;
}

export function getApiBase() {
  return API_BASE;
}

let _authSessionId = null; // When user is logged in, this is their email (persists to DB per user)

export function setAuthSession(user) {
  _authSessionId = user ? (user.email || user.id || null) : null;
}

function getSessionId() {
  // Use logged-in user email so session data saves to their account
  if (_authSessionId) return `auth:${_authSessionId}`;
  let sid = localStorage.getItem('emz_session');
  if (!sid) {
    sid = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
    localStorage.setItem('emz_session', sid);
  }
  return sid;
}

async function request(path, options = {}) {
  const base = await ensureApiBase();
  /*
   * `headers` is merged last on purpose. Spreading `options` after it would let
   * a caller that passes any header at all (every admin call passes
   * `x-admin-key`) replace the whole object and drop the JSON content type —
   * which makes express.json() skip the body and hand the route `undefined`.
   */
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!res.ok) {
    const err = isJson
      ? await res.json().catch(() => ({ error: 'Request failed' }))
      : await res.text().catch(() => '');

    const fallbackMessage =
      typeof err === 'string' && err.trim().startsWith('<')
        ? 'The server returned a page instead of data. Please try again.'
        : 'Request failed';

    throw new Error((typeof err === 'object' && err?.error) || fallbackMessage);
  }

  if (!isJson) {
    const text = await res.text().catch(() => '');
    if (text.trim().startsWith('<')) {
      throw new Error(
        'The server returned a page instead of data. Please try again.'
      );
    }
    throw new Error('API route returned a non-JSON response.');
  }

  return res.json();
}

/** Delete tokens for files uploaded in this tab, by blob URL. */
const mediaDeleteTokens = new Map();

/** True for a file in EasyMoveZone's private object storage (`s3://bucket/key`). */
export function isStoredMedia(url) {
  return typeof url === 'string' && url.startsWith('s3://');
}

/**
 * Where a browser can load a live listing's photo: uploads sit in a private
 * container, so they are served through the API (which checks the listing is
 * live). Anything else (a site image, an external URL) is returned as is.
 */
export function publicMediaUrl(url) {
  return isStoredMedia(url) ? `${getApiBase()}/media/public?u=${encodeURIComponent(url)}` : url;
}

export const api = {
  getSessionId,

  async submitLead(data) {
    return request('/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /* ── Profile ── */
  async getProfile() {
    return request(`/profile?sessionId=${getSessionId()}`);
  },
  async saveProfile(data) {
    return request('/profile', {
      method: 'POST',
      body: JSON.stringify({ sessionId: getSessionId(), ...data }),
    });
  },

  /* ── Plan matcher (which management plan fits this owner) ── */
  landlord: {
    async getProfile(email) {
      const { profile } = await request(`/landlord/profile?email=${encodeURIComponent(email)}`);
      return profile;
    },
    /** @param {object} profile — the derived match from config/landlord.js. */
    async saveProfile(email, profile) {
      const { profile: saved } = await request('/landlord/profile', {
        method: 'POST',
        body: JSON.stringify({ email, ...profile }),
      });
      return saved;
    },
  },

  /* ── Consultations (owner asking a manager to look at a property) ── */
  consult: {
    async book(payload) {
      const { booking } = await request('/consult/bookings', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return booking;
    },
    async myBookings(email) {
      const { bookings } = await request(`/consult/bookings?email=${encodeURIComponent(email)}`);
      return bookings;
    },
  },

  /* ── Property Passport verification requests ── */
  passport: {
    async create(data) {
      const { request: passportRequest } = await request('/passport-requests', {
        method: 'POST', body: JSON.stringify(data),
      });
      return passportRequest;
    },
    /** Every verification on the signed-in account (sign-in is needed to submit one). */
    async mine() {
      const { requests } = await request('/passport-requests/mine');
      return requests;
    },
    checkout(id) {
      return request(`/passport-requests/${id}/checkout`, { method: 'POST', body: '{}' });
    },
  },

  /* ── Admin ── */
  admin: {
    async summary(key) {
      return request('/admin/summary', { headers: { 'x-admin-key': key } });
    },
    /** Who the staff member is — works with the key or a staff sign-in (ADMIN_EMAILS). */
    whoami(key = '') {
      return request('/admin/whoami', { headers: key ? { 'x-admin-key': key } : {} });
    },
    async audit(key, limit = 30) {
      const { entries } = await request(`/admin/audit?limit=${limit}`, { headers: key ? { 'x-admin-key': key } : {} });
      return entries;
    },
    /** Signed, 15-minute read URLs for private uploads: { [blobUrl]: signedUrl }. */
    async readMedia(blobs, key) {
      const { urls } = await request('/media/read-many', {
        method: 'POST', headers: { 'x-admin-key': key }, body: JSON.stringify({ blobs }),
      });
      return urls || {};
    },
    async listLeads(key, status) {
      const qs = status ? `?status=${encodeURIComponent(status)}` : '';
      const { leads } = await request(`/leads/admin${qs}`, { headers: { 'x-admin-key': key } });
      return leads;
    },
    async updateLead(id, key, status) {
      return request(`/leads/admin/${id}`, {
        method: 'PATCH', headers: { 'x-admin-key': key }, body: JSON.stringify({ status }),
      });
    },
    async listPassportRequests(key) {
      const { requests } = await request('/passport-requests/admin', { headers: { 'x-admin-key': key } });
      return requests;
    },
    async updatePassportRequest(id, key, patch) {
      const { request: passportRequest } = await request(`/passport-requests/${id}`, {
        method: 'PATCH', headers: { 'x-admin-key': key }, body: JSON.stringify(patch),
      });
      return passportRequest;
    },
    async getPrivateDocumentUrl(blob, key) {
      return request('/media/read', {
        method: 'POST', headers: { 'x-admin-key': key }, body: JSON.stringify({ blob }),
      });
    },
    async listBookings(key, status) {
      const qs = status ? `?status=${encodeURIComponent(status)}` : '';
      const { bookings } = await request(`/consult/admin/bookings${qs}`, {
        headers: { 'x-admin-key': key },
      });
      return bookings;
    },
    async updateBooking(id, key, patch) {
      const { booking } = await request(`/consult/admin/bookings/${id}`, {
        method: 'PATCH', headers: { 'x-admin-key': key }, body: JSON.stringify(patch),
      });
      return booking;
    },
  },

  /* ── EasyAdviser (AI, grounded in the owner's own properties) ── */
  async chat(message) {
    return request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ sessionId: getSessionId(), message }),
    });
  },
  async getChatHistory() {
    return request(`/ai/history?sessionId=${encodeURIComponent(getSessionId())}`);
  },
  async clearChatHistory() {
    return request(`/ai/history?sessionId=${encodeURIComponent(getSessionId())}`, {
      method: 'DELETE',
    });
  },

  /* ── Marketplace ── */
  listings: {
    /** The public grid. Only ever returns properties an admin has published. */
    async browse(params = {}) {
      const qs = new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
      ).toString();
      return request(`/listings${qs ? `?${qs}` : ''}`);
    },
    /** Filter options with stock behind them; `mode` is 'rent' for the Rent page. */
    async facets(mode) {
      return request(`/listings/facets${mode === 'rent' ? '?mode=rent' : ''}`);
    },
    async get(idOrSlug) {
      const { listing } = await request(`/listings/${encodeURIComponent(idOrSlug)}`);
      return listing;
    },
    async enquire(id, payload) {
      return request(`/listings/${id}/enquiry`, {
        method: 'POST', body: JSON.stringify(payload),
      });
    },
    /** A renter applies for a live rental. */
    async apply(id, payload) {
      return request(`/listings/${id}/apply`, {
        method: 'POST', body: JSON.stringify(payload),
      });
    },
    /** An owner's own submissions, at any stage of the pipeline. */
    async mine(email) {
      const { listings } = await request(`/listings/mine?email=${encodeURIComponent(email)}`);
      return listings;
    },
    /** The owner's side of assisted intake: open the link, then sign. */
    confirm: {
      async get(token) {
        return request(`/listings/confirm/${encodeURIComponent(token)}`);
      },
      async submit(token, payload) {
        return request(`/listings/confirm/${encodeURIComponent(token)}`, {
          method: 'POST', body: JSON.stringify(payload),
        });
      },
    },
    admin: {
      /** `type` is 'sale' (the default, Marketplace) or 'rent' (Admin → Rentals). */
      async list(key, status, project, type) {
        const qs = new URLSearchParams(Object.entries({ status, project, type }).filter(([, v]) => v)).toString();
        const { listings } = await request(`/listings/admin${qs ? `?${qs}` : ''}`, { headers: { 'x-admin-key': key } });
        return listings;
      },
      /** Returns { listing, link: { path, expiresAt } }. */
      async createDraft(key, payload) {
        return request('/listings/admin/drafts', {
          method: 'POST', headers: { 'x-admin-key': key }, body: JSON.stringify(payload),
        });
      },
      /** Returns { project, listings, link: { path, expiresAt } }. */
      async createProject(key, payload) {
        return request('/listings/admin/projects', {
          method: 'POST', headers: { 'x-admin-key': key }, body: JSON.stringify(payload),
        });
      },
      async projects(key) {
        const { projects } = await request('/listings/admin/projects', { headers: { 'x-admin-key': key } });
        return projects;
      },
      async removeProject(id, key) {
        return request(`/listings/admin/projects/${id}`, { method: 'DELETE', headers: { 'x-admin-key': key } });
      },
      /** A fresh owner link for a draft listing or a project; earlier links stop working. */
      async newLink(key, { listingId, projectId }) {
        const { link } = await request(
          projectId ? `/listings/admin/projects/${projectId}/link` : `/listings/admin/${listingId}/link`,
          { method: 'POST', headers: { 'x-admin-key': key }, body: '{}' }
        );
        return link;
      },
      /** Managed properties that could be advertised for rent. */
      async rentalCandidates(key) {
        const { properties } = await request('/listings/admin/rentals/candidates', { headers: { 'x-admin-key': key } });
        return properties;
      },
      async createRental(key, details) {
        const { listing } = await request('/listings/admin/rentals', {
          method: 'POST', headers: { 'x-admin-key': key }, body: JSON.stringify(details),
        });
        return listing;
      },
      async applications(key, { status, listingId } = {}) {
        const qs = new URLSearchParams();
        if (status) qs.set('status', status);
        if (listingId) qs.set('listingId', String(listingId));
        const q = qs.toString();
        const { applications } = await request(`/listings/admin/applications${q ? `?${q}` : ''}`, { headers: { 'x-admin-key': key } });
        return applications;
      },
      async updateApplication(id, key, patch) {
        const { application } = await request(`/listings/admin/applications/${id}`, {
          method: 'PATCH', headers: { 'x-admin-key': key }, body: JSON.stringify(patch),
        });
        return application;
      },
      /** Let the property to this applicant: records the tenancy on the managed property. */
      async createTenancy(id, key, details) {
        return request(`/listings/admin/applications/${id}/tenancy`, {
          method: 'POST', headers: { 'x-admin-key': key }, body: JSON.stringify(details || {}),
        });
      },
      async update(id, key, patch) {
        const { listing } = await request(`/listings/admin/${id}`, {
          method: 'PATCH', headers: { 'x-admin-key': key }, body: JSON.stringify(patch),
        });
        return listing;
      },
      async remove(id, key) {
        return request(`/listings/admin/${id}`, { method: 'DELETE', headers: { 'x-admin-key': key } });
      },
      async enquiries(id, key) {
        const { enquiries } = await request(`/listings/admin/${id}/enquiries`, { headers: { 'x-admin-key': key } });
        return enquiries;
      },
      async updateEnquiry(id, key, patch) {
        const { enquiry } = await request(`/listings/admin/enquiries/${id}`, {
          method: 'PATCH', headers: { 'x-admin-key': key }, body: JSON.stringify(patch),
        });
        return enquiry;
      },
    },
  },

  /* ── Media uploads (object storage via presigned URL) ── */
  async getMediaConfig() {
    try {
      return await request('/media/config');
    } catch {
      return { enabled: false, accept: [], maxBytes: 0 };
    }
  },
  /**
   * Upload a File directly to object storage via a server-minted presigned URL.
   * @param {File} file
   * @param {{ prefix?: string, onProgress?: (pct:number)=>void }} opts
   * @returns {Promise<{ blobUrl: string, blobName: string }>}
   */
  async uploadMedia(file, { prefix = 'sell', onProgress } = {}) {
    const { uploadUrl, blobUrl, blobName, deleteToken } = await request('/media/sas', {
      method: 'POST',
      body: JSON.stringify({ contentType: file.type, fileName: file.name, size: file.size, prefix }),
    });

    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);
      xhr.setRequestHeader('Content-Type', file.type);
      if (onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
        };
      }
      xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`)));
      xhr.onerror = () => reject(new Error('Upload failed. Check storage CORS settings.'));
      xhr.send(file);
    });

    // Only the uploader can remove a file: keep the token this upload came with.
    if (deleteToken) mediaDeleteTokens.set(blobUrl, deleteToken);
    return { blobUrl, blobName };
  },
  /** Delete an uploaded blob by its name or full URL. */
  async deleteMedia(blob) {
    return request('/media', {
      method: 'DELETE',
      body: JSON.stringify({ blob, token: mediaDeleteTokens.get(blob) }),
    });
  },

  /* ── Engine health (Python analysis service) ── */
  async engineHealth() {
    try {
      return await request('/engine/health');
    } catch {
      return { ok: false, version: null };
    }
  },

  /* ── Property listings (Buy/Sell) ── */
  async generateListingDescription(data) {
    try {
      return await request('/ai/generate-listing', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      return { description: '' };
    }
  },
  async submitListing(data) {
    return request('/listings', {
      method: 'POST',
      body: JSON.stringify({ sessionId: getSessionId(), ...data }),
    });
  },
  async analyzePhotos(files) {
    try {
      return await request('/ai/photo-analysis', {
        method: 'POST',
        body: JSON.stringify({ files }),
      });
    } catch {
      return { assessment: {} };
    }
  },

  /* ── The in-app inbox behind the bell in both portals ── */
  notifications: {
    list(audience) {
      return request(`/notifications?audience=${audience}`);
    },
    markRead(audience, ids) {
      return request('/notifications/read', { method: 'POST', body: JSON.stringify({ audience, ids }) });
    },
  },

  /* ── EasyMoveZone for tenants (server/routes/tenant.js) ── */
  tenant: {
    /*
     * Every tenant call is answered for the signed-in session; the server
     * ignores any email in the request, so none is sent.
     */
    /** How many properties, tenancies and rental applications the signed-in account has. */
    roles() {
      return request('/tenant/roles');
    },
    portal() {
      return request('/tenant/portal');
    },
    /** A repair, "I have paid", a question or notice to leave. */
    async raise(_email, details) {
      const { request: row } = await request('/tenant/requests', {
        method: 'POST',
        body: JSON.stringify(details),
      });
      return row;
    },
    close(id) {
      return request(`/tenant/requests/${id}/close`, { method: 'POST', body: '{}' });
    },
    async documentUrl(id) {
      const { url } = await request(`/tenant/documents/${id}`);
      return url;
    },
    async reply(requestId, body) {
      const { message } = await request(`/tenant/requests/${requestId}/messages`, { method: 'POST', body: JSON.stringify({ body }) });
      return message;
    },
    /* Paying rent online (Paystack). */
    payConfig() {
      return request('/tenant/pay/config').catch(() => ({ enabled: false }));
    },
    /** Returns { url } — send the browser there to pay. */
    pay(chargeId) {
      return request('/tenant/pay', { method: 'POST', body: JSON.stringify({ chargeId }) });
    },
    verifyPayment(reference) {
      return request(`/tenant/pay/verify?reference=${encodeURIComponent(reference)}`);
    },
    /* Invite links. */
    invite(token) {
      return request(`/tenant/invites/${encodeURIComponent(token)}`);
    },
    acceptInvite(token) {
      return request(`/tenant/invites/${encodeURIComponent(token)}/accept`, { method: 'POST', body: '{}' });
    },
    admin: {
      async reply(id, key, body) {
        const { message } = await request(`/tenant/admin/requests/${id}/messages`, {
          method: 'POST', headers: { 'x-admin-key': key }, body: JSON.stringify({ body }),
        });
        return message;
      },
      /** A new single-use link for the tenant (revokes any earlier one). */
      invite(tenancyId, key, { email, send = true } = {}) {
        return request(`/tenant/admin/tenancies/${tenancyId}/invite`, {
          method: 'POST', headers: { 'x-admin-key': key }, body: JSON.stringify({ email, send }),
        });
      },
      async list(key, status = '') {
        const qs = status ? `?status=${encodeURIComponent(status)}` : '';
        const { requests } = await request(`/tenant/admin/requests${qs}`, { headers: { 'x-admin-key': key } });
        return requests;
      },
      update(id, key, details) {
        return request(`/tenant/admin/requests/${id}`, {
          method: 'PATCH', headers: { 'x-admin-key': key }, body: JSON.stringify(details),
        });
      },
    },
  },

  /* ── EasyMoveZone Manage: letting & property management ── */
  management: {
    async plans() {
      return request('/management/plans');
    },
    /** Server-side fee breakdown. The UI also mirrors this locally for instant feedback. */
    async quote({ plan, annualRent, units, addons, currency }) {
      const { quote } = await request('/management/quote', {
        method: 'POST',
        body: JSON.stringify({ plan, annualRent, units, addons, currency }),
      });
      return quote;
    },
    async submit(form) {
      return request('/management/requests', {
        method: 'POST',
        body: JSON.stringify(form),
      });
    },
    async mine(email) {
      const { requests } = await request(`/management/requests/mine?email=${encodeURIComponent(email)}`);
      return requests;
    },
    async getById(id, email) {
      return request(`/management/requests/${id}?email=${encodeURIComponent(email)}`);
    },
    async messages(id, email) {
      const { messages } = await request(`/management/requests/${id}/messages?email=${encodeURIComponent(email)}`);
      return messages;
    },
    async sendMessage(id, email, body) {
      const { message } = await request(`/management/requests/${id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ email, body }),
      });
      return message;
    },

    /* ── Owner portal ── */
    /** The roll-up across every property this owner has with us. */
    async portfolio(email) {
      return request(`/management/portfolio?email=${encodeURIComponent(email)}`);
    },
    /** Everything the portal renders in one call, optionally scoped to one property. */
    async portal(email, propertyId) {
      const qs = new URLSearchParams({ email });
      if (propertyId) qs.set('propertyId', String(propertyId));
      return request(`/management/portal?${qs}`);
    },
    async finance(email, { propertyId, months = 12 } = {}) {
      const qs = new URLSearchParams({ email, months: String(months) });
      if (propertyId) qs.set('propertyId', String(propertyId));
      const { finance } = await request(`/management/finance?${qs}`);
      return finance;
    },
    async payouts(email, propertyId) {
      const qs = new URLSearchParams({ email });
      if (propertyId) qs.set('propertyId', String(propertyId));
      const { payouts } = await request(`/management/payouts?${qs}`);
      return payouts;
    },
    /** One remittance statement, with the rent and cost lines behind it. */
    async payout(id, email) {
      return request(`/management/payouts/${id}?email=${encodeURIComponent(email)}`);
    },
    /** @param {'approve'|'reject'} decision */
    async decideExpense(id, email, decision, note) {
      return request(`/management/expenses/${id}/decision`, {
        method: 'POST',
        body: JSON.stringify({ email, decision, note }),
      });
    },
    /** Allow (or stop) advertising this property on the public Rent page. */
    async setAdvertise(propertyId, email, consent) {
      return request(`/management/requests/${propertyId}/advertise`, {
        method: 'PATCH',
        body: JSON.stringify({ email, consent }),
      });
    },
    /** A link the owner can open (signed when the file is in our private storage). */
    async documentUrl(id) {
      const { url } = await request(`/management/documents/${id}`);
      return url;
    },
    /** The owner's note on a repair their tenant reported (to the desk, not the tenant). */
    async noteOnTenantRequest(id, body) {
      const { message } = await request(`/management/tenant-requests/${id}/messages`, { method: 'POST', body: JSON.stringify({ body }) });
      return message;
    },
    async savePayoutMethod(propertyId, email, details) {
      const { payoutMethod } = await request(`/management/requests/${propertyId}/payout-method`, {
        method: 'PATCH',
        body: JSON.stringify({ email, ...details }),
      });
      return payoutMethod;
    },
    admin: {
      async list(key, status = '') {
        const qs = status ? `?status=${encodeURIComponent(status)}` : '';
        const { requests } = await request(`/management/requests${qs}`, { headers: { 'x-admin-key': key } });
        return requests;
      },
      get(id, key) {
        return request(`/management/requests/${id}`, { headers: { 'x-admin-key': key } });
      },
      async messages(id, key) {
        const { messages } = await request(`/management/requests/${id}/messages`, { headers: { 'x-admin-key': key } });
        return messages;
      },
      async sendMessage(id, key, body) {
        const { message } = await request(`/management/requests/${id}/messages`, {
          method: 'POST', headers: { 'x-admin-key': key }, body: JSON.stringify({ body }),
        });
        return message;
      },
      setStatus(id, key, status, note = '') {
        return request(`/management/requests/${id}/status`, {
          method: 'POST', headers: { 'x-admin-key': key }, body: JSON.stringify({ status, note }),
        });
      },
      assign(id, key, details) {
        return request(`/management/requests/${id}/assign`, {
          method: 'POST', headers: { 'x-admin-key': key }, body: JSON.stringify(details),
        });
      },
      remove(id, key) {
        return request(`/management/requests/${id}`, { method: 'DELETE', headers: { 'x-admin-key': key } });
      },
      createTenancy(id, key, details) {
        return request(`/management/requests/${id}/tenancies`, {
          method: 'POST', headers: { 'x-admin-key': key }, body: JSON.stringify(details),
        });
      },
      updateTenancy(id, key, details) {
        return request(`/management/tenancies/${id}`, {
          method: 'PATCH', headers: { 'x-admin-key': key }, body: JSON.stringify(details),
        });
      },
      /** Raise every rent period from the tenancy's start, end, rent and frequency. */
      buildSchedule(tenancyId, key) {
        return request(`/management/tenancies/${tenancyId}/schedule`, { method: 'POST', headers: { 'x-admin-key': key }, body: '{}' });
      },
      runRentReminders(key) {
        return request('/management/rent-reminders/run', { method: 'POST', headers: { 'x-admin-key': key }, body: '{}' });
      },
      createRentCharge(id, key, details) {
        return request(`/management/requests/${id}/rent-charges`, {
          method: 'POST', headers: { 'x-admin-key': key }, body: JSON.stringify(details),
        });
      },
      recordRent(id, key, details) {
        return request(`/management/rent-charges/${id}/receipt`, {
          method: 'POST', headers: { 'x-admin-key': key }, body: JSON.stringify(details),
        });
      },
      createExpense(id, key, details) {
        return request(`/management/requests/${id}/expenses`, {
          method: 'POST', headers: { 'x-admin-key': key }, body: JSON.stringify(details),
        });
      },
      createPayout(id, key, details) {
        return request(`/management/requests/${id}/payouts`, {
          method: 'POST', headers: { 'x-admin-key': key }, body: JSON.stringify(details),
        });
      },
      setPayoutStatus(id, key, details) {
        return request(`/management/payouts/${id}/status`, {
          method: 'POST', headers: { 'x-admin-key': key }, body: JSON.stringify(details),
        });
      },
      addDocument(id, key, details) {
        return request(`/management/requests/${id}/documents`, {
          method: 'POST', headers: { 'x-admin-key': key }, body: JSON.stringify(details),
        });
      },
    },
  },

  /* ── EasyMoveZone Upgrade: home renovations / upgrades ── */
  renovations: {
    async estimate(form) {
      const { estimate } = await request('/renovations/estimate', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      return estimate;
    },
    async submit(form) {
      return request('/renovations', {
        method: 'POST',
        body: JSON.stringify(form),
      });
    },
    async mine(email) {
      const { requests } = await request(`/renovations/mine?email=${encodeURIComponent(email)}`);
      return requests;
    },
    async get(id, email) {
      return request(`/renovations/${id}?email=${encodeURIComponent(email)}`);
    },
    async messages(id, email) {
      const { messages } = await request(`/renovations/${id}/messages?email=${encodeURIComponent(email)}`);
      return messages;
    },
    async sendMessage(id, email, body) {
      const { message } = await request(`/renovations/${id}/messages`, {
        method: 'POST', body: JSON.stringify({ email, body }),
      });
      return message;
    },
    async accept(id, email) {
      return request(`/renovations/${id}/accept`, {
        method: 'POST', body: JSON.stringify({ email }),
      });
    },
    async payMilestone(id, milestoneId, email) {
      return request(`/renovations/${id}/milestones/${milestoneId}/checkout`, {
        method: 'POST', body: JSON.stringify({ email }),
      });
    },
    admin: {
      async list(adminKey) {
        const { requests } = await request('/renovations', { headers: { 'x-admin-key': adminKey } });
        return requests;
      },
      get(id, adminKey) {
        return request(`/renovations/${id}`, { headers: { 'x-admin-key': adminKey } });
      },
      async messages(id, adminKey) {
        const { messages } = await request(`/renovations/${id}/messages`, { headers: { 'x-admin-key': adminKey } });
        return messages;
      },
      async sendMessage(id, adminKey, body) {
        const { message } = await request(`/renovations/${id}/messages`, {
          method: 'POST', headers: { 'x-admin-key': adminKey }, body: JSON.stringify({ body }),
        });
        return message;
      },
      schedule(id, adminKey, schedule) {
        return request(`/renovations/${id}/schedule`, {
          method: 'POST', headers: { 'x-admin-key': adminKey }, body: JSON.stringify(schedule),
        });
      },
      quote(id, adminKey, quote) {
        return request(`/renovations/${id}/quote`, {
          method: 'POST', headers: { 'x-admin-key': adminKey }, body: JSON.stringify(quote),
        });
      },
      setStatus(id, adminKey, status, note) {
        return request(`/renovations/${id}/status`, {
          method: 'POST', headers: { 'x-admin-key': adminKey }, body: JSON.stringify({ status, note }),
        });
      },
      markPaid(id, milestoneId, adminKey) {
        return request(`/renovations/${id}/milestones/${milestoneId}/mark-paid`, {
          method: 'POST', headers: { 'x-admin-key': adminKey }, body: JSON.stringify({}),
        });
      },
      remove(id, adminKey) {
        return request(`/renovations/${id}`, {
          method: 'DELETE', headers: { 'x-admin-key': adminKey },
        });
      },
    },
  },
};

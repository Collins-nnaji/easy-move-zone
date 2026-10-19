/**
 * Title and land documents an owner can tick on the Sell form. Same ids and
 * names as src/config/titleDocuments.js — change both together.
 *
 * Documents are private: they live in their own column (`title_documents`),
 * never in `media`, so GET /api/media/public (which only streams a live
 * listing's `media`) can never serve one. Admins open them through signed URLs.
 */

const { DEFAULT_MARKET } = require('./markets');

/**
 * Title papers differ by country, so the list is kept per market (by the
 * market code in server/markets.js). Nigeria is the only market today.
 */
const TITLE_DOCUMENTS_BY_MARKET = {};
TITLE_DOCUMENTS_BY_MARKET.NG = {
  c_of_o: 'Certificate of Occupancy (C of O)',
  governors_consent: "Governor's Consent",
  registered_deed: 'Registered Deed of Assignment',
  right_of_occupancy: 'Right of Occupancy (statutory or customary)',
  deed_of_lease: 'Deed of Lease or Sub-lease',
  allocation_letter: 'Letter of Allocation',
  survey_plan: 'Survey plan',
  gazette_excision: 'Excision or Gazette',
  land_search: 'Land Registry search report',
  deed_unregistered: 'Deed of Assignment (not yet registered)',
  sale_agreement: 'Contract of sale or sale agreement',
  purchase_receipt: 'Purchase receipt',
  family_receipt: 'Family or community receipt',
  power_of_attorney: 'Irrevocable Power of Attorney',
  probate: 'Probate or Letters of Administration',
  building_approval: 'Approved building plan',
  completion_cert: 'Certificate of completion or fitness',
  tenement_receipts: 'Land Use Charge or tenement rate receipts',
};
const TITLE_DOCUMENTS = TITLE_DOCUMENTS_BY_MARKET[DEFAULT_MARKET];

const MAX_DOCS = 25;
const MAX_FILES_PER_DOC = 6;

const text = (v, max) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);

/**
 * Keep only what we recognise: a known id (or `other` with the owner's own
 * name for it), whether they hold it, and the files they uploaded for it.
 */
function normalizeTitleDocuments(input) {
  if (!Array.isArray(input)) return [];
  const seen = new Set();
  const out = [];
  for (const d of input) {
    if (!d || typeof d !== 'object') continue;
    const id = String(d.id || '');
    let name;
    if (id === 'other') {
      name = text(d.name, 120);
      if (!name) continue;
    } else {
      name = TITLE_DOCUMENTS[id];
      if (!name || seen.has(id)) continue;
      seen.add(id);
    }
    const files = (Array.isArray(d.files) ? d.files : [])
      .filter((f) => f && typeof f.url === 'string' && /^https?:\/\//.test(f.url))
      .slice(0, MAX_FILES_PER_DOC)
      .map((f) => ({ url: f.url, name: text(f.name, 200) || 'Document' }));
    out.push({ id, name, files });
    if (out.length >= MAX_DOCS) break;
  }
  return out;
}

module.exports = { TITLE_DOCUMENTS_BY_MARKET, TITLE_DOCUMENTS, normalizeTitleDocuments };

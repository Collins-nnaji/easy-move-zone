/**
 * The papers a Nigerian owner may hold for a property, as ticked on the Sell
 * form. Grouped by what each one proves, because that is what decides how
 * quickly we can verify the title and buy.
 *
 * Same ids as server/titleDocuments.js — change both together. The server
 * drops any id it does not know, except `other`, which carries the owner's own
 * name for the document.
 */

import { DEFAULT_MARKET } from './markets';

export const TITLE_DOC_GROUPS = [
  { id: 'title', label: 'Title', hint: 'Proves who owns it' },
  { id: 'land', label: 'Land and survey', hint: 'Where it is and that it is free of acquisition' },
  { id: 'transfer', label: 'How you came to own it', hint: 'The chain from the last owner to you' },
  { id: 'building', label: 'The building', hint: 'Approvals for what was built' },
];

/**
 * Title papers differ by country, so the list is kept per market (codes as in
 * src/config/markets.js). Nigeria is the only market today; the Sell form uses
 * the default market's list.
 */
export const TITLE_DOCUMENTS_BY_MARKET = {};
TITLE_DOCUMENTS_BY_MARKET.NG = [
  { id: 'c_of_o', group: 'title', name: 'Certificate of Occupancy (C of O)', hint: 'Issued by the state governor' },
  { id: 'governors_consent', group: 'title', name: "Governor's Consent", hint: 'Approval of a transfer on land that already had a C of O' },
  { id: 'registered_deed', group: 'title', name: 'Registered Deed of Assignment', hint: 'Stamped and registered at the Lands Registry' },
  { id: 'right_of_occupancy', group: 'title', name: 'Right of Occupancy (statutory or customary)', hint: 'Grant from the state or local government' },
  { id: 'deed_of_lease', group: 'title', name: 'Deed of Lease or Sub-lease', hint: 'For leasehold estates and FCT land' },
  { id: 'allocation_letter', group: 'title', name: 'Letter of Allocation', hint: 'From a government agency or an estate developer' },

  { id: 'survey_plan', group: 'land', name: 'Survey plan', hint: 'Signed by a registered surveyor' },
  { id: 'gazette_excision', group: 'land', name: 'Excision or Gazette', hint: 'Shows the land was released from government acquisition' },
  { id: 'land_search', group: 'land', name: 'Land Registry search report', hint: 'A recent search on the title' },

  { id: 'deed_unregistered', group: 'transfer', name: 'Deed of Assignment (not yet registered)', hint: 'Signed with the seller, consent still to come' },
  { id: 'sale_agreement', group: 'transfer', name: 'Contract of sale or sale agreement', hint: 'From when you bought it' },
  { id: 'purchase_receipt', group: 'transfer', name: 'Purchase receipt', hint: 'Proof you paid the last owner' },
  { id: 'family_receipt', group: 'transfer', name: 'Family or community receipt', hint: 'For land bought from a family or community' },
  { id: 'power_of_attorney', group: 'transfer', name: 'Irrevocable Power of Attorney', hint: 'Authority to deal with the land, not title on its own' },
  { id: 'probate', group: 'transfer', name: 'Probate or Letters of Administration', hint: 'If you inherited the property' },

  { id: 'building_approval', group: 'building', name: 'Approved building plan', hint: 'Planning permit for the building' },
  { id: 'completion_cert', group: 'building', name: 'Certificate of completion or fitness', hint: 'Where the state issues one' },
  { id: 'tenement_receipts', group: 'building', name: 'Land Use Charge or tenement rate receipts', hint: 'Shows the property is paid up' },
];
export const TITLE_DOCUMENTS = TITLE_DOCUMENTS_BY_MARKET[DEFAULT_MARKET];

/** Anything not on the list. The owner names it. */
export const OTHER_DOCUMENT = { id: 'other', name: 'Another document' };

export const TITLE_DOC_BY_ID = Object.fromEntries(TITLE_DOCUMENTS.map((d) => [d.id, d]));

/** The documents that, on their own, show registered ownership. */
export const REGISTERED_TITLE_IDS = ['c_of_o', 'governors_consent', 'registered_deed', 'right_of_occupancy', 'deed_of_lease'];

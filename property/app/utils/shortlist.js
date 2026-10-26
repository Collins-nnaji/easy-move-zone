import { useSyncExternalStore } from 'react';

/**
 * Saved properties and recently viewed ones, kept on this device so they work
 * signed out too. Each entry is a small snapshot of the public listing (what a
 * card needs), so the Saved page renders without a round trip and still shows
 * something if a listing has since sold.
 */

const KEYS = { saved: 'bv.saved.v1', recent: 'bv.recent.v1' };
const LIMITS = { saved: 60, recent: 8 };
const listeners = new Set();
const cache = {};

function read(kind) {
  if (cache[kind]) return cache[kind];
  let list = [];
  try { list = JSON.parse(window.localStorage.getItem(KEYS[kind]) || '[]'); } catch { list = []; }
  cache[kind] = Array.isArray(list) ? list : [];
  return cache[kind];
}

function write(kind, list) {
  cache[kind] = list.slice(0, LIMITS[kind]);
  try { window.localStorage.setItem(KEYS[kind], JSON.stringify(cache[kind])); } catch { /* private mode: keep it in memory */ }
  listeners.forEach((fn) => fn());
}

/** The fields a ListingCard draws — never anything private. */
export function snapshot(l) {
  const cover = (l.media || []).find((m) => m.kind !== 'video');
  return {
    id: l.id, slug: l.slug, title: l.title, price: l.price, currency: l.currency, route: l.route,
    area: l.area, city: l.city, state: l.state, country: l.country,
    beds: l.beds, baths: l.baths, size_label: l.size_label, condition_score: l.condition_score,
    listing_type: l.listing_type, rent_frequency: l.rent_frequency, available_from: l.available_from,
    project_name: l.project_name, units_available: l.units_available,
    media: cover ? [{ url: cover.url, kind: 'image' }] : [],
  };
}

export const shortlist = {
  isSaved: (id) => read('saved').some((x) => x.id === id),
  merge(listings) {
    const have = new Set(read('saved').map((x) => x.id));
    const extra = (listings || []).filter((l) => l?.id && !have.has(l.id)).map(snapshot);
    if (extra.length) write('saved', [...extra, ...read('saved')]);
  },
  toggle(listing) {
    const list = read('saved');
    write('saved', list.some((x) => x.id === listing.id)
      ? list.filter((x) => x.id !== listing.id)
      : [snapshot(listing), ...list]);
  },
  remove: (id) => write('saved', read('saved').filter((x) => x.id !== id)),
  viewed(listing) {
    write('recent', [snapshot(listing), ...read('recent').filter((x) => x.id !== listing.id)]);
  },
};

function subscribe(fn) {
  listeners.add(fn);
  const onStorage = (e) => {
    if (Object.values(KEYS).includes(e.key)) { delete cache.saved; delete cache.recent; fn(); }
  };
  window.addEventListener('storage', onStorage);
  return () => { listeners.delete(fn); window.removeEventListener('storage', onStorage); };
}

export function useSaved() {
  return useSyncExternalStore(subscribe, () => read('saved'), () => []);
}

export function useRecent() {
  return useSyncExternalStore(subscribe, () => read('recent'), () => []);
}

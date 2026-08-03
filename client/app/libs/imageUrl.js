// Derives per-size image variant URLs from a photo key. A module-level memo
// cache avoids recomputing the same URL across a render. Its eviction is
// controlled by IMAGE_URL_CACHE_MODE:
//   'bounded'   (default) — LRU-capped at CACHE_LIMIT entries
//   'unbounded'           — never evicts (grows without bound)
// The unbounded mode is intentionally a memory-leak surface: under SSR load it
// reproduces the Node-renderer heap growth the demo studies (see docs/experiments).

const SIZES = { thumb: 80, tile: 320, gallery: 800, hero: 1200 };
const DPRS = [1, 2];
const CACHE_LIMIT = 5000;

const cache = new Map();

function cacheMode() {
  return (
    (typeof process !== 'undefined' && process.env && process.env.IMAGE_URL_CACHE_MODE) || 'bounded'
  );
}

function buildUrl(key, size, dpr) {
  // Photos arrive either as absolute provider CDN URLs or as bare keys; strip any
  // scheme to a stable slug and serve them from the local deterministic placeholder
  // image server so the demo shows distinct photos with no real assets.
  const slug = String(key).replace(/^https?:\/\//, '');
  return `/images/placeholder/${slug}?s=${size}&dpr=${dpr}`;
}

export function imageUrl(key, size = 'tile', dpr = 1) {
  const cacheKey = `${key}|${size}|${dpr}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const url = buildUrl(key, size, dpr);
  cache.set(cacheKey, url);

  if (cacheMode() === 'bounded' && cache.size > CACHE_LIMIT) {
    const oldest = cache.keys().next().value; // insertion order = LRU-ish
    cache.delete(oldest);
  }

  return url;
}

export function imageVariants(key) {
  const variants = {};
  for (const size of Object.keys(SIZES)) {
    for (const dpr of DPRS) {
      variants[`${size}@${dpr}x`] = imageUrl(key, size, dpr);
    }
  }
  return variants;
}

// Test/introspection helpers.
export const IMAGE_URL_CACHE_LIMIT = CACHE_LIMIT;
export function __imageUrlCacheSize() {
  return cache.size;
}
export function __resetImageUrlCache() {
  cache.clear();
}

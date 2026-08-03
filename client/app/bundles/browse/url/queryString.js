// Serialize/parse the browse view search params <-> a query string. Arrays use Rails'
// `key[]=` convention so the index endpoint reads them without extra config.
export function queryStringify(params = {}) {
  const parts = [];
  Object.entries(params).forEach(([key, value]) => {
    if (value == null || value === '') return;
    if (Array.isArray(value)) {
      value.forEach((item) =>
        parts.push(`${encodeURIComponent(`${key}[]`)}=${encodeURIComponent(item)}`),
      );
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
  });
  return parts.join('&');
}

// Parse a `?a=1&b[]=2` string back into a flat params object (arrays for `key[]`).
export function queryParse(search = '') {
  const out = {};
  const query = search.replace(/^\?/, '');
  if (!query) return out;
  query.split('&').forEach((pair) => {
    const [rawKey, rawValue] = pair.split('=');
    const value = decodeURIComponent(rawValue ?? '');
    const arrayKey = decodeURIComponent(rawKey).match(/^(.+)\[\]$/);
    if (arrayKey) {
      const key = arrayKey[1];
      out[key] = out[key] || [];
      out[key].push(value);
    } else {
      out[decodeURIComponent(rawKey)] = value;
    }
  });
  return out;
}

import { queryStringify } from '../url/queryString';

// Fetch a page of browse view results as JSON (the same ListingIndexJson the SSR
// page ships) for the store's map/filter/page refetches.
export async function fetchResults(params) {
  const qs = queryStringify(params);
  const response = await fetch(`/s${qs ? `?${qs}` : ''}`, {
    headers: { Accept: 'application/json' },
    credentials: 'same-origin',
  });
  if (!response.ok) throw new Error(`browse search failed: ${response.status}`);
  return response.json();
}

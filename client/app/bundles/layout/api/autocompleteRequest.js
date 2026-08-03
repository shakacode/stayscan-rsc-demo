// Fetches destination suggestions from the matview-backed autocomplete endpoint.
export default async function fetchDestinations(query) {
  const response = await fetch(`/api/autocomplete?q=${encodeURIComponent(query)}`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`autocomplete request failed: ${response.status}`);
  const data = await response.json();
  return data.results ?? [];
}

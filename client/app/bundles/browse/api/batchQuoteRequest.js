function csrfToken() {
  return document.querySelector('meta[name="csrf-token"]')?.content ?? '';
}

// Kick off one async quote per visible tile for the chosen dates. Returns
// [{ listingId, quote }] with each quote initially processing; the channels then
// settle in the background.
export async function createBatch(listingIds, dates) {
  const response = await fetch('/quotes/batch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-CSRF-Token': csrfToken(),
    },
    credentials: 'same-origin',
    body: JSON.stringify({
      listing_ids: listingIds,
      check_in: dates.checkIn,
      check_out: dates.checkOut,
      adults: dates.adults ?? 2,
    }),
  });
  if (response.status === 403) throw new Error('quote_limit');
  if (!response.ok) throw new Error(`batch quote failed: ${response.status}`);
  return response.json();
}

// Poll the batch until channels land (the store merges each update onto its tile).
export async function pollBatch(quoteIds) {
  const params = quoteIds.map((id) => `ids[]=${encodeURIComponent(id)}`).join('&');
  const response = await fetch(`/quotes/batch?${params}`, {
    headers: { Accept: 'application/json' },
    credentials: 'same-origin',
  });
  if (!response.ok) throw new Error(`batch poll failed: ${response.status}`);
  return response.json();
}

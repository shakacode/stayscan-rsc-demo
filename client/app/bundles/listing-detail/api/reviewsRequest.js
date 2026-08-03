// Paginated reviews endpoint. The listing-detail view JSON ships page 1 inline; later pages come
// from here so the initial render stays a single document.
export async function fetchReviews(listingId, page) {
  const response = await fetch(`/listings/${listingId}/reviews?page=${page}`, {
    headers: { Accept: 'application/json' },
    credentials: 'same-origin',
  });
  if (!response.ok) throw new Error(`reviews request failed: ${response.status}`);
  return response.json();
}

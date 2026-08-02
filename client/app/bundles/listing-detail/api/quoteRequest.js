// Quote endpoints for the booking widget. createQuote kicks off the async
// per-channel settle (results then stream over QuotesChannel); fetchQuote is the
// poll fallback when the socket is unavailable. A 403 surfaces the anon limit.
function csrfToken() {
  return document.querySelector('meta[name="csrf-token"]')?.content ?? '';
}

export class QuoteLimitError extends Error {
  constructor(access) {
    super('quote limit reached');
    this.name = 'QuoteLimitError';
    this.access = access ?? null;
  }
}

export async function createQuote(listingId, params) {
  const response = await fetch(`/listings/${listingId}/quotes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-CSRF-Token': csrfToken(),
    },
    credentials: 'same-origin',
    body: JSON.stringify({ quote: params }),
  });

  if (response.status === 403) {
    const data = await response.json().catch(() => ({}));
    throw new QuoteLimitError(data.access);
  }
  if (!response.ok) throw new Error(`quote request failed: ${response.status}`);

  return response.json();
}

export async function fetchQuote(quoteId) {
  const response = await fetch(`/quotes/${quoteId}`, {
    headers: { Accept: 'application/json' },
    credentials: 'same-origin',
  });
  if (!response.ok) throw new Error(`quote poll failed: ${response.status}`);
  return response.json();
}

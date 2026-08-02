import { createBrowserHistory } from 'history';
import { queryStringify } from './queryString';

// The browse view owns a single browser history (from react-router v5's `history` dep)
// to keep the URL in sync with the committed search state, so a copied link
// deep-links back to the exact same results (acceptance #4). SSR-safe: null on the
// server, created lazily on the client.
let history = null;

export function browseHistory() {
  if (!history && typeof window !== 'undefined') history = createBrowserHistory();
  return history;
}

// Reflect the current search params in the URL without stacking a history entry per
// keystroke/pan (replace); the entry that matters is the one the user can copy.
export function pushBrowseUrl(params) {
  const instance = browseHistory();
  if (!instance) return;
  const qs = queryStringify(params);
  instance.replace({ pathname: instance.location.pathname, search: qs ? `?${qs}` : '' });
}

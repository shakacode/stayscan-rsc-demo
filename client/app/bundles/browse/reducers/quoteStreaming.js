import { QUOTE_STREAM_ATTACHED, QUOTE_STREAM_DETACHED, SEARCH_REQUESTED } from '../actions/types';

// Per-listing quote-stream subscription state for live pricing: listingId ->
// { quoteId, status }. The saga attaches on-viewport and detaches on page changes.
export default function quoteStreaming(state = {}, action) {
  switch (action.type) {
    case QUOTE_STREAM_ATTACHED:
      return { ...state, [action.listingId]: { quoteId: action.quoteId, status: 'streaming' } };
    case QUOTE_STREAM_DETACHED: {
      const next = { ...state };
      delete next[action.listingId];
      return next;
    }
    case SEARCH_REQUESTED:
      return {}; // detach all when the result set is about to change
    default:
      return state;
  }
}

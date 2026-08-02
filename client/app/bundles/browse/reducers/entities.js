import { emptyEntities } from '../normalize';
import { SEARCH_SUCCEEDED, QUOTE_CHANNEL_UPDATED, QUOTE_BATCH_UPDATED } from '../actions/types';

// Normalized entity store in Immutable: id -> listing/user. A single
// tile's live-price update touches only that entity, so selectors keep other tiles
// referentially stable.
export default function entities(state = emptyEntities, action) {
  switch (action.type) {
    case SEARCH_SUCCEEDED:
      return state
        .update('listings', (m) => m.merge(action.payload.entities.listings))
        .update('users', (m) => m.merge(action.payload.entities.users));
    case QUOTE_CHANNEL_UPDATED:
      return state.updateIn(['listings', String(action.listingId), 'quote'], (q) => ({
        ...(q || {}),
        ...action.update,
      }));
    case QUOTE_BATCH_UPDATED:
      // Merge each tile's latest live quote onto its own entity only.
      return action.items.reduce((next, item) => {
        if (!next.hasIn(['listings', String(item.listingId)])) return next;
        return next.setIn(['listings', String(item.listingId), 'quote'], item.quote);
      }, state);
    default:
      return state;
  }
}

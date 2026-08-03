import { FILTER_DRAFT_CHANGED, FILTER_PREVIEW_RECEIVED, FILTERS_COMMITTED } from '../actions/types';

// The "how many results would this filter draft return" count, so the modal's
// apply button can read "Show N stays" before committing.
const initial = { count: null, loading: false };

export default function filterPreview(state = initial, action) {
  switch (action.type) {
    case FILTER_DRAFT_CHANGED:
      return { ...state, loading: true };
    case FILTER_PREVIEW_RECEIVED:
      return { count: action.count, loading: false };
    case FILTERS_COMMITTED:
      return initial;
    default:
      return state;
  }
}

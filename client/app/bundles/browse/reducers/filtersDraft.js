import {
  FILTER_DRAFT_CHANGED,
  FILTERS_CLEARED,
  FILTERS_COMMITTED,
  URL_STATE_RESTORED,
} from '../actions/types';

// The uncommitted (draft) filter state the filters modal edits. Committed to the
// applied filters on release (draft/commit semantics).
export const emptyFilters = {
  minPrice: null,
  maxPrice: null,
  minBedrooms: null,
  minBathrooms: null,
  minGuests: null,
  minRating: null,
  amenityIds: [],
  bookDirect: false,
  topRated: false,
};

export default function filtersDraft(state = emptyFilters, action) {
  switch (action.type) {
    case FILTER_DRAFT_CHANGED:
      return { ...state, ...action.patch };
    case FILTERS_CLEARED:
      return emptyFilters;
    case URL_STATE_RESTORED:
      return { ...emptyFilters, ...(action.state.filters || {}) };
    case FILTERS_COMMITTED:
    default:
      return state;
  }
}

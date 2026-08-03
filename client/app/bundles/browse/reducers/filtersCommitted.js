import { FILTERS_COMMITTED, FILTERS_CLEARED, URL_STATE_RESTORED } from '../actions/types';
import { emptyFilters } from './filtersDraft';

// The committed filters actually applied to the search. Only the draft's commit (or
// a URL restore) updates these, so the results don't churn on every keystroke.
export default function filtersCommitted(state = emptyFilters, action) {
  switch (action.type) {
    case FILTERS_COMMITTED:
      return { ...state, ...(action.draft || {}) };
    case FILTERS_CLEARED:
      return emptyFilters;
    case URL_STATE_RESTORED:
      return { ...emptyFilters, ...(action.state.filters || {}) };
    default:
      return state;
  }
}

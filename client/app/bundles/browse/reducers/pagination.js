import {
  PAGE_CHANGED,
  FILTERS_COMMITTED,
  FILTERS_CLEARED,
  SORT_CHANGED,
  URL_STATE_RESTORED,
} from '../actions/types';

// The current page. Any change that alters the result set resets to page 1.
export default function pagination(state = 1, action) {
  switch (action.type) {
    case PAGE_CHANGED:
      return action.page;
    case FILTERS_COMMITTED:
    case FILTERS_CLEARED:
    case SORT_CHANGED:
      return 1;
    case URL_STATE_RESTORED:
      return action.state.page ?? 1;
    default:
      return state;
  }
}

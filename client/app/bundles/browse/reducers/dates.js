import { DATES_CHANGED, URL_STATE_RESTORED } from '../actions/types';

// The check-in/check-out the tiles quote against (live pricing).
const initial = { checkIn: null, checkOut: null };

export default function dates(state = initial, action) {
  switch (action.type) {
    case DATES_CHANGED:
      return { ...state, ...action.dates };
    case URL_STATE_RESTORED:
      return { ...initial, ...(action.state.dates || {}) };
    default:
      return state;
  }
}

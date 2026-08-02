import { SORT_CHANGED, URL_STATE_RESTORED } from '../actions/types';

// Result ordering key ('recommended' default | price_asc | price_desc | rating).
export default function sort(state = 'recommended', action) {
  switch (action.type) {
    case SORT_CHANGED:
      return action.sort;
    case URL_STATE_RESTORED:
      return action.state.sort ?? state;
    default:
      return state;
  }
}

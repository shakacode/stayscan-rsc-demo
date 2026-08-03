import { MAP_BOUNDS_CHANGED, URL_STATE_RESTORED } from '../actions/types';

// The current map viewport bbox; drives the (debounced) refetch.
export default function mapBounds(state = null, action) {
  switch (action.type) {
    case MAP_BOUNDS_CHANGED:
      return action.bounds;
    case URL_STATE_RESTORED:
      return action.state.bbox ?? state;
    default:
      return state;
  }
}

import { LOCATION_SET } from '../actions/types';

// The destination-page location block (name/path/kind/center/breadcrumb), or null
// for a free search.
export default function location(state = null, action) {
  return action.type === LOCATION_SET ? action.location : state;
}

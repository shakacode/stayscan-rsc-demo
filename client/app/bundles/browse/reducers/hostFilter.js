import { HOST_FILTER_SET } from '../actions/types';

// Host-scoped browse mode: when set, results are filtered to one host's listings
// (used by the host page's map view). null = normal browse.
export default function hostFilter(state = null, action) {
  return action.type === HOST_FILTER_SET ? action.hostId : state;
}

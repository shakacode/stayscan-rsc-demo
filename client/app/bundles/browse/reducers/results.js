import { SEARCH_REQUESTED, SEARCH_SUCCEEDED, SEARCH_FAILED } from '../actions/types';

// The ordered result ids for the current page + the request lifecycle status.
const initial = { ids: [], status: 'idle' };

export default function results(state = initial, action) {
  switch (action.type) {
    case SEARCH_REQUESTED:
      return { ...state, status: 'loading' };
    case SEARCH_SUCCEEDED:
      return { ids: action.payload.result, status: 'loaded' };
    case SEARCH_FAILED:
      return { ...state, status: 'error' };
    default:
      return state;
  }
}

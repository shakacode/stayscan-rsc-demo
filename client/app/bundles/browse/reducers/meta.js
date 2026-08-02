import { SEARCH_SUCCEEDED } from '../actions/types';

// Result meta incl. the anti-scraping caps (totalCount / capReached / maxPages).
const initial = { totalCount: 0, currentPage: 1, pageSize: 25, capReached: false, maxPages: 6 };

export default function meta(state = initial, action) {
  switch (action.type) {
    case SEARCH_SUCCEEDED:
      return { ...state, ...action.payload.meta };
    default:
      return state;
  }
}

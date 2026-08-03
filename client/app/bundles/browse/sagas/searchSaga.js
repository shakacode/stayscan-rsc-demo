import { call, put, select, takeLatest } from 'redux-saga/effects';
import {
  SEARCH_REQUESTED,
  PAGE_CHANGED,
  FILTERS_COMMITTED,
  FILTERS_CLEARED,
  SORT_CHANGED,
  HOST_FILTER_SET,
} from '../actions/types';
import { searchRequested, searchSucceeded, searchFailed } from '../actions';
import { selectSearchParams } from '../selectors/urlSelectors';
import { normalizeListings } from '../normalize';
import { fetchResults } from '../api/searchRequest';

// The one worker that actually fetches. takeLatest on SEARCH_REQUESTED cancels an
// in-flight request when a newer one starts (no stale-response flash on rapid pans).
export function* runSearch(deps = {}) {
  const request = deps.fetchResults || fetchResults;
  try {
    const params = yield select(selectSearchParams);
    const index = yield call(request, params);
    const normalized = normalizeListings(index.listings);
    yield put(
      searchSucceeded({
        entities: normalized.entities,
        result: normalized.result,
        meta: index.meta,
      }),
    );
  } catch (error) {
    yield put(searchFailed(error.message));
  }
}

// Pagination / filters-commit / sort / host-filter all resolve to one fresh search.
export function* forwardToSearch(action) {
  yield put(searchRequested(action.type));
}

export default function* searchSaga() {
  yield takeLatest(SEARCH_REQUESTED, runSearch);
  yield takeLatest(
    [PAGE_CHANGED, FILTERS_COMMITTED, FILTERS_CLEARED, SORT_CHANGED, HOST_FILTER_SET],
    forwardToSearch,
  );
}

import { debounce, call, put } from 'redux-saga/effects';
import fetchDestinations from '../api/autocompleteRequest';
import { SET_QUERY, fetchStart, fetchSuccess, fetchFailure } from '../reducers/autocompleteReducer';

export const MIN_QUERY_LENGTH = 2;
export const DEBOUNCE_MS = 250;

// One in-flight request; typing debounced. Short queries clear results without a
// round-trip.
export function* handleQuery(action) {
  const query = action.query.trim();
  if (query.length < MIN_QUERY_LENGTH) {
    yield put(fetchSuccess([]));
    return;
  }
  yield put(fetchStart());
  try {
    const results = yield call(fetchDestinations, query);
    yield put(fetchSuccess(results));
  } catch (error) {
    yield put(fetchFailure(error.message));
  }
}

export default function* autocompleteSaga() {
  yield debounce(DEBOUNCE_MS, SET_QUERY, handleQuery);
}

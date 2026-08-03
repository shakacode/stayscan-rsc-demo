import { debounce, put } from 'redux-saga/effects';
import { MAP_BOUNDS_CHANGED } from '../actions/types';
import { searchRequested } from '../actions';

const DEBOUNCE_MS = 400;

// Panning the map fires many bounds changes; debounce them into one refetch. The
// search saga's takeLatest then cancels any request already in flight.
export function* onBoundsChanged() {
  yield put(searchRequested('bounds'));
}

export default function* mapSaga() {
  yield debounce(DEBOUNCE_MS, MAP_BOUNDS_CHANGED, onBoundsChanged);
}

import { all, fork } from 'redux-saga/effects';
import searchSaga from './searchSaga';
import mapSaga from './mapSaga';
import urlSyncSaga from './urlSyncSaga';
import quoteSaga from './quoteSaga';
import filterPreviewSaga from './filterPreviewSaga';

// The browse view saga tree — search (+ pagination/filters/sort/host forwarding), debounced
// bounds refetch, URL sync, live-pricing subscriptions, and the filter-count preview.
export default function* browseRootSaga() {
  yield all([
    fork(searchSaga),
    fork(mapSaga),
    fork(urlSyncSaga),
    fork(quoteSaga),
    fork(filterPreviewSaga),
  ]);
}

import { select, takeLatest } from 'redux-saga/effects';
import { SEARCH_SUCCEEDED } from '../actions/types';
import { selectSearchParams } from '../selectors/urlSelectors';
import { pushBrowseUrl } from '../url/history';

// After every successful search, reflect the committed state in the URL so a copied
// link deep-links back to the same results (acceptance #4).
export function* syncUrl(deps = {}) {
  const push = deps.pushBrowseUrl || pushBrowseUrl;
  const params = yield select(selectSearchParams);
  push(params);
}

export default function* urlSyncSaga() {
  yield takeLatest(SEARCH_SUCCEEDED, syncUrl);
}

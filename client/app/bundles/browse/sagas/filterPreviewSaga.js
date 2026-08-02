import { call, debounce, put, select } from 'redux-saga/effects';
import { FILTER_DRAFT_CHANGED } from '../actions/types';
import { filterPreviewReceived } from '../actions';
import { selectDraftSearchParams } from '../selectors/urlSelectors';
import { fetchResults } from '../api/searchRequest';

const DEBOUNCE_MS = 300;

// As the filters modal is edited, fetch how many results the *draft* would return
// (debounced) so the apply button reads "Show N stays" before committing.
export function* previewDraft(deps = {}) {
  const request = deps.fetchResults || fetchResults;
  try {
    const params = yield select(selectDraftSearchParams);
    const index = yield call(request, params);
    yield put(filterPreviewReceived(index.meta.totalCount));
  } catch (error) {
    yield put(filterPreviewReceived(null));
  }
}

export default function* filterPreviewSaga() {
  yield debounce(DEBOUNCE_MS, FILTER_DRAFT_CHANGED, previewDraft);
}

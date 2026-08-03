import { all, call, delay, put, select, takeLatest } from 'redux-saga/effects';
import { DATES_CHANGED, SEARCH_SUCCEEDED } from '../actions/types';
import { quoteStreamAttached, quotesBatchUpdated } from '../actions';
import { selectResultIds } from '../selectors/resultSelectors';
import { selectHasDates } from '../selectors/quoteSelectors';
import { selectDates } from '../selectors/browseSelectors';
import { createBatch, pollBatch } from '../api/batchQuoteRequest';

const POLL_MS = 2_000;
const MAX_POLLS = 15;

// Live-pricing lifecycle: once dates are set (and on every new result set),
// batch-create one async quote per visible tile, then poll until each tile's
// channels land, merging results onto its entity. takeLatest cancels a prior
// poll loop when the dates or the results change (no stale-price flashes).
export function* runBatchQuotes(deps = {}) {
  const create = deps.createBatch || createBatch;
  const poll = deps.pollBatch || pollBatch;

  const hasDates = yield select(selectHasDates);
  if (!hasDates) return;

  const ids = yield select(selectResultIds);
  if (ids.length === 0) return;
  const dates = yield select(selectDates);

  try {
    const { quotes } = yield call(create, ids, dates);
    yield put(quotesBatchUpdated(quotes));
    yield all(quotes.map((item) => put(quoteStreamAttached(item.listingId, item.quote.id))));

    const quoteIds = quotes.map((item) => item.quote.id);
    for (let poll_n = 0; poll_n < MAX_POLLS; poll_n += 1) {
      yield delay(POLL_MS);
      const status = yield call(poll, quoteIds);
      yield put(quotesBatchUpdated(status.quotes));
      if (status.quotes.every((item) => item.quote.state === 'finished')) break;
    }
  } catch (error) {
    // limit reached / network — tiles keep their sample price
  }
}

export default function* quoteSaga() {
  yield takeLatest([DATES_CHANGED, SEARCH_SUCCEEDED], runBatchQuotes);
}

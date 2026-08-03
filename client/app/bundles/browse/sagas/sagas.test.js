import { runSaga } from 'redux-saga';
import { select, call, put, delay } from 'redux-saga/effects';
import { runSearch, forwardToSearch } from './searchSaga';
import { syncUrl } from './urlSyncSaga';
import { runBatchQuotes } from './quoteSaga';
import { selectHasDates } from '../selectors/quoteSelectors';
import { quotesBatchUpdated } from '../actions';
import seedBrowseState from '../store/seedBrowseState';
import { SEARCH_SUCCEEDED, SEARCH_REQUESTED, PAGE_CHANGED } from '../actions/types';

const index = {
  listings: [
    { id: 1, title: 'Reef Villa', city: 'Kivora', coordinates: { lat: 8.9, lng: -140.4 } },
  ],
  meta: { totalCount: 1, currentPage: 1, pageSize: 25, capReached: false, maxPages: 6 },
  filters: { bookDirect: true },
  location: null,
  seo: { title: 'Search' },
};

const state = seedBrowseState(index);

function record(saga, arg) {
  const dispatched = [];
  const task = runSaga(
    { dispatch: (action) => dispatched.push(action), getState: () => state },
    saga,
    arg,
  );
  return task.toPromise().then(() => dispatched);
}

describe('browse sagas', () => {
  it('runSearch fetches, normalizes and dispatches SEARCH_SUCCEEDED', async () => {
    const fetchResults = jest.fn().mockResolvedValue(index);
    const dispatched = await record(runSearch, { fetchResults });

    expect(fetchResults).toHaveBeenCalledWith(expect.objectContaining({ book_direct: true }));
    const success = dispatched.find((a) => a.type === SEARCH_SUCCEEDED);
    expect(success.payload.result).toEqual([1]);
    expect(success.payload.meta.totalCount).toBe(1);
  });

  it('forwardToSearch turns a result-affecting change into a SEARCH_REQUESTED', async () => {
    const dispatched = await record(forwardToSearch, { type: PAGE_CHANGED, page: 2 });
    expect(dispatched).toEqual([{ type: SEARCH_REQUESTED, reason: PAGE_CHANGED }]);
  });

  it('syncUrl reflects the committed search params in the URL', async () => {
    const pushBrowseUrl = jest.fn();
    await record(syncUrl, { pushBrowseUrl });
    expect(pushBrowseUrl).toHaveBeenCalledWith(expect.objectContaining({ book_direct: true }));
  });

  it('runBatchQuotes short-circuits when no dates are set', () => {
    const gen = runBatchQuotes({});
    gen.next(); // select(selectHasDates)
    expect(gen.next(false).done).toBe(true);
  });

  it('runBatchQuotes batch-creates quotes then polls for the current tiles', () => {
    const createBatch = jest.fn();
    const pollBatch = jest.fn();
    const stay = { checkIn: '2026-06-01', checkOut: '2026-06-03' };
    const batch = { quotes: [{ listingId: 1, quote: { id: 'q1', state: 'processing' } }] };

    const gen = runBatchQuotes({ createBatch, pollBatch });
    expect(gen.next().value).toEqual(select(selectHasDates));
    gen.next(true); // -> select result ids
    gen.next([1, 2]); // ids -> select dates
    expect(gen.next(stay).value).toEqual(call(createBatch, [1, 2], stay));
    expect(gen.next(batch).value).toEqual(put(quotesBatchUpdated(batch.quotes)));
    gen.next(); // all([put(attached)])
    expect(gen.next().value).toEqual(delay(2000)); // first poll tick
  });
});

import browseReducer from './index';
import {
  filterDraftChanged,
  filtersCommitted,
  filtersCleared,
  pageChanged,
  sortChanged,
  searchSucceeded,
  quoteStreamAttached,
  quoteStreamDetached,
  quotesBatchUpdated,
  searchRequested,
} from '../actions';
import { normalizeListings } from '../normalize';

const tiles = [
  {
    id: 1,
    title: 'Reef Villa',
    city: 'Kivora',
    coordinates: { lat: 8.9, lng: -140.4 },
    previewPrice: 220,
  },
  {
    id: 2,
    title: 'Palm Casita',
    city: 'Kivora',
    coordinates: { lat: 8.91, lng: -140.41 },
    previewPrice: 180,
  },
];

function stateAfter(actions, initial) {
  return actions.reduce(
    (state, action) => browseReducer(state, action),
    initial ?? browseReducer(undefined, { type: '@@init' }),
  );
}

describe('browse reducers', () => {
  it('merges normalized entities and result ids on a successful search', () => {
    const normalized = normalizeListings(tiles);
    const state = stateAfter([
      searchSucceeded({
        entities: normalized.entities,
        result: normalized.result,
        meta: { totalCount: 2 },
      }),
    ]);

    expect(state.results.ids).toEqual([1, 2]);
    expect(state.entities.getIn(['listings', '1', 'title'])).toBe('Reef Villa');
    expect(state.meta.totalCount).toBe(2);
  });

  it('commits the draft into the committed filters and resets to page 1', () => {
    const state = stateAfter([
      pageChanged(4),
      filterDraftChanged({ bookDirect: true, minPrice: 100 }),
      filtersCommitted({ bookDirect: true, minPrice: 100 }),
    ]);

    expect(state.filtersCommitted).toMatchObject({ bookDirect: true, minPrice: 100 });
    expect(state.pagination).toBe(1);
    expect(state.filtersModal).toBe(false);
  });

  it('clears filters and resets the page', () => {
    const state = stateAfter([filterDraftChanged({ topRated: true }), filtersCleared()]);
    expect(state.filtersDraft.topRated).toBe(false);
    expect(state.filtersCommitted.topRated).toBe(false);
  });

  it('resets pagination to 1 when the sort changes', () => {
    const state = stateAfter([pageChanged(3), sortChanged('price_asc')]);
    expect(state.sort).toBe('price_asc');
    expect(state.pagination).toBe(1);
  });

  it('merges batch live quotes onto the matching tiles only', () => {
    const normalized = normalizeListings(tiles);
    let state = stateAfter([
      searchSucceeded({ entities: normalized.entities, result: normalized.result, meta: {} }),
    ]);
    state = browseReducer(
      state,
      quotesBatchUpdated([
        { listingId: 1, quote: { id: 'q1', state: 'finished', topDeal: { total: 200 } } },
      ]),
    );

    expect(state.entities.getIn(['listings', '1', 'quote']).topDeal.total).toBe(200);
    expect(state.entities.getIn(['listings', '2', 'quote'])).toBeUndefined();
  });

  it('attaches and detaches per-listing quote streams; a new search clears them', () => {
    const attached = stateAfter([quoteStreamAttached(1, 'q1'), quoteStreamAttached(2, 'q2')]);
    expect(Object.keys(attached.quoteStreaming)).toEqual(['1', '2']);

    const detached = browseReducer(attached, quoteStreamDetached(1));
    expect(Object.keys(detached.quoteStreaming)).toEqual(['2']);

    const cleared = browseReducer(attached, searchRequested('bounds'));
    expect(cleared.quoteStreaming).toEqual({});
  });
});

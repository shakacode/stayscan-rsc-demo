import seedBrowseState from '../store/seedBrowseState';
import { selectResultTiles, selectVisibleCount, selectIsEmpty } from './resultSelectors';
import { selectMarkers, selectHoveredMarker } from './mapSelectors';
import { selectTotalPages, selectPageCapReached } from './paginationSelectors';
import { selectHasUncommittedChanges, selectActiveFilterCount } from './filterSelectors';
import { selectSearchParams } from './urlSelectors';
import browseReducer from '../reducers';
import { filterDraftChanged, markerHovered } from '../actions';

const index = {
  listings: [
    {
      id: 1,
      title: 'Reef Villa',
      city: 'Kivora',
      url: '/listings/1',
      coordinates: { lat: 8.9, lng: -140.4 },
      previewPrice: 220,
    },
    {
      id: 2,
      title: 'Palm Casita',
      city: 'Kivora',
      url: '/listings/2',
      coordinates: { lat: 8.91, lng: -140.41 },
      previewPrice: 180,
    },
  ],
  meta: { totalCount: 150, currentPage: 2, pageSize: 25, capReached: true, maxPages: 6 },
  filters: {
    bookDirect: true,
    sort: 'price_asc',
    bbox: { minLat: 20, maxLat: 21, minLng: -157, maxLng: -156 },
  },
  location: null,
  seo: { title: 'Search vacation rentals' },
};

const baseState = seedBrowseState(index);

describe('browse selectors', () => {
  it('denormalizes the current page tiles from the Immutable entity map', () => {
    expect(selectResultTiles(baseState).map((tile) => tile.title)).toEqual([
      'Reef Villa',
      'Palm Casita',
    ]);
    expect(selectVisibleCount(baseState)).toBe(2);
    expect(selectIsEmpty(baseState)).toBe(false);
  });

  it('derives price-pill markers and the hovered marker', () => {
    expect(selectMarkers(baseState)).toHaveLength(2);
    const hovered = { browse: browseReducer(baseState.browse, markerHovered(2)) };
    expect(selectHoveredMarker(hovered).id).toBe(2);
  });

  it('clamps total pages to the max-pages cap and flags the cap', () => {
    // 150/25 = 6 pages, capped at maxPages 6; on page 6 with capReached -> capped.
    expect(selectTotalPages(baseState)).toBe(6);
    const onLastPage = { browse: { ...baseState.browse, pagination: 6 } };
    expect(selectPageCapReached(onLastPage)).toBe(true);
  });

  it('detects uncommitted draft changes and counts active committed filters', () => {
    expect(selectHasUncommittedChanges(baseState)).toBe(false);
    const edited = {
      browse: browseReducer(baseState.browse, filterDraftChanged({ topRated: true })),
    };
    expect(selectHasUncommittedChanges(edited)).toBe(true);
    expect(selectActiveFilterCount(baseState)).toBe(1); // bookDirect
  });

  it('flattens committed state into snake_case search params', () => {
    const params = selectSearchParams(baseState);
    expect(params).toMatchObject({
      book_direct: true,
      sort: 'price_asc',
      page: 2,
      min_lat: 20,
      max_lat: 21,
    });
  });
});

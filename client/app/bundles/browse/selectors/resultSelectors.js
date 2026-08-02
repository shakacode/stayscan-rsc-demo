import { createSelector } from 'reselect';
import { selectResultsSlice } from './browseSelectors';
import { selectListingEntities } from './entitySelectors';

export const selectResultIds = createSelector(selectResultsSlice, (results) => results.ids);
export const selectResultStatus = createSelector(selectResultsSlice, (results) => results.status);
export const selectIsLoading = createSelector(selectResultStatus, (status) => status === 'loading');
export const selectIsError = createSelector(selectResultStatus, (status) => status === 'error');

// Denormalize the current page's ids against the entity map. Memoized on
// [ids, listings], so unrelated slice changes never rebuild the tile array.
export const selectResultTiles = createSelector(
  [selectResultIds, selectListingEntities],
  (ids, listings) =>
    ids
      .map((id) => listings.get(String(id)))
      .filter(Boolean)
      .map((tile) => tile.toJS()),
);

export const selectVisibleCount = createSelector(selectResultTiles, (tiles) => tiles.length);

export const selectIsEmpty = createSelector(
  [selectResultTiles, selectResultStatus],
  (tiles, status) => status === 'loaded' && tiles.length === 0,
);

import { createSelector } from 'reselect';
import {
  selectFiltersDraft,
  selectFiltersCommitted,
  selectFacets,
  selectFilterPreview,
} from './browseSelectors';

function countActive(filters) {
  let count = 0;
  if (filters.minPrice != null || filters.maxPrice != null) count += 1;
  if (filters.minBedrooms != null) count += 1;
  if (filters.minBathrooms != null) count += 1;
  if (filters.minGuests != null) count += 1;
  if (filters.minRating != null) count += 1;
  if (filters.amenityIds && filters.amenityIds.length > 0) count += 1;
  if (filters.bookDirect) count += 1;
  if (filters.topRated) count += 1;
  return count;
}

export const selectActiveFilterCount = createSelector(selectFiltersCommitted, countActive);
export const selectHasAnyFilter = createSelector(selectActiveFilterCount, (count) => count > 0);

export const selectDraftAmenityIds = createSelector(
  selectFiltersDraft,
  (draft) => draft.amenityIds,
);
export const selectDraftPriceRange = createSelector(selectFiltersDraft, (draft) => ({
  min: draft.minPrice,
  max: draft.maxPrice,
}));

export const selectBookDirectActive = createSelector(selectFiltersCommitted, (f) => f.bookDirect);
export const selectTopRatedActive = createSelector(selectFiltersCommitted, (f) => f.topRated);

// Draft ≠ committed → the modal has unapplied edits (drives the "apply" affordance).
export const selectHasUncommittedChanges = createSelector(
  [selectFiltersDraft, selectFiltersCommitted],
  (draft, committed) => JSON.stringify(draft) !== JSON.stringify(committed),
);

export const selectAmenityFacets = createSelector(selectFacets, (facets) => facets.amenities);
export const selectPriceBounds = createSelector(selectFacets, (facets) => facets.priceBounds);
export const selectPreviewCount = createSelector(selectFilterPreview, (preview) => preview.count);
export const selectPreviewLoading = createSelector(
  selectFilterPreview,
  (preview) => preview.loading,
);

import { createSelector } from 'reselect';
import {
  selectFiltersCommitted,
  selectFiltersDraft,
  selectPage,
  selectMapBounds,
  selectSort,
  selectDates,
  selectHostFilter,
} from './browseSelectors';

function filtersToParams(filters, bbox) {
  const params = {};
  if (filters.minPrice != null) params.min_price = filters.minPrice;
  if (filters.maxPrice != null) params.max_price = filters.maxPrice;
  if (filters.minBedrooms != null) params.min_bedrooms = filters.minBedrooms;
  if (filters.minBathrooms != null) params.min_bathrooms = filters.minBathrooms;
  if (filters.minGuests != null) params.min_guests = filters.minGuests;
  if (filters.minRating != null) params.min_rating = filters.minRating;
  if (filters.bookDirect) params.book_direct = true;
  if (filters.topRated) params.top_rated = true;
  if (filters.amenityIds && filters.amenityIds.length) params.amenity_ids = filters.amenityIds;
  if (bbox) {
    params.min_lat = bbox.minLat;
    params.max_lat = bbox.maxLat;
    params.min_lng = bbox.minLng;
    params.max_lng = bbox.maxLng;
  }
  return params;
}

// The canonical URL state — committed filters + page + bbox + sort + dates. Both
// deep-link restore and the API request derive from this one selector (#4).
export const selectUrlState = createSelector(
  [selectFiltersCommitted, selectPage, selectMapBounds, selectSort, selectDates],
  (filters, page, bbox, sort, dates) => ({ filters, page, bbox, sort, dates }),
);

// Flatten the committed state into the snake_case query params the index endpoint expects.
export const selectSearchParams = createSelector(
  [selectUrlState, selectHostFilter],
  ({ filters, page, bbox, sort }, hostId) => {
    const params = filtersToParams(filters, bbox);
    if (sort && sort !== 'recommended') params.sort = sort;
    if (page > 1) params.page = page;
    if (hostId) params.host_id = hostId;
    return params;
  },
);

// The draft params for the filters modal's "how many results" preview fetch (bbox
// held constant so the count reflects the current map area).
export const selectDraftSearchParams = createSelector(
  [selectFiltersDraft, selectMapBounds],
  (draft, bbox) => filtersToParams(draft, bbox),
);

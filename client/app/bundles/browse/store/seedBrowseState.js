import { normalizeListings, emptyEntities } from '../normalize';

// Build the browse view store's initial state from the server-rendered index payload, so
// the SSR render and the hydrated client share identical state (E3). Entities
// are normalized into Immutable; the committed filters mirror what was searched.
function filtersFrom(indexFilters = {}) {
  return {
    minPrice: indexFilters.minPrice ?? null,
    maxPrice: indexFilters.maxPrice ?? null,
    minBedrooms: indexFilters.minBedrooms ?? null,
    minBathrooms: indexFilters.minBathrooms ?? null,
    minGuests: indexFilters.minGuests ?? null,
    minRating: indexFilters.minRating ?? null,
    amenityIds: indexFilters.amenityIds ?? [],
    bookDirect: Boolean(indexFilters.bookDirect),
    topRated: Boolean(indexFilters.topRated),
  };
}

export default function seedBrowseState(index) {
  const normalized = normalizeListings(index.listings);
  const filters = filtersFrom(index.filters);

  return {
    browse: {
      entities: emptyEntities
        .set('listings', normalized.entities.listings)
        .set('users', normalized.entities.users),
      results: { ids: normalized.result, status: 'loaded' },
      meta: index.meta,
      filtersDraft: filters,
      filtersCommitted: filters,
      mapBounds: index.filters?.bbox ?? null,
      mapZoom: 11,
      mapEngine: index.mapEngine ?? 'leaflet',
      mapHover: null,
      pagination: index.meta?.currentPage ?? 1,
      sort: index.filters?.sort ?? 'recommended',
      quoteStreaming: {},
      dates: { checkIn: null, checkOut: null },
      location: index.location ?? null,
      seo: index.seo,
      filtersModal: false,
      mobileView: 'list',
      hostFilter: null,
      facets: index.facets ?? { amenities: [], priceBounds: { min: 0, max: 1000 } },
      filterPreview: { count: null, loading: false },
    },
  };
}

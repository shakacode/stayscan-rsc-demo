// Base slice accessors for the browse view store (state.browse.*). Plain functions — the
// memoized derivations live in the sibling selector files.
export const selectBrowse = (state) => state.browse;

export const selectEntities = (state) => selectBrowse(state).entities;
export const selectResultsSlice = (state) => selectBrowse(state).results;
export const selectMeta = (state) => selectBrowse(state).meta;
export const selectFiltersDraft = (state) => selectBrowse(state).filtersDraft;
export const selectFiltersCommitted = (state) => selectBrowse(state).filtersCommitted;
export const selectMapBounds = (state) => selectBrowse(state).mapBounds;
export const selectMapZoom = (state) => selectBrowse(state).mapZoom;
export const selectMapEngine = (state) => selectBrowse(state).mapEngine;
export const selectMapHoverId = (state) => selectBrowse(state).mapHover;
export const selectPage = (state) => selectBrowse(state).pagination;
export const selectSort = (state) => selectBrowse(state).sort;
export const selectQuoteStreaming = (state) => selectBrowse(state).quoteStreaming;
export const selectDates = (state) => selectBrowse(state).dates;
export const selectLocation = (state) => selectBrowse(state).location;
export const selectSeo = (state) => selectBrowse(state).seo;
export const selectFiltersModalOpen = (state) => selectBrowse(state).filtersModal;
export const selectMobileView = (state) => selectBrowse(state).mobileView;
export const selectHostFilter = (state) => selectBrowse(state).hostFilter;
export const selectFacets = (state) => selectBrowse(state).facets;
export const selectFilterPreview = (state) => selectBrowse(state).filterPreview;

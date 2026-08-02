import * as t from './types';

// Action creators for the browse view store. Kept declarative so call sites and sagas read
// intent, not shapes.
export const searchRequested = (reason = 'manual') => ({ type: t.SEARCH_REQUESTED, reason });
export const searchSucceeded = (payload) => ({ type: t.SEARCH_SUCCEEDED, payload });
export const searchFailed = (error) => ({ type: t.SEARCH_FAILED, error });

export const mapBoundsChanged = (bounds) => ({ type: t.MAP_BOUNDS_CHANGED, bounds });
export const mapZoomChanged = (zoom) => ({ type: t.MAP_ZOOM_CHANGED, zoom });
export const mapEngineSet = (engine) => ({ type: t.MAP_ENGINE_SET, engine });
export const markerHovered = (id) => ({ type: t.MARKER_HOVERED, id });

export const filterDraftChanged = (patch) => ({ type: t.FILTER_DRAFT_CHANGED, patch });
export const filtersCommitted = (draft) => ({ type: t.FILTERS_COMMITTED, draft });
export const filtersCleared = () => ({ type: t.FILTERS_CLEARED });
export const filterPreviewReceived = (count) => ({ type: t.FILTER_PREVIEW_RECEIVED, count });

export const pageChanged = (page) => ({ type: t.PAGE_CHANGED, page });
export const sortChanged = (sort) => ({ type: t.SORT_CHANGED, sort });
export const datesChanged = (dates) => ({ type: t.DATES_CHANGED, dates });

export const quoteStreamAttached = (listingId, quoteId) => ({
  type: t.QUOTE_STREAM_ATTACHED,
  listingId,
  quoteId,
});
export const quoteChannelUpdated = (listingId, update) => ({
  type: t.QUOTE_CHANNEL_UPDATED,
  listingId,
  update,
});
export const quoteStreamDetached = (listingId) => ({ type: t.QUOTE_STREAM_DETACHED, listingId });
export const quotesBatchUpdated = (items) => ({ type: t.QUOTE_BATCH_UPDATED, items });

export const locationSet = (location) => ({ type: t.LOCATION_SET, location });
export const seoSet = (seo) => ({ type: t.SEO_SET, seo });

export const filtersModalToggled = (open) => ({ type: t.FILTERS_MODAL_TOGGLED, open });
export const mobileViewToggled = (view) => ({ type: t.MOBILE_VIEW_TOGGLED, view });

export const hostFilterSet = (hostId) => ({ type: t.HOST_FILTER_SET, hostId });
export const urlStateRestored = (state) => ({ type: t.URL_STATE_RESTORED, state });

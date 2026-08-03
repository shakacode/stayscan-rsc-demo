// browse view action types. One flat namespace; the sagas + reducers key off these.
export const SEARCH_REQUESTED = 'browse/SEARCH_REQUESTED';
export const SEARCH_SUCCEEDED = 'browse/SEARCH_SUCCEEDED';
export const SEARCH_FAILED = 'browse/SEARCH_FAILED';

export const MAP_BOUNDS_CHANGED = 'browse/MAP_BOUNDS_CHANGED';
export const MAP_ZOOM_CHANGED = 'browse/MAP_ZOOM_CHANGED';
export const MAP_ENGINE_SET = 'browse/MAP_ENGINE_SET';
export const MARKER_HOVERED = 'browse/MARKER_HOVERED';

export const FILTER_DRAFT_CHANGED = 'browse/FILTER_DRAFT_CHANGED';
export const FILTERS_COMMITTED = 'browse/FILTERS_COMMITTED';
export const FILTERS_CLEARED = 'browse/FILTERS_CLEARED';
export const FILTER_PREVIEW_RECEIVED = 'browse/FILTER_PREVIEW_RECEIVED';

export const PAGE_CHANGED = 'browse/PAGE_CHANGED';
export const SORT_CHANGED = 'browse/SORT_CHANGED';
export const DATES_CHANGED = 'browse/DATES_CHANGED';

export const QUOTE_STREAM_ATTACHED = 'browse/QUOTE_STREAM_ATTACHED';
export const QUOTE_CHANNEL_UPDATED = 'browse/QUOTE_CHANNEL_UPDATED';
export const QUOTE_STREAM_DETACHED = 'browse/QUOTE_STREAM_DETACHED';
export const QUOTE_BATCH_UPDATED = 'browse/QUOTE_BATCH_UPDATED';

export const LOCATION_SET = 'browse/LOCATION_SET';
export const SEO_SET = 'browse/SEO_SET';

export const FILTERS_MODAL_TOGGLED = 'browse/FILTERS_MODAL_TOGGLED';
export const MOBILE_VIEW_TOGGLED = 'browse/MOBILE_VIEW_TOGGLED';

export const HOST_FILTER_SET = 'browse/HOST_FILTER_SET';
export const URL_STATE_RESTORED = 'browse/URL_STATE_RESTORED';

import { combineReducers } from 'redux';
import entities from './entities';
import results from './results';
import meta from './meta';
import filtersDraft from './filtersDraft';
import filtersCommitted from './filtersCommitted';
import mapBounds from './mapBounds';
import mapZoom from './mapZoom';
import mapEngine from './mapEngine';
import mapHover from './mapHover';
import pagination from './pagination';
import sort from './sort';
import quoteStreaming from './quoteStreaming';
import dates from './dates';
import location from './location';
import seo from './seo';
import filtersModal from './filtersModal';
import mobileView from './mobileView';
import hostFilter from './hostFilter';
import facets from './facets';
import filterPreview from './filterPreview';

// The browse view page store's 18 single-responsibility slices, nested under one
// `browse` key so they sit alongside — not inside — the shared layout slices.
const browseReducer = combineReducers({
  entities,
  results,
  meta,
  filtersDraft,
  filtersCommitted,
  mapBounds,
  mapZoom,
  mapEngine,
  mapHover,
  pagination,
  sort,
  quoteStreaming,
  dates,
  location,
  seo,
  filtersModal,
  mobileView,
  hostFilter,
  facets,
  filterPreview,
});

export default browseReducer;

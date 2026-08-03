import { createSelector } from 'reselect';
import { selectMeta, selectPage } from './browseSelectors';

// Total pages, clamped to the anti-scraping cap (maxPages).
export const selectTotalPages = createSelector(selectMeta, (meta) =>
  Math.min(meta.maxPages, Math.max(1, Math.ceil(meta.totalCount / meta.pageSize))),
);

export const selectCanNextPage = createSelector(
  [selectPage, selectTotalPages],
  (page, totalPages) => page < totalPages,
);

export const selectCanPrevPage = createSelector(selectPage, (page) => page > 1);

// The cap is reached when we're on the last allowed page and more results exist.
export const selectPageCapReached = createSelector(
  [selectPage, selectMeta],
  (page, meta) => page >= meta.maxPages && meta.capReached,
);

export const selectPageWindow = createSelector(
  [selectPage, selectTotalPages],
  (page, totalPages) => {
    const window = [];
    for (let n = Math.max(1, page - 2); n <= Math.min(totalPages, page + 2); n += 1) window.push(n);
    return window;
  },
);

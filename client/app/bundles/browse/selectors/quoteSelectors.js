import { createSelector } from 'reselect';
import { selectQuoteStreaming, selectDates } from './browseSelectors';
import { selectListingEntities } from './entitySelectors';

export const selectStreamingIds = createSelector(selectQuoteStreaming, (streaming) =>
  Object.keys(streaming),
);

export const selectStreamingCount = createSelector(selectStreamingIds, (ids) => ids.length);

export const selectHasDates = createSelector(selectDates, (dates) =>
  Boolean(dates.checkIn && dates.checkOut),
);

// The live quote merged onto a listing entity (filled by the streaming saga).
export const selectQuoteForListing = createSelector(
  [selectListingEntities, (state, id) => id],
  (listings, id) => {
    const quote = listings.getIn([String(id), 'quote']);
    return quote || null;
  },
);

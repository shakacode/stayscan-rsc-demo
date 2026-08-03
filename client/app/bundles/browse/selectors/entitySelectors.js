import { createSelector } from 'reselect';
import { selectEntities } from './browseSelectors';

// Normalized-entity selectors. Memoized on the Immutable maps, so a single tile's
// update doesn't invalidate selectors reading other tiles (re-render safety).
export const selectListingEntities = createSelector(selectEntities, (entities) =>
  entities.get('listings'),
);

export const selectUserEntities = createSelector(selectEntities, (entities) =>
  entities.get('users'),
);

export const selectListingCount = createSelector(
  selectListingEntities,
  (listings) => listings.size,
);

export const selectListingById = createSelector(
  [selectListingEntities, (state, id) => id],
  (listings, id) => {
    const listing = listings.get(String(id));
    return listing ? listing.toJS() : null;
  },
);

export const selectUserById = createSelector(
  [selectUserEntities, (state, id) => id],
  (users, id) => {
    const user = users.get(String(id));
    return user ? user.toJS() : null;
  },
);

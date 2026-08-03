import { normalize } from 'normalizr';
import { Map as IMap, fromJS } from 'immutable';
import { listingListSchema } from './schemas';

// Normalize a page of tiles into { entities: Immutable maps, result: [ids] }.
// Entities live in Immutable structures so selectors can memoize on identity.
export function normalizeListings(tiles = []) {
  const { entities, result } = normalize(tiles, listingListSchema);
  return {
    entities: {
      listings: fromJS(entities.listings || {}),
      users: fromJS(entities.users || {}),
    },
    result,
  };
}

export const emptyEntities = IMap({ listings: IMap(), users: IMap() });

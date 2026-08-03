import { schema } from 'normalizr';

// normalizr entity schemas: listings + users are stored normalized (by id)
// so a tile update never re-renders unrelated tiles.
export const userSchema = new schema.Entity('users');
export const listingSchema = new schema.Entity('listings', { host: userSchema });
export const listingListSchema = [listingSchema];

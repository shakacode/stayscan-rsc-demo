import { call, put } from 'redux-saga/effects';
import fetchDestinations from '../api/autocompleteRequest';
import { handleQuery } from './autocompleteSaga';
import { setQuery, fetchStart, fetchSuccess, fetchFailure } from '../reducers/autocompleteReducer';

describe('autocompleteSaga.handleQuery', () => {
  it('clears results for a too-short query without fetching', () => {
    const gen = handleQuery(setQuery('a'));

    expect(gen.next().value).toEqual(put(fetchSuccess([])));
    expect(gen.next().done).toBe(true);
  });

  it('fetches then dispatches success for a valid query', () => {
    const gen = handleQuery(setQuery('mau'));
    const results = [{ id: 1, name: 'Marenca' }];

    expect(gen.next().value).toEqual(put(fetchStart()));
    expect(gen.next().value).toEqual(call(fetchDestinations, 'mau'));
    expect(gen.next(results).value).toEqual(put(fetchSuccess(results)));
    expect(gen.next().done).toBe(true);
  });

  it('dispatches failure when the request throws', () => {
    const gen = handleQuery(setQuery('mau'));
    gen.next();
    gen.next();

    expect(gen.throw(new Error('boom')).value).toEqual(put(fetchFailure('boom')));
  });
});

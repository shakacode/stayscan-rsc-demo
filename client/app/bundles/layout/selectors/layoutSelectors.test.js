import {
  selectIsAuthenticated,
  selectCurrentCurrency,
  selectActiveResult,
} from './layoutSelectors';

const baseState = {
  session: { user: null },
  currencyModal: { open: false, current: 'USD', currencies: [{ code: 'USD', symbol: '$' }] },
  autocomplete: {
    results: [
      { id: 1, name: 'Kivora' },
      { id: 2, name: 'Marisel' },
    ],
    activeIndex: -1,
  },
};

describe('layout selectors', () => {
  it('selectIsAuthenticated reflects the session user', () => {
    expect(selectIsAuthenticated(baseState)).toBe(false);
    expect(selectIsAuthenticated({ ...baseState, session: { user: { id: 9 } } })).toBe(true);
  });

  it('selectCurrentCurrency resolves the active currency object', () => {
    expect(selectCurrentCurrency(baseState)).toEqual({ code: 'USD', symbol: '$' });
  });

  it('selectActiveResult returns the highlighted suggestion or null', () => {
    expect(selectActiveResult(baseState)).toBeNull();
    const highlighted = {
      ...baseState,
      autocomplete: { ...baseState.autocomplete, activeIndex: 1 },
    };
    expect(selectActiveResult(highlighted)).toEqual({ id: 2, name: 'Marisel' });
  });
});

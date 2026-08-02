import createPageStore from './createPageStore';
import seedLayoutState from './seedLayoutState';
import { toggleMobileMenu } from '../reducers/navbarReducer';
import { selectIsAuthenticated, selectCurrentCurrency } from '../selectors/layoutSelectors';

describe('createPageStore', () => {
  const pageReducer = (state = { count: 0 }, action) =>
    action.type === 'welcome/inc' ? { count: state.count + 1 } : state;

  it('combines layout slices with page reducers and preloaded state', () => {
    const store = createPageStore(
      { welcome: pageReducer },
      seedLayoutState({
        user: { id: 1, name: 'Ada' },
        currentCurrency: 'EUR',
        currencies: [{ code: 'EUR', symbol: '€' }],
      }),
    );
    const state = store.getState();

    expect(Object.keys(state)).toEqual(
      expect.arrayContaining([
        'navbar',
        'session',
        'authenticationModal',
        'currencyModal',
        'alerts',
        'welcome',
      ]),
    );
    expect(selectIsAuthenticated(state)).toBe(true);
    expect(selectCurrentCurrency(state)).toEqual({ code: 'EUR', symbol: '€' });
  });

  it('dispatches to both layout and page reducers', () => {
    const store = createPageStore({ welcome: pageReducer });

    store.dispatch(toggleMobileMenu());
    store.dispatch({ type: 'welcome/inc' });

    expect(store.getState().navbar.mobileMenuOpen).toBe(true);
    expect(store.getState().welcome.count).toBe(1);
  });
});

describe('seedLayoutState', () => {
  it('only seeds slices present in the LayoutJson payload', () => {
    expect(seedLayoutState({})).toEqual({});
    expect(seedLayoutState({ user: null })).toEqual({ session: { user: null } });
  });
});

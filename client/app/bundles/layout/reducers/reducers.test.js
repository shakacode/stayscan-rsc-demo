import navbar, { toggleMobileMenu, setSearchExpanded } from './navbarReducer';
import session, { setUser, clearUser } from './sessionReducer';
import authModal, {
  openAuthModal,
  closeAuthModal,
  setAuthMode,
} from './authenticationModalReducer';
import autocomplete, { setQuery, fetchSuccess, clearAutocomplete } from './autocompleteReducer';
import currency, { setCurrency, openCurrencyModal } from './currencyModalReducer';
import alerts, { addAlert, dismissAlert } from './alertsReducer';
import feedback, { openFeedback, dismissFeedback } from './surveyPromptReducer';

describe('layout reducers', () => {
  it('navbar toggles the mobile menu and search expansion', () => {
    const opened = navbar(undefined, toggleMobileMenu());
    expect(opened.mobileMenuOpen).toBe(true);
    expect(navbar(opened, setSearchExpanded(true)).searchExpanded).toBe(true);
  });

  it('session sets and clears the current user', () => {
    const signedIn = session(undefined, setUser({ id: 1 }));
    expect(signedIn.user).toEqual({ id: 1 });
    expect(session(signedIn, clearUser()).user).toBeNull();
  });

  it('auth modal opens to a mode and closes', () => {
    const open = authModal(undefined, openAuthModal('signUp'));
    expect(open).toMatchObject({ open: true, mode: 'signUp' });
    expect(authModal(open, setAuthMode('forgot')).mode).toBe('forgot');
    expect(authModal(open, closeAuthModal()).open).toBe(false);
  });

  it('autocomplete records results and clears', () => {
    const queried = autocomplete(undefined, setQuery('mau'));
    expect(queried.query).toBe('mau');
    const withResults = autocomplete(queried, fetchSuccess([{ id: 1 }]));
    expect(withResults.results).toHaveLength(1);
    expect(autocomplete(withResults, clearAutocomplete()).results).toEqual([]);
  });

  it('currency selects a code and closes the modal', () => {
    const open = currency(undefined, openCurrencyModal());
    expect(open.open).toBe(true);
    const chosen = currency(open, setCurrency('EUR'));
    expect(chosen).toMatchObject({ current: 'EUR', open: false });
  });

  it('alerts append with an id and dismiss by id', () => {
    const added = alerts(undefined, addAlert({ id: 'a1', message: 'saved' }));
    expect(added.items).toHaveLength(1);
    expect(alerts(added, dismissAlert('a1')).items).toEqual([]);
  });

  it('feedback popup stays closed once dismissed', () => {
    const dismissed = feedback(undefined, dismissFeedback());
    expect(feedback(dismissed, openFeedback()).open).toBe(false);
  });
});

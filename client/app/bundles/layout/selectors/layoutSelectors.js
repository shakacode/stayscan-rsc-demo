import { createSelector } from 'reselect';

// Slice accessors
export const selectNavbar = (state) => state.navbar;
export const selectSession = (state) => state.session;
export const selectAuthModal = (state) => state.authenticationModal;
export const selectAutocomplete = (state) => state.autocomplete;
export const selectCurrency = (state) => state.currencyModal;
export const selectAlerts = (state) => state.alerts;
export const selectFeedback = (state) => state.surveyPrompt;

// Derived (memoized)
export const selectCurrentUser = createSelector(selectSession, (session) => session.user);
export const selectIsAuthenticated = createSelector(selectCurrentUser, (user) => user != null);

export const selectAutocompleteResults = createSelector(selectAutocomplete, (a) => a.results);
export const selectActiveResult = createSelector(selectAutocomplete, (a) =>
  a.activeIndex >= 0 ? (a.results[a.activeIndex] ?? null) : null,
);

export const selectCurrentCurrency = createSelector(
  selectCurrency,
  (currency) =>
    currency.currencies.find((entry) => entry.code === currency.current) ?? {
      code: currency.current,
    },
);

export const selectVisibleAlerts = createSelector(selectAlerts, (alerts) => alerts.items);

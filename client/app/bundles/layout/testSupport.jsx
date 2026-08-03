import React from 'react';
import { render } from '@testing-library/react';
import createPageStore from './store/createPageStore';
import LayoutProviders from './LayoutProviders';
import en from './i18n/en.json';

// Render a connected layout component inside a real page store + react-intl, so
// tests exercise the same store/selectors/i18n the app uses. Not a *.test file,
// so jest never runs it directly.
export function renderWithLayout(ui, { preloadedState = {}, store } = {}) {
  const pageStore = store ?? createPageStore({}, preloadedState);
  return {
    store: pageStore,
    ...render(
      <LayoutProviders store={pageStore} messages={en}>
        {ui}
      </LayoutProviders>,
    ),
  };
}

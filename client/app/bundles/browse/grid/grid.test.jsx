import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { legacy_createStore as createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import layoutReducers from '../../layout/reducers';
import browseReducer from '../reducers';
import seedBrowseState from '../store/seedBrowseState';
import browseEn from '../i18n/en.json';
import Pagination from './Pagination';
import SortDropdown from './SortDropdown';

function makeStore(index) {
  const root = combineReducers({ ...layoutReducers, browse: browseReducer });
  return createStore(root, seedBrowseState(index));
}

function renderWith(ui, index) {
  const store = makeStore(index);
  const utils = render(
    <Provider store={store}>
      <IntlProvider locale="en" messages={browseEn}>
        {ui}
      </IntlProvider>
    </Provider>,
  );
  return { store, ...utils };
}

const cappedIndex = {
  listings: [],
  meta: { totalCount: 150, currentPage: 6, pageSize: 25, capReached: true, maxPages: 6 },
  filters: {},
  location: null,
  seo: { title: 'Search' },
};

describe('Pagination', () => {
  it('caps total pages at maxPages and shows the cap note on the last page', () => {
    renderWith(<Pagination />, cappedIndex);

    expect(screen.getByTestId('page-6')).toBeInTheDocument();
    expect(screen.queryByTestId('page-7')).not.toBeInTheDocument();
    expect(screen.getByTestId('page-next')).toBeDisabled();
    expect(screen.getByTestId('page-cap-note')).toBeInTheDocument();
  });

  it('dispatches a page change', () => {
    const { store } = renderWith(<Pagination />, cappedIndex);
    fireEvent.click(screen.getByTestId('page-prev'));
    expect(store.getState().browse.pagination).toBe(5);
  });
});

describe('SortDropdown', () => {
  it('commits a sort change (which resets the page to 1)', () => {
    const { store } = renderWith(<SortDropdown />, cappedIndex);
    fireEvent.change(screen.getByTestId('sort-dropdown'), { target: { value: 'price_asc' } });

    expect(store.getState().browse.sort).toBe('price_asc');
    expect(store.getState().browse.pagination).toBe(1);
  });
});

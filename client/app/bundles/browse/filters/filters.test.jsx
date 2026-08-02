import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { legacy_createStore as createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import layoutReducers from '../../layout/reducers';
import browseReducer from '../reducers';
import seedBrowseState from '../store/seedBrowseState';
import browseEn from '../i18n/en.json';
import { filtersModalToggled } from '../actions';
import FiltersModal from './FiltersModal';
import FiltersButton from './FiltersButton';

const index = {
  listings: [],
  meta: { totalCount: 42, currentPage: 1, pageSize: 25, capReached: false, maxPages: 6 },
  filters: {},
  facets: {
    amenities: [
      { id: 1, name: 'WiFi' },
      { id: 2, name: 'Pool' },
    ],
    priceBounds: { min: 0, max: 1000 },
  },
  location: null,
  seo: { title: 'Search' },
};

function makeStore() {
  const root = combineReducers({ ...layoutReducers, browse: browseReducer });
  return createStore(root, seedBrowseState(index));
}

function renderWith(ui, store) {
  return render(
    <Provider store={store}>
      <IntlProvider locale="en" messages={browseEn}>
        {ui}
      </IntlProvider>
    </Provider>,
  );
}

describe('FiltersModal', () => {
  it('renders 8 filter groups and applies the draft on commit', () => {
    const store = makeStore();
    store.dispatch(filtersModalToggled(true));
    renderWith(<FiltersModal />, store);

    expect(screen.getByTestId('filters-modal')).toBeInTheDocument();
    [
      'price',
      'bedrooms',
      'bathrooms',
      'guests',
      'rating',
      'amenities',
      'book-direct',
      'top-rated',
    ].forEach((name) => expect(screen.getByTestId(`filter-group-${name}`)).toBeInTheDocument());

    fireEvent.click(screen.getByLabelText('Book direct available'));
    fireEvent.change(screen.getByTestId('filter-min-price'), { target: { value: '150' } });
    expect(store.getState().browse.filtersDraft.bookDirect).toBe(true);

    fireEvent.click(screen.getByTestId('filters-apply'));

    expect(store.getState().browse.filtersCommitted).toMatchObject({
      bookDirect: true,
      minPrice: 150,
    });
    expect(store.getState().browse.filtersModal).toBe(false);
  });

  it('clears the filters', () => {
    const store = makeStore();
    store.dispatch(filtersModalToggled(true));
    store.dispatch({ type: 'browse/FILTER_DRAFT_CHANGED', patch: { topRated: true } });
    renderWith(<FiltersModal />, store);

    fireEvent.click(screen.getByTestId('filters-clear'));
    expect(store.getState().browse.filtersDraft.topRated).toBe(false);
  });
});

describe('FiltersButton', () => {
  it('shows the active committed-filter count', () => {
    const store = makeStore();
    store.dispatch({ type: 'browse/FILTERS_COMMITTED', draft: { bookDirect: true, minRating: 4 } });
    renderWith(<FiltersButton />, store);

    expect(screen.getByTestId('open-filters')).toHaveTextContent('2');
  });
});

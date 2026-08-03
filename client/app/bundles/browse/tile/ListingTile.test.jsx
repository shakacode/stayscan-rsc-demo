import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { legacy_createStore as createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import layoutReducers from '../../layout/reducers';
import browseReducer from '../reducers';
import seedBrowseState from '../store/seedBrowseState';
import layoutEn from '../../layout/i18n/en.json';
import browseEn from '../i18n/en.json';
import ListingTile from './ListingTile';
import { haversineMeters } from './distance';

const messages = { ...layoutEn, ...browseEn };

const tile = {
  id: 1,
  title: 'Reef Villa',
  city: 'Kivora',
  url: '/listings/1',
  photos: ['a/0.jpg', 'a/1.jpg'],
  rating: 4.6,
  reviewsCount: 8,
  previewPrice: 220,
  capacity: { bedrooms: 2, bathrooms: 2, maxGuests: 4 },
  coordinates: { lat: 8.9, lng: -140.4 },
  channels: ['airhive', 'hostflow'],
  badges: { bookDirect: true, topRated: false, verified: true },
};

const index = {
  listings: [tile],
  meta: { totalCount: 1, currentPage: 1, pageSize: 25, capReached: false, maxPages: 6 },
  filters: {},
  location: null,
  seo: { title: 'Search' },
};

function makeStore() {
  const root = combineReducers({ ...layoutReducers, browse: browseReducer });
  return createStore(root, seedBrowseState(index));
}

function renderTile() {
  const store = makeStore();
  const utils = render(
    <Provider store={store}>
      <IntlProvider locale="en" messages={messages}>
        <ListingTile tile={tile} center={{ lat: 8.8, lng: -140.3 }} />
      </IntlProvider>
    </Provider>,
  );
  return { store, ...utils };
}

describe('haversineMeters', () => {
  it('returns null without both points and a positive distance otherwise', () => {
    expect(haversineMeters(null, { lat: 1, lng: 1 })).toBeNull();
    expect(haversineMeters({ lat: 8.8, lng: -140.3 }, { lat: 8.9, lng: -140.4 })).toBeGreaterThan(
      0,
    );
  });
});

describe('ListingTile', () => {
  it('renders the carousel, title, rating, capacity, channels, price and distance', () => {
    renderTile();

    expect(screen.getByTestId('tile-title')).toHaveTextContent('Reef Villa');
    expect(screen.getByTestId('tile-carousel')).toBeInTheDocument();
    expect(screen.getByTestId('tile-rating')).toHaveTextContent('4.6');
    expect(screen.getByTestId('tile-capacity')).toBeInTheDocument();
    expect(screen.getByTestId('tile-channel-airhive')).toBeInTheDocument();
    expect(screen.getByTestId('tile-price-row')).toHaveTextContent('$220');
    expect(screen.getByTestId('tile-distance')).toBeInTheDocument();
    expect(screen.getByTestId('tile-badges')).toBeInTheDocument();
  });

  it('routes an anonymous save-to-trip through the auth modal', () => {
    const { store } = renderTile();

    fireEvent.click(screen.getByTestId('tile-save-1'));

    expect(store.getState().authenticationModal.open).toBe(true);
  });

  it('highlights the tile when its map marker is hovered', () => {
    const { store } = renderTile();
    expect(screen.getByTestId('result-tile')).not.toHaveAttribute('data-active');

    act(() => {
      store.dispatch({ type: 'browse/MARKER_HOVERED', id: 1 });
    });
    expect(screen.getByTestId('result-tile')).toHaveAttribute('data-active');
  });
});

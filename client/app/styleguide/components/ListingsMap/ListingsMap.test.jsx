import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import ListingsMap from './ListingsMap';
import MapFallback from './MapFallback';
import { createMarkerElement } from './markerElement';

const markers = [
  { id: 1, lat: 8.9, lng: -140.4, price: 220 },
  { id: 2, lat: 8.91, lng: -140.41, price: 180 },
];

function wrap(ui) {
  return render(
    <IntlProvider locale="en" messages={{ 'browse.map.noscript': 'JS off' }}>
      {ui}
    </IntlProvider>,
  );
}

describe('createMarkerElement', () => {
  it('builds a price pill node with a test id + active styling', () => {
    const el = createMarkerElement({ id: 5, price: 199, active: true, onHover: () => {} });
    expect(el.dataset.testId).toBe('map-marker-5');
    expect(el.textContent).toBe('$199');
    expect(el.style.fontWeight).toBe('700');
  });

  it('fires the hover callback on enter/leave', () => {
    const onHover = jest.fn();
    const el = createMarkerElement({ id: 3, price: 99, active: false, onHover });
    el.dispatchEvent(new MouseEvent('mouseenter'));
    expect(onHover).toHaveBeenCalledWith(3);
  });
});

describe('ListingsMap wrapper', () => {
  it('tags the container with the flag-selected engine (page code stays engine-agnostic)', () => {
    wrap(<ListingsMap engine="maplibre" markers={markers} />);
    expect(screen.getByTestId('listings-map')).toHaveAttribute('data-engine', 'maplibre');
  });
});

describe('MapFallback', () => {
  it('renders an interactive price pill per marker', () => {
    const onMarkerHover = jest.fn();
    wrap(<MapFallback markers={markers} hoveredId={1} onMarkerHover={onMarkerHover} />);

    expect(screen.getByTestId('map-marker-1')).toBeInTheDocument();
    fireEvent.mouseEnter(screen.getByTestId('map-marker-2'));
    expect(onMarkerHover).toHaveBeenCalledWith(2);
  });
});

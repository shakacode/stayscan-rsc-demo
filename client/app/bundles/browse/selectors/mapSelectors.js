import { createSelector } from 'reselect';
import {
  selectMapBounds,
  selectMapZoom,
  selectMapEngine,
  selectMapHoverId,
} from './browseSelectors';
import { selectResultTiles } from './resultSelectors';

// Price-pill markers derived from the current tiles; memoized so the map only
// re-renders markers when the result set changes.
export const selectMarkers = createSelector(selectResultTiles, (tiles) =>
  tiles
    .filter((tile) => tile.coordinates && tile.coordinates.lat != null)
    .map((tile) => ({
      id: tile.id,
      lat: tile.coordinates.lat,
      lng: tile.coordinates.lng,
      price: tile.previewPrice,
    })),
);

export const selectMarkerCount = createSelector(selectMarkers, (markers) => markers.length);

export const selectHoveredMarker = createSelector(
  [selectMarkers, selectMapHoverId],
  (markers, hoveredId) => markers.find((marker) => marker.id === hoveredId) || null,
);

export const selectMapViewport = createSelector(
  [selectMapBounds, selectMapZoom],
  (bounds, zoom) => ({ bounds, zoom }),
);

// Tight bbox around the current markers, for fit-to-results.
export const selectFitBounds = createSelector(selectMarkers, (markers) => {
  if (markers.length === 0) return null;
  const lats = markers.map((m) => m.lat);
  const lngs = markers.map((m) => m.lng);
  return {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
  };
});

export const selectIsMapEngine = createSelector(
  [selectMapEngine, (state, engine) => engine],
  (current, engine) => current === engine,
);

// The search center used for tile distances: a location page's center, else the
// centroid of the current markers.
export const selectSearchCenter = createSelector(
  [selectMapBounds, selectMarkers],
  (bounds, markers) => {
    if (bounds && bounds.minLat != null) {
      return { lat: (bounds.minLat + bounds.maxLat) / 2, lng: (bounds.minLng + bounds.maxLng) / 2 };
    }
    if (markers.length === 0) return null;
    const lat = markers.reduce((sum, m) => sum + m.lat, 0) / markers.length;
    const lng = markers.reduce((sum, m) => sum + m.lng, 0) / markers.length;
    return { lat, lng };
  },
);

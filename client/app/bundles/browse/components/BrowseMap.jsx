import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ListingsMap from '../../../styleguide/components/ListingsMap/ListingsMap';
import { selectMarkers } from '../selectors/mapSelectors';
import { selectMapHoverId, selectMapEngine, selectLocation } from '../selectors/browseSelectors';
import { markerHovered, mapBoundsChanged } from '../actions';

// Connects the shared ListingsMap wrapper to the browse view store: markers + hovered id +
// the flag-selected engine in, hover/bounds/click dispatches out. Page code never
// touches an engine directly.
export default function BrowseMap() {
  const dispatch = useDispatch();
  const markers = useSelector(selectMarkers);
  const hoveredId = useSelector(selectMapHoverId);
  const engine = useSelector(selectMapEngine);
  const location = useSelector(selectLocation);

  const center = location?.center?.lat
    ? location.center
    : markers[0] && { lat: markers[0].lat, lng: markers[0].lng };

  return (
    <ListingsMap
      engine={engine}
      markers={markers}
      hoveredId={hoveredId}
      center={center}
      onMarkerHover={(id) => dispatch(markerHovered(id))}
      onBoundsChange={(bounds) => dispatch(mapBoundsChanged(bounds))}
      onMarkerClick={(id) => {
        window.location.href = `/listings/${id}`;
      }}
    />
  );
}

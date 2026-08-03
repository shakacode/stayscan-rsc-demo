import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import L from 'leaflet';
import { createMarkerElement } from '../markerElement';
import * as style from '../ListingsMap.module.scss';

const DEFAULT_CENTER = { lat: 8.9, lng: -140.4 };

// A map whose container is display:none (the mobile list view) has a 0×0 viewport,
// so its bounds are degenerate — never drive a refetch or a fit from that.
const isSized = (el) => !!el && el.clientWidth > 0 && el.clientHeight > 0;

// Fit the map to the markers. This is a PROGRAMMATIC move, so raise the guard: the
// moveend it fires must not be read as a user pan and drive a bounds refetch — that
// feeds back (fit → refetch → new markers → fit → …) into an endless reload loop.
const fitToMarkers = (map, markers, suppressRef) => {
  if (markers.length === 0) return;
  suppressRef.current = true;
  map.fitBounds(
    markers.map((m) => [m.lat, m.lng]),
    { padding: [30, 30], maxZoom: 14, animate: false },
  );
  // If fitBounds was a no-op (already at those bounds) no moveend fires, so drop the
  // guard on the next tick rather than swallow the user's next real pan.
  queueMicrotask(() => {
    suppressRef.current = false;
  });
};

// Leaflet engine (DOM/canvas — no WebGL, works in headless tests). Tile-less base
// so it needs no external network; price-pill markers via divIcon. Implements the
// shared engine contract (markers / hover / bounds / fit-to-results).
export default function LeafletEngine({
  markers,
  hoveredId,
  center,
  zoom,
  onBoundsChange,
  onMarkerHover,
  onMarkerClick,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const markersRef = useRef(markers);
  markersRef.current = markers;
  const boundsCbRef = useRef(onBoundsChange);
  boundsCbRef.current = onBoundsChange;
  // Raised while a programmatic fit runs, so its moveend doesn't refetch (see fitToMarkers).
  const suppressBoundsRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    const start = center || markers[0] || DEFAULT_CENTER;
    const map = L.map(container, {
      center: [start.lat, start.lng],
      zoom,
      attributionControl: false,
    });
    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);

    const emit = () => {
      if (suppressBoundsRef.current) {
        suppressBoundsRef.current = false;
        return;
      }
      if (!isSized(container)) return;
      const b = map.getBounds();
      boundsCbRef.current({
        minLat: b.getSouth(),
        maxLat: b.getNorth(),
        minLng: b.getWest(),
        maxLng: b.getEast(),
      });
    };
    map.on('moveend', emit);

    // When the container gains size (the mobile list→map toggle reveals it), Leaflet
    // has to recompute its viewport and re-fit; the resulting moveend then emits the
    // real bounds. Without this the map stays sized to the 0×0 it was created at.
    let wasSized = isSized(container);
    const resizeObserver = new ResizeObserver(() => {
      const nowSized = isSized(container);
      if (nowSized && !wasSized) {
        map.invalidateSize();
        fitToMarkers(map, markersRef.current, suppressBoundsRef);
      }
      wasSized = nowSized;
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      map.off('moveend', emit);
      map.remove();
    };
    // Init the map once from the initial center/zoom; later marker/hover updates are
    // applied imperatively in the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    const map = mapRef.current;
    if (!layer || !map) return;
    layer.clearLayers();

    markers.forEach((marker) => {
      const el = createMarkerElement({
        id: marker.id,
        price: marker.price,
        active: marker.id === hoveredId,
        onHover: onMarkerHover,
        onClick: onMarkerClick,
      });
      L.marker([marker.lat, marker.lng], { icon: L.divIcon({ className: '', html: el.outerHTML }) })
        .on('mouseover', () => onMarkerHover(marker.id))
        .on('mouseout', () => onMarkerHover(null))
        .on('click', () => onMarkerClick && onMarkerClick(marker.id))
        .addTo(layer);
    });

    // Skip fitting while hidden (0×0): the ResizeObserver re-fits once it's revealed.
    if (isSized(containerRef.current)) fitToMarkers(map, markers, suppressBoundsRef);
    // Re-run only when the markers or the hovered id change; the hover/click handlers
    // are stable dispatch thunks from the container.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers, hoveredId]);

  return <div ref={containerRef} className={style.canvas} data-test-id="leaflet-canvas" />;
}

LeafletEngine.propTypes = {
  markers: PropTypes.arrayOf(PropTypes.object).isRequired,
  hoveredId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  center: PropTypes.shape({ lat: PropTypes.number, lng: PropTypes.number }),
  zoom: PropTypes.number,
  onBoundsChange: PropTypes.func,
  onMarkerHover: PropTypes.func,
  onMarkerClick: PropTypes.func,
};

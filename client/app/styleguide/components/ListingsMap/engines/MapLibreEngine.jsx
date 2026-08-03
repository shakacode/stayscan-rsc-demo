import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import maplibregl from 'maplibre-gl';
import { createMarkerElement } from '../markerElement';
import MapFallback from '../MapFallback';
import * as style from '../ListingsMap.module.scss';

// Tile-less blank style so the map needs no external network — a plain background
// plus our price-pill markers.
const BLANK_STYLE = {
  version: 8,
  sources: {},
  layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#e8efe9' } }],
};
const DEFAULT_CENTER = { lat: 8.9, lng: -140.4 };

// A map whose container is display:none (the mobile list view) has a 0×0 viewport,
// so its bounds are degenerate — never drive a refetch or a fit from that.
const isSized = (el) => !!el && el.clientWidth > 0 && el.clientHeight > 0;

// Fit the map to the markers. This is a PROGRAMMATIC move, so raise the guard: the
// moveend it fires must not be read as a user pan and drive a bounds refetch — that
// feeds back (fit → refetch → new markers → fit → …) into an endless reload loop.
const fitToMarkers = (map, markers, suppressRef) => {
  if (markers.length === 0) return;
  const bounds = new maplibregl.LngLatBounds();
  markers.forEach((marker) => bounds.extend([marker.lng, marker.lat]));
  try {
    suppressRef.current = true;
    map.fitBounds(bounds, { padding: 40, maxZoom: 14, animate: false });
    // If fitBounds was a no-op no moveend fires, so drop the guard on the next tick
    // rather than swallow the user's next real pan.
    queueMicrotask(() => {
      suppressRef.current = false;
    });
  } catch (error) {
    suppressRef.current = false;
    // map not ready yet — the next markers effect will fit
  }
};

// MapLibre (WebGL) engine implementing the same contract as LeafletEngine. WebGL
// init is guarded: where it isn't available (e.g. a headless GPU-less runner) it
// falls back to the pill overlay instead of crashing.
export default function MapLibreEngine({
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
  const markerObjsRef = useRef([]);
  const markersRef = useRef(markers);
  markersRef.current = markers;
  const boundsCbRef = useRef(onBoundsChange);
  boundsCbRef.current = onBoundsChange;
  // Raised while a programmatic fit runs, so its moveend doesn't refetch (see fitToMarkers).
  const suppressBoundsRef = useRef(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const start = center || markers[0] || DEFAULT_CENTER;
    let resizeObserver;
    try {
      const map = new maplibregl.Map({
        container,
        style: BLANK_STYLE,
        center: [start.lng, start.lat],
        zoom,
        attributionControl: false,
      });
      mapRef.current = map;
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

      // When the container gains size (the mobile list→map toggle reveals it),
      // MapLibre must recompute its viewport and re-fit; the resulting moveend then
      // emits the real bounds instead of the degenerate 0×0 ones.
      let wasSized = isSized(container);
      resizeObserver = new ResizeObserver(() => {
        const nowSized = isSized(container);
        if (nowSized && !wasSized) {
          map.resize();
          fitToMarkers(map, markersRef.current, suppressBoundsRef);
        }
        wasSized = nowSized;
      });
      resizeObserver.observe(container);
    } catch (error) {
      setFailed(true);
    }
    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // Init once from the initial center/zoom; markers update imperatively below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (failed || !map) return;

    markerObjsRef.current.forEach((obj) => obj.remove());
    markerObjsRef.current = markers.map((marker) => {
      const el = createMarkerElement({
        id: marker.id,
        price: marker.price,
        active: marker.id === hoveredId,
        onHover: onMarkerHover,
        onClick: onMarkerClick,
      });
      return new maplibregl.Marker({ element: el }).setLngLat([marker.lng, marker.lat]).addTo(map);
    });

    // Skip fitting while hidden (0×0): the ResizeObserver re-fits once it's revealed.
    if (isSized(containerRef.current)) fitToMarkers(map, markers, suppressBoundsRef);
    // Hover/click handlers are stable dispatch thunks from the container.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers, hoveredId, failed]);

  if (failed) {
    return (
      <MapFallback
        markers={markers}
        hoveredId={hoveredId}
        onMarkerHover={onMarkerHover}
        onMarkerClick={onMarkerClick}
      />
    );
  }
  return <div ref={containerRef} className={style.canvas} data-test-id="maplibre-canvas" />;
}

MapLibreEngine.propTypes = {
  markers: PropTypes.arrayOf(PropTypes.object).isRequired,
  hoveredId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  center: PropTypes.shape({ lat: PropTypes.number, lng: PropTypes.number }),
  zoom: PropTypes.number,
  onBoundsChange: PropTypes.func,
  onMarkerHover: PropTypes.func,
  onMarkerClick: PropTypes.func,
};

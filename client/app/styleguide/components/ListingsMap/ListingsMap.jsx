import React from 'react';
import PropTypes from 'prop-types';
import loadable from '@loadable/component';
import * as style from './ListingsMap.module.scss';

// One wrapper API over two interchangeable map engines. Page code renders
// <ListingsMap engine={...}/> and never imports an engine directly, so the
// feature-flag flip swaps engines with zero page-code changes. Engines are lazy,
// client-only chunks (leaflet/maplibre touch window/WebGL), so SSR shows a
// placeholder and the engine mounts after hydration.
const ENGINES = {
  leaflet: loadable(() => import('./engines/LeafletEngine'), {
    ssr: false,
    fallback: <div className={style.placeholder} />,
  }),
  maplibre: loadable(() => import('./engines/MapLibreEngine'), {
    ssr: false,
    fallback: <div className={style.placeholder} />,
  }),
};

export default function ListingsMap({
  engine = 'leaflet',
  markers,
  hoveredId = null,
  center,
  zoom = 11,
  onBoundsChange = () => {},
  onMarkerHover = () => {},
  onMarkerClick,
}) {
  const Engine = ENGINES[engine] || ENGINES.leaflet;

  return (
    <div className={style.map} data-test-id="listings-map" data-engine={engine}>
      <Engine
        markers={markers}
        hoveredId={hoveredId}
        center={center}
        zoom={zoom}
        onBoundsChange={onBoundsChange}
        onMarkerHover={onMarkerHover}
        onMarkerClick={onMarkerClick}
      />
      <noscript>
        <div className={style.placeholder}>Enable JavaScript to view the map.</div>
      </noscript>
    </div>
  );
}

ListingsMap.propTypes = {
  engine: PropTypes.oneOf(['leaflet', 'maplibre']),
  markers: PropTypes.arrayOf(PropTypes.object).isRequired,
  hoveredId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  center: PropTypes.shape({ lat: PropTypes.number, lng: PropTypes.number }),
  zoom: PropTypes.number,
  onBoundsChange: PropTypes.func,
  onMarkerHover: PropTypes.func,
  onMarkerClick: PropTypes.func,
};
